import { Type } from '@angular/core';
import { HeroAuraTabComponent } from './hero-aura-tab.component';
import { HeroBondTabComponent } from './hero-bond-tab.component';
import { HeroLevelUpTabComponent } from './hero-level-up-tab.component';
import { HeroStarUpgradeTabComponent } from './hero-star-upgrade-tab.component';

export const HERO_FEATURE_TAB_REGISTRY: Readonly<Record<string, Type<unknown>>> = {
  HERO_LEVEL_UP: HeroLevelUpTabComponent,
  HERO_STAR_UPGRADE: HeroStarUpgradeTabComponent,
  HERO_AURA: HeroAuraTabComponent,
  HERO_BOND: HeroBondTabComponent,
};

export function resolveHeroFeatureTab(code: string): Type<unknown> | null {
  return HERO_FEATURE_TAB_REGISTRY[code] ?? null;
}
