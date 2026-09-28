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

export interface ChainSegment {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  path: string;
}

@Component({
  selector: 'app-van-trong-scene-vfx',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="van-trong-vfx-container"
      [class.caster-right]="actorTeamRight"
      [class.caster-left]="!actorTeamRight"
      [style.--speed]="visualSpeed"
    >
      <!-- Electric Mascot Orb Charging Near Caster -->
      @if (phase === 'charge' || phase === 'strike') {
        <div
          class="mascot-orb-anchor"
          [style.left.px]="actorPos.x"
          [style.top.px]="actorPos.y"
        >
          <img
            [src]="mascotOrbAssetUrl"
            alt="Electric Mascot Orb"
            class="mascot-orb-img"
            (error)="onAssetError()"
          />
          @if (assetFailed) {
            <div class="mascot-orb-fallback"></div>
          }
          <div class="electric-corona"></div>
        </div>
      }

      <!-- SVG Zigzag Lightning Bolts Between Targets -->
      <svg class="lightning-svg-canvas">
        @for (seg of activeSegments; track $index) {
          <path
            [attr.d]="seg.path"
            class="lightning-bolt-glow"
          />
          <path
            [attr.d]="seg.path"
            class="lightning-bolt-core"
          />
        }
      </svg>

      <!-- Impact Sparks & Stun Badges on Struck Targets -->
      @for (impact of struckTargets; track $index) {
        <div
          class="target-impact-sparks"
          [style.left.px]="impact.x"
          [style.top.px]="impact.y"
        >
          <div class="spark-core"></div>
          <div class="spark-burst"></div>
          @if (impact.stunned) {
            <div class="stun-badge">TÊ LIỆT ⚡</div>
          }
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

    .van-trong-vfx-container {
      position: absolute;
      inset: 0;
      overflow: hidden;
    }

    .mascot-orb-anchor {
      position: absolute;
      transform: translate(-50%, -50%);
      width: 68px;
      height: 68px;
      pointer-events: none;
      animation: orb-charge calc(0.4s / var(--speed, 1)) infinite alternate ease-in-out;
    }

    .mascot-orb-img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      filter: drop-shadow(0 0 16px rgba(255, 230, 0, 0.95));
    }

    .mascot-orb-fallback {
      width: 50px;
      height: 50px;
      margin: 9px;
      border-radius: 50%;
      background: radial-gradient(circle, #ffffff 20%, #ffe600 65%, #ff9900 100%);
      box-shadow: 0 0 20px #ffe600;
    }

    .electric-corona {
      position: absolute;
      inset: -10px;
      border-radius: 50%;
      border: 2px dashed #ffffff;
      box-shadow: 0 0 16px #ffe600;
      animation: corona-spin calc(0.3s / var(--speed, 1)) linear infinite;
    }

    .lightning-svg-canvas {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
    }

    .lightning-bolt-glow {
      fill: none;
      stroke: #ff9900;
      stroke-width: 8px;
      stroke-linecap: round;
      stroke-linejoin: round;
      filter: drop-shadow(0 0 12px #ffe600);
      opacity: 0.85;
    }

    .lightning-bolt-core {
      fill: none;
      stroke: #ffffff;
      stroke-width: 3.5px;
      stroke-linecap: round;
      stroke-linejoin: round;
      filter: drop-shadow(0 0 6px #ffffff);
    }

    .target-impact-sparks {
      position: absolute;
      transform: translate(-50%, -50%);
      width: 70px;
      height: 70px;
      pointer-events: none;
    }

    .spark-core {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 25px;
      height: 25px;
      border-radius: 50%;
      background: radial-gradient(circle, #ffffff 40%, #ffe600 80%, transparent 100%);
      box-shadow: 0 0 25px #ffe600;
      animation: spark-pulse calc(0.3s / var(--speed, 1)) ease-out forwards;
    }

    .spark-burst {
      position: absolute;
      inset: 0;
      border-radius: 50%;
      border: 3px solid #ffcc00;
      animation: ring-puff calc(0.35s / var(--speed, 1)) ease-out forwards;
    }

    .stun-badge {
      position: absolute;
      top: -28px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 11px;
      font-weight: 800;
      color: #ffe600;
      background: rgba(17, 17, 17, 0.9);
      border: 1px solid #ffe600;
      border-radius: 8px;
      padding: 1px 7px;
      white-space: nowrap;
      box-shadow: 0 0 10px #ffe600;
      animation: badge-pop calc(0.35s / var(--speed, 1)) ease-out forwards;
    }

    @keyframes orb-charge {
      from { transform: translate(-50%, -50%) scale(0.9); }
      to { transform: translate(-50%, -50%) scale(1.15); }
    }

    @keyframes corona-spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    @keyframes spark-pulse {
      0% { transform: translate(-50%, -50%) scale(0.3); opacity: 1; }
      100% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
    }

    @keyframes ring-puff {
      0% { transform: scale(0.2); opacity: 1; }
      100% { transform: scale(1.8); opacity: 0; }
    }

    @keyframes badge-pop {
      0% { transform: translateX(-50%) scale(0.6); opacity: 0; }
      100% { transform: translateX(-50%) scale(1); opacity: 1; }
    }
  `]
})
export class VanTrongSceneVfxComponent implements OnInit, OnChanges, OnDestroy {
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

  readonly mascotOrbAssetUrl = '/assets/images/dcs-game/skills/van-trong-dien-vang/electric-mascot-orb.png';
  assetFailed = false;

  phase: 'idle' | 'charge' | 'strike' = 'idle';
  actorPos = { x: 0, y: 0 };
  activeSegments: ChainSegment[] = [];
  struckTargets: Array<{ x: number; y: number; stunned: boolean }> = [];

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
    this.activeSegments = [];
    this.struckTargets = [];
    this.phase = 'idle';
    this.cdr.markForCheck();
  }

  private startSequence(): void {
    this.clearAll();

    const hostRect = this.el.nativeElement.getBoundingClientRect();
    const w = hostRect.width || 800;
    const h = hostRect.height || 450;

    // Resolve Actor coordinates
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

    // Resolve up to 3 distinct target coordinates
    const targetPoints: Array<{ id: number; x: number; y: number }> = [];
    const targetsToChain = this.activeTargetIds.slice(0, 3);

    targetsToChain.forEach(id => {
      const el = document.querySelector(`[data-combatant-id="${id}"]`);
      if (el) {
        const r = el.getBoundingClientRect();
        targetPoints.push({
          id,
          x: r.left + r.width * 0.5 - hostRect.left,
          y: r.top + r.height * 0.5 - hostRect.top
        });
      }
    });

    if (targetPoints.length === 0) {
      const enemySideX = this.actorTeamRight ? w * 0.25 : w * 0.75;
      targetPoints.push(
        { id: 1, x: enemySideX, y: h * 0.4 },
        { id: 2, x: enemySideX - 30, y: h * 0.6 },
        { id: 3, x: enemySideX + 30, y: h * 0.5 }
      );
    }

    const stunnedTargetIds = new Set(
      this.castEvents
        .filter(e => e.eventType === 'STATUS_APPLIED' && e.effectTypeCode === 'STUN')
        .map(e => e.targetId)
    );

    const speed = Math.max(1, this.visualSpeed);
    const chargeDuration = Math.round(400 / speed);
    const strikeInterval = Math.round(250 / speed);

    // Phase 1: Charge up orb
    this.phase = 'charge';
    this.cdr.markForCheck();

    // Phase 2: Chain bolts
    targetPoints.forEach((target, idx) => {
      const delay = chargeDuration + idx * strikeInterval;
      const t = setTimeout(() => {
        this.phase = 'strike';
        const prevPoint = idx === 0 ? this.actorPos : targetPoints[idx - 1];
        const path = this.generateZigzagPath(prevPoint.x, prevPoint.y, target.x, target.y);

        this.activeSegments.push({
          startX: prevPoint.x,
          startY: prevPoint.y,
          endX: target.x,
          endY: target.y,
          path
        });

        this.struckTargets.push({
          x: target.x,
          y: target.y,
          stunned: stunnedTargetIds.has(target.id)
        });

        this.cdr.markForCheck();
      }, delay);
      this.timeouts.push(t);
    });

    const totalDuration = chargeDuration + targetPoints.length * strikeInterval + Math.round(400 / speed);
    const tEnd = setTimeout(() => {
      this.phase = 'idle';
      this.activeSegments = [];
      this.struckTargets = [];
      this.cdr.markForCheck();
    }, totalDuration);
    this.timeouts.push(tEnd);
  }

  private generateZigzagPath(x1: number, y1: number, x2: number, y2: number): string {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dist = Math.hypot(dx, dy);
    const steps = Math.max(4, Math.floor(dist / 35));

    let path = `M ${x1} ${y1}`;
    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      const baseX = x1 + dx * t;
      const baseY = y1 + dy * t;
      const perpX = -dy / dist;
      const perpY = dx / dist;
      const offset = (Math.random() - 0.5) * 28;
      path += ` L ${baseX + perpX * offset} ${baseY + perpY * offset}`;
    }
    path += ` L ${x2} ${y2}`;
    return path;
  }
}
