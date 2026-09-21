import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Hero, HeroStarAuraConfig } from '../../../../../core/models/hero.model';
import { StarAuraVisualKey } from './hero-star-aura.models';
import { resolveAuraVisualKey } from './hero-star-aura.resolver';

import { KietAuraComponent } from './kiet-aura/kiet-aura.component';
import { NamDeadlineAuraComponent } from './nam-deadline-aura/nam-deadline-aura.component';
import { ChuanMenAuraComponent } from './chuan-men-aura/chuan-men-aura.component';
import { CoderBanhAuraComponent } from './coder-banh-aura/coder-banh-aura.component';
import { TesterDepAuraComponent } from './tester-dep-aura/tester-dep-aura.component';
import { TuongLongAuraComponent } from './tuong-long-aura/tuong-long-aura.component';
import { PmHoiHaAuraComponent } from './pm-hoi-ha-aura/pm-hoi-ha-aura.component';
import { QaKyTinhAuraComponent } from './qa-ky-tinh-aura/qa-ky-tinh-aura.component';
import { KietNoelAuraComponent } from './kiet-noel-aura/kiet-noel-aura.component';
import { HoangNguyenAuraComponent } from './hoang-nguyen-aura/hoang-nguyen-aura.component';
import { PeRedLightningComponent } from './legacy-five-star/pe-red-lightning/pe-red-lightning.component';
import { PeObsidianNebulaComponent } from './legacy-five-star/pe-obsidian-nebula/pe-obsidian-nebula.component';
import { PeScorchedEarthComponent } from './legacy-five-star/pe-scorched-earth/pe-scorched-earth.component';
import { PeSpectralGroomingComponent } from './legacy-five-star/pe-spectral-grooming/pe-spectral-grooming.component';
import { PeViciousDebtComponent } from './legacy-five-star/pe-vicious-debt/pe-vicious-debt.component';
import { PeDarkBlizzardComponent } from './legacy-five-star/pe-dark-blizzard/pe-dark-blizzard.component';
import { PeHeavyIronAuraComponent } from './legacy-five-star/pe-heavy-iron-aura/pe-heavy-iron-aura.component';

@Component({
  selector: 'app-hero-star-aura',
  standalone: true,
  imports: [
    CommonModule,
    KietAuraComponent,
    NamDeadlineAuraComponent,
    ChuanMenAuraComponent,
    CoderBanhAuraComponent,
    TesterDepAuraComponent,
    TuongLongAuraComponent,
    PmHoiHaAuraComponent,
    QaKyTinhAuraComponent,
    KietNoelAuraComponent,
    HoangNguyenAuraComponent,
    PeRedLightningComponent,
    PeObsidianNebulaComponent,
    PeScorchedEarthComponent,
    PeSpectralGroomingComponent,
    PeViciousDebtComponent,
    PeDarkBlizzardComponent,
    PeHeavyIronAuraComponent
  ],
  templateUrl: './hero-star-aura.component.html',
  styleUrl: './hero-star-aura.component.scss'
})
export class HeroStarAuraComponent implements OnChanges {
  @Input() heroTemplateId?: number | null;
  @Input() stars = 0;
  @Input() auraConfig?: HeroStarAuraConfig | null;
  @Input() hero?: Hero | null;

  visualKey: StarAuraVisualKey | null = null;
  effectiveStarLevel = 0;
  intensity = 1;
  particleLevel = 1;
  primaryColor?: string | null;
  secondaryColor?: string | null;

  get hasActiveAura(): boolean {
    return this.effectiveStarLevel >= 2 && this.visualKey !== null;
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.updateState();
  }

  private updateState(): void {
    const rawStars = this.stars || this.auraConfig?.starLevel || this.hero?.stars || 0;
    const clampedStars = Math.max(0, Math.min(5, rawStars));

    if (clampedStars < 2) {
      this.effectiveStarLevel = 0;
      this.visualKey = null;
      return;
    }

    this.effectiveStarLevel = clampedStars;

    const tId = this.heroTemplateId ?? this.hero?.heroTemplateId ?? (this.hero?.id && this.hero.id > 0 && this.hero.id <= 10 ? this.hero.id : null);
    this.visualKey = resolveAuraVisualKey(this.auraConfig, tId, this.hero?.avatar);

    this.primaryColor = this.auraConfig?.primaryColorHex || null;
    this.secondaryColor = this.auraConfig?.secondaryColorHex || null;

    if (this.auraConfig?.intensity != null) {
      this.intensity = Number(this.auraConfig.intensity);
    } else {
      // Progressive default intensity
      switch (this.effectiveStarLevel) {
        case 2: this.intensity = 0.85; break;
        case 3: this.intensity = 1.30; break;
        case 4: this.intensity = 1.75; break;
        case 5: this.intensity = 2.20; break;
        default: this.intensity = 1; break;
      }
    }

    this.particleLevel = this.auraConfig?.particleLevel ?? Math.max(1, this.effectiveStarLevel - 1);
  }
}
