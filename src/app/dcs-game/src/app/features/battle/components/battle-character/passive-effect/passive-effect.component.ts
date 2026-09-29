import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Hero } from '../../../../../core/models/hero.model';
import { PeFlyingMoneyComponent } from './pe-flying-money/pe-flying-money.component';
import { PeDarkShieldComponent } from './pe-dark-shield/pe-dark-shield.component';
import { PeBleedComponent } from './pe-bleed/pe-bleed.component';

@Component({
  selector: 'app-passive-effect',
  standalone: true,
  imports: [
    CommonModule,
    PeFlyingMoneyComponent,
    PeDarkShieldComponent,
    PeBleedComponent
  ],
  templateUrl: './passive-effect.component.html',
  styleUrl: './passive-effect.component.scss'
})
export class PassiveEffectComponent {
  @Input() hasMoneyEffect = false;
  @Input() hasDarkShield = false;
  @Input() isHit = false;
  @Input({ required: true }) character!: Hero;

  get hasBleedEffect(): boolean {
    if (this.character?.statusEffects?.includes('BLEED')) return true;
    return this.character?.battleStatuses?.some(s => s.code === 'BLEED') || false;
  }

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
    return this.character?.statusEffects?.some(effect => effect === 'Jackpot' || effect.startsWith('Jackpot (')) || false;
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

  get hasCatCompanion(): boolean {
    if (this.character?.statusEffects?.includes('CAT_COMPANION')) return true;
    return this.character?.battleStatuses?.some(s => s.code === 'CAT_COMPANION') || false;
  }

  get hasCatScratch(): boolean {
    if (this.character?.statusEffects?.includes('CAT_SCRATCH')) return true;
    return this.character?.battleStatuses?.some(s => s.code === 'CAT_SCRATCH') || false;
  }

  get hasDeepCatScratch(): boolean {
    if (this.character?.statusEffects?.includes('DEEP_CAT_SCRATCH')) return true;
    return this.character?.battleStatuses?.some(s => s.code === 'DEEP_CAT_SCRATCH') || false;
  }

  get hasChayNgayDi(): boolean {
    if (this.character?.statusEffects?.includes('CHAY_NGAY_DI')) return true;
    return this.character?.battleStatuses?.some(s => s.code === 'CHAY_NGAY_DI') || false;
  }

  get phongAnStacks(): number {
    const st = this.character?.battleStatuses?.find(s => s.code === 'PHONG_AN');
    return st?.stacks || (this.character?.resources?.['PHONG_AN']?.currentValue ?? 0);
  }

  get tinChiStacks(): number {
    const st = this.character?.battleStatuses?.find(s => s.code === 'TIN_CHI_DANH_DU');
    return st?.stacks || (this.character?.resources?.['TIN_CHI_DANH_DU']?.currentValue ?? 0);
  }

  get luanDiemStacks(): number {
    const st = this.character?.battleStatuses?.find(s => s.code === 'LUAN_DIEM');
    return st?.stacks || 0;
  }

  get hasSilenceEffect(): boolean {
    if (this.character?.statusEffects?.includes('SILENCE')) return true;
    return this.character?.battleStatuses?.some(s => s.code === 'SILENCE') || false;
  }

  get hasDamageReductionEffect(): boolean {
    if (this.character?.statusEffects?.includes('DAMAGE_REDUCTION')) return true;
    return this.character?.battleStatuses?.some(s => s.code === 'DAMAGE_REDUCTION') || false;
  }
}
