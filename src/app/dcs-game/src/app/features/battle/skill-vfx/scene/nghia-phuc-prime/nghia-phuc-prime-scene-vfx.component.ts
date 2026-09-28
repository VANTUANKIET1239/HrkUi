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

export type FortressVisualPhase =
  | 'idle'
  | 'prep'
  | 'assemble'
  | 'charge'
  | 'impact'
  | 'broken_morale'
  | 'return'
  | 'dome';

export interface VfxPoint {
  id: number;
  x: number;
  y: number;
}

export interface ReturnShieldProjectile {
  targetId: number;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
}

export interface BrokenMoraleTargetMarker {
  targetId: number;
  x: number;
  y: number;
}

@Component({
  selector: 'app-nghia-phuc-prime-scene-vfx',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './nghia-phuc-prime-scene-vfx.component.html',
  styleUrl: './nghia-phuc-prime-scene-vfx.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NghiaPhucPrimeSceneVfxComponent implements OnInit, OnChanges, OnDestroy {
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

  // Measured battlefield coordinates
  casterX = 0;
  casterY = 0;
  enemyCenterX = 0;
  enemyCenterY = 0;
  allyCenterX = 0;
  allyCenterY = 0;
  facing = 1; // 1 for left-to-right, -1 for right-to-left

  // Active visual state
  visualPhase: FortressVisualPhase = 'idle';
  showAssemblyRune = false;
  showChargeTrail = false;
  showImpactShockwave = false;
  showGroundCracks = false;
  showBrokenMoraleMarkers = false;
  showReturningShields = false;
  showTeamDome = false;

  // Tracked combatant targets
  staggeredTargetIds: number[] = [];
  brokenMoraleTargets: BrokenMoraleTargetMarker[] = [];
  returnShields: ReturnShieldProjectile[] = [];

  private timeouts: ReturnType<typeof setTimeout>[] = [];
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
      this.startFortressSequence();
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
   * Measures positions of caster, enemy team center, ally team center,
   * staggered targets, and broken morale targets dynamically from the DOM.
   */
  measureCoordinates(): void {
    const hostEl = this.el.nativeElement;
    const hostRect = hostEl.getBoundingClientRect();
    if (hostRect.width === 0 || hostRect.height === 0) return;

    this.facing = this.actorTeamRight ? -1 : 1;
    const enemyTeam = this.actorTeamRight ? 'left' : 'right';
    const allyTeam = this.actorTeamRight ? 'right' : 'left';

    // 1. Measure Caster
    const actorId = this.actorId;
    let casterFound = false;
    if (actorId != null) {
      const casterNode = document.querySelector(`[data-combatant-id="${actorId}"], [data-character-id="${actorId}"]`);
      if (casterNode) {
        const r = casterNode.getBoundingClientRect();
        this.casterX = r.left + r.width * 0.5 - hostRect.left;
        this.casterY = r.top + r.height * 0.45 - hostRect.top;
        casterFound = true;
      }
    }
    if (!casterFound) {
      this.casterX = this.actorTeamRight ? hostRect.width * 0.78 : hostRect.width * 0.22;
      this.casterY = hostRect.height * 0.5;
    }

    // 2. Measure Enemy Team Center and individual enemy targets
    const enemyNodes = Array.from(document.querySelectorAll(`[data-team="${enemyTeam}"]`));
    if (enemyNodes.length > 0) {
      let sumX = 0;
      let sumY = 0;
      enemyNodes.forEach(node => {
        const r = node.getBoundingClientRect();
        sumX += r.left + r.width * 0.5 - hostRect.left;
        sumY += r.top + r.height * 0.45 - hostRect.top;
      });
      this.enemyCenterX = sumX / enemyNodes.length;
      this.enemyCenterY = sumY / enemyNodes.length;
    } else {
      this.enemyCenterX = this.actorTeamRight ? hostRect.width * 0.25 : hostRect.width * 0.75;
      this.enemyCenterY = hostRect.height * 0.5;
    }

    // 3. Measure Ally Team Center and living ally positions
    const allyNodes = Array.from(document.querySelectorAll(`[data-team="${allyTeam}"]`));
    const allyPoints: VfxPoint[] = [];
    if (allyNodes.length > 0) {
      let sumX = 0;
      let sumY = 0;
      allyNodes.forEach(node => {
        const idAttr = node.getAttribute('data-combatant-id') || node.getAttribute('data-character-id');
        const id = idAttr ? parseInt(idAttr, 10) : 0;
        const r = node.getBoundingClientRect();
        const pt = {
          id,
          x: r.left + r.width * 0.5 - hostRect.left,
          y: r.top + r.height * 0.45 - hostRect.top
        };
        allyPoints.push(pt);
        sumX += pt.x;
        sumY += pt.y;
      });
      this.allyCenterX = sumX / allyNodes.length;
      this.allyCenterY = sumY / allyNodes.length;
    } else {
      this.allyCenterX = this.actorTeamRight ? hostRect.width * 0.75 : hostRect.width * 0.25;
      this.allyCenterY = hostRect.height * 0.5;
    }

    // 4. Resolve Broken Morale Targets (up to 3 from backend events or fallback to first 3 enemies)
    const brokenMoraleIds = this.resolveBrokenMoraleTargetIds();
    this.brokenMoraleTargets = [];
    brokenMoraleIds.forEach(id => {
      const node = document.querySelector(`[data-combatant-id="${id}"], [data-character-id="${id}"]`);
      if (node) {
        const r = node.getBoundingClientRect();
        this.brokenMoraleTargets.push({
          targetId: id,
          x: r.left + r.width * 0.5 - hostRect.left,
          y: r.top + r.height * 0.15 - hostRect.top
        });
      }
    });

    // 5. Prepare Return Shields trajectories (from enemy center to each ally point)
    this.returnShields = allyPoints.map(allyPt => ({
      targetId: allyPt.id,
      startX: this.enemyCenterX,
      startY: this.enemyCenterY,
      targetX: allyPt.x,
      targetY: allyPt.y
    }));

    // Inject CSS variables into host
    hostEl.style.setProperty('--caster-x', `${this.casterX}px`);
    hostEl.style.setProperty('--caster-y', `${this.casterY}px`);
    hostEl.style.setProperty('--enemy-center-x', `${this.enemyCenterX}px`);
    hostEl.style.setProperty('--enemy-center-y', `${this.enemyCenterY}px`);
    hostEl.style.setProperty('--ally-center-x', `${this.allyCenterX}px`);
    hostEl.style.setProperty('--ally-center-y', `${this.allyCenterY}px`);
    hostEl.style.setProperty('--facing', `${this.facing}`);
  }

  private resolveBrokenMoraleTargetIds(): number[] {
    const ids: number[] = [];
    if (this.castEvents && this.castEvents.length > 0) {
      this.castEvents.forEach(e => {
        if (
          e.targetId != null &&
          (e.effectTypeCode === 'PRIME_BROKEN_MORALE' || (e.eventType === 'STATUS_APPLIED' && e.effectTypeCode === 'PRIME_BROKEN_MORALE'))
        ) {
          if (!ids.includes(e.targetId)) {
            ids.push(e.targetId);
          }
        }
      });
    }

    if (ids.length === 0 && this.activeTargetIds && this.activeTargetIds.length > 0) {
      return this.activeTargetIds.slice(0, 3);
    }
    return ids.slice(0, 3);
  }

  /**
   * Main Cinematic Timeline orchestrator:
   * 0–500ms: Prep (Shield raise, electric arcs, ground rune)
   * 500–900ms: Assembly (Energy plates assemble into fortress, scales 0.65 -> 1.0)
   * 900–1450ms: Charge (Fortress charges forward with afterimages & dust)
   * 1450–1750ms: Impact (Abrupt stop, massive shockwave, ground crack decal, stagger)
   * 1750–2050ms: Broken Morale (Up to 3 enemies receive cracked shield marker)
   * 2050–2450ms: Return (Fortress splits into modular shields returning to allies)
   * 2450–2900ms: Dome (Hexagonal shields form dome across entire team, fortress fades)
   */
  private startFortressSequence(): void {
    this.clearAll();
    this.measureCoordinates();

    const speed = Math.max(0.5, this.visualSpeed);

    // Guaranteed minimum visible durations as specified:
    // Fortress assembly: min 250ms
    // Charge travel: min 300ms
    // Impact: min 300ms
    // Broken Morale: min 250ms
    // Return & Dome: min 350ms
    const prepDuration = Math.max(200, Math.round(500 / speed));
    const assembleDuration = Math.max(250, Math.round(400 / speed));
    const chargeDuration = Math.max(300, Math.round(550 / speed));
    const impactDuration = Math.max(300, Math.round(300 / speed));
    const brokenMoraleDuration = Math.max(250, Math.round(300 / speed));
    const returnDuration = Math.max(300, Math.round(400 / speed));
    const domeDuration = Math.max(350, Math.round(450 / speed));

    // 1. Prep
    this.visualPhase = 'prep';
    this.showAssemblyRune = true;
    this.cdr.markForCheck();

    // 2. Assemble (500ms)
    const t1 = setTimeout(() => {
      this.visualPhase = 'assemble';
      this.cdr.markForCheck();
    }, prepDuration);
    this.timeouts.push(t1);

    // 3. Charge (900ms)
    const t2 = setTimeout(() => {
      this.visualPhase = 'charge';
      this.showChargeTrail = true;
      this.cdr.markForCheck();
    }, prepDuration + assembleDuration);
    this.timeouts.push(t2);

    // 4. Impact (1450ms)
    const t3 = setTimeout(() => {
      this.visualPhase = 'impact';
      this.showChargeTrail = false;
      this.showImpactShockwave = true;
      this.showGroundCracks = true;
      this.staggeredTargetIds = [...this.activeTargetIds];
      this.cdr.markForCheck();
    }, prepDuration + assembleDuration + chargeDuration);
    this.timeouts.push(t3);

    // 5. Broken Morale (1750ms)
    const t4 = setTimeout(() => {
      this.visualPhase = 'broken_morale';
      this.showImpactShockwave = false;
      this.showBrokenMoraleMarkers = true;
      this.cdr.markForCheck();
    }, prepDuration + assembleDuration + chargeDuration + impactDuration);
    this.timeouts.push(t4);

    // 6. Return (2050ms)
    const t5 = setTimeout(() => {
      this.visualPhase = 'return';
      this.showReturningShields = true;
      this.cdr.markForCheck();
    }, prepDuration + assembleDuration + chargeDuration + impactDuration + brokenMoraleDuration);
    this.timeouts.push(t5);

    // 7. Dome (2450ms)
    const t6 = setTimeout(() => {
      this.visualPhase = 'dome';
      this.showReturningShields = false;
      this.showTeamDome = true;
      this.cdr.markForCheck();
    }, prepDuration + assembleDuration + chargeDuration + impactDuration + brokenMoraleDuration + returnDuration);
    this.timeouts.push(t6);

    // 8. End Sequence & Cleanup (2900ms)
    const t7 = setTimeout(() => {
      this.clearAll();
      this.cdr.markForCheck();
    }, prepDuration + assembleDuration + chargeDuration + impactDuration + brokenMoraleDuration + returnDuration + domeDuration);
    this.timeouts.push(t7);
  }

  private clearAll(): void {
    for (const t of this.timeouts) {
      clearTimeout(t);
    }
    this.timeouts = [];

    this.visualPhase = 'idle';
    this.showAssemblyRune = false;
    this.showChargeTrail = false;
    this.showImpactShockwave = false;
    this.showGroundCracks = false;
    this.showBrokenMoraleMarkers = false;
    this.showReturningShields = false;
    this.showTeamDome = false;
    this.staggeredTargetIds = [];
    this.brokenMoraleTargets = [];
    this.returnShields = [];
  }
}
