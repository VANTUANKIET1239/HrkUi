import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Hero } from '../../../../core/models/hero.model';
import { HpBarComponent } from '../../../../shared/components/hp-bar/hp-bar.component';
import { ManaBarComponent } from '../../../../shared/components/mana-bar/mana-bar.component';
import { DamageTextEvent } from '../../../../core/services/battle-engine.service';
import { SKILL_LIST } from '../../mocks/mock-battle.data';
import { SkillComponent } from './skill/skill.component';
import { PassiveEffectComponent } from './passive-effect/passive-effect.component';

@Component({
  selector: 'app-battle-character',
  standalone: true,
  imports: [
    CommonModule, 
    HpBarComponent, 
    ManaBarComponent,
    SkillComponent,
    PassiveEffectComponent
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
  @Input() displayMode: 'battle' | 'formation' = 'battle';

  getSkillCategory(): 'basic' | 'rage' | 'thunder' | 'ultimate' | 'heavenly' | null {
    if (!this.isCharging || !this.activeSkillId) return null;

    const skill = SKILL_LIST[this.activeSkillId];
    return (skill?.category as 'basic' | 'rage' | 'thunder' | 'ultimate' | 'heavenly') || 'basic';
  }

  hasMoneyEffect(): boolean {
    return this.character.statusEffects?.some(e => 
      ['Rich', 'Nạp VIP', 'Chiêu Tài', 'Sixpack Glow', 'Angry Aura'].includes(e)
    ) || false;
  }

  hasRedLightningEffect(): boolean {
    return this.character.statusEffects?.some(e => 
      ['Red Lightning', 'Sấm Sét Đỏ'].includes(e)
    ) || false;
  }

  hasObsidianNebulaEffect(): boolean {
    return this.character.statusEffects?.some(e => 
      ['Veil of the Obsidian Nebulae', 'Obsidian Nebula', 'Veil of Obsidian Nebulae'].includes(e)
    ) || false;
  }

  hasDarkShieldEffect(): boolean {
    return this.character.statusEffects?.some(e => 
      ['Dark Shield', 'Giáp Hư Không'].includes(e)
    ) || false;
  }

  hasScorchedEarthEffect(): boolean {
    return this.character.statusEffects?.some(e => 
      ['Scorched Earth Command', 'Scorched Earth', 'Chỉ Huy Thiết Giáp'].includes(e)
    ) || false;
  }

  hasSpectralGroomingEffect(): boolean {
    return this.character.statusEffects?.some(e => 
      ['Spectral Grooming Swarm', 'Spectral Grooming', 'Vortex Tóc Tai'].includes(e)
    ) || false;
  }

  hasViciousDebtEffect(): boolean {
    return this.character.statusEffects?.some(e => 
      ['Vortex of Vicious Debt', 'Vicious Debt', 'Vòng Xoáy Nợ Nần', 'Chúa Nợ'].includes(e)
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
    const defaultFacing = this.character.defaultFacing || 'right';
    if (this.character.team === 'left') {
      return defaultFacing === 'left';
    } else {
      return defaultFacing === 'right';
    }
  }
}
