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
  LONG_LE_CAT_PROJECTILE_ASSET,
  CAT_SCRATCH_EFFECT_ASSET,
  LongLeCatBasicPhase
} from './long-le-cat-vfx.models';

@Component({
  selector: 'app-long-le-cat-basic-scene-vfx',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './long-le-cat-basic-scene-vfx.component.html',
  styleUrl: './long-le-cat-basic-scene-vfx.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LongLeCatBasicSceneVfxComponent implements OnInit, OnChanges, OnDestroy {
  @Input() skillId?: string | null = null;
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

  readonly catProjectileAsset = LONG_LE_CAT_PROJECTILE_ASSET;
  readonly catScratchAsset = CAT_SCRATCH_EFFECT_ASSET;

  phase: LongLeCatBasicPhase = 'idle';

  startX = 0;
  startY = 0;
  targetX = 0;
  targetY = 0;
  deltaX = 0;
  deltaY = 0;

  hasTarget = false;
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

    // 1. Resolve Caster Anchor (at foot of Long Lê)
    let cX = this.actorTeamRight ? w * 0.75 : w * 0.25;
    let cY = h * 0.6;

    if (this.actorId != null) {
      const actorEl = document.querySelector(`[data-combatant-id="${this.actorId}"]`);
      if (actorEl) {
        const r = actorEl.getBoundingClientRect();
        cX = r.left + r.width * 0.5 - hostRect.left;
        cY = r.bottom - 24 - hostRect.top;
      }
    }
    this.startX = cX;
    this.startY = cY;

    // 2. Resolve Target Anchor (middle / lower torso of target)
    let targetId = this.activeTargetIds[0] ?? null;
    if (targetId == null) {
      for (const ev of this.castEvents) {
        if (ev.targetId) {
          targetId = ev.targetId;
          break;
        }
      }
    }

    let tX = this.actorTeamRight ? w * 0.25 : w * 0.75;
    let tY = h * 0.55;

    if (targetId != null) {
      const targetEl = document.querySelector(`[data-combatant-id="${targetId}"]`);
      if (targetEl) {
        const r = targetEl.getBoundingClientRect();
        tX = r.left + r.width * 0.5 - hostRect.left;
        tY = r.top + r.height * 0.52 - hostRect.top;
        this.hasTarget = true;
      } else {
        this.hasTarget = false;
      }
    } else {
      this.hasTarget = false;
    }

    this.targetX = tX;
    this.targetY = tY;
    this.deltaX = tX - cX;
    this.deltaY = tY - cY;

    const speed = Math.max(1, this.visualSpeed);
    const dPrep = Math.round(180 / speed);
    const dFlight = Math.round(320 / speed);
    const dClaw = Math.round(250 / speed);
    const dMark = Math.round(150 / speed);
    const dReturn = Math.round(300 / speed);

    // Phase 1: 0 - 180ms: Crouch preparation next to Long Lê
    this.phase = 'crouch_prep';
    this.cdr.markForCheck();

    // Phase 2: 180 - 500ms: Pounce flight parabolic arc from caster to target
    this.timers.push(
      setTimeout(() => {
        this.phase = 'pounce_flight';
        this.cdr.markForCheck();
      }, dPrep)
    );

    // Phase 3: 500 - 750ms: 3 Staggered claw slashes & impact on target
    this.timers.push(
      setTimeout(() => {
        this.phase = 'claw_impact';
        this.cdr.markForCheck();
      }, dPrep + dFlight)
    );

    // Phase 4: 700 - 850ms: Claws condense into CAT_SCRATCH pulse mark
    this.timers.push(
      setTimeout(() => {
        this.phase = 'mark_placed';
        this.cdr.markForCheck();
      }, dPrep + dFlight + dClaw - 50)
    );

    // Phase 5: 850 - 1150ms: Cat bounces back to Long Lê & dissolves
    this.timers.push(
      setTimeout(() => {
        this.phase = 'cat_return';
        this.cdr.markForCheck();
      }, dPrep + dFlight + dClaw)
    );

    // Phase 6: Complete
    this.timers.push(
      setTimeout(() => {
        this.phase = 'complete';
        this.cdr.markForCheck();
      }, dPrep + dFlight + dClaw + dReturn)
    );
  }
}
