import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DungeonPossibleDrop, DungeonStage } from '../../../../core/models/dungeon.model';
import { TowerFloorDetail } from '../../../../core/models/event.model';
import { EquipmentTooltipService } from '../../../../shared/components/equipment-tooltip/equipment-tooltip.service';

@Component({
  selector: 'app-campaign-stage-detail-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './campaign-stage-detail-modal.component.html',
  styleUrl: './campaign-stage-detail-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CampaignStageDetailModalComponent {
  private readonly tooltipService = inject(EquipmentTooltipService);

  @Input() mode: 'DUNGEON' | 'TOWER' = 'DUNGEON';
  @Input() stage?: DungeonStage;
  @Input() towerFloor?: TowerFloorDetail;
  @Input() remainingLives = 3;
  @Input() staminaCurrent = 0;
  @Input() isStarting = false;
  @Input() errorMessage = '';

  @Output() close = new EventEmitter<void>();
  @Output() startBattle = new EventEmitter<any>();

  onDropHover(event: MouseEvent, drop: DungeonPossibleDrop): void {
    this.tooltipService.show(event, drop);
  }

  onDropLeave(): void {
    this.tooltipService.hide();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (!this.isStarting) {
      this.close.emit();
    }
  }

  get isStaminaSufficient(): boolean {
    if (this.mode === 'TOWER') return true;
    return this.staminaCurrent >= (this.stage?.staminaCost || 0);
  }

  get canStart(): boolean {
    if (this.isStarting) return false;
    if (this.mode === 'TOWER') {
      return this.remainingLives > 0 && (this.towerFloor?.isUnlocked ?? true);
    }
    return this.isStaminaSufficient;
  }

  get modalTitle(): string {
    if (this.mode === 'TOWER') {
      return `Tầng ${this.towerFloor?.floorNumber || 1} - Đỉnh Phong`;
    }
    return this.stage?.name || '';
  }

  get challengeTypeLabel(): string {
    if (this.mode === 'TOWER') {
      switch (this.towerFloor?.floorType) {
        case 'BOSS': return 'ĐẠI BOSS';
        case 'ELITE': return 'TINH ANH';
        default: return 'TẦNG THƯỜNG';
      }
    }
    switch (this.stage?.stageType) {
      case 'BOSS': return 'ĐẠI BOSS';
      case 'MINI_BOSS': return 'MINI BOSS';
      default: return 'ẢI THƯỜNG';
    }
  }

  get effectivePlayerPower(): number {
    return this.mode === 'TOWER'
      ? (this.towerFloor?.playerPower || 0)
      : (this.stage?.playerPower || 0);
  }

  get effectiveEnemyPower(): number {
    if (this.mode === 'TOWER') {
      return this.towerFloor?.enemies?.reduce((sum, e) => sum + e.power, 0) || 0;
    }
    return this.stage?.enemyPower || 0;
  }

  get effectiveRecommendedPower(): number {
    return this.mode === 'TOWER'
      ? (this.towerFloor?.recommendedPower || 0)
      : (this.stage?.recommendedPower || 0);
  }

  get powerStatus(): { label: string; class: string; icon: string } {
    const ratio = this.effectivePlayerPower / Math.max(1, this.effectiveRecommendedPower || 1);
    if (ratio >= 1.15) {
      return { label: 'Ưu Thế Áp Đảo', class: 'status-advantage', icon: '⚡' };
    }
    if (ratio >= 0.9) {
      return { label: 'Cân Bằng Thử Thách', class: 'status-balanced', icon: '⚖️' };
    }
    return { label: 'Nguy Hiểm - Lực Chiến Thấp', class: 'status-danger', icon: '⚠️' };
  }

  get displayEnemies(): { name: string; imagePath?: string; level: number; stars: number; power: number; position: number; isBoss: boolean }[] {
    if (this.mode === 'TOWER') {
      return this.towerFloor?.enemies || [];
    }
    return this.stage?.enemies || [];
  }

  get lockOrErrorText(): string {
    if (this.errorMessage) return this.errorMessage;
    if (this.mode === 'TOWER') {
      if (this.remainingLives <= 0) return 'Đã hết mạng! Vui lòng bắt đầu lượt leo mới.';
      if (this.towerFloor && !this.towerFloor.isUnlocked) {
        return this.towerFloor.lockReason || 'Tầng chưa mở khóa (phải vượt tầng trước).';
      }
      return '';
    }
    if (!this.isStaminaSufficient) {
      return `Không đủ thể lực để bắt đầu chiến đấu (cần ${this.stage?.staminaCost}, hiện có ${this.staminaCurrent}).`;
    }
    return '';
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop') && !this.isStarting) {
      this.close.emit();
    }
  }

  onFightClick(): void {
    if (!this.canStart) return;
    this.startBattle.emit(this.mode === 'TOWER' ? this.towerFloor : this.stage);
  }
}
