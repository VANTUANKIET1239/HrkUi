import {
  Component,
  Input,
  ElementRef,
  OnDestroy,
  OnInit,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { BattleEventDto } from '../../../../../../core/models/battle.model';
import {
  LONG_LE_CAT_AIRBORNE_ASSET,
  LONG_LE_CAT_LANDING_ASSET,
  LONG_LE_CAT_COMPANION_ASSET,
  LONG_LE_CAT_PROJECTILE_ASSET,
  LongLeCatEnergyPhase,
  CatAllyTargetNode
} from './long-le-cat-vfx.models';

@Component({
  selector: 'app-long-le-cat-scene-vfx',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './long-le-cat-scene-vfx.component.html',
  styleUrl: './long-le-cat-scene-vfx.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LongLeCatSceneVfxComponent implements OnInit, OnChanges, OnDestroy {
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

  readonly catAirborneAsset = LONG_LE_CAT_AIRBORNE_ASSET;
  readonly catLandingAsset = LONG_LE_CAT_LANDING_ASSET;
  readonly catCompanionAsset = LONG_LE_CAT_COMPANION_ASSET;
  readonly catProjectileAsset = LONG_LE_CAT_PROJECTILE_ASSET;

  // Aliases for compatibility
  readonly catIdleAsset = '/assets/images/dcs-game/skill-vfx/long-le-cat/cat-idle.png';
  readonly catPounceAsset = '/assets/images/dcs-game/skill-vfx/long-le-cat/cat-pounce.png';
  readonly catSwipeAsset = '/assets/images/dcs-game/skill-vfx/long-le-cat/cat-swipe.png';

  phase: LongLeCatEnergyPhase = 'idle';
  actorPos = { x: 0, y: 0 };
  allyNodes: CatAllyTargetNode[] = [];
  assetFailed = false;

  private timers: ReturnType<typeof setTimeout>[] = [];
  private lastExecutedSeq: number | null = null;

  constructor(
    private readonly el: ElementRef<HTMLElement>,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (this.actorActive || this.impactActive) {
      this.startSequence();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    const isActivating = this.actorActive || this.impactActive;
    const seqChanged = this.castSequence != null && this.castSequence !== this.lastExecutedSeq;

    if (isActivating && (seqChanged || changes['actorActive'] || changes['impactActive'])) {
      this.lastExecutedSeq = this.castSequence ?? null;
      this.startSequence();
    } else if (!this.actorActive && !this.impactActive) {
      this.cleanup();
    }
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  onAssetError(): void {
    this.assetFailed = true;
    this.cdr.markForCheck();
  }

  private cleanup(): void {
    this.timers.forEach(t => clearTimeout(t));
    this.timers = [];
    this.phase = 'idle';
    this.cdr.markForCheck();
  }

  private startSequence(): void {
    this.cleanup();

    const hostRect = this.el.nativeElement.getBoundingClientRect();
    const w = hostRect.width || 800;
    const h = hostRect.height || 450;

    // 1. Resolve Long Lê position
    let actorX = this.actorTeamRight ? w * 0.75 : w * 0.25;
    let actorY = h * 0.55;
    if (this.actorId != null) {
      const actorEl = document.querySelector(`[data-combatant-id="${this.actorId}"]`);
      if (actorEl) {
        const r = actorEl.getBoundingClientRect();
        actorX = r.left + r.width * 0.5 - hostRect.left;
        actorY = r.bottom - 20 - hostRect.top;
      }
    }
    this.actorPos = { x: actorX, y: actorY };

    // 2. Resolve Chosen Allies from backend (up to 3, EXACTLY matching backend targets)
    const chosenIds: number[] = [];
    if (this.activeTargetIds && this.activeTargetIds.length > 0) {
      for (const id of this.activeTargetIds) {
        if (!chosenIds.includes(id)) chosenIds.push(id);
      }
    }

    if (chosenIds.length === 0) {
      for (const ev of this.castEvents) {
        if (ev.eventType === 'STATUS_APPLIED' && ev.effectTypeCode === 'CAT_COMPANION' && ev.targetId) {
          if (!chosenIds.includes(ev.targetId)) chosenIds.push(ev.targetId);
        }
      }
    }

    // Only if still empty (e.g. test mock), fallback to other allies on same team
    if (chosenIds.length === 0) {
      const myTeam = this.actorTeamRight ? 'right' : 'left';
      const allies = document.querySelectorAll(`[data-team="${myTeam}"]:not(.is-dead)`);
      allies.forEach(el => {
        const idAttr = el.getAttribute('data-combatant-id');
        const id = idAttr ? parseInt(idAttr, 10) : 0;
        if (id && id !== this.actorId && chosenIds.length < 3) {
          chosenIds.push(id);
        }
      });
      if (chosenIds.length === 0) chosenIds.push(1);
    }

    const offsetDir = this.actorTeamRight ? 42 : -42;

    this.allyNodes = chosenIds.map((id, index) => {
      let ax = this.actorTeamRight ? w * 0.7 : w * 0.3;
      let ay = h * 0.5;
      const el = document.querySelector(`[data-combatant-id="${id}"]`);
      if (el) {
        const r = el.getBoundingClientRect();
        ax = r.left + r.width * 0.5 - hostRect.left;
        ay = r.top + r.height * 0.5 - hostRect.top;
      }

      // Slightly staggered apex heights so paths don't overlap completely
      const staggerX = (index - (chosenIds.length - 1) / 2) * 35;
      const staggerY = (index % 2 === 0 ? -15 : 15);
      const apexX = (actorX + ax) * 0.5 + staggerX;
      const apexY = Math.max(30, Math.min(actorY, ay) - 130 + staggerY);

      return {
        id,
        x: ax,
        y: ay,
        catX: actorX,
        catY: actorY,
        apexX,
        apexY,
        landingX: ax + offsetDir,
        landingY: ay + 32, // At foot of ally, offset slightly outward
        currentAsset: this.catAirborneAsset
      };
    });

    const speed = Math.max(1, this.visualSpeed);
    const dSummon = Math.round(250 / speed);
    const dThrow = Math.round(250 / speed);
    const dAirborne = Math.round(350 / speed);
    const dDescend = Math.round(300 / speed);
    const dLanding = Math.round(250 / speed);

    // 0ms: Summoning circle (0-250ms)
    this.phase = 'summon_circle';
    this.cdr.markForCheck();

    // 250ms: Throwing motion arc (250-500ms)
    this.timers.push(
      setTimeout(() => {
        this.phase = 'throw_motion';
        this.cdr.markForCheck();
      }, dSummon)
    );

    // 500ms: Airborne high parabolic flight (500-850ms)
    this.timers.push(
      setTimeout(() => {
        this.phase = 'airborne';
        this.allyNodes.forEach(node => {
          node.currentAsset = this.catAirborneAsset;
        });
        this.cdr.markForCheck();
      }, dSummon + dThrow)
    );

    // 850ms: Descend toward allies with landing markers (850-1150ms)
    this.timers.push(
      setTimeout(() => {
        this.phase = 'descend';
        this.cdr.markForCheck();
      }, dSummon + dThrow + dAirborne)
    );

    // 1150ms: Touchdown landing with dust ring & pulse (1150-1400ms)
    this.timers.push(
      setTimeout(() => {
        this.phase = 'landing';
        this.allyNodes.forEach(node => {
          node.currentAsset = this.catLandingAsset;
        });
        this.cdr.markForCheck();
      }, dSummon + dThrow + dAirborne + dDescend)
    );

    // 1400ms: Complete and transition to persistent companion
    this.timers.push(
      setTimeout(() => {
        this.phase = 'complete';
        this.cdr.markForCheck();
      }, dSummon + dThrow + dAirborne + dDescend + dLanding)
    );
  }
}
