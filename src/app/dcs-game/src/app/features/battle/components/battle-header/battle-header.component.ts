import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-battle-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './battle-header.component.html',
  styleUrl: './battle-header.component.scss'
})
export class BattleHeaderComponent {
  @Input() teamName = 'Đội ngũ Coder';
  @Input() powerScore = 0;
  @Input() currentTurn = 0;
  @Input() leaderAvatar?: string;

  @Output() onReplay = new EventEmitter<void>();
  @Output() onExit = new EventEmitter<void>();
}
