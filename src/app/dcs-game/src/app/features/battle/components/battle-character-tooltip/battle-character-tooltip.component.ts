import { Component, Input } from '@angular/core';
import { HERO_STAR_COLORS } from '../../../../core/configs/hero-star-colors';
import { CommonModule } from '@angular/common';
import { Hero, BattleStatusEffectViewModel } from '../../../../core/models/hero.model';

@Component({
  selector: 'app-battle-character-tooltip',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './battle-character-tooltip.component.html',
  styleUrl: './battle-character-tooltip.component.scss'
})
export class BattleCharacterTooltipComponent {
  readonly starColors = HERO_STAR_COLORS;
  @Input({ required: true }) hero!: Hero;
  @Input() placement: 'left' | 'right' | 'auto' = 'auto';

  get computedPlacement(): string {
    if (this.placement !== 'auto') return this.placement;
    return this.hero.team === 'left' ? 'right' : 'left';
  }

  get isTopRow(): boolean {
    return this.hero.position === 1 || this.hero.position === 2;
  }

  get isBottomRow(): boolean {
    return this.hero.position === 4 || this.hero.position === 5;
  }

  get starsCount(): number {
    return Math.max(0, Math.min(5, this.hero.stars ?? 1));
  }

  get starsArray(): number[] {
    return Array.from({ length: this.starsCount }, (_, index) => index);
  }

  get hpPercent(): number {
    if (!this.hero.maxHp) return 0;
    return Math.max(0, Math.min(100, Math.round((this.hero.hp / this.hero.maxHp) * 100)));
  }

  get manaPercent(): number {
    if (!this.hero.maxMana) return 0;
    return Math.max(0, Math.min(100, Math.round((this.hero.mana / this.hero.maxMana) * 100)));
  }

  get buffs(): BattleStatusEffectViewModel[] {
    return (this.hero.battleStatuses ?? []).filter(s => s.category === 'BUFF');
  }

  get debuffs(): BattleStatusEffectViewModel[] {
    return (this.hero.battleStatuses ?? []).filter(s => s.category === 'DEBUFF' || s.category === 'CONTROL');
  }

  get otherStatuses(): BattleStatusEffectViewModel[] {
    return (this.hero.battleStatuses ?? []).filter(s => s.category !== 'BUFF' && s.category !== 'DEBUFF' && s.category !== 'CONTROL');
  }

  formatModifier(modifier: { attributeName?: string; attributeCode: string; value: number; valueType: string }): string {
    const name = modifier.attributeName || this.translateAttr(modifier.attributeCode);
    const sign = modifier.value > 0 ? '+' : '';
    const unit = modifier.valueType === 'PERCENT' ? '%' : '';
    return `${name}: ${sign}${modifier.value}${unit}`;
  }

  private translateAttr(code: string): string {
    const map: Record<string, string> = {
      ATK: 'Công',
      DEF: 'Thủ',
      SPD: 'Tốc độ',
      HP: 'HP',
      CRIT: 'Chí mạng',
      SHIELD: 'Khiên'
    };
    return map[code.toUpperCase()] || code;
  }
}
