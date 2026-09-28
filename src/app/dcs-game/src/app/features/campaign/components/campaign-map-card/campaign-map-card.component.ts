import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DungeonMap } from '../../../../core/models/dungeon.model';

@Component({
  selector: 'app-campaign-map-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './campaign-map-card.component.html',
  styleUrl: './campaign-map-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CampaignMapCardComponent {
  @Input({ required: true }) map!: DungeonMap;
  @Output() selectMap = new EventEmitter<DungeonMap>();

  get isClickable(): boolean {
    return this.map.state === 'AVAILABLE' || this.map.state === 'COMPLETED';
  }

  get progressPercent(): number {
    if (!this.map.totalStages) return 0;
    return Math.min(100, Math.round((this.map.clearedStages / this.map.totalStages) * 100));
  }

  onImgError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target && !target.src.includes('lobby_bg.png')) {
      target.src = '/assets/images/dcs-game/lobby_bg.png';
    }
  }

  onCardClick(): void {
    if (this.isClickable) {
      this.selectMap.emit(this.map);
    }
  }
}
