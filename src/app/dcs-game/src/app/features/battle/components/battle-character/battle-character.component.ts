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

  getSkillCategory(): 'basic' | 'rage' | 'thunder' | 'ultimate' | 'heavenly' | null {
    if (!this.isCharging || !this.activeSkillId) return null;

    const skill = SKILL_LIST[this.activeSkillId];
    return skill ? skill.category : 'basic';
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
}
