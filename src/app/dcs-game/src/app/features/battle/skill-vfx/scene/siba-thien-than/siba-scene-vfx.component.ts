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
import { SibaHaloComponent } from './siba-halo.component';
import { SibaCelestialBeamComponent } from './siba-celestial-beam.component';
import { SibaBlessingWingsComponent, SibaWingPhase } from './siba-blessing-wings.component';
import { SibaDispelParticlesComponent } from './siba-dispel-particles.component';

export type SibaVisualPhase =
  | 'idle'
  // Basic Phases
  | 'cast'
  | 'focus'
  | 'descent'
  | 'impact'
  | 'blessing'
  | 'recovery'
  // Normal Energy Phases
  | 'alignment'
  | 'manifestation'
  | 'dispel'
  // Empowered Energy Phases
  | 'empowered_cast'
  | 'grand_beam'
  | 'wings_descent'
  | 'embrace'
  | 'wings_burst'
  | 'ascend';

export interface SibaTargetNode {
  id: number;
  x: number;
  y: number;
  headOffsetY: number;
  centerOffsetY: number;
  beamHeight: number;
  isFrontRow: boolean;
  hasEncouragement: boolean;
  hasDispel: boolean;
  hasEnergyGain: boolean;
}

@Component({
  selector: 'app-siba-scene-vfx',
  standalone: true,
  imports: [
    CommonModule,
    SibaHaloComponent,
    SibaCelestialBeamComponent,
    SibaBlessingWingsComponent,
    SibaDispelParticlesComponent
  ],
  templateUrl: './siba-scene-vfx.component.html',
  styleUrl: './siba-scene-vfx.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SibaSceneVfxComponent implements OnInit, OnChanges, OnDestroy {
  @Input() skillId?: string | null = null;
  @Input() actorActive = false;
  @Input() impactActive = false;
  @Input() actorTeamRight = false;
  @Input() visualSpeed = 1;
  @Input() isEmpowered = false;
  @Input() empowered = false;
  @Input() targetCount = 0;
  @Input() castSequence?: number | null = null;
  @Input() actorId?: number | null = null;
  @Input() activeTargetIds: number[] = [];
  @Input() castEvents: BattleEventDto[] = [];

  // Orchestrator State
  visualPhase: SibaVisualPhase = 'idle';
  beamPhase: 'idle' | 'focus' | 'descent' | 'impact' | 'recovery' = 'idle';
  wingPhase: SibaWingPhase = 'idle';

  get phase(): string {
    return this.visualPhase;
  }

  actorPos = { x: 0, y: 0 };
  targetNodes: SibaTargetNode[] = [];
  allyFormationCenterX = 0;
  allyFormationTopY = 0;

  private timeouts: ReturnType<typeof setTimeout>[] = [];
  private resizeObserver: ResizeObserver | null = null;
  private lastExecutedCastSeq: number | null = null;

  constructor(
    private readonly el: ElementRef<HTMLElement>,
    private readonly cdr: ChangeDetectorRef
  ) {}

  get isBasicSkill(): boolean {
    const sId = this.skillId ?? this.castEvents.find(e => e.skillId)?.skillId;
    return sId === 'SIBA_ANGEL_GENTLE_WING';
  }

  get isEmpoweredSkill(): boolean {
    if (this.isBasicSkill) return false;
    if (this.isEmpowered || this.empowered) return true;
    return this.castEvents.some(
      e => e.eventType === 'SIBA_EMPOWERED_CAST' || e.skillId === 'SIBA_EMPOWERED_CAST'
    );
  }

  ngOnInit(): void {
    this.setupResizeObserver();
    if (this.actorActive || this.impactActive) {
      this.startSequence();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    const isActivating = this.actorActive || this.impactActive;
    const seqChanged = this.castSequence != null && this.castSequence !== this.lastExecutedCastSeq;

    if (isActivating && (seqChanged || changes['actorActive'] || changes['impactActive'])) {
      this.lastExecutedCastSeq = this.castSequence ?? null;
      this.startSequence();
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

  private clearAll(): void {
    this.timeouts.forEach(t => clearTimeout(t));
    this.timeouts = [];
    this.visualPhase = 'idle';
    this.beamPhase = 'idle';
    this.wingPhase = 'idle';
    this.cdr.markForCheck();
  }

  /**
   * Measures positions of caster and all living ally targets dynamically from DOM.
   */
  measureCoordinates(): void {
    const hostEl = this.el.nativeElement;
    const hostRect = hostEl.getBoundingClientRect();
    const w = hostRect.width || 800;
    const h = hostRect.height || 450;

    // 1. Measure Actor
    let actorX = this.actorTeamRight ? w * 0.75 : w * 0.25;
    let actorY = h * 0.5;
    if (this.actorId != null) {
      const actorEl =
        document.querySelector(`[data-combatant-id="${this.actorId}"]`) ||
        document.querySelector(`[data-hero-id="${this.actorId}"]`);
      if (actorEl) {
        const r = actorEl.getBoundingClientRect();
        actorX = r.left + r.width * 0.5 - hostRect.left;
        actorY = r.top + r.height * 0.5 - hostRect.top;
      }
    }
    this.actorPos = { x: actorX, y: actorY };

    // 2. Measure Targets
    const nodes: SibaTargetNode[] = [];
    const allyIds =
      this.activeTargetIds && this.activeTargetIds.length > 0
        ? this.activeTargetIds
        : (this.actorId != null ? [this.actorId] : [1, 2, 3]);

    // For basic skill, only target the designated ally (first active target or from event)
    const targetIdsToProcess = this.isBasicSkill ? [allyIds[0]] : allyIds;

    let sumX = 0;
    let sumY = 0;

    for (const tId of targetIdsToProcess) {
      const targetEl =
        document.querySelector(`[data-combatant-id="${tId}"]`) ||
        document.querySelector(`[data-hero-id="${tId}"]`);

      // Check if target had Encouragement applied or refreshed
      const hasEnc = this.castEvents.some(
        e =>
          e.targetId === tId &&
          (e.effectTypeCode === 'ENCOURAGEMENT_OFFENSE' ||
            e.effectTypeCode === 'ENCOURAGEMENT_DEFENSE' ||
            (e.eventType === 'STATUS_REFRESHED' && (e.effectTypeCode?.includes('ENCOURAGEMENT') ?? false)))
      );

      // Check if target had debuff dispelled (STATUS_REMOVED)
      const hasDisp = this.castEvents.some(
        e => e.targetId === tId && e.eventType === 'STATUS_REMOVED'
      );

      // Check if target had Energy gain event
      const hasNrg = this.castEvents.some(
        e => e.targetId === tId && (e.eventType === 'ENERGY_CHANGED' || e.effectTypeCode === 'ENERGY_CHANGE')
      );

      // Determine front row vs back row from position attribute if available
      let isFront = true;
      if (targetEl) {
        const gridCell = targetEl.closest('.grid-cell');
        if (gridCell) {
          const className = gridCell.className;
          // Positions 1, 3, 5 are front row; 2, 4 are back row
          if (className.includes('pos-left-2') || className.includes('pos-left-4') ||
              className.includes('pos-right-2') || className.includes('pos-right-4')) {
            isFront = false;
          }
        }
      }

      if (targetEl) {
        const r = targetEl.getBoundingClientRect();
        const tx = r.left + r.width * 0.5 - hostRect.left;
        const ty = r.top + r.height * 0.5 - hostRect.top;
        const headOffset = -r.height * 0.45;
        const centerOffset = -r.height * 0.1;
        const beamH = Math.max(240, ty - (ty - 260));

        nodes.push({
          id: tId,
          x: tx,
          y: ty,
          headOffsetY: headOffset,
          centerOffsetY: centerOffset,
          beamHeight: beamH,
          isFrontRow: isFront,
          hasEncouragement: hasEnc,
          hasDispel: hasDisp,
          hasEnergyGain: hasNrg
        });
        sumX += tx;
        sumY += ty;
      } else {
        // Fallback target layout
        const allySideX = this.actorTeamRight ? w * 0.75 : w * 0.25;
        const tx = allySideX + (tId % 2 === 0 ? 40 : -40);
        const ty = h * 0.4 + ((tId * 45) % 150);
        nodes.push({
          id: tId,
          x: tx,
          y: ty,
          headOffsetY: -55,
          centerOffsetY: -10,
          beamHeight: 280,
          isFrontRow: tId % 2 !== 0,
          hasEncouragement: hasEnc,
          hasDispel: hasDisp,
          hasEnergyGain: hasNrg
        });
        sumX += tx;
        sumY += ty;
      }
    }

    this.targetNodes = nodes;
    this.allyFormationCenterX = nodes.length > 0 ? sumX / nodes.length : (this.actorTeamRight ? w * 0.75 : w * 0.25);
    this.allyFormationTopY = Math.max(50, (nodes.length > 0 ? sumY / nodes.length : h * 0.4) - 130);
  }

  private startSequence(): void {
    this.clearAll();
    this.measureCoordinates();

    const speed = Math.max(0.5, this.visualSpeed);

    if (this.isBasicSkill) {
      this.runBasicTimeline(speed);
    } else if (this.isEmpoweredSkill) {
      this.runEmpoweredEnergyTimeline(speed);
    } else {
      this.runNormalEnergyTimeline(speed);
    }
  }

  // ==============================================================
  // TIMELINE 1: BASIC SKILL (SIBA_ANGEL_GENTLE_WING) ~ 1.30s (1300ms)
  // ==============================================================
  private runBasicTimeline(speed: number): void {
    // Phase 1: Cast (0 - 220ms)
    this.visualPhase = 'cast';
    this.beamPhase = 'focus';
    this.cdr.markForCheck();

    // Phase 2: Focus (220 - 420ms)
    const t1 = setTimeout(() => {
      this.visualPhase = 'focus';
      this.beamPhase = 'focus';
      this.cdr.markForCheck();
    }, Math.round(220 / speed));
    this.timeouts.push(t1);

    // Phase 3: Light Descent (420 - 650ms)
    const t2 = setTimeout(() => {
      this.visualPhase = 'descent';
      this.beamPhase = 'descent';
      this.cdr.markForCheck();
    }, Math.round(420 / speed));
    this.timeouts.push(t2);

    // Phase 4: Heal & Energy & Encouragement (650 - 900ms)
    const t3 = setTimeout(() => {
      this.visualPhase = 'impact';
      this.beamPhase = 'impact';
      this.cdr.markForCheck();
    }, Math.round(650 / speed));
    this.timeouts.push(t3);

    // Phase 5: Blessing Resource Arcs to Siba (900 - 1100ms)
    const t4 = setTimeout(() => {
      this.visualPhase = 'blessing';
      this.beamPhase = 'recovery';
      this.cdr.markForCheck();
    }, Math.round(900 / speed));
    this.timeouts.push(t4);

    // Phase 6: Recovery (1100 - 1300ms)
    const t5 = setTimeout(() => {
      this.visualPhase = 'recovery';
      this.beamPhase = 'recovery';
      this.cdr.markForCheck();
    }, Math.round(1100 / speed));
    this.timeouts.push(t5);

    // Completion (1300ms)
    const t6 = setTimeout(() => {
      this.visualPhase = 'idle';
      this.beamPhase = 'idle';
      this.cdr.markForCheck();
    }, Math.round(1300 / speed));
    this.timeouts.push(t6);
  }

  // ==============================================================
  // TIMELINE 2: NORMAL ENERGY SKILL (SIBA_CELESTIAL_PROTECTION) ~ 2.10s (2100ms)
  // ==============================================================
  private runNormalEnergyTimeline(speed: number): void {
    // Phase 1: Mythic Cast (0 - 350ms)
    this.visualPhase = 'cast';
    this.beamPhase = 'focus';
    this.cdr.markForCheck();

    // Phase 2: Celestial Alignment (350 - 650ms)
    const t1 = setTimeout(() => {
      this.visualPhase = 'alignment';
      this.beamPhase = 'focus';
      this.cdr.markForCheck();
    }, Math.round(350 / speed));
    this.timeouts.push(t1);

    // Phase 3: Beams Descend (650 - 1000ms)
    const t2 = setTimeout(() => {
      this.visualPhase = 'descent';
      this.beamPhase = 'descent';
      this.cdr.markForCheck();
    }, Math.round(650 / speed));
    this.timeouts.push(t2);

    // Phase 4: Halo Manifestation & SPD/RES Badges (1000 - 1300ms)
    const t3 = setTimeout(() => {
      this.visualPhase = 'manifestation';
      this.beamPhase = 'impact';
      this.cdr.markForCheck();
    }, Math.round(1000 / speed));
    this.timeouts.push(t3);

    // Phase 5: Dispel Burst (1200 - 1550ms)
    const t4 = setTimeout(() => {
      this.visualPhase = 'dispel';
      this.cdr.markForCheck();
    }, Math.round(1200 / speed));
    this.timeouts.push(t4);

    // Phase 6: Recovery (1550 - 2100ms)
    const t5 = setTimeout(() => {
      this.visualPhase = 'recovery';
      this.beamPhase = 'recovery';
      this.cdr.markForCheck();
    }, Math.round(1550 / speed));
    this.timeouts.push(t5);

    // Completion (2100ms)
    const t6 = setTimeout(() => {
      this.visualPhase = 'idle';
      this.beamPhase = 'idle';
      this.cdr.markForCheck();
    }, Math.round(2100 / speed));
    this.timeouts.push(t6);
  }

  // ==============================================================
  // TIMELINE 3: EMPOWERED ENERGY SKILL ~ 3.00s (3000ms)
  // Sequence: Tia sáng → Cánh hạ xuống → Bao bọc → Heal/refresh → Bung cánh → Bay lên → Halo
  // ==============================================================
  private runEmpoweredEnergyTimeline(speed: number): void {
    // Phase 1: Empowered Cast & Blessing Influx (0 - 400ms)
    this.visualPhase = 'empowered_cast';
    this.beamPhase = 'focus';
    this.wingPhase = 'idle';
    this.cdr.markForCheck();

    // Phase 2: Grand Beam Descent (400 - 850ms)
    const t1 = setTimeout(() => {
      this.visualPhase = 'grand_beam';
      this.beamPhase = 'descent';
      this.cdr.markForCheck();
    }, Math.round(400 / speed));
    this.timeouts.push(t1);

    // Phase 3: Wing Descent (850 - 1250ms)
    const t2 = setTimeout(() => {
      this.visualPhase = 'wings_descent';
      this.beamPhase = 'impact';
      this.wingPhase = 'descent';
      this.cdr.markForCheck();
    }, Math.round(850 / speed));
    this.timeouts.push(t2);

    // Phase 4: Protective Embrace Cocoon (1250 - 1650ms)
    const t3 = setTimeout(() => {
      this.visualPhase = 'embrace';
      this.wingPhase = 'embrace';
      this.cdr.markForCheck();
    }, Math.round(1250 / speed));
    this.timeouts.push(t3);

    // Phase 5: Empowered Impact & Team Heal / Refresh / Energy (1650 - 1950ms)
    const t4 = setTimeout(() => {
      this.visualPhase = 'impact';
      this.wingPhase = 'pulse';
      this.cdr.markForCheck();
    }, Math.round(1650 / speed));
    this.timeouts.push(t4);

    // Phase 6: Wings Burst Open & Full Radiant Halos (1950 - 2350ms)
    const t5 = setTimeout(() => {
      this.visualPhase = 'wings_burst';
      this.wingPhase = 'burst';
      this.cdr.markForCheck();
    }, Math.round(1950 / speed));
    this.timeouts.push(t5);

    // Phase 7: Ascension Soaring into Heaven (2350 - 2750ms)
    const t6 = setTimeout(() => {
      this.visualPhase = 'ascend';
      this.wingPhase = 'ascend';
      this.beamPhase = 'recovery';
      this.cdr.markForCheck();
    }, Math.round(2350 / speed));
    this.timeouts.push(t6);

    // Phase 8: Recovery (2750 - 3000ms)
    const t7 = setTimeout(() => {
      this.visualPhase = 'recovery';
      this.wingPhase = 'idle';
      this.cdr.markForCheck();
    }, Math.round(2750 / speed));
    this.timeouts.push(t7);

    // Completion (3000ms)
    const t8 = setTimeout(() => {
      this.visualPhase = 'idle';
      this.cdr.markForCheck();
    }, Math.round(3000 / speed));
    this.timeouts.push(t8);
  }

  // ==============================================================
  // Template Visibility Helpers
  // ==============================================================
  shouldShowBeam(target: SibaTargetNode): boolean {
    if (this.visualPhase === 'idle') return false;
    if (this.isBasicSkill) {
      return (
        this.visualPhase === 'focus' ||
        this.visualPhase === 'descent' ||
        this.visualPhase === 'impact' ||
        this.visualPhase === 'blessing'
      );
    }
    return (
      this.visualPhase === 'alignment' ||
      this.visualPhase === 'grand_beam' ||
      this.visualPhase === 'descent' ||
      this.visualPhase === 'wings_descent' ||
      this.visualPhase === 'embrace' ||
      this.visualPhase === 'manifestation' ||
      this.visualPhase === 'impact'
    );
  }

  shouldShowHalo(target: SibaTargetNode): boolean {
    if (this.visualPhase === 'idle') return false;
    if (this.isBasicSkill) {
      return this.visualPhase === 'descent' || this.visualPhase === 'impact';
    }
    return (
      this.visualPhase === 'manifestation' ||
      this.visualPhase === 'dispel' ||
      this.visualPhase === 'wings_burst' ||
      this.visualPhase === 'ascend' ||
      this.visualPhase === 'recovery'
    );
  }

  shouldShowWings(target: SibaTargetNode): boolean {
    return (
      this.visualPhase === 'wings_descent' ||
      this.visualPhase === 'embrace' ||
      this.visualPhase === 'impact' ||
      this.visualPhase === 'wings_burst' ||
      this.visualPhase === 'ascend'
    );
  }

  shouldShowEncouragementWings(target: SibaTargetNode): boolean {
    if (!target.hasEncouragement) return false;
    if (this.isBasicSkill) {
      return this.visualPhase === 'impact' || this.visualPhase === 'blessing';
    }
    // In Empowered: show during impact, burst, and ascend
    return (
      this.visualPhase === 'impact' ||
      this.visualPhase === 'wings_burst' ||
      this.visualPhase === 'ascend'
    );
  }

  shouldShowDispel(target: SibaTargetNode): boolean {
    if (!target.hasDispel) return false;
    return this.visualPhase === 'dispel' || (this.isEmpoweredSkill && this.visualPhase === 'impact');
  }

  shouldShowBadges(target: SibaTargetNode): boolean {
    if (this.isBasicSkill) return false;
    return (
      this.visualPhase === 'manifestation' ||
      this.visualPhase === 'dispel' ||
      this.visualPhase === 'wings_burst' ||
      this.visualPhase === 'ascend'
    );
  }

  shouldShowEnergyFlow(target: SibaTargetNode): boolean {
    if (this.isBasicSkill) {
      return this.visualPhase === 'impact';
    }
    return (
      this.isEmpoweredSkill &&
      target.hasEncouragement &&
      (this.visualPhase === 'impact' || this.visualPhase === 'wings_burst')
    );
  }
}
