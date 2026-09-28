import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BattlePresentationEffect, BattleStatusEffectViewModel, Hero } from '../../../../core/models/hero.model';
import { BattleResourceViewModel } from '../../../../core/models/battle.model';
import { BattleStatusPresenter } from '../../presentation/battle-status.presenter';
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
import { AuraResourceComponent } from './aura-resource/aura-resource.component';

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
    BattleCharacterTooltipComponent,
    AuraResourceComponent
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
  @Input() displayMode: 'battle' | 'formation' | 'management' | 'library' = 'battle';
  @Input() activeActor: Hero | null | undefined = null;
  @Input() phase: string = 'idle';
  @Input() visualSpeed = 1;
  @Input() castSequence?: number | null = null;
  @Input() isEmpowered = false;

  private readonly statusPresenter = inject(BattleStatusPresenter);

  showTooltip = false;

  get presentationEffects(): BattlePresentationEffect[] {
    if (!this.character) return [];
    return this.statusPresenter.getPresentationEffects(this.character);
  }

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

  isStatusFullyStacked(status: BattlePresentationEffect | BattleStatusEffectViewModel): boolean {
    if (status.code === 'RICARDO') {
      return (status.stacks ?? 0) >= 6;
    }
    const max = (status as any).maxStacks;
    return max != null && max > 0 && (status.stacks ?? 0) >= max;
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

  getAuraResource(): BattleResourceViewModel | null {
    if (this.character?.resources?.['AURA']) {
      return this.character.resources['AURA'];
    }
    if (this.character?.heroCode === 'THANH_THAI_AURA') {
      return {
        resourceCode: 'AURA',
        currentValue: 0,
        maxValue: 100,
        tier: 0,
        isFull: false
      };
    }
    return null;
  }

  getAuraPercentage(): number {
    const aura = this.getAuraResource();
    if (!aura) return 0;
    return Math.min(100, Math.max(0, (aura.currentValue / (aura.maxValue || 100)) * 100));
  }

  formatAuraBonus(value: number | undefined): string {
    const safeValue = Math.max(0, value ?? 0);
    return Number.isInteger(safeValue) ? safeValue.toFixed(0) : safeValue.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
  }
}

export { getSpriteFlipState } from '../../utils/battle-facing.util';
