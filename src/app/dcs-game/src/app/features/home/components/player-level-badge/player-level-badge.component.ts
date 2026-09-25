import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-player-level-badge',
  standalone: true,
  template: `<div class="level-emblem" [attr.data-tier]="tier" [attr.title]="tierName">
    <span class="wing wing-left"></span><span class="wing wing-right"></span>
    <span class="level-label">LV</span><strong>{{ normalizedLevel }}</strong>
  </div>`,
  styleUrl: './player-level-badge.component.scss'
})
export class PlayerLevelBadgeComponent {
  @Input() level = 1;
  get normalizedLevel(): number { return Math.max(1, Math.floor(this.level || 1)); }
  get tier(): number { return Math.min(11, Math.floor((this.normalizedLevel - 1) / 10)); }
  get tierName(): string { return `Cấp ${this.normalizedLevel} · Bậc ${this.tier + 1}`; }
}
