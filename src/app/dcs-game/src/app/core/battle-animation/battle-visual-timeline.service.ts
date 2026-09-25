import { Injectable, signal } from '@angular/core';
import { BattleEventDto } from '../models/battle.model';
import { BattleSpeed } from './battle-speed.constants';
import {
  BattleVisualPhase,
  SkillAnimationConfig,
  SkillAnimationMetadata,
  VisualCastState,
  VisualTimerHandle
} from './skill-animation.models';
import {
  resolveEffectiveDuration,
  resolveSkillConfig,
  resolveVisualSpeed
} from './skill-animation-registry';

interface ActiveTimerRecord {
  callback: () => void;
  remainingMs: number;
  startedAt: number;
  timerId: any;
  completed: boolean;
}

@Injectable({ providedIn: 'root' })
export class BattleVisualTimelineService {
  readonly currentVisualSkillId = signal<string | null>(null);
  readonly visualActorId = signal<number | null>(null);
  readonly visualPhase = signal<BattleVisualPhase>('idle');
  readonly currentVisualSpeed = signal<number>(1);
  readonly visualCastSequence = signal<number | null>(null);
  readonly isVisualActive = signal<boolean>(false);
  readonly isVisualEmpowered = signal<boolean>(false);
  readonly isPaused = signal<boolean>(false);

  private currentCastState: VisualCastState | null = null;
  private currentSkillConfig: SkillAnimationConfig | null = null;
  private timerSequence = 0;
  private activeTimers = new Map<number, ActiveTimerRecord>();
  private castCompleteTimer: VisualTimerHandle | null = null;
  private pauseStartedAt = 0;

  beginCast(
    event: BattleEventDto,
    battleSpeed: BattleSpeed,
    isUltimate = false,
    metadata?: SkillAnimationMetadata | null,
    isEmpowered = false
  ): void {
    if (this.castCompleteTimer) {
      this.castCompleteTimer.cancel();
      this.castCompleteTimer = null;
    }

    const config = resolveSkillConfig(event.skillId, isUltimate, metadata);
    const visualSpeed = resolveVisualSpeed(battleSpeed, config);
    const effectiveDurationMs = resolveEffectiveDuration(battleSpeed, config);

    this.currentSkillConfig = config;
    const castSeq = event.castSequence ?? 0;

    this.currentCastState = {
      castSequence: castSeq,
      skillId: event.skillId ?? '',
      actorId: event.actorId ?? 0,
      startedAt: Date.now(),
      durationMs: effectiveDurationMs,
      visualSpeed,
      phaseCode: event.phaseCode ?? 'CAST',
      completed: false
    };

    this.currentVisualSkillId.set(event.skillId ?? null);
    this.visualActorId.set(event.actorId ?? null);
    this.visualCastSequence.set(castSeq);
    this.visualPhase.set((event.phaseCode as BattleVisualPhase) ?? 'CAST');
    this.currentVisualSpeed.set(visualSpeed);
    this.isVisualActive.set(true);
    this.isVisualEmpowered.set(isEmpowered);

    this.castCompleteTimer = this.scheduleVisualTask(() => {
      this.completeCast(castSeq);
    }, effectiveDurationMs);
  }

  advancePhase(event: BattleEventDto): void {
    if (!this.isVisualActive()) return;
    // Never let an unrelated event without a cast identity mutate the active cast.
    if (event.castSequence != null && event.castSequence === this.visualCastSequence()) {
      if (event.phaseCode) {
        this.visualPhase.set(event.phaseCode as BattleVisualPhase);
      }
      if (this.currentCastState) {
        this.currentCastState.phaseCode = event.phaseCode ?? null;
      }
    }
  }

  requestLogicalEnd(castSequence: number): void {
    if (!this.isVisualActive()) return;
    if (this.visualCastSequence() === castSequence) {
      if (this.isVisualSafe()) {
        this.completeCast(castSequence);
      }
    }
  }

  completeCast(castSequence?: number): void {
    if (castSequence != null && this.visualCastSequence() !== castSequence) return;
    if (this.currentCastState) {
      this.currentCastState.completed = true;
    }
    if (this.castCompleteTimer) {
      this.castCompleteTimer.cancel();
      this.castCompleteTimer = null;
    }
    this.resetVisualCast();
  }

  cancelCast(): void {
    this.clearAllTimers();
    this.resetVisualCast();
  }

  skipToEnd(): void {
    this.clearAllTimers();
    this.resetVisualCast();
    this.isPaused.set(false);
  }

  pause(): void {
    if (this.isPaused()) return;
    this.isPaused.set(true);
    this.pauseStartedAt = Date.now();

    for (const [id, record] of this.activeTimers.entries()) {
      if (record.completed) continue;
      clearTimeout(record.timerId);
      const elapsed = Date.now() - record.startedAt;
      record.remainingMs = Math.max(0, record.remainingMs - elapsed);
    }
  }

  resume(): void {
    if (!this.isPaused()) return;
    this.isPaused.set(false);

    if (this.currentCastState && this.pauseStartedAt > 0) {
      const pausedDuration = Date.now() - this.pauseStartedAt;
      this.currentCastState.startedAt += pausedDuration;
    }
    this.pauseStartedAt = 0;

    for (const [id, record] of this.activeTimers.entries()) {
      if (record.completed) continue;
      record.startedAt = Date.now();
      record.timerId = setTimeout(() => {
        record.completed = true;
        this.activeTimers.delete(id);
        record.callback();
      }, record.remainingMs);
    }
  }

  getRemainingDurationMs(): number {
    if (!this.isVisualActive() || !this.currentCastState) return 0;
    if (this.isPaused() && this.pauseStartedAt > 0) {
      const elapsedBeforePause = this.pauseStartedAt - this.currentCastState.startedAt;
      return Math.max(0, this.currentCastState.durationMs - elapsedBeforePause);
    }
    const elapsed = Date.now() - this.currentCastState.startedAt;
    return Math.max(0, this.currentCastState.durationMs - elapsed);
  }

  isVisualSafe(): boolean {
    return !this.isVisualActive() || this.getRemainingDurationMs() <= 0;
  }

  scaleVisualDuration(baseMs: number): number {
    const speed = this.currentVisualSpeed();
    return baseMs / (speed > 0 ? speed : 1);
  }

  getCombatTextDurationMs(baseDurationMs = 1250, defaultMinimumMs = 550): number {
    const speed = this.currentVisualSpeed();
    const minimum = this.currentSkillConfig?.combatTextMinimumDurationMs ?? defaultMinimumMs;
    return Math.max(minimum, baseDurationMs / (speed > 0 ? speed : 1));
  }

  scheduleVisualTask(callback: () => void, delayMs: number): VisualTimerHandle {
    const timerIdNum = ++this.timerSequence;
    const record: ActiveTimerRecord = {
      callback,
      remainingMs: Math.max(0, delayMs),
      startedAt: Date.now(),
      timerId: null,
      completed: false
    };

    if (!this.isPaused()) {
      record.timerId = setTimeout(() => {
        record.completed = true;
        this.activeTimers.delete(timerIdNum);
        callback();
      }, record.remainingMs);
    }

    this.activeTimers.set(timerIdNum, record);

    return {
      id: timerIdNum,
      cancel: () => {
        if (record.timerId) clearTimeout(record.timerId);
        record.completed = true;
        this.activeTimers.delete(timerIdNum);
      },
      pause: () => {
        if (record.completed || !record.timerId) return;
        clearTimeout(record.timerId);
        const elapsed = Date.now() - record.startedAt;
        record.remainingMs = Math.max(0, record.remainingMs - elapsed);
        record.timerId = null;
      },
      resume: () => {
        if (record.completed || record.timerId) return;
        record.startedAt = Date.now();
        record.timerId = setTimeout(() => {
          record.completed = true;
          this.activeTimers.delete(timerIdNum);
          record.callback();
        }, record.remainingMs);
      },
      isCompleted: () => record.completed
    };
  }

  resetVisualCast(): void {
    this.currentVisualSkillId.set(null);
    this.visualActorId.set(null);
    this.visualPhase.set('idle');
    this.visualCastSequence.set(null);
    this.isVisualActive.set(false);
    this.isVisualEmpowered.set(false);
    this.currentCastState = null;
    this.currentSkillConfig = null;
  }

  private clearAllTimers(): void {
    for (const record of this.activeTimers.values()) {
      if (record.timerId) clearTimeout(record.timerId);
      record.completed = true;
    }
    this.activeTimers.clear();
    this.castCompleteTimer = null;
  }
}
