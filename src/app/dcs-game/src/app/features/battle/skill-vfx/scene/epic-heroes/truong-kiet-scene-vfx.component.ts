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
  selector: 'app-truong-kiet-scene-vfx',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="truong-kiet-vfx-container"
      [class.caster-right]="actorTeamRight"
      [class.caster-left]="!actorTeamRight"
      [style.--speed]="visualSpeed"
    >
      <!-- Phase 1: Sonic Charge Rings around Caster -->
      @if (phase === 'charge') {
        <div
          class="sonic-charge-rings"
          [style.left.px]="actorPos.x"
          [style.top.px]="actorPos.y"
        >
          <div class="ring-charge ring-1"></div>
          <div class="ring-charge ring-2"></div>
        </div>
      }

      <!-- Phase 2: Resonance Wave Projectile Traveling towards Target -->
      @if (phase === 'travel') {
        <div
          class="sonic-seal-projectile"
          [style.left.px]="projPos.x"
          [style.top.px]="projPos.y"
        >
          <img
            [src]="sealAssetUrl"
            alt="Resonance Kiss Seal"
            class="seal-image"
            (error)="onAssetError()"
          />
          @if (assetFailed) {
            <div class="seal-fallback">
              <div class="seal-arc seal-arc-top"></div>
              <div class="seal-arc seal-arc-bottom"></div>
              <div class="seal-core"></div>
            </div>
          }
          <div class="sonic-trail trail-1"></div>
          <div class="sonic-trail trail-2"></div>
        </div>
      }

      <!-- Phase 3: Resonant Sonic Impact Burst at Target -->
      @if (phase === 'impact') {
        <div
          class="sonic-impact-burst"
          [style.left.px]="impactPos.x"
          [style.top.px]="impactPos.y"
        >
          <div class="impact-flash-core"></div>
          <div class="resonance-ring ring-a"></div>
          <div class="resonance-ring ring-b"></div>
          <div class="resonance-ring ring-c"></div>

          @if (hasPanic) {
            <div class="panic-burst-badge">
              <span class="badge-text">HOẢNG LOẠN!</span>
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

    .truong-kiet-vfx-container {
      position: absolute;
      inset: 0;
      overflow: hidden;
    }

    .sonic-charge-rings {
      position: absolute;
      transform: translate(-50%, -50%);
      width: 90px;
      height: 90px;

      .ring-charge {
        position: absolute;
        inset: 0;
        border: 3px solid #ff007f;
        border-radius: 50%;
        box-shadow: 0 0 16px #ff007f, 0 0 24px #9900ff;

        &.ring-1 {
          animation: ring-converge calc(0.35s / var(--speed, 1)) ease-in forwards;
        }
        &.ring-2 {
          animation: ring-converge calc(0.35s / var(--speed, 1)) 0.1s ease-in forwards;
        }
      }
    }

    .sonic-seal-projectile {
      position: absolute;
      transform: translate(-50%, -50%);
      width: 64px;
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: center;
      filter: drop-shadow(0 0 16px rgba(255, 0, 127, 0.9));

      .seal-image {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }

      .seal-fallback {
        width: 48px;
        height: 48px;
        position: relative;

        .seal-arc {
          position: absolute;
          width: 40px;
          height: 18px;
          border: 3px solid #ff007f;
          border-radius: 50%;

          &.seal-arc-top {
            top: 2px;
            left: 4px;
            border-bottom-color: transparent;
            box-shadow: 0 -2px 10px #ff007f;
          }
          &.seal-arc-bottom {
            bottom: 2px;
            left: 4px;
            border-top-color: transparent;
            box-shadow: 0 2px 10px #8b00ff;
          }
        }

        .seal-core {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 14px;
          height: 14px;
          background: #ffffff;
          border-radius: 50%;
          box-shadow: 0 0 12px #ff007f;
        }
      }

      .sonic-trail {
        position: absolute;
        width: 70px;
        height: 4px;
        background: linear-gradient(90deg, transparent, #ff007f);
        border-radius: 2px;

        &.trail-1 {
          transform: rotate(20deg);
        }
        &.trail-2 {
          transform: rotate(-20deg);
        }
      }
    }

    .sonic-impact-burst {
      position: absolute;
      transform: translate(-50%, -50%);
      width: 120px;
      height: 120px;
      display: flex;
      align-items: center;
      justify-content: center;

      .impact-flash-core {
        position: absolute;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: radial-gradient(circle, #ffffff 10%, #ff007f 60%, transparent 100%);
        animation: flash-bloom calc(0.35s / var(--speed, 1)) ease-out forwards;
      }

      .resonance-ring {
        position: absolute;
        border: 3px solid #ff007f;
        border-radius: 50%;
        box-shadow: 0 0 16px #ff007f;

        &.ring-a {
          animation: ring-expand calc(0.4s / var(--speed, 1)) ease-out forwards;
        }
        &.ring-b {
          animation: ring-expand calc(0.55s / var(--speed, 1)) 0.08s ease-out forwards;
        }
        &.ring-c {
          animation: ring-expand calc(0.7s / var(--speed, 1)) 0.16s ease-out forwards;
        }
      }

      .panic-burst-badge {
        position: absolute;
        top: -38px;
        background: linear-gradient(90deg, #4a004e, #8b008b);
        border: 1.5px solid #ff007f;
        border-radius: 4px;
        padding: 2px 8px;
        box-shadow: 0 0 12px rgba(255, 0, 127, 0.8);
        animation: badge-bounce calc(0.65s / var(--speed, 1)) ease-out forwards;

        .badge-text {
          font-size: 11px;
          font-weight: 800;
          color: #fff;
          letter-spacing: 0.5px;
        }
      }
    }

    @keyframes ring-converge {
      0% { transform: scale(1.6); opacity: 0; }
      50% { opacity: 0.9; }
      100% { transform: scale(0.3); opacity: 0; }
    }

    @keyframes flash-bloom {
      0% { transform: scale(0.2); opacity: 1; }
      100% { transform: scale(1.5); opacity: 0; }
    }

    @keyframes ring-expand {
      0% { width: 20px; height: 20px; opacity: 1; }
      100% { width: 140px; height: 140px; opacity: 0; }
    }

    @keyframes badge-bounce {
      0% { transform: translateY(12px) scale(0.7); opacity: 0; }
      40% { transform: translateY(-4px) scale(1.1); opacity: 1; }
      80% { transform: translateY(0) scale(1); opacity: 1; }
      100% { transform: translateY(-10px); opacity: 0; }
    }
  `]
})
export class TruongKietSceneVfxComponent implements OnInit, OnChanges, OnDestroy {
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

  readonly sealAssetUrl = '/assets/images/dcs-game/skills/truong-kiet-chu-mo/resonance-kiss-seal.png';
  assetFailed = false;

  phase: 'idle' | 'charge' | 'travel' | 'impact' = 'idle';
  actorPos = { x: 0, y: 0 };
  impactPos = { x: 0, y: 0 };
  projPos = { x: 0, y: 0 };
  hasPanic = false;

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

    let targetX = this.actorTeamRight ? w * 0.25 : w * 0.75;
    let targetY = h * 0.5;
    const targetId = this.activeTargetIds[0];
    if (targetId != null) {
      const targetEl = document.querySelector(`[data-combatant-id="${targetId}"]`);
      if (targetEl) {
        const r = targetEl.getBoundingClientRect();
        targetX = r.left + r.width * 0.5 - hostRect.left;
        targetY = r.top + r.height * 0.5 - hostRect.top;
      }
    }
    this.impactPos = { x: targetX, y: targetY };
    this.projPos = { x: actorX, y: actorY };

    this.hasPanic = this.castEvents.some(e =>
      e.eventType === 'STATUS_APPLIED' && (e.effectTypeCode === 'PANIC' || e.skillId?.includes('TRUONG_KIET'))
    );

    const speed = Math.max(1, this.visualSpeed);
    const chargeDuration = Math.round(350 / speed);
    const travelDuration = Math.round(400 / speed);
    const impactDuration = Math.round(750 / speed);

    // Phase 1: Charge
    this.phase = 'charge';
    this.cdr.markForCheck();

    const t1 = setTimeout(() => {
      // Phase 2: Travel
      this.phase = 'travel';
      this.projPos = { x: (actorX + targetX) * 0.5, y: (actorY + targetY) * 0.5 - 20 };
      this.cdr.markForCheck();
    }, chargeDuration);
    this.timeouts.push(t1);

    const t2 = setTimeout(() => {
      // Phase 3: Impact
      this.phase = 'impact';
      this.cdr.markForCheck();
    }, chargeDuration + travelDuration);
    this.timeouts.push(t2);

    const t3 = setTimeout(() => {
      // Phase 4: Dissipation
      this.phase = 'idle';
      this.cdr.markForCheck();
    }, chargeDuration + travelDuration + impactDuration);
    this.timeouts.push(t3);
  }
}
