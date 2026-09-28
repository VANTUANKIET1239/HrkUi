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

@Component({
  selector: 'app-tien-dung-xuan-scene-vfx',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="tien-dung-xuan-vfx-container"
      [class.caster-right]="actorTeamRight"
      [class.caster-left]="!actorTeamRight"
      [style.--speed]="visualSpeed"
    >
      <!-- Circular Ink Gesture at Caster -->
      @if (phase === 'draw') {
        <div
          class="ink-circle-anchor"
          [style.left.px]="actorPos.x"
          [style.top.px]="actorPos.y"
        >
          <div class="ink-circle-stroke"></div>
          <div class="gold-brush-glow"></div>
        </div>
      }

      <!-- Replicated Spring Calligraphy Seals on Enemy Field -->
      @if (phase === 'spread' || phase === 'stamp') {
        <div class="enemy-seals-container">
          @for (target of targetPositions; track $index) {
            <div
              class="enemy-seal-glyph"
              [class.is-stamped]="phase === 'stamp'"
              [style.left.px]="target.x"
              [style.top.px]="target.y"
            >
              <img
                [src]="sealAssetUrl"
                alt="Spring Calligraphy Seal"
                class="seal-image"
                (error)="onAssetError()"
              />
              @if (assetFailed) {
                <div class="seal-fallback-card"></div>
              }
              <!-- Blooming Apricot Blossom Petals -->
              <div class="blossom-petals">
                <span class="petal p1"></span>
                <span class="petal p2"></span>
                <span class="petal p3"></span>
                <span class="petal p4"></span>
              </div>
              @if (phase === 'stamp') {
                <div class="ink-shockwave"></div>
                <div class="mres-debuff-badge">GIẢM KHÁNG PHÉP</div>
              }
            </div>
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

    .tien-dung-xuan-vfx-container {
      position: absolute;
      inset: 0;
      overflow: hidden;
      --facing: 1;

      &.caster-right {
        --facing: -1;
      }
    }

    .ink-circle-anchor {
      position: absolute;
      transform: translate(-50%, -50%);
      width: 110px;
      height: 110px;
      pointer-events: none;
    }

    .ink-circle-stroke {
      position: absolute;
      inset: 5px;
      border-radius: 50%;
      border: 4px solid #111111;
      border-top-color: #ffcc00;
      border-right-color: #ff9900;
      box-shadow: 0 0 14px rgba(255, 204, 0, 0.7);
      animation: ink-spin calc(0.5s / var(--speed, 1)) cubic-bezier(0.4, 0, 0.2, 1) forwards;
    }

    .gold-brush-glow {
      position: absolute;
      inset: 20px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(255, 204, 0, 0.4) 0%, transparent 70%);
      animation: brush-pulse calc(0.45s / var(--speed, 1)) ease-out forwards;
    }

    .enemy-seals-container {
      position: absolute;
      inset: 0;
    }

    .enemy-seal-glyph {
      position: absolute;
      transform: translate(-50%, -50%);
      width: 80px;
      height: 90px;
      pointer-events: none;
      animation: seal-glide calc(0.45s / var(--speed, 1)) ease-out forwards;

      &.is-stamped {
        animation: seal-slam calc(0.35s / var(--speed, 1)) cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
      }
    }

    .seal-image {
      width: 100%;
      height: 100%;
      object-fit: contain;
      filter: drop-shadow(0 0 12px rgba(255, 204, 0, 0.8));
    }

    .seal-fallback-card {
      width: 60px;
      height: 75px;
      margin: 8px auto;
      border-radius: 4px;
      background: radial-gradient(circle, #ffeedd 20%, #cc3322 80%);
      border: 2px solid #ffcc00;
      box-shadow: 0 0 16px rgba(255, 204, 0, 0.8);
    }

    .blossom-petals {
      position: absolute;
      inset: 0;

      .petal {
        position: absolute;
        width: 12px;
        height: 12px;
        border-radius: 50% 0 50% 50%;
        background: radial-gradient(circle, #fff, #ffdd44 70%, #ff8800 100%);
        box-shadow: 0 0 8px #ffcc00;
        animation: petal-drift calc(0.65s / var(--speed, 1)) ease-out forwards;

        &.p1 { top: -10px; left: 10%; }
        &.p2 { top: -5px; right: 10%; animation-delay: calc(0.08s / var(--speed, 1)); }
        &.p3 { bottom: -10px; left: 20%; animation-delay: calc(0.12s / var(--speed, 1)); }
        &.p4 { bottom: -5px; right: 15%; animation-delay: calc(0.16s / var(--speed, 1)); }
      }
    }

    .ink-shockwave {
      position: absolute;
      inset: -15px;
      border-radius: 50%;
      border: 2px dashed rgba(255, 204, 0, 0.9);
      animation: ring-puff calc(0.4s / var(--speed, 1)) ease-out forwards;
    }

    .mres-debuff-badge {
      position: absolute;
      bottom: -24px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 11px;
      font-weight: 700;
      color: #ffeedd;
      background: rgba(17, 17, 17, 0.85);
      border: 1px solid #ffcc00;
      border-radius: 8px;
      padding: 1px 7px;
      white-space: nowrap;
      box-shadow: 0 0 10px rgba(255, 204, 0, 0.6);
      animation: badge-pop calc(0.35s / var(--speed, 1)) ease-out forwards;
    }

    @keyframes ink-spin {
      0% { transform: scale(0.2) rotate(0deg); opacity: 0; }
      50% { opacity: 1; }
      100% { transform: scale(1.1) rotate(220deg); opacity: 0.9; }
    }

    @keyframes brush-pulse {
      0% { transform: scale(0.3); opacity: 0; }
      100% { transform: scale(1.3); opacity: 0.8; }
    }

    @keyframes seal-glide {
      0% { transform: translate(-50%, -80px) scale(0.4); opacity: 0; }
      100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
    }

    @keyframes seal-slam {
      0% { transform: translate(-50%, -50%) scale(1); }
      50% { transform: translate(-50%, -40px) scale(1.25); }
      100% { transform: translate(-50%, -50%) scale(1.05); }
    }

    @keyframes petal-drift {
      0% { transform: scale(0.2) translate(0, 0); opacity: 0; }
      100% { transform: scale(1) translate(calc(20px * var(--facing)), -25px); opacity: 1; }
    }

    @keyframes ring-puff {
      0% { transform: scale(0.4); opacity: 1; }
      100% { transform: scale(1.8); opacity: 0; }
    }

    @keyframes badge-pop {
      0% { transform: translateX(-50%) scale(0.6); opacity: 0; }
      100% { transform: translateX(-50%) scale(1); opacity: 1; }
    }
  `]
})
export class TienDungXuanSceneVfxComponent implements OnInit, OnChanges, OnDestroy {
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

  readonly sealAssetUrl = '/assets/images/dcs-game/skills/tien-dung-xuan/spring-calligraphy-seal.png';
  assetFailed = false;

  phase: 'idle' | 'draw' | 'spread' | 'stamp' = 'idle';
  actorPos = { x: 0, y: 0 };
  targetPositions: Array<{ x: number; y: number }> = [];

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

    // Resolve target positions
    this.targetPositions = [];
    this.activeTargetIds.forEach(id => {
      const el = document.querySelector(`[data-combatant-id="${id}"]`);
      if (el) {
        const r = el.getBoundingClientRect();
        this.targetPositions.push({
          x: r.left + r.width * 0.5 - hostRect.left,
          y: r.top + r.height * 0.5 - hostRect.top
        });
      }
    });

    if (this.targetPositions.length === 0) {
      // Default to enemy side spread
      const enemySideX = this.actorTeamRight ? w * 0.25 : w * 0.75;
      this.targetPositions = [
        { x: enemySideX, y: h * 0.35 },
        { x: enemySideX, y: h * 0.5 },
        { x: enemySideX, y: h * 0.65 }
      ];
    }

    const speed = Math.max(1, this.visualSpeed);
    const drawDuration = Math.round(500 / speed);
    const spreadDuration = Math.round(450 / speed);
    const stampDuration = Math.round(450 / speed);
    const recoverDuration = Math.round(500 / speed);

    // Phase 1: Draw ink circle
    this.phase = 'draw';
    this.cdr.markForCheck();

    const t1 = setTimeout(() => {
      // Phase 2: Spread seals to enemies
      this.phase = 'spread';
      this.cdr.markForCheck();
    }, drawDuration);
    this.timeouts.push(t1);

    const t2 = setTimeout(() => {
      // Phase 3: Stamp down with apricot blossom bloom
      this.phase = 'stamp';
      this.cdr.markForCheck();
    }, drawDuration + spreadDuration);
    this.timeouts.push(t2);

    const t3 = setTimeout(() => {
      // Phase 4: Done
      this.phase = 'idle';
      this.cdr.markForCheck();
    }, drawDuration + spreadDuration + stampDuration + recoverDuration);
    this.timeouts.push(t3);
  }
}
