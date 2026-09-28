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
  selector: 'app-tuong-long-scene-vfx',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="tuong-long-vfx-container"
      [class.caster-right]="actorTeamRight"
      [class.caster-left]="!actorTeamRight"
      [style.--speed]="visualSpeed"
    >
      <!-- Bronze School Bell at Caster -->
      @if (phase === 'lift' || phase === 'strike' || phase === 'chime') {
        <div
          class="school-bell-anchor"
          [class.is-striking]="phase === 'strike'"
          [style.left.px]="actorPos.x"
          [style.top.px]="actorPos.y"
        >
          <img
            [src]="bellAssetUrl"
            alt="School Bell"
            class="bell-image"
            (error)="onAssetError()"
          />
          @if (assetFailed) {
            <div class="bell-fallback"></div>
          }
          <div class="bell-strike-glow"></div>
        </div>
      }

      <!-- 3 Concentric Soundwave Rings Rippling Across Ally Field -->
      @if (phase === 'chime' || phase === 'heal') {
        <div
          class="soundwave-rings-anchor"
          [style.left.px]="actorPos.x"
          [style.top.px]="actorPos.y"
        >
          <div class="sound-ring ring-bronze ring-1"></div>
          <div class="sound-ring ring-emerald ring-2"></div>
          <div class="sound-ring ring-gold ring-3"></div>
        </div>
      }

      <!-- Healing Emerald Sparkles & SPD Wind on Allies -->
      @if (phase === 'heal') {
        <div class="ally-heals-container">
          @for (ally of allyPositions; track $index) {
            <div
              class="ally-heal-sparkle"
              [style.left.px]="ally.x"
              [style.top.px]="ally.y"
            >
              <div class="heal-glow"></div>
              <div class="heal-sparkle s1">✦</div>
              <div class="heal-sparkle s2">✦</div>
              <div class="spd-buff-badge">TĂNG TỐC +10%</div>
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

    .tuong-long-vfx-container {
      position: absolute;
      inset: 0;
      overflow: hidden;
    }

    .school-bell-anchor {
      position: absolute;
      transform: translate(-50%, -50%);
      width: 65px;
      height: 65px;
      pointer-events: none;
      animation: bell-lift calc(0.35s / var(--speed, 1)) ease-out forwards;

      &.is-striking {
        animation: bell-chime calc(0.25s / var(--speed, 1)) infinite alternate ease-in-out;
      }
    }

    .bell-image {
      width: 100%;
      height: 100%;
      object-fit: contain;
      filter: drop-shadow(0 0 14px rgba(217, 119, 6, 0.8));
    }

    .bell-fallback {
      width: 48px;
      height: 48px;
      margin: 8px;
      border-radius: 50% 50% 10% 10%;
      background: radial-gradient(circle, #fde68a 30%, #d97706 70%, #15803d 100%);
      box-shadow: 0 0 16px #d97706;
    }

    .bell-strike-glow {
      position: absolute;
      inset: -10px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(253, 230, 138, 0.5) 0%, transparent 70%);
      animation: strike-glow calc(0.4s / var(--speed, 1)) ease-out forwards;
    }

    .soundwave-rings-anchor {
      position: absolute;
      transform: translate(-50%, -50%);
      width: 100px;
      height: 100px;
      pointer-events: none;
    }

    .sound-ring {
      position: absolute;
      inset: 0;
      border-radius: 50%;
      border: 3px solid transparent;

      &.ring-bronze {
        border-color: #d97706;
        animation: ring-ripple calc(0.7s / var(--speed, 1)) ease-out forwards;
      }
      &.ring-emerald {
        border-color: #22c55e;
        animation: ring-ripple calc(0.8s / var(--speed, 1)) calc(0.12s / var(--speed, 1)) ease-out forwards;
      }
      &.ring-gold {
        border-color: #fde68a;
        animation: ring-ripple calc(0.9s / var(--speed, 1)) calc(0.24s / var(--speed, 1)) ease-out forwards;
      }
    }

    .ally-heals-container {
      position: absolute;
      inset: 0;
    }

    .ally-heal-sparkle {
      position: absolute;
      transform: translate(-50%, -50%);
      width: 70px;
      height: 80px;
      pointer-events: none;
    }

    .heal-glow {
      position: absolute;
      inset: 10px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(34, 197, 94, 0.4) 0%, transparent 70%);
      box-shadow: 0 0 18px rgba(34, 197, 94, 0.7);
      animation: glow-pulse calc(0.5s / var(--speed, 1)) ease-out forwards;
    }

    .heal-sparkle {
      position: absolute;
      font-size: 16px;
      color: #86efac;
      text-shadow: 0 0 6px #22c55e;
      animation: sparkle-float calc(0.6s / var(--speed, 1)) ease-out forwards;

      &.s1 { top: 10px; left: 15px; }
      &.s2 { top: 25px; right: 15px; animation-delay: calc(0.1s / var(--speed, 1)); }
    }

    .spd-buff-badge {
      position: absolute;
      bottom: -22px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 11px;
      font-weight: 700;
      color: #ffffff;
      background: rgba(21, 128, 61, 0.9);
      border-radius: 8px;
      padding: 1px 7px;
      white-space: nowrap;
      box-shadow: 0 0 10px rgba(34, 197, 94, 0.6);
      animation: badge-pop calc(0.35s / var(--speed, 1)) ease-out forwards;
    }

    @keyframes bell-lift {
      0% { transform: translate(-50%, 20px) scale(0.5); opacity: 0; }
      100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
    }

    @keyframes bell-chime {
      from { transform: translate(-50%, -50%) rotate(-8deg); }
      to { transform: translate(-50%, -50%) rotate(8deg); }
    }

    @keyframes strike-glow {
      0% { transform: scale(0.3); opacity: 1; }
      100% { transform: scale(1.6); opacity: 0; }
    }

    @keyframes ring-ripple {
      0% { transform: scale(0.2); opacity: 1; }
      100% { transform: scale(3.5); opacity: 0; }
    }

    @keyframes glow-pulse {
      0% { transform: scale(0.4); opacity: 0; }
      50% { transform: scale(1.2); opacity: 1; }
      100% { transform: scale(1); opacity: 0.8; }
    }

    @keyframes sparkle-float {
      0% { transform: translateY(10px) scale(0.5); opacity: 0; }
      50% { opacity: 1; }
      100% { transform: translateY(-20px) scale(1.2); opacity: 0; }
    }

    @keyframes badge-pop {
      0% { transform: translateX(-50%) scale(0.6); opacity: 0; }
      100% { transform: translateX(-50%) scale(1); opacity: 1; }
    }
  `]
})
export class TuongLongSceneVfxComponent implements OnInit, OnChanges, OnDestroy {
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

  readonly bellAssetUrl = '/assets/images/dcs-game/skills/tuong-long-cap-3/school-bell.png';
  assetFailed = false;

  phase: 'idle' | 'lift' | 'strike' | 'chime' | 'heal' = 'idle';
  actorPos = { x: 0, y: 0 };
  allyPositions: Array<{ x: number; y: number }> = [];

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

    // Resolve ally positions (from HEAL events or ally field)
    const allyIds = this.castEvents
      .filter(e => e.eventType === 'HEAL')
      .map(e => e.targetId)
      .filter((id): id is number => id != null);

    this.allyPositions = [];
    if (allyIds.length > 0) {
      allyIds.forEach(id => {
        const el = document.querySelector(`[data-combatant-id="${id}"]`);
        if (el) {
          const r = el.getBoundingClientRect();
          this.allyPositions.push({
            x: r.left + r.width * 0.5 - hostRect.left,
            y: r.top + r.height * 0.5 - hostRect.top
          });
        }
      });
    }

    if (this.allyPositions.length === 0) {
      const allySideX = this.actorTeamRight ? w * 0.75 : w * 0.25;
      this.allyPositions = [
        { x: allySideX, y: h * 0.4 },
        { x: allySideX - 35, y: h * 0.6 },
        { x: allySideX + 35, y: h * 0.6 }
      ];
    }

    const speed = Math.max(1, this.visualSpeed);
    const liftDuration = Math.round(350 / speed);
    const strikeDuration = Math.round(250 / speed);
    const chimeDuration = Math.round(450 / speed);
    const healDuration = Math.round(450 / speed);
    const recoverDuration = Math.round(300 / speed);

    // Phase 1: Lift bell
    this.phase = 'lift';
    this.cdr.markForCheck();

    const t1 = setTimeout(() => {
      // Phase 2: Strike bell
      this.phase = 'strike';
      this.cdr.markForCheck();
    }, liftDuration);
    this.timeouts.push(t1);

    const t2 = setTimeout(() => {
      // Phase 3: Soundwave rings
      this.phase = 'chime';
      this.cdr.markForCheck();
    }, liftDuration + strikeDuration);
    this.timeouts.push(t2);

    const t3 = setTimeout(() => {
      // Phase 4: Heal & SPD buff on allies
      this.phase = 'heal';
      this.cdr.markForCheck();
    }, liftDuration + strikeDuration + chimeDuration);
    this.timeouts.push(t3);

    const t4 = setTimeout(() => {
      // Phase 5: Done
      this.phase = 'idle';
      this.cdr.markForCheck();
    }, liftDuration + strikeDuration + chimeDuration + healDuration + recoverDuration);
    this.timeouts.push(t4);
  }
}
