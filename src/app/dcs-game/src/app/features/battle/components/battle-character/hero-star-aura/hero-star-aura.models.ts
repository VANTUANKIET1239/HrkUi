import { HeroStarAuraConfig } from '../../../../../core/models/hero.model';

export type StarAuraVisualKey =
  | 'kiet-red-lightning'
  | 'nam-deadline-sterile-pulse'
  | 'chuan-men-crimson-rhythm'
  | 'coder-banh-digital-knowledge'
  | 'tester-dep-obsidian-nebula'
  | 'tuong-long-scorched-command'
  | 'pm-hoi-ha-spectral-grooming'
  | 'qa-ky-tinh-vicious-debt'
  | 'kiet-noel-dark-blizzard'
  | 'hoang-nguyen-heavy-iron';

export interface HeroAuraInputs {
  starLevel: number;
  intensity: number;
  particleLevel: number;
  primaryColor?: string | null;
  secondaryColor?: string | null;
}

export type { HeroStarAuraConfig };
