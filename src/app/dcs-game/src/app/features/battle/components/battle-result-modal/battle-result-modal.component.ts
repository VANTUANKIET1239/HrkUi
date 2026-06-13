import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Hero } from '../../../../core/models/hero.model';

@Component({
  selector: 'app-battle-result-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './battle-result-modal.component.html',
  styleUrl: './battle-result-modal.component.scss'
})
export class BattleResultModalComponent {
  @Input({ required: true }) isVictory = true;
  @Input() totalTurns = 0;
  @Input() aliveCount = 0;
  @Input() totalCount = 5;
  @Input() totalRemainingHp = 0;

  @Output() onReplay = new EventEmitter<void>();
}
