import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BattleStatusEffectViewModel, Hero } from '../../../../core/models/hero.model';
import { HpBarComponent } from '../../../../shared/components/hp-bar/hp-bar.component';
import { ManaBarComponent } from '../../../../shared/components/mana-bar/mana-bar.component';
import { DamageTextEvent } from '../../../../core/services/battle-engine.service';
import { SKILL_LIST } from '../../mocks/mock-battle.data';
import { SkillComponent } from './skill/skill.component';
import { PassiveEffectComponent } from './passive-effect/passive-effect.component';
import { getSpriteFlipState } from '../../utils/battle-facing.util';

import { BasicSkillEffectComponent } from './basic-skill-effect/basic-skill-effect.component';
import { HeroStarAuraComponent } from './hero-star-aura/hero-star-aura.component';
import { BattleCharacterTooltipComponent } from '../battle-character-tooltip/battle-character-tooltip.component';

@Component({
  selector: 'app-battle-character',
  standalone: true,
  imports: [
    CommonModule, 
    HpBarComponent, 
    ManaBarComponent,
    SkillComponent,
    PassiveEffectComponent,
    BasicSkillEffectComponent,
    HeroStarAuraComponent,
    BattleCharacterTooltipComponent
  ],
  templateUrl: './battle-character.component.html',
  styleUrl: './battle-character.component.scss'
})
export class BattleCharacterComponent {
  @Input({ required: true }) character!: Hero;
  @Input() isCharging = false;
  @Input() isHit = false;
  @Input() skillColor = '#ffffff';
  @Input() damageEvent: DamageTextEvent | null = null;
  @Input() activeSkillId: string | null = null;
  @Input() activeSkillCategory: 'basic' | 'ultimate' = 'basic';
  @Input() displayMode: 'battle' | 'formation' = 'battle';
  @Input() activeActor: Hero | null | undefined = null;
  @Input() phase: string = 'idle';
  @Input() visualSpeed = 1;
  @Input() castSequence?: number | null = null;
  @Input() isEmpowered = false;

  showTooltip = false;

  onMouseEnter(): void {
    this.showTooltip = true;
  }

  onMouseLeave(): void {
    this.showTooltip = false;
  }

  onFocus(): void {
    this.showTooltip = true;
  }

  onBlur(): void {
    this.showTooltip = false;
  }

  isBasicSkill(skillId: string | null): boolean {
    if (!skillId) return false;
    return skillId === 'NORMAL_ATTACK' || skillId === 'CHUAN_MEN_BASIC' || skillId === 'BASIC_RANDOM_HEAL' || this.activeSkillCategory === 'basic';
  }

  isEmpoweredRicardo(): boolean {
    return this.activeSkillId === 'RICARDO_MILOS' && this.isCharging && this.isEmpowered;
  }

  isStatusFullyStacked(status: BattleStatusEffectViewModel): boolean {
    return status.maxStacks != null && status.maxStacks > 0 && status.stacks >= status.maxStacks;
  }

  getSkillCategory(): 'basic' | 'rage' | 'thunder' | 'ultimate' | 'heavenly' | null {
    if (!this.isCharging || !this.activeSkillId) return null;

    const skill = SKILL_LIST[this.activeSkillId];
    return (skill?.category as 'basic' | 'rage' | 'thunder' | 'ultimate' | 'heavenly') || this.activeSkillCategory;
  }

  hasMoneyEffect(): boolean {
    return this.character.statusEffects?.some(e => 
      ['Rich', 'Nạp VIP', 'Chiêu Tài', 'Sixpack Glow', 'Angry Aura'].includes(e)
    ) || false;
  }

  hasDarkShieldEffect(): boolean {
    if (this.character.statusEffects?.includes('SHIELD')) return true;
    return this.character.statusEffects?.some(e => 
      ['Dark Shield', 'Giáp Hư Không'].includes(e)
    ) || false;
  }

  hasBaoKeEffect(): boolean {
    return this.character.statusEffects?.some(e => e.startsWith('Quà Bảo Kê')) || false;
  }


  getRowLabel(): string {
    const pos = this.character.position;
    return [1, 3, 5].includes(pos) ? 'FRONT' : 'BACK';
  }

  shouldFlipSprite(): boolean {
    return getSpriteFlipState(this.character.team, this.character.defaultFacing);
  }

  isTaoLaNhat(): boolean {
    return this.character.heroTemplateId === 11 ||
      (this.character.avatar?.includes('tao-la-nhat') ?? false) ||
      (this.character.name?.toLowerCase().includes('tao là nhất') ?? false);
  }
}

export { getSpriteFlipState } from '../../utils/battle-facing.util';
