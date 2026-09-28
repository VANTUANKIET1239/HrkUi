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
import { BattleEventDto } from '../../../../core/models/battle.model';
import {
  LightningBranchData,
  LightningChainPoint,
  LightningPoint,
  generateLightningBranch,
  generateVerticalStrike
} from './thanh-thai-lightning.util';

export interface ActiveChainImpact {
  point: LightningPoint;
  order: number;
  romanNumeral: string;
  isRebound: boolean;
  isFinal: boolean;
  hasDetonation: boolean;
  detonationStacks: number;
}

export interface StatusBanner {
  id: string;
  x: number;
  y: number;
  text: string;
  type: 'gain' | 'detonate';
}

@Component({
  selector: 'app-thanh-thai-scene-vfx',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './thanh-thai-scene-vfx.component.html',
  styleUrl: './thanh-thai-scene-vfx.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ThanhThaiSceneVfxComponent implements OnInit, OnChanges, OnDestroy {
  @Input() actorActive = false;
  @Input() impactActive = false;
  @Input() actorTeamRight = false;
  @Input() visualSpeed = 1;
  @Input() empowered = false;
  @Input() targetCount = 0;
  @Input() castSequence?: number | null = null;
  @Input() actorId?: number | null = null;
  @Input() activeTargetIds: number[] = [];
  @Input() castEvents: BattleEventDto[] = [];

  // Measured Coordinates
  sourcePoint: LightningChainPoint | null = null;
  targetPoints: LightningChainPoint[] = [];

  // Active VFX State
  isCharging = false;
  activeBranches: LightningBranchData[] = [];
  activeImpacts: ActiveChainImpact[] = [];
  statusBanners: StatusBanner[] = [];
  showFinalShockwave = false;
  finalShockwavePoint: LightningPoint | null = null;
  flickerToggle = false;

  private timeouts: any[] = [];
  private flickerInterval: any = null;
  private resizeObserver: ResizeObserver | null = null;
  private lastExecutedCastSeq: number | null = null;

  constructor(
    private readonly el: ElementRef<HTMLElement>,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.startFlickerLoop();
    this.setupResizeObserver();
  }

  ngOnChanges(changes: SimpleChanges): void {
    const isActivating = (this.actorActive || this.impactActive);
    const seqChanged = this.castSequence != null && this.castSequence !== this.lastExecutedCastSeq;

    if (isActivating && (seqChanged || changes['actorActive'] || changes['impactActive'])) {
      this.lastExecutedCastSeq = this.castSequence ?? null;
      this.startLightningSequence();
    } else if (!this.actorActive && !this.impactActive) {
      this.clearSequence();
    }
  }

  ngOnDestroy(): void {
    this.clearAllTimers();
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    if (this.flickerInterval) {
      clearInterval(this.flickerInterval);
      this.flickerInterval = null;
    }
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    if (this.isCharging || this.activeBranches.length > 0) {
      this.measureCoordinates();
      this.cdr.markForCheck();
    }
  }

  private setupResizeObserver(): void {
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        if (this.isCharging || this.activeBranches.length > 0) {
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

  private startFlickerLoop(): void {
    this.flickerInterval = setInterval(() => {
      if (this.activeBranches.length > 0) {
        this.flickerToggle = !this.flickerToggle;
        this.cdr.markForCheck();
      }
    }, 45);
  }

  /**
   * Main sequence controller driving Charge -> Chain Travel -> Impacts -> Detonation -> Final shockwave.
   */
  private startLightningSequence(): void {
    this.clearAllTimers();
    this.measureCoordinates();

    const speed = Math.max(1, this.visualSpeed);
    const chargeDuration = Math.max(180, Math.round(360 / speed));
    const stepDuration = Math.max(170, Math.round(260 / speed));
    const impactDuration = Math.max(240, Math.round(420 / speed));
    const shockwaveDuration = Math.max(300, Math.round(550 / speed));

    // Phase 1: Charge up at actor
    this.isCharging = true;
    this.activeBranches = [];
    this.activeImpacts = [];
    this.statusBanners = [];
    this.showFinalShockwave = false;
    this.cdr.markForCheck();

    // Check Loss of Confidence events from cast events
    this.scheduleStatusBanners(chargeDuration, stepDuration);

    // Build the chain segments plan
    const seed = this.castSequence ?? 42;
    const branchesPlan = this.buildBranchesPlan(seed);

    if (branchesPlan.length === 0) {
      // Fallback if no target points could be resolved
      const t = setTimeout(() => {
        this.isCharging = false;
        this.cdr.markForCheck();
      }, chargeDuration);
      this.timeouts.push(t);
      return;
    }

    // Phase 2: Successive chain progression
    branchesPlan.forEach((branch, index) => {
      const branchStartTime = chargeDuration + index * stepDuration;

      // Launch segment
      const tStart = setTimeout(() => {
        if (index === 0) {
          this.isCharging = false;
        }
        this.activeBranches.push(branch);
        this.cdr.markForCheck();
      }, branchStartTime);
      this.timeouts.push(tStart);

      // Hit impact on target
      const tImpact = setTimeout(() => {
        const isFinal = index === branchesPlan.length - 1;
        const targetPoint = branch.endPoint;
        const roman = this.getRomanNumeral(index + 1);

        const impact: ActiveChainImpact = {
          point: targetPoint,
          order: index + 1,
          romanNumeral: roman,
          isRebound: this.isReboundHit(index, branchesPlan.length),
          isFinal,
          hasDetonation: this.hasDetonationOnTarget(index),
          detonationStacks: this.getDetonationStacks(index)
        };

        this.activeImpacts.push(impact);

        if (isFinal) {
          this.finalShockwavePoint = targetPoint;
          this.showFinalShockwave = true;
        }

        this.cdr.markForCheck();

        // Expire this individual impact after duration
        const tExpireImpact = setTimeout(() => {
          this.activeImpacts = this.activeImpacts.filter(i => i !== impact);
          this.cdr.markForCheck();
        }, impactDuration);
        this.timeouts.push(tExpireImpact);

      }, branchStartTime + Math.round(stepDuration * 0.45));
      this.timeouts.push(tImpact);
    });

    // Phase 3: Complete Sequence & Cleanup
    const totalDuration = chargeDuration + branchesPlan.length * stepDuration + shockwaveDuration;
    const tEnd = setTimeout(() => {
      this.clearSequence();
    }, totalDuration);
    this.timeouts.push(tEnd);
  }

  /**
   * Plans the sequence of branches between actor and targets, handling rebounds for 1 or 2 targets.
   */
  private buildBranchesPlan(seed: number): LightningBranchData[] {
    const branches: LightningBranchData[] = [];
    if (!this.sourcePoint) return branches;

    const targets = this.targetPoints;
    if (targets.length === 0) return branches;

    const maxHits = this.empowered ? 4 : Math.min(3, Math.max(targets.length, 2));

    if (targets.length === 1) {
      // Single Target: Hit 1 from Actor, Subsequent hits are vertical sky strikes
      const t1 = targets[0];
      branches.push(generateLightningBranch(this.sourcePoint, t1, seed, this.empowered, 1));

      for (let h = 2; h <= maxHits; h++) {
        branches.push(generateVerticalStrike(t1, seed, this.empowered, h));
      }
    } else if (targets.length === 2) {
      // Two Targets: Actor -> T1 -> T2 -> T1 -> T2 (rebound)
      const t1 = targets[0];
      const t2 = targets[1];
      branches.push(generateLightningBranch(this.sourcePoint, t1, seed, this.empowered, 1));
      branches.push(generateLightningBranch(t1, t2, seed, this.empowered, 2));

      if (maxHits >= 3) {
        branches.push(generateLightningBranch(t2, t1, seed, this.empowered, 3));
      }
      if (maxHits >= 4) {
        branches.push(generateLightningBranch(t1, t2, seed, this.empowered, 4));
      }
    } else {
      // 3 or 4 Targets: Sequential chain
      let prevPoint: LightningPoint = this.sourcePoint;
      const count = Math.min(targets.length, maxHits);

      for (let i = 0; i < count; i++) {
        const curr = targets[i];
        branches.push(generateLightningBranch(prevPoint, curr, seed, this.empowered, i + 1));
        prevPoint = curr;
      }
    }

    return branches;
  }

  private isReboundHit(index: number, total: number): boolean {
    if (this.targetPoints.length === 1 && index > 0) return true;
    if (this.targetPoints.length === 2 && index >= 2) return true;
    return false;
  }

  private hasDetonationOnTarget(index: number): boolean {
    const target = this.targetPoints[index % this.targetPoints.length];
    if (!target) return false;
    return this.castEvents.some(e =>
      e.eventType === 'LOSS_OF_CONFIDENCE_DETONATED' &&
      e.targetId === target.combatantId
    );
  }

  private getDetonationStacks(index: number): number {
    const target = this.targetPoints[index % this.targetPoints.length];
    if (!target) return 3;
    const detEvent = this.castEvents.find(e =>
      e.eventType === 'LOSS_OF_CONFIDENCE_DETONATED' &&
      e.targetId === target.combatantId
    );
    return detEvent?.currentStacks ?? (detEvent?.value ?? 3);
  }

  private scheduleStatusBanners(chargeDuration: number, stepDuration: number): void {
    if (!this.castEvents || this.castEvents.length === 0) return;

    this.castEvents.forEach((ev) => {
      if (ev.targetId == null) return;
      const targetPt = this.targetPoints.find(t => t.combatantId === ev.targetId);
      if (!targetPt) return;

      if (ev.eventType === 'STATUS_APPLIED' && ev.effectTypeCode === 'LOSS_OF_CONFIDENCE') {
        const delay = chargeDuration + (targetPt.order || 0) * stepDuration + 200;
        const t = setTimeout(() => {
          this.statusBanners.push({
            id: `loc-gain-${ev.targetId}-${Date.now()}`,
            x: targetPt.x,
            y: Math.max(30, targetPt.y - 110),
            text: 'GIẢM TỰ TIN +1',
            type: 'gain'
          });
          this.cdr.markForCheck();
        }, delay);
        this.timeouts.push(t);
      } else if (ev.eventType === 'LOSS_OF_CONFIDENCE_DETONATED') {
        const delay = chargeDuration + (targetPt.order || 0) * stepDuration + 300;
        const t = setTimeout(() => {
          this.statusBanners.push({
            id: `loc-det-${ev.targetId}-${Date.now()}`,
            x: targetPt.x,
            y: Math.max(30, targetPt.y - 120),
            text: 'MẤT TỰ TIN BÙNG NỔ',
            type: 'detonate'
          });
          this.cdr.markForCheck();
        }, delay);
        this.timeouts.push(t);
      }
    });
  }

  private getRomanNumeral(n: number): string {
    switch (n) {
      case 1: return 'I';
      case 2: return 'II';
      case 3: return 'III';
      case 4: return 'IV';
      default: return `${n}`;
    }
  }

  /**
   * Measures the pixel center coordinates of actor and target elements relative to host.
   */
  measureCoordinates(): void {
    const hostEl = this.el.nativeElement;
    const hostRect = hostEl.getBoundingClientRect();
    if (hostRect.width === 0 || hostRect.height === 0) return;

    // 1. Measure Actor
    const actorId = this.actorId;
    let actorPt: LightningChainPoint | null = null;

    if (actorId != null) {
      const actorNode = document.querySelector(`[data-combatant-id="${actorId}"]`);
      if (actorNode) {
        const r = actorNode.getBoundingClientRect();
        actorPt = {
          combatantId: actorId,
          x: r.left + r.width * 0.5 - hostRect.left,
          y: r.top + r.height * 0.42 - hostRect.top,
          order: 0
        };
      }
    }

    if (!actorPt) {
      // Fallback actor point based on team
      actorPt = {
        combatantId: actorId ?? -1,
        x: this.actorTeamRight ? hostRect.width * 0.75 : hostRect.width * 0.25,
        y: hostRect.height * 0.45,
        order: 0
      };
    }
    this.sourcePoint = actorPt;

    // 2. Measure Targets
    const targetIds = this.resolveOrderedTargetIds();
    const pts: LightningChainPoint[] = [];

    targetIds.forEach((tId, idx) => {
      let tPt: LightningChainPoint | null = null;
      const targetNode = document.querySelector(`[data-combatant-id="${tId}"]`);

      if (targetNode) {
        const r = targetNode.getBoundingClientRect();
        tPt = {
          combatantId: tId,
          x: r.left + r.width * 0.5 - hostRect.left,
          y: r.top + r.height * 0.42 - hostRect.top,
          order: idx + 1
        };
      }

      if (!tPt) {
        // Fallback target point on opponent side
        const opponentRight = !this.actorTeamRight;
        const colBase = opponentRight ? 0.65 : 0.25;
        const rowOffsets = [0.35, 0.52, 0.22, 0.68];
        const yFrac = rowOffsets[idx % rowOffsets.length];
        const xOffset = (idx % 2 === 0 ? 0 : 0.08) * (opponentRight ? 1 : -1);

        tPt = {
          combatantId: tId,
          x: hostRect.width * (colBase + xOffset),
          y: hostRect.height * yFrac,
          order: idx + 1
        };
      }

      pts.push(tPt);
    });

    this.targetPoints = pts;
  }

  private resolveOrderedTargetIds(): number[] {
    const list: number[] = [];

    // Prioritize sequence from server castEvents
    if (this.castEvents && this.castEvents.length > 0) {
      const chainEvents = this.castEvents
        .filter(e => e.targetId != null && (e.eventType === 'DAMAGE' || e.phaseCode === 'IMPACT'))
        .sort((a, b) => (a.hitIndex ?? 0) - (b.hitIndex ?? 0));

      chainEvents.forEach(e => {
        if (e.targetId != null && !list.includes(e.targetId)) {
          list.push(e.targetId);
        }
      });
    }

    // Supplement with activeTargetIds
    if (this.activeTargetIds && this.activeTargetIds.length > 0) {
      this.activeTargetIds.forEach(id => {
        if (!list.includes(id)) {
          list.push(id);
        }
      });
    }

    return list;
  }

  private clearSequence(): void {
    this.clearAllTimers();
    this.isCharging = false;
    this.activeBranches = [];
    this.activeImpacts = [];
    this.statusBanners = [];
    this.showFinalShockwave = false;
    this.cdr.markForCheck();
  }

  private clearAllTimers(): void {
    this.timeouts.forEach(t => clearTimeout(t));
    this.timeouts = [];
  }
}
