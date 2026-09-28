import { Component, inject, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { ClaimStarChestResult, DungeonMapDetail, DungeonStage, DungeonStamina, DungeonStarChest } from '../../../../core/models/dungeon.model';
import { DungeonApiService } from '../../../../core/services/dungeon-api.service';
import { DungeonSessionService } from '../../../../core/services/dungeon-session.service';
import { CampaignAtmosphereComponent } from '../../components/campaign-atmosphere/campaign-atmosphere.component';
import { CampaignRoadComponent } from '../../components/campaign-road/campaign-road.component';
import { CampaignStageNodeComponent } from '../../components/campaign-stage-node/campaign-stage-node.component';
import { CampaignBossNodeComponent } from '../../components/campaign-boss-node/campaign-boss-node.component';
import { CampaignStageDetailModalComponent } from '../../components/campaign-stage-detail-modal/campaign-stage-detail-modal.component';
import { BattleFormationSetupModalComponent } from '../../components/battle-formation-setup-modal/battle-formation-setup-modal.component';
import { STAGE_COORDINATES, RoadPoint } from '../../components/campaign-road/campaign-road.models';
import { BattleFormationDraft } from '../../../../core/models/dungeon.model';
import { EquipmentTooltipComponent } from '../../../../shared/components/equipment-tooltip/equipment-tooltip.component';
import { CampaignThemeService, CampaignTheme } from '../../services/campaign-theme.service';

@Component({
  selector: 'app-campaign-stage-map',
  standalone: true,
  imports: [
    CommonModule,
    CampaignAtmosphereComponent,
    CampaignRoadComponent,
    CampaignStageNodeComponent,
    CampaignBossNodeComponent,
    CampaignStageDetailModalComponent,
    BattleFormationSetupModalComponent,
    EquipmentTooltipComponent
  ],
  templateUrl: './campaign-stage-map.component.html',
  styleUrl: './campaign-stage-map.component.scss'
})
export class CampaignStageMapComponent implements OnInit, AfterViewInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(DungeonApiService);
  private readonly session = inject(DungeonSessionService);
  private readonly themeService = inject(CampaignThemeService);

  @ViewChild('journeyContainer') journeyContainer?: ElementRef<HTMLElement>;

  map?: DungeonMapDetail;
  get currentTheme(): CampaignTheme {
    return this.themeService.resolveTheme(this.map?.code);
  }
  selected?: DungeonStage;
  formationSetupStage?: DungeonStage;
  stamina?: DungeonStamina;
  loading = true;
  starting = false;
  claimingChestId: number | null = null;
  previewChest: DungeonStarChest | null = null;
  claimedReward: ClaimStarChestResult | null = null;
  error = '';
  modalError = '';
  chestError = '';

  private readonly coordsMap = new Map<number, RoadPoint>(
    STAGE_COORDINATES.map(p => [p.stageNumber, p])
  );

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadMap(id);
    this.refreshStamina();
  }

  ngAfterViewInit(): void {
    // Attempt focus once DOM elements mount
    setTimeout(() => this.focusCurrentStage(), 350);
  }

  loadMap(id: number): void {
    this.loading = true;
    this.error = '';
    this.api.map(id).subscribe({
      next: r => {
        this.loading = false;
        if (r.success && r.data) {
          this.map = r.data;
          setTimeout(() => this.focusCurrentStage(), 250);
        } else {
          this.error = r.message || 'Không tải được thông tin các màn phó bản.';
        }
      },
      error: e => {
        this.loading = false;
        this.error = e?.error?.message ?? 'Không tải được danh sách các màn.';
      }
    });
  }

  refreshStamina(): void {
    this.api.stamina().subscribe({
      next: r => {
        if (r.success) {
          this.stamina = r.data;
        }
      }
    });
  }

  get currentStageNumber(): number {
    if (!this.map?.stages || this.map.stages.length === 0) return 1;
    // Find stage in AVAILABLE state
    const available = this.map.stages.find(s => s.state === 'AVAILABLE');
    if (available) return available.stageNumber;

    // Or highest cleared stage
    const cleared = this.map.stages.filter(s => s.state === 'CLEARED');
    if (cleared.length > 0) {
      return Math.min(15, cleared[cleared.length - 1].stageNumber + 1);
    }
    return 1;
  }

  getStageCoord(stageNumber: number): { xPercent: number; yPercent: number } {
    const pt = this.coordsMap.get(stageNumber);
    return {
      xPercent: pt?.xPercent ?? 50,
      yPercent: pt?.yPercent ?? 50
    };
  }

  isBossStage(stage: DungeonStage): boolean {
    return stage.stageNumber === 5 || stage.stageNumber === 10 || stage.stageNumber === 15 || stage.stageType !== 'NORMAL';
  }

  choose(stage: DungeonStage): void {
    if (stage.state !== 'LOCKED') {
      this.selected = stage;
      this.modalError = '';
    }
  }

  focusCurrentStage(): void {
    const curNum = this.currentStageNumber;
    const targetElement = document.getElementById(`stage-node-${curNum}`);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  fight(stage: DungeonStage): void {
    if (!stage || !this.map || this.starting) return;

    if ((this.stamina?.current ?? 0) < stage.staminaCost) {
      this.modalError = `Không đủ thể lực. Cần ${stage.staminaCost} thể lực, bạn hiện có ${this.stamina?.current ?? 0}.`;
      return;
    }

    this.modalError = '';
    this.selected = undefined;
    this.formationSetupStage = stage;
  }

  startBattleWithDraft(draft: BattleFormationDraft): void {
    if (!this.formationSetupStage || !this.map || this.starting) return;

    if ((this.stamina?.current ?? 0) < this.formationSetupStage.staminaCost) {
      return;
    }

    this.starting = true;
    const stageId = this.formationSetupStage.id;
    const mapId = this.map.id;

    this.api.start(stageId, draft).subscribe({
      next: r => {
        this.starting = false;
        if (r.success && r.data) {
          this.formationSetupStage = undefined;
          this.session.set(r.data, mapId);
          this.router.navigate(['/dcs-game/battle']);
        }
      },
      error: () => {
        this.starting = false;
      }
    });
  }

  closeModal(): void {
    if (!this.starting) {
      this.selected = undefined;
      this.modalError = '';
    }
  }

  getProgressPercent(): number {
    const total = this.map?.totalStars || 0;
    return Math.min(100, Math.max(0, (total / 45) * 100));
  }

  onChestClick(chest: DungeonStarChest): void {
    if (chest.state === 'CLAIMABLE') {
      if (this.claimingChestId !== null) return;
      this.claimingChestId = chest.id;
      this.chestError = '';

      this.api.claimChest(chest.id).pipe(
        finalize(() => {
          this.claimingChestId = null;
        })
      ).subscribe({
        next: res => {
          if (res.success && res.data) {
            chest.state = 'CLAIMED';
            this.claimedReward = res.data;
            this.refreshStamina();
          } else {
            this.chestError = res.message || 'Không thể nhận rương sao.';
          }
        },
        error: err => {
          this.chestError = err?.error?.message || 'Lỗi khi nhận thưởng rương sao.';
        }
      });
    } else {
      this.previewChest = chest;
    }
  }

  closePreviewChest(): void {
    this.previewChest = null;
  }

  closeClaimedReward(): void {
    this.claimedReward = null;
  }

  back(): void {
    this.router.navigate(['/dcs-game/campaign']);
  }
}

