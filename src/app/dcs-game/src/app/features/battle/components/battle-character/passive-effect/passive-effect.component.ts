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
    PeViciousDebtComponent
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
  @Input({ required: true }) character!: Hero;
}
