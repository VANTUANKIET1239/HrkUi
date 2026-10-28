import { HrkTranslatePipe } from '@hrk/localization/hrk-translate.pipe';
import { Component, Input } from '@angular/core';

@Component({
  imports: [HrkTranslatePipe],
  selector: 'app-player-level-badge',
  standalone: true,
  template: `<div class="level-emblem" [attr.data-tier]="tier" [attr.title]="'Cấp {{level}} · Bậc {{tier}}' | hrkTranslate:{level:normalizedLevel,tier:tier + 1}">
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
