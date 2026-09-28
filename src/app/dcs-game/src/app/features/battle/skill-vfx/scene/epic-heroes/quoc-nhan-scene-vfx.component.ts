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
import { BattleEventDto } from '../../../../../core/models/battle.model';

interface TargetCoord {
  id: number;
  x: number;
  y: number;
}

@Component({
  selector: 'app-quoc-nhan-scene-vfx',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="quoc-nhan-vfx-container"
      [class.caster-right]="actorTeamRight"
      [class.caster-left]="!actorTeamRight"
      [style.--speed]="visualSpeed"
    >
      <!-- Phase 1: Splitting Phantoms at Caster Position -->
      @if (phase === 'split') {
        <div
          class="caster-shadow-split"
          [style.left.px]="actorPos.x"
          [style.top.px]="actorPos.y"
        >
          <div class="smoke-puff dark-smoke-1"></div>
          <div class="smoke-puff dark-smoke-2"></div>
          <div class="phantom-silhouette left-phantom"></div>
          <div class="phantom-silhouette right-phantom"></div>
        </div>
      }

      <!-- Phase 2: Darting Phantoms towards Back-row Enemies -->
      @if (phase === 'dash') {
        @for (target of targetPositions; track target.id; let idx = $index) {
          <div
            class="phantom-dart"
            [style.left.px]="getMidpointX(actorPos.x, target.x, idx)"
            [style.top.px]="getMidpointY(actorPos.y, target.y, idx)"
          >
            <div class="phantom-streak-trail"></div>
          </div>
        }
      }

      <!-- Phase 3: Simultaneous Cross Slashes & Phantom Mask Stamp -->
      @if (phase === 'strike') {
        @for (target of targetPositions; track target.id) {
          <div
            class="target-phantom-strike"
            [style.left.px]="target.x"
            [style.top.px]="target.y"
          >
            <div class="cross-slash slash-1"></div>
            <div class="cross-slash slash-2"></div>
            <div class="mask-burst-prop">
              <img
                [src]="maskAssetUrl"
                alt="Phantom Mask"
                class="mask-image"
                (error)="onAssetError()"
              />
              @if (assetFailed) {
                <div class="mask-fallback">
                  <div class="mask-grin"></div>
                  <div class="mask-eye left-eye"></div>
                  <div class="mask-eye right-eye"></div>
                </div>
              }
            </div>
          </div>
        }

        <!-- Caster gets Crit Buff Glow -->
        <div
          class="caster-crit-buff"
          [style.left.px]="actorPos.x"
          [style.top.px]="actorPos.y"
        >
          <div class="crit-aura-ring"></div>
          <div class="crit-buff-badge">
            <span class="badge-text">CHÍ MẠNG +15%</span>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 35;
    }

    .quoc-nhan-vfx-container {
      position: absolute;
      inset: 0;
      overflow: hidden;
    }

    .caster-shadow-split {
      position: absolute;
      transform: translate(-50%, -50%);
      width: 100px;
      height: 100px;

      .smoke-puff {
        position: absolute;
        inset: 10px;
        background: radial-gradient(circle, rgba(15, 23, 42, 0.9) 0%, rgba(2, 132, 199, 0.4) 60%, transparent 100%);
        border-radius: 50%;
        filter: blur(4px);
        animation: smoke-expand calc(0.35s / var(--speed, 1)) ease-out forwards;
      }

      .phantom-silhouette {
        position: absolute;
        width: 30px;
        height: 50px;
        background: rgba(15, 23, 42, 0.7);
        border: 1px solid #38bdf8;
        border-radius: 6px;
        filter: blur(1px);

        &.left-phantom {
          left: -15px;
          top: 25px;
          animation: split-left calc(0.35s / var(--speed, 1)) ease-out forwards;
        }
        &.right-phantom {
          right: -15px;
          top: 25px;
          animation: split-right calc(0.35s / var(--speed, 1)) ease-out forwards;
        }
      }
    }

    .phantom-dart {
      position: absolute;
      transform: translate(-50%, -50%);
      width: 80px;
      height: 16px;

      .phantom-streak-trail {
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, #0f172a 40%, #38bdf8 80%, #ffffff);
        border-radius: 4px;
        box-shadow: 0 0 12px #38bdf8;
        animation: streak-dash calc(0.4s / var(--speed, 1)) ease-out forwards;
      }
    }

    .target-phantom-strike {
      position: absolute;
      transform: translate(-50%, -50%);
      width: 90px;
      height: 90px;
      display: flex;
      align-items: center;
      justify-content: center;

      .cross-slash {
        position: absolute;
        width: 85px;
        height: 4px;
        background: linear-gradient(90deg, transparent, #ffffff 40%, #38bdf8 80%, transparent);
        box-shadow: 0 0 10px #38bdf8;

        &.slash-1 {
          transform: rotate(45deg);
          animation: slash-slice calc(0.35s / var(--speed, 1)) ease-out forwards;
        }
        &.slash-2 {
          transform: rotate(-45deg);
          animation: slash-slice calc(0.35s / var(--speed, 1)) 0.06s ease-out forwards;
        }
      }

      .mask-burst-prop {
        position: absolute;
        width: 50px;
        height: 50px;
        filter: drop-shadow(0 0 12px rgba(56, 189, 248, 0.9));
        animation: mask-pop calc(0.45s / var(--speed, 1)) ease-out forwards;

        .mask-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .mask-fallback {
          width: 44px;
          height: 44px;
          background: #0f172a;
          border: 2px solid #38bdf8;
          border-radius: 50% 50% 45% 45%;
          position: relative;
          box-shadow: 0 0 14px #0284c7;

          .mask-grin {
            position: absolute;
            bottom: 8px;
            left: 50%;
            transform: translateX(-50%);
            width: 22px;
            height: 6px;
            background: #ffffff;
            clip-path: polygon(0 0, 20% 100%, 40% 0, 60% 100%, 80% 0, 100% 100%, 90% 0);
          }

          .mask-eye {
            position: absolute;
            top: 14px;
            width: 8px;
            height: 4px;
            background: #38bdf8;
            border-radius: 50%;

            &.left-eye { left: 9px; transform: rotate(15deg); }
            &.right-eye { right: 9px; transform: rotate(-15deg); }
          }
        }
      }
    }

    .caster-crit-buff {
      position: absolute;
      transform: translate(-50%, -50%);
      width: 80px;
      height: 80px;
      display: flex;
      align-items: center;
      justify-content: center;

      .crit-aura-ring {
        position: absolute;
        width: 70px;
        height: 70px;
        border: 2px solid #38bdf8;
        border-radius: 50%;
        animation: pulse-crit calc(0.6s / var(--speed, 1)) ease-out forwards;
      }

      .crit-buff-badge {
        position: absolute;
        top: -30px;
        background: rgba(15, 23, 42, 0.9);
        border: 1px solid #38bdf8;
        border-radius: 4px;
        padding: 2px 6px;
        box-shadow: 0 0 10px rgba(56, 189, 248, 0.7);
        animation: badge-float calc(0.65s / var(--speed, 1)) ease-out forwards;

        .badge-text {
          font-size: 11px;
          font-weight: 800;
          color: #bae6fd;
          letter-spacing: 0.5px;
        }
      }
    }

    @keyframes smoke-expand {
      0% { transform: scale(0.2); opacity: 0; }
      50% { opacity: 0.8; }
      100% { transform: scale(1.4); opacity: 0; }
    }

    @keyframes split-left {
      0% { transform: translate(0, 0); opacity: 0; }
      100% { transform: translate(-30px, -10px); opacity: 0.8; }
    }

    @keyframes split-right {
      0% { transform: translate(0, 0); opacity: 0; }
      100% { transform: translate(30px, -10px); opacity: 0.8; }
    }

    @keyframes streak-dash {
      0% { transform: scaleX(0.2); opacity: 0; }
      50% { opacity: 1; }
      100% { transform: scaleX(1.3); opacity: 0; }
    }

    @keyframes slash-slice {
      0% { transform: scaleX(0); opacity: 0; }
      50% { opacity: 1; }
      100% { transform: scaleX(1.2); opacity: 0; }
    }

    @keyframes mask-pop {
      0% { transform: scale(0.4); opacity: 0; }
      50% { transform: scale(1.1); opacity: 1; }
      100% { transform: scale(1); opacity: 0; }
    }

    @keyframes pulse-crit {
      0% { transform: scale(0.5); opacity: 0.9; }
      100% { transform: scale(1.5); opacity: 0; }
    }

    @keyframes badge-float {
      0% { transform: translateY(8px); opacity: 0; }
      30% { transform: translateY(0); opacity: 1; }
      80% { transform: translateY(-4px); opacity: 1; }
      100% { transform: translateY(-10px); opacity: 0; }
    }
  `]
})
export class QuocNhanSceneVfxComponent implements OnInit, OnChanges, OnDestroy {
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

  readonly maskAssetUrl = '/assets/images/dcs-game/skills/quoc-nhan-gia-dien/phantom-mask.png';
  assetFailed = false;

  phase: 'idle' | 'split' | 'dash' | 'strike' = 'idle';
  actorPos = { x: 0, y: 0 };
  targetPositions: TargetCoord[] = [];

  private timeouts: any[] = [];
  private lastExecutedCastSeq: number | null = null;

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
  }

  onAssetError(): void {
    this.assetFailed = true;
    this.cdr.markForCheck();
  }

  getMidpointX(x1: number, x2: number, idx: number): number {
    return (x1 + x2) * 0.5 + (idx % 2 === 0 ? 20 : -20);
  }

  getMidpointY(y1: number, y2: number, idx: number): number {
    return (y1 + y2) * 0.5 + (idx % 2 === 0 ? -30 : 30);
  }

  private clearAll(): void {
    this.timeouts.forEach(t => clearTimeout(t));
    this.timeouts = [];
    this.phase = 'idle';
    this.cdr.markForCheck();
  }

  private startSequence(): void {
    this.clearAll();

    const hostRect = this.el.nativeElement.getBoundingClientRect();
    const w = hostRect.width || 800;
    const h = hostRect.height || 450;

    let actorX = this.actorTeamRight ? w * 0.75 : w * 0.25;
    let actorY = h * 0.5;
    if (this.actorId != null) {
      const actorEl = document.querySelector(`[data-combatant-id="${this.actorId}"]`);
      if (actorEl) {
        const r = actorEl.getBoundingClientRect();
        actorX = r.left + r.width * 0.5 - hostRect.left;
        actorY = r.top + r.height * 0.5 - hostRect.top;
      }
    }
    this.actorPos = { x: actorX, y: actorY };

    // Resolve Back-row Targets
    const targets: TargetCoord[] = [];
    if (this.activeTargetIds && this.activeTargetIds.length > 0) {
      for (const tId of this.activeTargetIds) {
        const targetEl = document.querySelector(`[data-combatant-id="${tId}"]`);
        if (targetEl) {
          const r = targetEl.getBoundingClientRect();
          targets.push({
            id: tId,
            x: r.left + r.width * 0.5 - hostRect.left,
            y: r.top + r.height * 0.5 - hostRect.top
          });
        }
      }
    }

    if (targets.length === 0) {
      const enemyBackX = this.actorTeamRight ? w * 0.15 : w * 0.85;
      targets.push(
        { id: 21, x: enemyBackX, y: h * 0.35 },
        { id: 22, x: enemyBackX, y: h * 0.65 }
      );
    }
    this.targetPositions = targets;

    const speed = Math.max(1, this.visualSpeed);
    const splitDuration = Math.round(350 / speed);
    const dashDuration = Math.round(500 / speed);
    const strikeDuration = Math.round(750 / speed);

    // Phase 1: Shadow split
    this.phase = 'split';
    this.cdr.markForCheck();

    const t1 = setTimeout(() => {
      // Phase 2: Dash
      this.phase = 'dash';
      this.cdr.markForCheck();
    }, splitDuration);
    this.timeouts.push(t1);

    const t2 = setTimeout(() => {
      // Phase 3: Simultaneous strikes
      this.phase = 'strike';
      this.cdr.markForCheck();
    }, splitDuration + dashDuration);
    this.timeouts.push(t2);

    const t3 = setTimeout(() => {
      // Phase 4: Dissipation
      this.phase = 'idle';
      this.cdr.markForCheck();
    }, splitDuration + dashDuration + strikeDuration);
    this.timeouts.push(t3);
  }
}
