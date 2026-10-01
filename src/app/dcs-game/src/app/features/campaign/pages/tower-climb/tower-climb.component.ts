import { BattleSceneComponent } from '../../../battle/components/battle-scene/battle-scene.component';
import { BattleEngineService } from '../../../../core/services/battle-engine.service';
import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { finalize, Subscription, interval } from 'rxjs';
import { CampaignAtmosphereComponent } from '../../components/campaign-atmosphere/campaign-atmosphere.component';
import { CampaignStageDetailModalComponent } from '../../components/campaign-stage-detail-modal/campaign-stage-detail-modal.component';
import { FormationManagementComponent } from '../../../home/components/formation-management/formation-management.component';
import { TowerQuickClimbModalComponent } from '../../components/tower-quick-climb-modal/tower-quick-climb-modal.component';
import { BattleResultModalComponent } from '../../../battle/components/battle-result-modal/battle-result-modal.component';
import { TowerApiService } from '../../../../core/services/tower-api.service';
import {
  TowerProgress,
  TowerFloorSummary,
  TowerFloorDetail,
  TowerChest,
  StartTowerBattleResult,
  PendingReward
} from '../../../../core/models/event.model';
import { BattleHeroStatisticsDto } from '../../../../core/models/battle.model';

@Component({
  selector: 'app-tower-climb',
  standalone: true,
  imports: [
    CommonModule,
    CampaignAtmosphereComponent,
    CampaignStageDetailModalComponent,
    FormationManagementComponent,
    TowerQuickClimbModalComponent,
    BattleResultModalComponent,
    BattleSceneComponent
  ],
  templateUrl: './tower-climb.component.html',
  styleUrl: './tower-climb.component.scss'
})
export class TowerClimbComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  readonly battleEngine = inject(BattleEngineService);
  isPlayingBattle = false;
  private readonly api = inject(TowerApiService);
  private readonly cdr = inject(ChangeDetectorRef);

  progress?: TowerProgress;
  loading = true;
  error = '';

  get lifeIcons(): number[] {
    return Array.from({ length: this.progress?.initialLives ?? 0 }, (_, i) => i + 1);
  }

  // Windowed presentation; actual floors and chest milestones come from the server.
  activeChunkIndex = 0;
  get chunkTabs() {
    const max = this.progress?.maxFloor ?? 0;
    // Chunk size is presentation-only; floors and reward milestones remain server-owned.
    return Array.from({ length: Math.ceil(max / 15) }, (_, i) => ({
      label: `Tầng ${i * 15 + 1} - ${Math.min(max, (i + 1) * 15)}`,
      min: i * 15 + 1, max: Math.min(max, (i + 1) * 15), chestFloor: this.progress?.milestoneChests.find(c => c.floorNumber > i * 15 && c.floorNumber <= (i + 1) * 15)?.floorNumber
    }));
  }

  // Modals state
  selectedFloorDetail?: TowerFloorDetail;
  loadingFloorDetail = false;
  startingBattle = false;
  isFormationModalOpen = false;
  isQuickClimbModalOpen = false;
  activeQuickClimbJobId?: string;

  // Battle Result Modal state
  battleResult?: StartTowerBattleResult;
  isBattleResultOpen = false;
  battleHeroStats: BattleHeroStatisticsDto[] = [];

  // Floor Transition Animation (700 - 1000ms)
  isFloorTransitioning = false;
  transitionSourceFloor = 0;
  transitionTargetFloor = 0;

  // Pending Rewards
  pendingRewards: PendingReward[] = [];
  claimingPendingId: number | null = null;
  claimingChestId: number | null = null;

  // Countdown subscription
  private timerSub?: Subscription;

  ngOnInit(): void {
    this.fetchTowerData();
    this.startCountdownTimer();
  }

  ngOnDestroy(): void {
    this.timerSub?.unsubscribe();
    if (this.isPlayingBattle) this.battleEngine.resetBattle();
  }

  fetchTowerData(autoSelectChunk = true): void {
    this.loading = true;
    this.error = '';

    this.api.getTowerProgress().pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: res => {
        if (res.success && res.data) {
          this.progress = res.data;

          if (autoSelectChunk) {
            // Auto switch to chunk containing currentFloor
            const curFloor = this.progress.currentFloor;
            const chunkIdx = Math.min(this.chunkTabs.length - 1, Math.floor((curFloor - 1) / 15));
            this.activeChunkIndex = Math.max(0, chunkIdx);
          }

          // If there is an active quick climb job running, auto open modal
          if (this.progress.hasActiveQuickClimbJob && this.progress.activeQuickClimbJobId) {
            this.activeQuickClimbJobId = this.progress.activeQuickClimbJobId;
            this.isQuickClimbModalOpen = true;
          }

          // Fetch pending rewards if count > 0
          this.fetchPendingRewards();
        } else {
          this.error = res.message || 'Không thể tải tiến độ tháp.';
        }
      },
      error: err => {
        this.error = err?.error?.message || 'Lỗi khi tải tiến trình tháp.';
      }
    });
  }

  fetchPendingRewards(): void {
    this.api.getPendingRewards().subscribe({
      next: res => {
        if (res.success && res.data) {
          this.pendingRewards = res.data;
          this.cdr.markForCheck();
        }
      }
    });
  }

  claimPending(pending: PendingReward): void {
    if (this.claimingPendingId) return;
    this.claimingPendingId = pending.id;

    this.api.claimPendingReward(pending.id).pipe(
      finalize(() => {
        this.claimingPendingId = null;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: res => {
        if (res.success) {
          if (res.data?.isBagFull) alert(res.data.message);
          this.fetchTowerData(false);
        } else {
          alert(res.message || 'Không thể nhận phần thưởng chờ.');
        }
      },
      error: err => {
        alert(err?.error?.message || 'Lỗi khi nhận thưởng chờ.');
      }
    });
  }

  claimMilestoneChest(chest: TowerChest): void {
    if (chest.state !== 'UNLOCKED' || this.claimingChestId) return;
    this.claimingChestId = chest.id;

    this.api.claimChest(chest.id).pipe(
      finalize(() => {
        this.claimingChestId = null;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: res => {
        if (res.success && res.data) {
          chest.state = 'CLAIMED';
          alert(`Nhận thành công ${chest.chestName}!`);
          this.fetchTowerData(false);
        } else {
          alert(res.message || 'Không thể nhận rương.');
        }
      },
      error: err => {
        alert(err?.error?.message || 'Lỗi khi nhận rương mốc.');
      }
    });
  }

  get displayedFloors(): TowerFloorSummary[] {
    if (!this.progress?.floors) return [];
    const activeTab = this.chunkTabs[this.activeChunkIndex];
    if (!activeTab) return [];
    return this.progress.floors.filter(
      f => f.floorNumber >= activeTab.min && f.floorNumber <= activeTab.max
    );
  }

  selectChunk(index: number): void {
    this.activeChunkIndex = index;
  }

  openFloorDetail(floor: TowerFloorSummary): void {
    if (this.isFloorTransitioning) return;
    this.loadingFloorDetail = true;

    this.api.getFloorDetail(floor.floorNumber).pipe(
      finalize(() => {
        this.loadingFloorDetail = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: res => {
        if (res.success && res.data) {
          this.selectedFloorDetail = res.data;
        } else {
          alert(res.message || 'Không thể xem chi tiết tầng.');
        }
      },
      error: err => {
        alert(err?.error?.message || 'Lỗi khi tải chi tiết tầng.');
      }
    });
  }

  closeFloorDetail(): void {
    this.selectedFloorDetail = undefined;
  }

  startFloorBattle(detail: TowerFloorDetail): void {
    if (this.startingBattle || this.progress?.hasActiveQuickClimbJob || !this.progress || this.progress.remainingLives <= 0 || !detail.isUnlocked) return;
    this.startingBattle = true;

    this.api.startBattle(detail.floorNumber).pipe(finalize(() => this.startingBattle = false)).subscribe({
      next: res => {
        if (res.success && res.data) {
          this.selectedFloorDetail = undefined;
          this.battleResult = res.data;
          this.battleHeroStats = res.data.battleSimulation?.heroStatistics || [];
          this.isBattleResultOpen = true;
          this.isPlayingBattle = true;
          this.battleEngine.resetBattle();
          this.battleEngine.loadServerBattle(this.battleResult!.battleSimulation);
          this.battleEngine.startBattle();
          this.cdr.markForCheck();
        } else {
          alert(res.message || 'Không thể bắt đầu trận.');
        }
      },
      error: err => {
        alert(err?.error?.message || 'Lỗi khi bắt đầu trận chiến.');
      }
    });
  }

  startNewRun(): void {
    if (!confirm('Bạn có chắc muốn bắt đầu lượt leo mới với số mạng ban đầu?')) return;

    this.api.startNewRun().subscribe({
      next: res => {
        if (res.success) {
          this.isBattleResultOpen = false;
    this.isPlayingBattle = false;
    this.battleEngine.resetBattle();
          this.fetchTowerData(true);
        } else {
          alert(res.message || 'Không thể bắt đầu lượt mới.');
        }
      },
      error: err => {
        alert(err?.error?.message || 'Lỗi khi bắt đầu lượt mới.');
      }
    });
  }

  // --- Quick Climb ---
  openQuickClimb(): void {
    if (!this.progress) return;
    if (this.progress.remainingLives <= 0) {
      alert('Bạn đã hết mạng! Vui lòng bắt đầu lượt mới trước.');
      return;
    }
    if (this.progress.isCompleted) {
      alert('Bạn đã hoàn thành toàn bộ các tầng tháp hôm nay!');
      return;
    }

    if (!confirm(`Bắt đầu leo nhanh từ Tầng ${this.progress.currentFloor}? Leo nhanh sẽ tự động dừng ngay ở trận thua đầu tiên.`)) {
      return;
    }

    this.api.startQuickClimb(this.progress.currentFloor, this.progress.maxFloor).subscribe({
      next: res => {
        if (res.success && res.data) {
          this.activeQuickClimbJobId = res.data.jobId;
          this.isQuickClimbModalOpen = true;
          this.cdr.markForCheck();
        } else {
          alert(res.message || 'Không thể bắt đầu leo nhanh.');
        }
      },
      error: err => {
        alert(err?.error?.message || 'Lỗi khi khởi chạy leo nhanh.');
      }
    });
  }

  closeQuickClimbModal(): void {
    this.isQuickClimbModalOpen = false;
    this.activeQuickClimbJobId = undefined;
    this.fetchTowerData(false);
  }

  viewBattleFromHistory(battleId: string): void {
    this.isQuickClimbModalOpen = false;
    this.api.getBattleHistory(battleId).subscribe({
      next: res => {
        if (res.success && res.data) {
          this.battleResult = res.data;
          this.battleHeroStats = res.data.battleSimulation.heroStatistics || [];
          this.isBattleResultOpen = true;
          this.cdr.markForCheck();
        }
      }
    });
  }

  // --- Battle Result Events ---
  handleContinueClimb(): void {
    this.isBattleResultOpen = false;
    this.isPlayingBattle = false;
    this.battleEngine.resetBattle();
    const nextFloor = this.battleResult?.nextFloorNumber;
    if (nextFloor && this.progress) {
      this.triggerFloorTransition(this.progress.currentFloor, nextFloor);
    } else {
      this.fetchTowerData(false);
    }
  }

  handleRetryClimb(): void {
    this.isBattleResultOpen = false;
    this.isPlayingBattle = false;
    this.battleEngine.resetBattle();
    if (this.battleResult) {
      this.api.getFloorDetail(this.battleResult.floorNumber).subscribe({
        next: res => {
          if (res.success && res.data) {
            this.selectedFloorDetail = res.data;
            this.fetchTowerData(false);
          }
        }
      });
    }
  }

  get totalBattleRounds(): number {
    const events = this.battleResult?.battleSimulation?.events;
    if (!events || events.length === 0) return 0;
    return events[events.length - 1].round || 1;
  }

  replayCurrentBattle(): void {
    if (!this.battleResult) return;
    this.isPlayingBattle = true;
    this.battleEngine.resetBattle();
    this.battleEngine.loadServerBattle(this.battleResult.battleSimulation);
    this.battleEngine.startBattle();
  }

  closeBattleResult(): void {
    this.isBattleResultOpen = false;
    this.isPlayingBattle = false;
    this.battleEngine.resetBattle();
    this.fetchTowerData(false);
  }

  private triggerFloorTransition(sourceFloor: number, targetFloor: number): void {
    this.isFloorTransitioning = true;
    this.transitionSourceFloor = sourceFloor;
    this.transitionTargetFloor = targetFloor;
    this.cdr.markForCheck();

    const prefersReducedMotion = typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

    const duration = prefersReducedMotion ? 50 : 850;

    setTimeout(() => {
      this.isFloorTransitioning = false;
      this.fetchTowerData(true);
    }, duration);
  }

  openFormationModal(): void {
    this.isFormationModalOpen = true;
  }

  closeFormationModal(): void {
    this.isFormationModalOpen = false;
    this.fetchTowerData(false);
  }

  private startCountdownTimer(): void {
    this.timerSub = interval(1000).subscribe(() => {
      if (this.progress && this.progress.secondsUntilReset > 0) {
        this.progress.secondsUntilReset--;
        if (this.progress.secondsUntilReset === 0) this.fetchTowerData(true);
        this.cdr.markForCheck();
      }
    });
  }

  formatCountdown(seconds?: number): string {
    if (!seconds || seconds <= 0) return '00:00:00';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  backToCampaign(): void {
    this.router.navigate(['/dcs-game/campaign']);
  }
}
