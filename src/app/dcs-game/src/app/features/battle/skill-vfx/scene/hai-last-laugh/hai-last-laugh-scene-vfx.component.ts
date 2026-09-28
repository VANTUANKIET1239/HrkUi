import {
  Component,
  Input,
  ElementRef,
  OnDestroy,
  OnInit,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef,
  HostListener,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { BattleEventDto } from '../../../../../core/models/battle.model';
import { HaiTargetLockVfxComponent } from './hai-target-lock-vfx.component';
import { HaiSlashImpactVfxComponent, HaiSlashStage } from './hai-slash-impact-vfx.component';
import { HaiBleedStackVfxComponent } from './hai-bleed-stack-vfx.component';
import { HaiBleedDetonationVfxComponent } from './hai-bleed-detonation-vfx.component';

export type HaiVisualPhase = 'idle' | 'prep' | 'lock' | 'dash' | 'strike' | 'detonate' | 'return';

@Component({
  selector: 'app-hai-last-laugh-scene-vfx',
  standalone: true,
  imports: [
    CommonModule,
    HaiTargetLockVfxComponent,
    HaiSlashImpactVfxComponent,
    HaiBleedStackVfxComponent,
    HaiBleedDetonationVfxComponent
  ],
  templateUrl: './hai-last-laugh-scene-vfx.component.html',
  styleUrl: './hai-last-laugh-scene-vfx.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HaiLastLaughSceneVfxComponent implements OnInit, OnChanges, OnDestroy {
  @Input() actorActive = false;
  @Input() impactActive = false;
  @Input() actorTeamRight = false;
  @Input() visualSpeed = 1;
  @Input() isEmpowered = false;
  @Input() targetCount = 0;
  @Input() castSequence?: number | null = null;
  @Input() actorId?: number | null = null;
  @Input() activeTargetIds: number[] = [];
  @Input() castEvents: BattleEventDto[] = [];

  // Measured Coordinates
  casterX = 0;
  casterY = 0;
  targetX = 0;
  targetY = 0;
  travelX = 0;
  travelY = 0;
  facing = 1;

  // Active Visual State
  visualPhase: HaiVisualPhase = 'idle';
  showTargetLock = false;
  isLockSnapping = false;

  showDash = false;
  showPhantomStriker = false;
  slashStage: HaiSlashStage = 'idle';
  currentHitCrit = false;

  bleedStacks = 0;
  isStackingUp = false;
  showBleedDetonation = false;

  showReturnDash = false;

  private timeouts: any[] = [];
  private resizeObserver: ResizeObserver | null = null;
  private lastExecutedCastSeq: number | null = null;

  constructor(
    private readonly el: ElementRef<HTMLElement>,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.setupResizeObserver();
  }

  ngOnChanges(changes: SimpleChanges): void {
    const isActivating = this.actorActive || this.impactActive;
    const seqChanged = this.castSequence != null && this.castSequence !== this.lastExecutedCastSeq;

    if (isActivating && (seqChanged || changes['actorActive'] || changes['impactActive'])) {
      this.lastExecutedCastSeq = this.castSequence ?? null;
      this.startCinematicSequence();
    } else if (!this.actorActive && !this.impactActive) {
      this.clearAll();
    }
  }

  ngOnDestroy(): void {
    this.clearAll();
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    if (this.visualPhase !== 'idle') {
      this.measureCoordinates();
      this.cdr.markForCheck();
    }
  }

  private setupResizeObserver(): void {
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        if (this.visualPhase !== 'idle') {
          this.measureCoordinates();
          this.cdr.markForCheck();
        }
      });
      const parent = this.el.nativeElement.parentElement;
      if (parent) {
        this.resizeObserver.observe(parent);
      }
    }
  }

  /**
   * Locates DOM elements of caster and target, calculating pixel positions
   * relative to this scene VFX host and injecting CSS variables.
   */
  measureCoordinates(): void {
    const hostEl = this.el.nativeElement;
    const hostRect = hostEl.getBoundingClientRect();
    if (hostRect.width === 0 || hostRect.height === 0) return;

    this.facing = this.actorTeamRight ? -1 : 1;

    // 1. Measure Caster
    const actorId = this.actorId;
    let casterFound = false;
    if (actorId != null) {
      const casterNode = document.querySelector(`[data-character-id="${actorId}"], [data-combatant-id="${actorId}"]`);
      if (casterNode) {
        const r = casterNode.getBoundingClientRect();
        this.casterX = r.left + r.width * 0.5 - hostRect.left;
        this.casterY = r.top + r.height * 0.45 - hostRect.top;
        casterFound = true;
      }
    }
    if (!casterFound) {
      this.casterX = this.actorTeamRight ? hostRect.width * 0.75 : hostRect.width * 0.25;
      this.casterY = hostRect.height * 0.5;
    }

    // 2. Measure Target
    const targetId = this.resolvePrimaryTargetId();
    let targetFound = false;
    if (targetId != null) {
      const targetNode = document.querySelector(`[data-character-id="${targetId}"], [data-combatant-id="${targetId}"]`);
      if (targetNode) {
        const r = targetNode.getBoundingClientRect();
        this.targetX = r.left + r.width * 0.5 - hostRect.left;
        this.targetY = r.top + r.height * 0.45 - hostRect.top;
        targetFound = true;
      }
    }
    if (!targetFound) {
      this.targetX = !this.actorTeamRight ? hostRect.width * 0.72 : hostRect.width * 0.28;
      this.targetY = hostRect.height * 0.48;
    }

    this.travelX = this.targetX - this.casterX;
    this.travelY = this.targetY - this.casterY;

    // Assign CSS variables
    hostEl.style.setProperty('--caster-x', `${this.casterX}px`);
    hostEl.style.setProperty('--caster-y', `${this.casterY}px`);
    hostEl.style.setProperty('--target-x', `${this.targetX}px`);
    hostEl.style.setProperty('--target-y', `${this.targetY}px`);
    hostEl.style.setProperty('--travel-x', `${this.travelX}px`);
    hostEl.style.setProperty('--travel-y', `${this.travelY}px`);
    hostEl.style.setProperty('--facing', `${this.facing}`);
  }

  private resolvePrimaryTargetId(): number | null {
    if (this.castEvents && this.castEvents.length > 0) {
      const firstTargetEvent = this.castEvents.find(e => e.targetId != null && e.targetId !== this.actorId);
      if (firstTargetEvent?.targetId != null) {
        return firstTargetEvent.targetId;
      }
    }
    if (this.activeTargetIds && this.activeTargetIds.length > 0) {
      return this.activeTargetIds[0];
    }
    return null;
  }

  /**
   * Main cinematic sequence orchestrator with clamped visual durations.
   */
  private startCinematicSequence(): void {
    this.clearTimers();
    this.measureCoordinates();

    const vSpeed = Math.max(1, this.visualSpeed);

    // Clamped phase durations guaranteeing readability at x2 / x4
    const prepDuration = Math.max(280, Math.round(450 / vSpeed));
    const lockDuration = Math.max(240, Math.round(350 / vSpeed));
    const dashDuration = Math.max(140, Math.round(200 / vSpeed));
    const hit1Duration = Math.max(200, Math.round(280 / vSpeed));
    const hit2Duration = Math.max(220, Math.round(300 / vSpeed));
    const hit3Duration = Math.max(320, Math.round(470 / vSpeed));
    const lingeringDuration = Math.max(220, Math.round(300 / vSpeed));
    const detonateDuration = Math.max(250, Math.round(340 / vSpeed));
    const returnDuration = Math.max(220, Math.round(320 / vSpeed));

    // Update CSS variables for sub-components
    const hostEl = this.el.nativeElement;
    hostEl.style.setProperty('--slash-duration', `${hit1Duration}ms`);
    hostEl.style.setProperty('--slash3-duration', `${hit3Duration}ms`);
    hostEl.style.setProperty('--impact-hold-duration', `${lingeringDuration}ms`);
    hostEl.style.setProperty('--detonation-duration', `${detonateDuration}ms`);
    hostEl.style.setProperty('--visual-speed', `${vSpeed}`);

    // Parse backend events for conditional hit & bleed execution
    const hasHit1 = this.castEvents.length === 0 || this.castEvents.some(e => e.executionGroup === 'HIT_1' || e.hitIndex === 1);
    const hasHit2 = this.castEvents.length === 0 || this.castEvents.some(e => e.executionGroup === 'HIT_2' || e.hitIndex === 2);
    const hasHit3 = this.castEvents.length === 0 || this.castEvents.some(e => e.executionGroup === 'HIT_3' || e.hitIndex === 3);

    const hit1Crit = this.castEvents.some(e => (e.executionGroup === 'HIT_1' || e.hitIndex === 1) && e.isCrit);
    const hit2Crit = this.castEvents.some(e => (e.executionGroup === 'HIT_2' || e.hitIndex === 2) && e.isCrit);
    const hit3Crit = this.castEvents.some(e => (e.executionGroup === 'HIT_3' || e.hitIndex === 3) && e.isCrit);

    // Bleed events inspection
    const hit1Bleed = this.castEvents.some(e =>
      (e.executionGroup === 'HIT_1' || e.hitIndex === 1) &&
      (e.effectTypeCode === 'BLEED' || e.eventType === 'STATUS_APPLIED' || e.eventType === 'STATUS_STACK_CHANGED')
    );
    const hit2BleedStackChange = this.castEvents.some(e =>
      (e.executionGroup === 'HIT_2' || e.hitIndex === 2) &&
      (e.eventType === 'STATUS_STACK_CHANGED' || (e.effectTypeCode === 'BLEED' && e.currentStacks === 2))
    );
    const hasDetonation = this.castEvents.some(e => e.eventType === 'BLEED_DETONATED');

    // Reset presentation states
    this.visualPhase = 'prep';
    this.showTargetLock = true;
    this.isLockSnapping = false;
    this.showDash = false;
    this.showPhantomStriker = false;
    this.slashStage = 'idle';
    this.bleedStacks = 0;
    this.isStackingUp = false;
    this.showBleedDetonation = false;
    this.showReturnDash = false;
    this.cdr.markForCheck();

    let currentTime = 0;

    // -------------------------------------------------------------------------
    // Phase 1: Target Lock (450ms)
    // -------------------------------------------------------------------------
    currentTime += prepDuration;
    this.schedule(() => {
      this.visualPhase = 'lock';
      this.cdr.markForCheck();
    }, currentTime);

    // Reticle snap-in right before dash
    this.schedule(() => {
      this.isLockSnapping = true;
      this.cdr.markForCheck();
    }, currentTime + lockDuration - 70);

    // -------------------------------------------------------------------------
    // Phase 2: Phantom Dash (800ms)
    // -------------------------------------------------------------------------
    currentTime += lockDuration;
    this.schedule(() => {
      this.visualPhase = 'dash';
      this.showTargetLock = false;
      this.showDash = true;
      this.cdr.markForCheck();
    }, currentTime);

    // -------------------------------------------------------------------------
    // Phase 3: Hit 1 (1000ms)
    // -------------------------------------------------------------------------
    currentTime += dashDuration;
    this.schedule(() => {
      this.showDash = false;
      this.showPhantomStriker = true;
      this.visualPhase = 'strike';

      if (hasHit1) {
        this.slashStage = 'hit1';
        this.currentHitCrit = hit1Crit;
        if (hit1Bleed) {
          this.bleedStacks = 1;
        }
      }
      this.cdr.markForCheck();
    }, currentTime);

    if (!hasHit1) {
      // Early exit if target defeated or no hit 1
      currentTime += 60;
      this.scheduleReturn(currentTime, returnDuration);
      return;
    }

    // -------------------------------------------------------------------------
    // Phase 4: Hit 2 (1320ms)
    // -------------------------------------------------------------------------
    currentTime += hit1Duration;
    this.schedule(() => {
      if (hasHit2) {
        this.slashStage = 'hit2';
        this.currentHitCrit = hit2Crit;
        if (hit2BleedStackChange) {
          this.bleedStacks = 2;
          this.isStackingUp = true;
        }
        this.cdr.markForCheck();
      }
    }, currentTime);

    if (!hasHit2) {
      currentTime += 60;
      this.scheduleReturn(currentTime, returnDuration);
      return;
    }

    // Reset stack pulse state shortly after
    this.schedule(() => {
      this.isStackingUp = false;
      this.cdr.markForCheck();
    }, currentTime + 280);

    // -------------------------------------------------------------------------
    // Phase 5: Hit 3 Climax (1780ms)
    // -------------------------------------------------------------------------
    currentTime += hit2Duration;
    this.schedule(() => {
      if (hasHit3) {
        this.slashStage = 'hit3';
        this.currentHitCrit = hit3Crit;
        this.cdr.markForCheck();
      }
    }, currentTime);

    if (!hasHit3) {
      currentTime += 60;
      this.scheduleReturn(currentTime, returnDuration);
      return;
    }

    // Lingering X-Slash state (250-350ms)
    currentTime += hit3Duration;
    this.schedule(() => {
      this.slashStage = 'lingering3';
      this.cdr.markForCheck();
    }, currentTime);

    // -------------------------------------------------------------------------
    // Phase 6: Bleed Detonation (2250ms - ONLY if BLEED_DETONATED)
    // -------------------------------------------------------------------------
    currentTime += lingeringDuration;
    if (hasDetonation) {
      this.schedule(() => {
        this.visualPhase = 'detonate';
        this.slashStage = 'idle';
        this.showBleedDetonation = true;
        this.bleedStacks = 0; // Detonation consumes bleed stacks
        this.cdr.markForCheck();
      }, currentTime);

      currentTime += detonateDuration;
      this.schedule(() => {
        this.showBleedDetonation = false;
        this.cdr.markForCheck();
      }, currentTime);
    } else {
      this.schedule(() => {
        this.slashStage = 'idle';
        this.cdr.markForCheck();
      }, currentTime);
    }

    // -------------------------------------------------------------------------
    // Phase 7: Return to Position (2400-2900ms)
    // -------------------------------------------------------------------------
    this.scheduleReturn(currentTime, returnDuration);
  }

  private scheduleReturn(startTime: number, returnDuration: number): void {
    this.schedule(() => {
      this.visualPhase = 'return';
      this.showPhantomStriker = false;
      this.slashStage = 'idle';
      this.showReturnDash = true;
      this.cdr.markForCheck();
    }, startTime);

    this.schedule(() => {
      this.showReturnDash = false;
      this.visualPhase = 'idle';
      this.cdr.markForCheck();
    }, startTime + returnDuration);
  }

  private schedule(fn: () => void, delayMs: number): void {
    const t = setTimeout(fn, delayMs);
    this.timeouts.push(t);
  }

  private clearTimers(): void {
    this.timeouts.forEach(t => clearTimeout(t));
    this.timeouts = [];
  }

  private clearAll(): void {
    this.clearTimers();
    this.visualPhase = 'idle';
    this.showTargetLock = false;
    this.isLockSnapping = false;
    this.showDash = false;
    this.showPhantomStriker = false;
    this.slashStage = 'idle';
    this.bleedStacks = 0;
    this.isStackingUp = false;
    this.showBleedDetonation = false;
    this.showReturnDash = false;
    this.cdr.markForCheck();
  }
}
