import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Hero } from '../../../../../core/models/hero.model';
import { PeLevel1Component } from './pe-level-1/pe-level-1.component';
import { PeLevel2Component } from './pe-level-2/pe-level-2.component';
import { PeLevel3Component } from './pe-level-3/pe-level-3.component';
import { PeLevel4Component } from './pe-level-4/pe-level-4.component';
import { PeFlyingMoneyComponent } from './pe-flying-money/pe-flying-money.component';
import { PeRedLightningComponent } from './pe-red-lightning/pe-red-lightning.component';
import { PeObsidianNebulaComponent } from './pe-obsidian-nebula/pe-obsidian-nebula.component';
import { PeDarkShieldComponent } from './pe-dark-shield/pe-dark-shield.component';
import { PeScorchedEarthComponent } from './pe-scorched-earth/pe-scorched-earth.component';
import { PeSpectralGroomingComponent } from './pe-spectral-grooming/pe-spectral-grooming.component';
import { PeViciousDebtComponent } from './pe-vicious-debt/pe-vicious-debt.component';
import { PeDarkBlizzardComponent } from './pe-dark-blizzard/pe-dark-blizzard.component';
import { PeHeavyIronAuraComponent } from './pe-heavy-iron-aura/pe-heavy-iron-aura.component';

@Component({
  selector: 'app-passive-effect',
  standalone: true,
  imports: [
    CommonModule,
    PeLevel1Component,
    PeLevel2Component,
    PeLevel3Component,
    PeLevel4Component,
    PeFlyingMoneyComponent,
    PeRedLightningComponent,
    PeObsidianNebulaComponent,
    PeDarkShieldComponent,
    PeScorchedEarthComponent,
    PeSpectralGroomingComponent,
    PeViciousDebtComponent,
    PeDarkBlizzardComponent,
    PeHeavyIronAuraComponent
  ],
  templateUrl: './passive-effect.component.html',
  styleUrl: './passive-effect.component.scss'
})
export class PassiveEffectComponent {
  @Input() level = 1;
  @Input() hasMoneyEffect = false;
  @Input() hasRedLightning = false;
  @Input() hasObsidianNebula = false;
  @Input() hasDarkShield = false;
  @Input() hasScorchedEarth = false;
  @Input() hasSpectralGrooming = false;
  @Input() hasViciousDebt = false;
  @Input() isHit = false;
  @Input({ required: true }) character!: Hero;

  get hasMarkedEffect(): boolean {
    return this.character?.statusEffects?.some(e => 
      ['Marked', 'Đánh dấu', 'Đánh Dấu'].includes(e)
    ) || false;
  }

  get isDizzy(): boolean {
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

  get hasDarkBlizzard(): boolean {
    return this.character?.statusEffects?.some(e => 
      ['Dark Blizzard Sleighstream', 'Bão Tuyết Bóng Tối', 'Dark Blizzard'].includes(e)
    ) || false;
  }

  get hasHeavyIronAura(): boolean {
    return this.character?.statusEffects?.some(e => 
      ['Heavy Iron Gravitational Aura', 'Heavy Iron Aura', 'Trọng Lực', 'Heavy Iron'].includes(e)
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

