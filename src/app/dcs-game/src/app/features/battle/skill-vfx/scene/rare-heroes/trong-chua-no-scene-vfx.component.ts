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
  selector: 'app-trong-chua-no-scene-vfx',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="trong-chua-no-vfx-container"
      [class.caster-right]="actorTeamRight"
      [class.caster-left]="!actorTeamRight"
      [style.--speed]="visualSpeed"
    >
      <!-- Parabolic Thrown Timed Charge -->
      @if (phase === 'throw' || phase === 'armed') {
        <div
          class="timed-charge-prop"
          [class.is-armed]="phase === 'armed'"
          [style.left.px]="chargePos.x"
          [style.top.px]="chargePos.y"
        >
          <img
            [src]="chargeAssetUrl"
            alt="Timed Charge"
            class="charge-image"
            (error)="onAssetError()"
          />
          @if (assetFailed) {
            <div class="charge-fallback-orb"></div>
          }
          <!-- 3 Blinking Warning Indicators -->
          <div class="blinking-lights">
            <span class="light light-1"></span>
            <span class="light light-2"></span>
            <span class="light light-3"></span>
          </div>
        </div>
      }

      <!-- Detonation Phase: Cyan-Orange Shockwave & Blast -->
      @if (phase === 'detonate') {
        <div
          class="detonation-burst"
          [style.left.px]="impactPos.x"
          [style.top.px]="impactPos.y"
        >
          <div class="blast-core"></div>
          <div class="blast-ring cyan-ring"></div>
          <div class="blast-ring orange-ring"></div>
          <div class="blast-shockwave"></div>
          <div class="smoke-puff puff-1"></div>
          <div class="smoke-puff puff-2"></div>
          <div class="smoke-puff puff-3"></div>
          @if (hasPanic) {
            <div class="panic-banner">HOẢNG LOẠN</div>
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

    .trong-chua-no-vfx-container {
      position: absolute;
      inset: 0;
      overflow: hidden;
    }

    .timed-charge-prop {
      position: absolute;
      transform: translate(-50%, -50%);
      width: 52px;
      height: 52px;
      transition: transform 0.1s linear;

      &.is-armed {
        animation: charge-shake calc(0.2s / var(--speed, 1)) infinite ease-in-out;
      }
    }

    .charge-image {
      width: 100%;
      height: 100%;
      object-fit: contain;
      filter: drop-shadow(0 0 8px rgba(0, 240, 255, 0.7));
    }

    .charge-fallback-orb {
      width: 44px;
      height: 44px;
      margin: 4px;
      border-radius: 50%;
      background: radial-gradient(circle, #00f0ff 30%, #1e293b 80%);
      box-shadow: 0 0 14px #00f0ff;
    }

    .blinking-lights {
      position: absolute;
      bottom: 6px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 4px;

      .light {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #ff5500;
        box-shadow: 0 0 6px #ff5500;
        animation: blink calc(0.25s / var(--speed, 1)) infinite alternate;

        &.light-1 { animation-delay: 0s; }
        &.light-2 { animation-delay: calc(0.08s / var(--speed, 1)); }
        &.light-3 { animation-delay: calc(0.16s / var(--speed, 1)); }
      }
    }

    .detonation-burst {
      position: absolute;
      transform: translate(-50%, -50%);
      width: 160px;
      height: 160px;
      pointer-events: none;
    }

    .blast-core {
      position: absolute;
      inset: 20%;
      border-radius: 50%;
      background: radial-gradient(circle, #ffffff 20%, #00f0ff 60%, transparent 100%);
      box-shadow: 0 0 35px #00f0ff, 0 0 50px #ff6600;
      animation: blast-expand calc(0.45s / var(--speed, 1)) ease-out forwards;
    }

    .blast-ring {
      position: absolute;
      inset: 10%;
      border-radius: 50%;
      border: 3px solid transparent;

      &.cyan-ring {
        border-color: #00f0ff;
        animation: ring-expand calc(0.5s / var(--speed, 1)) ease-out forwards;
      }
      &.orange-ring {
        border-color: #ff6600;
        animation: ring-expand calc(0.6s / var(--speed, 1)) calc(0.05s / var(--speed, 1)) ease-out forwards;
      }
    }

    .blast-shockwave {
      position: absolute;
      inset: 0;
      border-radius: 50%;
      border: 2px dashed rgba(255, 255, 255, 0.8);
      animation: ring-expand calc(0.4s / var(--speed, 1)) ease-out forwards;
    }

    .smoke-puff {
      position: absolute;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgba(30, 41, 59, 0.55);
      filter: blur(4px);
      animation: smoke-fade calc(0.7s / var(--speed, 1)) ease-out forwards;

      &.puff-1 { top: 10%; left: 20%; }
      &.puff-2 { top: 20%; right: 15%; animation-delay: calc(0.1s / var(--speed, 1)); }
      &.puff-3 { bottom: 15%; left: 30%; animation-delay: calc(0.15s / var(--speed, 1)); }
    }

    .panic-banner {
      position: absolute;
      top: -35px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 13px;
      font-weight: 800;
      color: #ff3366;
      background: rgba(0, 0, 0, 0.75);
      border: 1px solid #ff3366;
      border-radius: 12px;
      padding: 2px 10px;
      letter-spacing: 1px;
      box-shadow: 0 0 12px #ff3366;
      animation: banner-float calc(0.6s / var(--speed, 1)) ease-out forwards;
    }

    @keyframes blink {
      from { opacity: 0.2; transform: scale(0.8); }
      to { opacity: 1; transform: scale(1.3); }
    }

    @keyframes charge-shake {
      0%, 100% { transform: translate(-50%, -50%) rotate(0deg); }
      25% { transform: translate(-52%, -48%) rotate(-4deg); }
      75% { transform: translate(-48%, -52%) rotate(4deg); }
    }

    @keyframes blast-expand {
      0% { transform: scale(0.2); opacity: 1; }
      50% { transform: scale(1.3); opacity: 0.9; }
      100% { transform: scale(1.6); opacity: 0; }
    }

    @keyframes ring-expand {
      0% { transform: scale(0.3); opacity: 1; }
      100% { transform: scale(2.2); opacity: 0; }
    }

    @keyframes smoke-fade {
      0% { transform: scale(0.5); opacity: 0.8; }
      100% { transform: scale(1.8) translateY(-25px); opacity: 0; }
    }

    @keyframes banner-float {
      0% { transform: translateX(-50%) translateY(10px); opacity: 0; }
      30% { transform: translateX(-50%) translateY(0); opacity: 1; }
      100% { transform: translateX(-50%) translateY(-15px); opacity: 0; }
    }
  `]
})
export class TrongChuaNoSceneVfxComponent implements OnInit, OnChanges, OnDestroy {
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

  readonly chargeAssetUrl = '/assets/images/dcs-game/skills/trong-chua-no/timed-charge.png';
  assetFailed = false;

  phase: 'idle' | 'throw' | 'armed' | 'detonate' = 'idle';
  chargePos = { x: 0, y: 0 };
  impactPos = { x: 0, y: 0 };
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

    // Resolve Target coordinates
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
    this.chargePos = { x: actorX, y: actorY };

    // Check if PANIC is in cast events
    this.hasPanic = this.castEvents.some(e =>
      e.eventType === 'STATUS_APPLIED' && (e.effectTypeCode === 'PANIC' || e.skillId?.includes('TRONG_CHUA_NO'))
    );

    const speed = Math.max(1, this.visualSpeed);
    const throwDuration = Math.round(350 / speed);
    const armedDuration = Math.round(500 / speed);
    const detonateDuration = Math.round(800 / speed);

    // Phase 1: Throw charge
    this.phase = 'throw';
    this.chargePos = { x: (actorX + targetX) * 0.5, y: Math.min(actorY, targetY) - 60 };
    this.cdr.markForCheck();

    const t1 = setTimeout(() => {
      // Phase 2: Land beside target & blink 3 beats
      this.phase = 'armed';
      this.chargePos = { x: targetX + (this.actorTeamRight ? 35 : -35), y: targetY + 25 };
      this.cdr.markForCheck();
    }, throwDuration);
    this.timeouts.push(t1);

    const t2 = setTimeout(() => {
      // Phase 3: Detonate with cyan-orange shockwave
      this.phase = 'detonate';
      this.cdr.markForCheck();
    }, throwDuration + armedDuration);
    this.timeouts.push(t2);

    const t3 = setTimeout(() => {
      // Phase 4: Done
      this.phase = 'idle';
      this.cdr.markForCheck();
    }, throwDuration + armedDuration + detonateDuration);
    this.timeouts.push(t3);
  }
}
