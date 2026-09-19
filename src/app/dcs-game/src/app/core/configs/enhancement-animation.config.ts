export type EnhancementTier = 1 | 2 | 3;

export interface EnhancementAnimationConfig {
  tier: EnhancementTier;
  targetLevelMin: number;
  targetLevelMax: number;
  totalDurationMs: number;
  revealPointMs: number;
  strikeCount: number;
  strikeTimingsMs: number[];
  shakeLevel: 'none' | 'light' | 'medium' | 'heavy';
  hasEnergyRing: boolean;
  hasDarkeningOverlay: boolean;
  hasLightningArcs: boolean;
  hasSuspensePause: boolean;
}

export const ENHANCEMENT_ANIMATION_CONFIGS: Record<EnhancementTier, EnhancementAnimationConfig> = {
  1: {
    tier: 1,
    targetLevelMin: 1,
    targetLevelMax: 5,
    totalDurationMs: 1200,
    revealPointMs: 1200,
    strikeCount: 1,
    strikeTimingsMs: [500],
    shakeLevel: 'light',
    hasEnergyRing: false,
    hasDarkeningOverlay: false,
    hasLightningArcs: false,
    hasSuspensePause: false
  },
  2: {
    tier: 2,
    targetLevelMin: 6,
    targetLevelMax: 10,
    totalDurationMs: 1900,
    revealPointMs: 1900,
    strikeCount: 2,
    strikeTimingsMs: [700, 1000],
    shakeLevel: 'medium',
    hasEnergyRing: true,
    hasDarkeningOverlay: true,
    hasLightningArcs: false,
    hasSuspensePause: false
  },
  3: {
    tier: 3,
    targetLevelMin: 11,
    targetLevelMax: 15,
    totalDurationMs: 2500,
    revealPointMs: 2500,
    strikeCount: 2,
    strikeTimingsMs: [1100, 1500],
    shakeLevel: 'heavy',
    hasEnergyRing: true,
    hasDarkeningOverlay: true,
    hasLightningArcs: true,
    hasSuspensePause: true
  }
};

/**
 * Xác định tầng hiệu ứng cường hóa (Tier 1, 2, 3) dựa trên CẤP ĐỘ MỤC TIÊU (targetLevel = currentLevel + 1)
 */
export function getEnhancementAnimationTier(targetLevel: number): EnhancementTier {
  if (targetLevel <= 5) return 1;
  if (targetLevel <= 10) return 2;
  return 3;
}

/**
 * Kiểm tra xem lượt cường hóa có phải là nỗ lực lên cấp thần thoại tối đa (+14 -> +15) hay không
 */
export function isMaxLevelAttempt(targetLevel: number): boolean {
  return targetLevel === 15;
}
