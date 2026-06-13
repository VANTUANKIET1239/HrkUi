import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PeLevel1Component } from './pe-level-1/pe-level-1.component';
import { PeLevel2Component } from './pe-level-2/pe-level-2.component';
import { PeLevel3Component } from './pe-level-3/pe-level-3.component';
import { PeLevel4Component } from './pe-level-4/pe-level-4.component';
import { PeFlyingMoneyComponent } from './pe-flying-money/pe-flying-money.component';
import { PeRedLightningComponent } from './pe-red-lightning/pe-red-lightning.component';

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
    PeRedLightningComponent
  ],
  templateUrl: './passive-effect.component.html',
  styleUrl: './passive-effect.component.scss'
})
export class PassiveEffectComponent {
  @Input() level = 1;
  @Input() hasMoneyEffect = false;
  @Input() hasRedLightning = false;
}
