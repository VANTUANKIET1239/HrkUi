import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DungeonResult } from '../../../../core/models/dungeon.model';
import { EquipmentTooltipService } from '../../../../shared/components/equipment-tooltip/equipment-tooltip.service';
import { EquipmentRollDetailsComponent } from '../../../../shared/components/equipment-roll-details/equipment-roll-details.component';

@Component({
  selector: 'app-battle-result-modal',
  standalone: true,
  imports: [CommonModule, EquipmentRollDetailsComponent],
  templateUrl: './battle-result-modal.component.html',
  styleUrl: './battle-result-modal.component.scss'
})
export class BattleResultModalComponent implements OnInit {
  private readonly tooltipService = inject(EquipmentTooltipService);

  @Input({ required: true }) isVictory = true;
  @Input() totalTurns = 0;
  @Input() aliveCount = 0;
  @Input() totalCount = 5;
  @Input() totalRemainingHp = 0;
  @Input() dungeonResult?: DungeonResult | null;

  @Output() onReplay = new EventEmitter<void>();
  @Output() onExit = new EventEmitter<void>();

  displayedStars = 0;

  ngOnInit(): void {
    if (this.isVictory) {
      const targetStars = this.dungeonResult?.earnedStars ?? 1;
      let cur = 0;
      const interval = setInterval(() => {
        if (cur < targetStars) {
          cur++;
          this.displayedStars = cur;
        } else {
          clearInterval(interval);
        }
      }, 260);
    }
  }

  get remainingHpPercent(): number {
    if (!this.dungeonResult) return 0;
    return Math.round(Number(this.dungeonResult.remainingHpRate || 0) * 100);
  }

  onDroppedEquipHover(event: MouseEvent): void {
    if (this.dungeonResult?.droppedEquipment) {
      this.tooltipService.show(event, this.dungeonResult.droppedEquipment);
    }
  }

  onDroppedEquipLeave(): void {
    this.tooltipService.hide();
  }
}

