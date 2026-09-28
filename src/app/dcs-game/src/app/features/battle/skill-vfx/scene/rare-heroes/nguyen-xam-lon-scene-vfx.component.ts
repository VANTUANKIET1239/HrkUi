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
  selector: 'app-nguyen-xam-lon-scene-vfx',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="nguyen-xam-lon-vfx-container"
      [class.caster-right]="actorTeamRight"
      [class.caster-left]="!actorTeamRight"
      [style.--speed]="visualSpeed"
    >
      <!-- Stomp Dust at Caster -->
      @if (phase === 'stomp') {
        <div
          class="stomp-dust-anchor"
          [style.left.px]="actorPos.x"
          [style.top.px]="actorPos.y"
        >
          <div class="dust-ring ring-1"></div>
          <div class="dust-ring ring-2"></div>
          <div class="stomp-shockwave"></div>
        </div>
      }

      <!-- Boss Stamp Slam on Front Row Target Area -->
      @if (phase === 'stamp' || phase === 'buff') {
        <div
          class="boss-stamp-impact"
          [style.left.px]="frontRowCenter.x"
          [style.top.px]="frontRowCenter.y"
        >
          <img
            [src]="bossStampAssetUrl"
            alt="Boss Stamp"
            class="stamp-decal-img"
            (error)="onAssetError()"
          />
          @if (assetFailed) {
            <div class="stamp-decal-fallback"></div>
          }
          <div class="horizontal-sweep-wave wave-left"></div>
          <div class="horizontal-sweep-wave wave-right"></div>
          <div class="cracked-ground-overlay"></div>
        </div>
      }

      <!-- Self ATK Buff Aura at Caster -->
      @if (phase === 'buff') {
        <div
          class="atk-buff-aura"
          [style.left.px]="actorPos.x"
          [style.top.px]="actorPos.y"
        >
          <div class="buff-flame flame-1"></div>
          <div class="buff-flame flame-2"></div>
          <div class="buff-badge">TĂNG CÔNG +10%</div>
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

    .nguyen-xam-lon-vfx-container {
      position: absolute;
      inset: 0;
      overflow: hidden;
      --facing: 1;

      &.caster-right {
        --facing: -1;
      }
    }

    .stomp-dust-anchor {
      position: absolute;
      transform: translate(-50%, -50%);
      width: 100px;
      height: 100px;
      pointer-events: none;
    }

    .dust-ring {
      position: absolute;
      inset: 0;
      border-radius: 50%;
      border: 3px solid rgba(230, 0, 38, 0.7);
      animation: dust-expand calc(0.35s / var(--speed, 1)) ease-out forwards;

      &.ring-2 {
        border-color: rgba(17, 34, 68, 0.8);
        animation-delay: calc(0.08s / var(--speed, 1));
      }
    }

    .stomp-shockwave {
      position: absolute;
      bottom: -10px;
      left: 50%;
      transform: translateX(-50%);
      width: 120px;
      height: 16px;
      border-radius: 50%;
      background: radial-gradient(ellipse, #e60026 30%, #112244 80%, transparent 100%);
      box-shadow: 0 0 20px #e60026;
      animation: dust-expand calc(0.35s / var(--speed, 1)) ease-out forwards;
    }

    .boss-stamp-impact {
      position: absolute;
      transform: translate(-50%, -50%);
      width: 130px;
      height: 130px;
      pointer-events: none;
      animation: stamp-crash calc(0.32s / var(--speed, 1)) cubic-bezier(0.19, 1, 0.22, 1) forwards;
    }

    .stamp-decal-img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      filter: drop-shadow(0 0 16px rgba(230, 0, 38, 0.9));
    }

    .stamp-decal-fallback {
      width: 100px;
      height: 100px;
      margin: 15px;
      border-radius: 50%;
      border: 5px solid #e60026;
      background: radial-gradient(circle, #112244 50%, #e60026 90%);
      box-shadow: 0 0 24px #e60026;
    }

    .horizontal-sweep-wave {
      position: absolute;
      top: 50%;
      height: 6px;
      border-radius: 4px;
      background: linear-gradient(to right, #e60026, #ffffff, transparent);
      box-shadow: 0 0 14px #e60026;

      &.wave-left {
        right: 50%;
        width: 160px;
        transform: translateY(-50%) scaleX(-1);
        animation: sweep-expand calc(0.45s / var(--speed, 1)) ease-out forwards;
      }
      &.wave-right {
        left: 50%;
        width: 160px;
        transform: translateY(-50%);
        animation: sweep-expand calc(0.45s / var(--speed, 1)) ease-out forwards;
      }
    }

    .cracked-ground-overlay {
      position: absolute;
      bottom: -10px;
      left: 50%;
      transform: translateX(-50%);
      width: 150px;
      height: 20px;
      border-radius: 50%;
      background: radial-gradient(ellipse, rgba(230, 0, 38, 0.8) 0%, rgba(17, 34, 68, 0.5) 60%, transparent 100%);
      animation: dust-expand calc(0.45s / var(--speed, 1)) ease-out forwards;
    }

    .atk-buff-aura {
      position: absolute;
      transform: translate(-50%, -50%);
      width: 70px;
      height: 80px;
      pointer-events: none;
    }

    .buff-flame {
      position: absolute;
      inset: 0;
      border-radius: 35px;
      background: radial-gradient(circle, rgba(230, 0, 38, 0.4) 30%, transparent 80%);
      box-shadow: 0 0 16px #e60026;
      animation: flame-pulse calc(0.35s / var(--speed, 1)) infinite alternate;

      &.flame-2 {
        animation-delay: calc(0.15s / var(--speed, 1));
      }
    }

    .buff-badge {
      position: absolute;
      top: -30px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 11px;
      font-weight: 800;
      color: #ffffff;
      background: rgba(230, 0, 38, 0.85);
      border-radius: 8px;
      padding: 2px 8px;
      white-space: nowrap;
      box-shadow: 0 0 12px #e60026;
      animation: badge-pop calc(0.4s / var(--speed, 1)) ease-out forwards;
    }

    @keyframes dust-expand {
      0% { transform: scale(0.3); opacity: 1; }
      100% { transform: scale(1.8); opacity: 0; }
    }

    @keyframes stamp-crash {
      0% { transform: translate(-50%, -120px) scale(1.6); opacity: 0; }
      60% { transform: translate(-50%, -50%) scale(0.9); opacity: 1; }
      100% { transform: translate(-50%, -50%) scale(1); opacity: 0.95; }
    }

    @keyframes sweep-expand {
      0% { width: 0; opacity: 1; }
      100% { width: 160px; opacity: 0; }
    }

    @keyframes flame-pulse {
      from { transform: scale(0.85); opacity: 0.5; }
      to { transform: scale(1.15); opacity: 0.9; }
    }

    @keyframes badge-pop {
      0% { transform: translateX(-50%) translateY(10px); opacity: 0; }
      100% { transform: translateX(-50%) translateY(0); opacity: 1; }
    }
  `]
})
export class NguyenXamLonSceneVfxComponent implements OnInit, OnChanges, OnDestroy {
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

  readonly bossStampAssetUrl = '/assets/images/dcs-game/skills/nguyen-xam-lon/boss-stamp.png';
  assetFailed = false;

  phase: 'idle' | 'windup' | 'stomp' | 'stamp' | 'buff' = 'idle';
  actorPos = { x: 0, y: 0 };
  frontRowCenter = { x: 0, y: 0 };

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

    // Resolve front row center coordinates from targets
    const targetPoints: Array<{ x: number; y: number }> = [];
    this.activeTargetIds.forEach(id => {
      const el = document.querySelector(`[data-combatant-id="${id}"]`);
      if (el) {
        const r = el.getBoundingClientRect();
        targetPoints.push({
          x: r.left + r.width * 0.5 - hostRect.left,
          y: r.top + r.height * 0.5 - hostRect.top
        });
      }
    });

    if (targetPoints.length > 0) {
      const avgX = targetPoints.reduce((acc, p) => acc + p.x, 0) / targetPoints.length;
      const avgY = targetPoints.reduce((acc, p) => acc + p.y, 0) / targetPoints.length;
      this.frontRowCenter = { x: avgX, y: avgY };
    } else {
      // Default to enemy front row zone
      this.frontRowCenter = {
        x: this.actorTeamRight ? w * 0.35 : w * 0.65,
        y: h * 0.5
      };
    }

    const speed = Math.max(1, this.visualSpeed);
    const windupDuration = Math.round(350 / speed);
    const stompDuration = Math.round(350 / speed);
    const stampDuration = Math.round(450 / speed);
    const buffDuration = Math.round(300 / speed);
    const recoverDuration = Math.round(250 / speed);

    // Phase 1: Windup
    this.phase = 'windup';
    this.cdr.markForCheck();

    const t1 = setTimeout(() => {
      // Phase 2: Ground Stomp
      this.phase = 'stomp';
      this.cdr.markForCheck();
    }, windupDuration);
    this.timeouts.push(t1);

    const t2 = setTimeout(() => {
      // Phase 3: Boss Stamp Slam on Front Row
      this.phase = 'stamp';
      this.cdr.markForCheck();
    }, windupDuration + stompDuration);
    this.timeouts.push(t2);

    const t3 = setTimeout(() => {
      // Phase 4: Self ATK Buff
      this.phase = 'buff';
      this.cdr.markForCheck();
    }, windupDuration + stompDuration + stampDuration);
    this.timeouts.push(t3);

    const t4 = setTimeout(() => {
      // Phase 5: Done
      this.phase = 'idle';
      this.cdr.markForCheck();
    }, windupDuration + stompDuration + stampDuration + buffDuration + recoverDuration);
    this.timeouts.push(t4);
  }
}
