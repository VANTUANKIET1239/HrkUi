import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-battle-controls',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './battle-controls.component.html',
  styleUrl: './battle-controls.component.scss'
})
export class BattleControlsComponent {
  @Input() status: 'idle' | 'playing' | 'paused' | 'finished' = 'playing';
  @Input() speed = 1;
  @Input() isLogOpen = false;

  @Output() onTogglePlay = new EventEmitter<void>();
  @Output() onSpeedChange = new EventEmitter<number>();
  @Output() onSkip = new EventEmitter<void>();
  @Output() onToggleLog = new EventEmitter<void>();

  get isPlaying(): boolean {
    return this.status === 'playing';
  }

  get isFinished(): boolean {
    return this.status === 'finished';
  }

  selectSpeed(s: number): void {
    this.onSpeedChange.emit(s);
  }
}
