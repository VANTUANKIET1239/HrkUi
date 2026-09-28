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
  selector: 'app-tien-dung-tong-dai-scene-vfx',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="tien-dung-vfx-container"
      [class.caster-right]="actorTeamRight"
      [class.caster-left]="!actorTeamRight"
      [style.--speed]="visualSpeed"
    >
      <!-- Phase 1, 2, 3: Holographic Call Panel above Caster -->
      @if (phase === 'open' || phase === 'lock' || phase === 'beams') {
        <div
          class="holo-panel-prop"
          [style.left.px]="actorPos.x"
          [style.top.px]="actorPos.y - 75"
        >
          <img
            [src]="panelAssetUrl"
            alt="Holo Call Panel"
            class="panel-image"
            (error)="onAssetError()"
          />
          @if (assetFailed) {
            <div class="panel-fallback">
              <div class="holo-tile tile-1"></div>
              <div class="holo-tile tile-2"></div>
              <div class="holo-tile tile-3"></div>
              <div class="holo-tile tile-4"></div>
              <div class="holo-tile tile-5"></div>
              <div class="status-node node-orange"></div>
            </div>
          }
          <div class="holo-ambient-grid"></div>
        </div>
      }

      <!-- Phase 2: Lock-on Targets on Enemy Combatants -->
      @if (phase === 'lock' || phase === 'beams') {
        @for (target of targetPositions; track target.id) {
          <div
            class="enemy-lock-reticle"
            [style.left.px]="target.x"
            [style.top.px]="target.y"
          >
            <div class="reticle-bracket top-left"></div>
            <div class="reticle-bracket top-right"></div>
            <div class="reticle-bracket btm-left"></div>
            <div class="reticle-bracket btm-right"></div>
            <div class="reticle-dot"></div>
          </div>
        }
      }

      <!-- Phase 3: Data Lightning Beams to Enemies -->
      @if (phase === 'beams') {
        <svg class="data-beams-svg">
          @for (target of targetPositions; track target.id) {
            <line
              [attr.x1]="actorPos.x"
              [attr.y1]="actorPos.y - 50"
              [attr.x2]="target.x"
              [attr.y2]="target.y"
              class="data-beam-line"
            />
          }
        </svg>

        @for (target of targetPositions; track target.id) {
          <div
            class="data-impact-burst"
            [style.left.px]="target.x"
            [style.top.px]="target.y"
          >
            <div class="digital-flash"></div>
            <div class="digital-grid-burst"></div>
            @if (hasActionBarReduction) {
              <div class="action-bar-badge">
                <span class="badge-text">-15 LƯỢT</span>
              </div>
            }
          </div>
        }
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

    .tien-dung-vfx-container {
      position: absolute;
      inset: 0;
      overflow: hidden;
    }

    .holo-panel-prop {
      position: absolute;
      transform: translate(-50%, -50%);
      width: 80px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      filter: drop-shadow(0 0 14px rgba(0, 240, 255, 0.8));
      animation: holo-flicker calc(1.5s / var(--speed, 1)) infinite ease-in-out;

      .panel-image {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }

      .panel-fallback {
        width: 72px;
        height: 48px;
        background: rgba(0, 40, 60, 0.8);
        border: 1.5px solid #00f0ff;
        border-radius: 4px;
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 3px;
        padding: 4px;
        position: relative;

        .holo-tile {
          background: rgba(0, 240, 255, 0.25);
          border: 1px solid rgba(0, 240, 255, 0.6);
          border-radius: 2px;
        }

        .status-node {
          position: absolute;
          top: 3px;
          right: 3px;
          width: 5px;
          height: 5px;
          background: #ff6600;
          border-radius: 50%;
          box-shadow: 0 0 6px #ff6600;
        }
      }

      .holo-ambient-grid {
        position: absolute;
        inset: -6px;
        border: 1px dashed rgba(0, 240, 255, 0.4);
        border-radius: 6px;
      }
    }

    .enemy-lock-reticle {
      position: absolute;
      transform: translate(-50%, -50%);
      width: 44px;
      height: 44px;

      .reticle-bracket {
        position: absolute;
        width: 8px;
        height: 8px;
        border: 2px solid #ff9900;

        &.top-left { top: 0; left: 0; border-right: none; border-bottom: none; }
        &.top-right { top: 0; right: 0; border-left: none; border-bottom: none; }
        &.btm-left { bottom: 0; left: 0; border-right: none; border-top: none; }
        &.btm-right { bottom: 0; right: 0; border-left: none; border-top: none; }
      }

      .reticle-dot {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 4px;
        height: 4px;
        background: #00f0ff;
        border-radius: 50%;
        box-shadow: 0 0 6px #00f0ff;
      }
    }

    .data-beams-svg {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;

      .data-beam-line {
        stroke: #00f0ff;
        stroke-width: 3;
        stroke-dasharray: 6 3;
        filter: drop-shadow(0 0 10px #00f0ff);
        animation: beam-stream calc(0.35s / var(--speed, 1)) linear infinite;
      }
    }

    .data-impact-burst {
      position: absolute;
      transform: translate(-50%, -50%);
      width: 70px;
      height: 70px;
      display: flex;
      align-items: center;
      justify-content: center;

      .digital-flash {
        position: absolute;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: radial-gradient(circle, #ffffff, #00f0ff 60%, transparent 100%);
        animation: digital-bloom calc(0.4s / var(--speed, 1)) ease-out forwards;
      }

      .digital-grid-burst {
        position: absolute;
        width: 55px;
        height: 55px;
        border: 1.5px solid #ff9900;
        animation: grid-expand calc(0.45s / var(--speed, 1)) ease-out forwards;
      }

      .action-bar-badge {
        position: absolute;
        top: -32px;
        background: rgba(30, 20, 0, 0.85);
        border: 1px solid #ff9900;
        border-radius: 4px;
        padding: 2px 6px;
        box-shadow: 0 0 10px rgba(255, 153, 0, 0.7);
        animation: badge-float calc(0.65s / var(--speed, 1)) ease-out forwards;

        .badge-text {
          font-size: 11px;
          font-weight: 800;
          color: #ffcc66;
          letter-spacing: 0.5px;
        }
      }
    }

    @keyframes holo-flicker {
      0%, 100% { opacity: 0.95; transform: translate(-50%, -50%) scale(1); }
      50% { opacity: 0.85; transform: translate(-50%, -50%) scale(1.02); }
    }

    @keyframes beam-stream {
      to { stroke-dashoffset: -18; }
    }

    @keyframes digital-bloom {
      0% { transform: scale(0.2); opacity: 1; }
      100% { transform: scale(1.4); opacity: 0; }
    }

    @keyframes grid-expand {
      0% { transform: scale(0.4) rotate(0deg); opacity: 1; }
      100% { transform: scale(1.3) rotate(45deg); opacity: 0; }
    }

    @keyframes badge-float {
      0% { transform: translateY(8px); opacity: 0; }
      30% { transform: translateY(0); opacity: 1; }
      80% { transform: translateY(-4px); opacity: 1; }
      100% { transform: translateY(-10px); opacity: 0; }
    }
  `]
})
export class TienDungTongDaiSceneVfxComponent implements OnInit, OnChanges, OnDestroy {
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

  readonly panelAssetUrl = '/assets/images/dcs-game/skills/tien-dung-tong-dai/holo-call-panel.png';
  assetFailed = false;

  phase: 'idle' | 'open' | 'lock' | 'beams' = 'idle';
  actorPos = { x: 0, y: 0 };
  targetPositions: TargetCoord[] = [];
  hasActionBarReduction = false;

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

    // Resolve target coordinates (all enemies)
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
      const enemySideX = this.actorTeamRight ? w * 0.25 : w * 0.75;
      targets.push(
        { id: 10, x: enemySideX - 30, y: h * 0.35 },
        { id: 11, x: enemySideX + 30, y: h * 0.65 },
        { id: 12, x: enemySideX, y: h * 0.5 }
      );
    }
    this.targetPositions = targets;

    this.hasActionBarReduction = this.castEvents.some(e =>
      e.eventType === 'ACTION_BAR_CHANGED' || (e.effectTypeCode === 'ACTION_BAR_CHANGE' && (e.value ?? 0) < 0)
    );

    const speed = Math.max(1, this.visualSpeed);
    const openDuration = Math.round(450 / speed);
    const lockDuration = Math.round(350 / speed);
    const beamsDuration = Math.round(750 / speed);

    // Phase 1: Open panel
    this.phase = 'open';
    this.cdr.markForCheck();

    const t1 = setTimeout(() => {
      // Phase 2: Lock-on targets
      this.phase = 'lock';
      this.cdr.markForCheck();
    }, openDuration);
    this.timeouts.push(t1);

    const t2 = setTimeout(() => {
      // Phase 3: Synchronized data beams
      this.phase = 'beams';
      this.cdr.markForCheck();
    }, openDuration + lockDuration);
    this.timeouts.push(t2);

    const t3 = setTimeout(() => {
      // Phase 4: Dissipation
      this.phase = 'idle';
      this.cdr.markForCheck();
    }, openDuration + lockDuration + beamsDuration);
    this.timeouts.push(t3);
  }
}
