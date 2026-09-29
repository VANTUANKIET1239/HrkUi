import type { RPGHero } from '../hero-management.component';
import type {
  HeroStarUpgradePreviewDto,
  HeroUpgradePreviewDto,
} from '../../../../../core/models/player-hero.model';

export interface HeroFeatureTabContext {
  hero: RPGHero;
  upgradePreview: HeroUpgradePreviewDto | null;
  starUpgradePreview: HeroStarUpgradePreviewDto | null;
  isUpgradingHero: boolean;
  isStarUpgrading: boolean;
  upgradeHero: (levels: number) => void;
  confirmStarUpgrade: () => void;
  setAuraTier: (tier: 1 | 2 | 3 | 4) => void;
}
