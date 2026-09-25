import { BattleSpeed, VISUAL_SPEED_BY_BATTLE_SPEED } from './battle-speed.constants';
import { SkillAnimationConfig, SkillAnimationMetadata, SkillVisualPolicy } from './skill-animation.models';

export const SKILL_VISUAL_POLICIES: Readonly<Record<string, SkillVisualPolicy>> = {
  RICARDO_MILOS: {
    speedPolicy: 'CLAMPED',
    maxVisualSpeed: 1.5,
    minimumVisibleDurationMs: 1800
  },
  HAI_LAST_LAUGH: {
    speedPolicy: 'CLAMPED',
    maxVisualSpeed: 1.6,
    minimumVisibleDurationMs: 1700
  },
  FATAL_ALL_IN_DIRECTIVE: {
    speedPolicy: 'CLAMPED',
    maxVisualSpeed: 1.7,
    minimumVisibleDurationMs: 2300
  },
  DEADLIFT_DIA_CHAN: {
    speedPolicy: 'CLAMPED',
    maxVisualSpeed: 1.7,
    minimumVisibleDurationMs: 2200
  },
  TACTICAL_AIR_STRIKE: {
    speedPolicy: 'CLAMPED',
    maxVisualSpeed: 1.6,
    minimumVisibleDurationMs: 1800
  }
};

// Durations here are compatibility fallbacks only. Configured skills get their
// actual timeline duration from HRK_SkillAnimationConfigs through the API.
export const SKILL_ANIMATION_CONFIGS: Readonly<Record<'DEFAULT_BASIC' | 'DEFAULT_ULTIMATE', SkillAnimationConfig>> = {
  DEFAULT_BASIC: {
    skillId: 'DEFAULT_BASIC',
    totalDurationMs: 700,
    speedPolicy: 'FULL_SCALE',
    minimumVisibleDurationMs: 250,
    combatTextMinimumDurationMs: 400
  },
  DEFAULT_ULTIMATE: {
    skillId: 'DEFAULT_ULTIMATE',
    totalDurationMs: 2200,
    speedPolicy: 'CLAMPED',
    maxVisualSpeed: 1.75,
    minimumVisibleDurationMs: 1200,
    combatTextMinimumDurationMs: 550
  }
};

export function resolveSkillConfig(
  skillId?: string | null,
  isUltimate = false,
  metadata?: SkillAnimationMetadata | null
): SkillAnimationConfig {
  const policyKey = metadata?.animationKey || skillId || '';
  const registeredPolicy = SKILL_VISUAL_POLICIES[policyKey] ??
    (skillId ? SKILL_VISUAL_POLICIES[skillId] : undefined);

  if (registeredPolicy) {
    const fallback = isUltimate ? SKILL_ANIMATION_CONFIGS.DEFAULT_ULTIMATE : SKILL_ANIMATION_CONFIGS.DEFAULT_BASIC;
    return {
      ...fallback,
      ...registeredPolicy,
      skillId: skillId || fallback.skillId,
      totalDurationMs: metadata?.totalDurationMs ?? fallback.totalDurationMs,
      animationKey: metadata?.animationKey,
      defaultPlaybackSpeed: metadata?.defaultPlaybackSpeed,
      phases: metadata?.phases
    };
  }

  const fallback = isUltimate ? SKILL_ANIMATION_CONFIGS.DEFAULT_ULTIMATE : SKILL_ANIMATION_CONFIGS.DEFAULT_BASIC;
  return {
    ...fallback,
    skillId: skillId || fallback.skillId,
    totalDurationMs: metadata?.totalDurationMs ?? fallback.totalDurationMs,
    animationKey: metadata?.animationKey,
    defaultPlaybackSpeed: metadata?.defaultPlaybackSpeed,
    phases: metadata?.phases
  };
}

export function resolveVisualSpeed(
  battleSpeed: BattleSpeed,
  config: SkillAnimationConfig
): number {
  const configuredSpeed = config.defaultPlaybackSpeed && config.defaultPlaybackSpeed > 0
    ? config.defaultPlaybackSpeed
    : 1;
  switch (config.speedPolicy) {
    case 'FULL_SCALE':
      return battleSpeed * configuredSpeed;
    case 'CLAMPED': {
      const mapped = (VISUAL_SPEED_BY_BATTLE_SPEED[battleSpeed] ?? 1) * configuredSpeed;
      return config.maxVisualSpeed ? Math.min(mapped, config.maxVisualSpeed) : mapped;
    }
    case 'FIXED':
      return configuredSpeed;
    default:
      return 1;
  }
}

export function resolveEffectiveDuration(
  battleSpeed: BattleSpeed,
  config: SkillAnimationConfig
): number {
  const visualSpeed = resolveVisualSpeed(battleSpeed, config);
  const scaled = config.totalDurationMs / (visualSpeed > 0 ? visualSpeed : 1);
  return Math.max(scaled, config.minimumVisibleDurationMs ?? 0);
}
