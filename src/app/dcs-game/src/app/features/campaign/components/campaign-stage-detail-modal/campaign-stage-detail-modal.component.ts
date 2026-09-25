import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DungeonPossibleDrop, DungeonStage } from '../../../../core/models/dungeon.model';
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

  @Input({ required: true }) stage!: DungeonStage;
  @Input() staminaCurrent = 0;
  @Input() isStarting = false;
  @Input() errorMessage = '';

  @Output() close = new EventEmitter<void>();
  @Output() startBattle = new EventEmitter<DungeonStage>();

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
    return this.staminaCurrent >= this.stage.staminaCost;
  }

  get powerDifference(): number {
    return (this.stage.playerPower || 0) - (this.stage.recommendedPower || 0);
  }

  get powerStatus(): { label: string; class: string; icon: string } {
    const ratio = (this.stage.playerPower || 0) / Math.max(1, this.stage.recommendedPower || 1);
    if (ratio >= 1.15) {
      return { label: 'Ưu Thế Áp Đảo', class: 'status-advantage', icon: '⚡' };
    }
    if (ratio >= 0.9) {
      return { label: 'Cân Bằng Thử Thách', class: 'status-balanced', icon: '⚖️' };
    }
    return { label: 'Nguy Hiểm - Lực Chiến Thấp', class: 'status-danger', icon: '⚠️' };
  }

  get stageTypeLabel(): string {
    switch (this.stage.stageType) {
      case 'BOSS': return 'ĐẠI BOSS';
      case 'MINI_BOSS': return 'MINI BOSS';
      default: return 'ẢI THƯỜNG';
    }
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop') && !this.isStarting) {
      this.close.emit();
    }
  }

  onFightClick(): void {
    if (this.isStarting || !this.isStaminaSufficient) return;
    this.startBattle.emit(this.stage);
  }
}
