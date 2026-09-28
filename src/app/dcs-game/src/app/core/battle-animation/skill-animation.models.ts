import { BattleSpeed } from './battle-speed.constants';

export type SkillSpeedPolicy =
  | 'FULL_SCALE'
  | 'CLAMPED'
  | 'FIXED';

export interface SkillAnimationConfig {
  skillId: string;
  totalDurationMs: number;
  speedPolicy: SkillSpeedPolicy;
  maxVisualSpeed?: number;
  minimumVisibleDurationMs?: number;
  combatTextMinimumDurationMs?: number;
  animationKey?: string;
  defaultPlaybackSpeed?: number;
  phases?: SkillAnimationPhaseMetadata[];
}

export interface SkillVisualPolicy {
  speedPolicy: SkillSpeedPolicy;
  maxVisualSpeed?: number;
  minimumVisibleDurationMs?: number;
  combatTextMinimumDurationMs?: number;
  totalDurationMs?: number;
}

export interface SkillAnimationPhaseMetadata {
  phaseCode: string;
  startAtMs: number;
  durationMs: number;
  triggerEventType?: string | null;
}

export interface SkillAnimationMetadata {
  animationKey: string;
  totalDurationMs: number;
  defaultPlaybackSpeed?: number;
  phases?: SkillAnimationPhaseMetadata[];
}

// Phase codes are content data owned by the server (for example DESCEND,
// AOE_DAMAGE or DETONATE), so the UI must not maintain a closed enum for them.
export type BattleVisualPhase = string;

export interface VisualCastState {
  castSequence: number;
  skillId: string;
  actorId: number;
  startedAt: number;
  durationMs: number;
  visualSpeed: number;
  phaseCode: string | null;
  completed: boolean;
}

export interface VisualTimerHandle {
  id: number;
  cancel: () => void;
  pause: () => void;
  resume: () => void;
  isCompleted: () => boolean;
}
