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
  selector: 'app-cau-vang-scene-vfx',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="cau-vang-vfx-container"
      [class.caster-right]="actorTeamRight"
      [class.caster-left]="!actorTeamRight"
      [style.--speed]="visualSpeed"
    >
      <!-- Phase 1, 2, 3: Hovering Jade Guardian Bell above Caster -->
      @if (phase === 'chime' || phase === 'paws' || phase === 'barrier') {
        <div
          class="jade-bell-prop"
          [style.left.px]="actorPos.x"
          [style.top.px]="actorPos.y - 70"
        >
          <img
            [src]="bellAssetUrl"
            alt="Jade Guard Bell"
            class="bell-image"
            (error)="onAssetError()"
          />
          @if (assetFailed) {
            <div class="bell-fallback">
              <div class="bell-dome"></div>
              <div class="bell-collar-cord"></div>
              <div class="bell-paw-glyph"></div>
            </div>
          }
          <div class="chime-harmonic-wave wave-1"></div>
          <div class="chime-harmonic-wave wave-2"></div>
        </div>
      }

      <!-- Phase 2 & 3: Jade Paw Prints on the Ground Under Allies -->
      @if (phase === 'paws' || phase === 'barrier') {
        @for (target of targetPositions; track target.id) {
          <div
            class="ally-paw-seal"
            [style.left.px]="target.x"
            [style.top.px]="target.y + 40"
          >
            <div class="paw-main-pad"></div>
            <div class="paw-toe toe-1"></div>
            <div class="paw-toe toe-2"></div>
            <div class="paw-toe toe-3"></div>
            <div class="paw-toe toe-4"></div>
            <div class="paw-ground-ring"></div>
          </div>
        }
      }

      <!-- Phase 3: Shimmering Jade-Bronze Protective Barriers -->
      @if (phase === 'barrier') {
        @for (target of targetPositions; track target.id) {
          <div
            class="ally-jade-barrier"
            [style.left.px]="target.x"
            [style.top.px]="target.y"
          >
            <div class="barrier-dome-shell"></div>
            <div class="barrier-light-sheen"></div>
            <div class="barrier-buff-badge">
              <span class="badge-text">KHIÊN & GIẢM ST 12%</span>
            </div>
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

    .cau-vang-vfx-container {
      position: absolute;
      inset: 0;
      overflow: hidden;
    }

    .jade-bell-prop {
      position: absolute;
      transform: translate(-50%, -50%);
      width: 58px;
      height: 58px;
      display: flex;
      align-items: center;
      justify-content: center;
      filter: drop-shadow(0 0 14px rgba(16, 185, 129, 0.85));
      animation: bell-chime-sway calc(1.8s / var(--speed, 1)) infinite ease-in-out;

      .bell-image {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }

      .bell-fallback {
        width: 44px;
        height: 48px;
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;

        .bell-collar-cord {
          width: 14px;
          height: 6px;
          background: #b91c1c;
          border-radius: 4px;
          box-shadow: 0 0 6px #b91c1c;
        }

        .bell-dome {
          width: 36px;
          height: 38px;
          background: radial-gradient(circle at 35% 35%, #6ee7b7, #059669 60%, #064e3b 100%);
          border: 2px solid #d97706;
          border-radius: 50% 50% 40% 40%;
          box-shadow: 0 0 12px #10b981;
        }

        .bell-paw-glyph {
          position: absolute;
          bottom: 12px;
          width: 10px;
          height: 8px;
          background: #fef3c7;
          border-radius: 4px;
        }
      }

      .chime-harmonic-wave {
        position: absolute;
        border: 2px solid #10b981;
        border-radius: 50%;

        &.wave-1 {
          width: 50px;
          height: 50px;
          animation: harmonic-chime calc(1s / var(--speed, 1)) infinite ease-out;
        }
        &.wave-2 {
          width: 70px;
          height: 70px;
          animation: harmonic-chime calc(1s / var(--speed, 1)) 0.3s infinite ease-out;
        }
      }
    }

    .ally-paw-seal {
      position: absolute;
      transform: translate(-50%, -50%);
      width: 40px;
      height: 30px;

      .paw-main-pad {
        position: absolute;
        bottom: 2px;
        left: 50%;
        transform: translateX(-50%);
        width: 18px;
        height: 14px;
        background: radial-gradient(circle, #34d399, #059669);
        border-radius: 50% 50% 45% 45%;
        box-shadow: 0 0 10px #10b981;
      }

      .paw-toe {
        position: absolute;
        width: 6px;
        height: 8px;
        background: #6ee7b7;
        border-radius: 50%;
        box-shadow: 0 0 6px #34d399;

        &.toe-1 { top: 0; left: 4px; transform: rotate(-20deg); }
        &.toe-2 { top: -3px; left: 12px; }
        &.toe-3 { top: -3px; right: 12px; }
        &.toe-4 { top: 0; right: 4px; transform: rotate(20deg); }
      }

      .paw-ground-ring {
        position: absolute;
        inset: -10px;
        border: 1.5px solid rgba(16, 185, 129, 0.6);
        border-radius: 50%;
        animation: ground-ripple calc(0.65s / var(--speed, 1)) ease-out forwards;
      }
    }

    .ally-jade-barrier {
      position: absolute;
      transform: translate(-50%, -50%);
      width: 86px;
      height: 96px;
      display: flex;
      align-items: center;
      justify-content: center;

      .barrier-dome-shell {
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at 50% 20%, rgba(110, 231, 183, 0.4), rgba(5, 150, 105, 0.25) 70%, transparent 100%);
        border: 2px solid #34d399;
        border-top-color: #f59e0b;
        border-radius: 50% 50% 45% 45%;
        box-shadow: 0 0 14px rgba(16, 185, 129, 0.7), inset 0 0 10px rgba(52, 211, 153, 0.4);
        animation: dome-bloom calc(0.45s / var(--speed, 1)) ease-out forwards;
      }

      .barrier-light-sheen {
        position: absolute;
        top: 10px;
        width: 50px;
        height: 15px;
        background: rgba(255, 255, 255, 0.35);
        border-radius: 50%;
        filter: blur(2px);
      }

      .barrier-buff-badge {
        position: absolute;
        top: -30px;
        background: rgba(6, 78, 59, 0.9);
        border: 1px solid #10b981;
        border-radius: 4px;
        padding: 2px 6px;
        box-shadow: 0 0 10px rgba(16, 185, 129, 0.8);
        animation: badge-float calc(0.65s / var(--speed, 1)) ease-out forwards;

        .badge-text {
          font-size: 10.5px;
          font-weight: 700;
          color: #a7f3d0;
          letter-spacing: 0.3px;
        }
      }
    }

    @keyframes bell-chime-sway {
      0%, 100% { transform: translate(-50%, -50%) rotate(0deg); }
      25% { transform: translate(-50%, -50%) rotate(4deg); }
      75% { transform: translate(-50%, -50%) rotate(-4deg); }
    }

    @keyframes harmonic-chime {
      0% { transform: scale(0.6); opacity: 0.9; }
      100% { transform: scale(1.6); opacity: 0; }
    }

    @keyframes ground-ripple {
      0% { transform: scale(0.4); opacity: 0; }
      50% { opacity: 0.8; }
      100% { transform: scale(1.2); opacity: 0; }
    }

    @keyframes dome-bloom {
      0% { transform: scale(0.3); opacity: 0; }
      60% { transform: scale(1.08); opacity: 1; }
      100% { transform: scale(1); opacity: 0.95; }
    }

    @keyframes badge-float {
      0% { transform: translateY(8px); opacity: 0; }
      30% { transform: translateY(0); opacity: 1; }
      80% { transform: translateY(-4px); opacity: 1; }
      100% { transform: translateY(-10px); opacity: 0; }
    }
  `]
})
export class CauVangSceneVfxComponent implements OnInit, OnChanges, OnDestroy {
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

  readonly bellAssetUrl = '/assets/images/dcs-game/skills/cau-vang-mat-lanh/jade-guard-bell.png';
  assetFailed = false;

  phase: 'idle' | 'chime' | 'paws' | 'barrier' = 'idle';
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

    // Resolve target coordinates (all allies)
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
      const allySideX = this.actorTeamRight ? w * 0.75 : w * 0.25;
      targets.push(
        { id: 1, x: allySideX - 30, y: h * 0.35 },
        { id: 2, x: allySideX + 30, y: h * 0.65 },
        { id: 3, x: allySideX, y: h * 0.5 }
      );
    }
    this.targetPositions = targets;

    const speed = Math.max(1, this.visualSpeed);
    const chimeDuration = Math.round(350 / speed);
    const pawsDuration = Math.round(450 / speed);
    const barrierDuration = Math.round(750 / speed);

    // Phase 1: Bell chime
    this.phase = 'chime';
    this.cdr.markForCheck();

    const t1 = setTimeout(() => {
      // Phase 2: Paw seals under allies
      this.phase = 'paws';
      this.cdr.markForCheck();
    }, chimeDuration);
    this.timeouts.push(t1);

    const t2 = setTimeout(() => {
      // Phase 3: Jade dome barrier
      this.phase = 'barrier';
      this.cdr.markForCheck();
    }, chimeDuration + pawsDuration);
    this.timeouts.push(t2);

    const t3 = setTimeout(() => {
      // Phase 4: Dissipation
      this.phase = 'idle';
      this.cdr.markForCheck();
    }, chimeDuration + pawsDuration + barrierDuration);
    this.timeouts.push(t3);
  }
}
