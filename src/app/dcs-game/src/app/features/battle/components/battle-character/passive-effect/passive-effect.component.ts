import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Hero } from '../../../../../core/models/hero.model';
import { PeFlyingMoneyComponent } from './pe-flying-money/pe-flying-money.component';
import { PeDarkShieldComponent } from './pe-dark-shield/pe-dark-shield.component';

@Component({
  selector: 'app-passive-effect',
  standalone: true,
  imports: [
    CommonModule,
    PeFlyingMoneyComponent,
    PeDarkShieldComponent
  ],
  templateUrl: './passive-effect.component.html',
  styleUrl: './passive-effect.component.scss'
})
export class PassiveEffectComponent {
  @Input() hasMoneyEffect = false;
  @Input() hasDarkShield = false;
  @Input() isHit = false;
  @Input({ required: true }) character!: Hero;

  get hasMarkedEffect(): boolean {
    if (this.character?.statusEffects?.includes('MARK')) return true;
    return this.character?.statusEffects?.some(e => 
      ['Marked', 'Đánh dấu', 'Đánh Dấu'].includes(e)
    ) || false;
  }

  get isDizzy(): boolean {
    if (this.character?.statusEffects?.includes('STUN')) return true;
    return this.character?.statusEffects?.includes('Choáng Váng') || false;
  }

  get isJackpot(): boolean {
    return this.character?.statusEffects?.includes('Jackpot') || false;
  }

  get isBankrupt(): boolean {
    return this.character?.statusEffects?.some(e => 
      e.startsWith('Bankruptcy')
    ) || false;
  }

  get hasBaoKeEffect(): boolean {
    return this.character?.statusEffects?.some(e => 
      e.startsWith('Quà Bảo Kê')
    ) || false;
  }

  get hasDaThitEffect(): boolean {
    return this.character?.statusEffects?.some(e => 
      e.startsWith('Da Thịt Vững Chãi')
    ) || false;
  }

  get hasDeadliftShield(): boolean {
    return this.character?.statusEffects?.some(e => 
      e.startsWith('Deadlift Shield')
    ) || false;
  }

  get hasJointLock(): boolean {
    return this.character?.statusEffects?.some(e => 
      e.startsWith('Khóa Khớp')
    ) || false;
  }
}

