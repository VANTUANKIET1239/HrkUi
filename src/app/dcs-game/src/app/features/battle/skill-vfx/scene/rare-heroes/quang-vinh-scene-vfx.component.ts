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
  selector: 'app-quang-vinh-scene-vfx',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="quang-vinh-vfx-container"
      [class.caster-right]="actorTeamRight"
      [class.caster-left]="!actorTeamRight"
      [style.--speed]="visualSpeed"
    >
      <!-- Central Guardian Emblem Stamp at Caster -->
      @if (phase === 'slam' || phase === 'wave') {
        <div
          class="shield-slam-anchor"
          [style.left.px]="actorPos.x"
          [style.top.px]="actorPos.y"
        >
          <img
            [src]="barrierAssetUrl"
            alt="School Barrier"
            class="shield-slam-icon"
            (error)="onAssetError()"
          />
          @if (assetFailed) {
            <div class="shield-slam-fallback"></div>
          }
          <div class="slam-ground-crack"></div>
        </div>
      }

      <!-- Brick-Red & Cream Shockwave Traveling Towards Enemies -->
      @if (phase === 'wave') {
        <div
          class="honor-shockwave"
          [style.left.px]="wavePos.x"
          [style.top.px]="wavePos.y"
        >
          <div class="wave-crest brick-crest"></div>
          <div class="wave-crest cream-crest"></div>
          <div class="wave-dust"></div>
        </div>
      }

      <!-- Protective Barrier Hexagons Over Allies -->
      @if (phase === 'barrier') {
        <div class="ally-shields-container">
          @for (pos of allyPositions; track $index) {
            <div
              class="ally-barrier-crest"
              [style.left.px]="pos.x"
              [style.top.px]="pos.y"
            >
              <div class="barrier-aura"></div>
              <div class="barrier-shards">
                <span class="shard s1"></span>
                <span class="shard s2"></span>
                <span class="shard s3"></span>
                <span class="shard s4"></span>
              </div>
              <div class="shield-text">KHIÊN DANH DỰ</div>
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

    .quang-vinh-vfx-container {
      position: absolute;
      inset: 0;
      overflow: hidden;
      --facing: 1;

      &.caster-right {
        --facing: -1;
      }
    }

    .shield-slam-anchor {
      position: absolute;
      transform: translate(-50%, -50%);
      width: 72px;
      height: 72px;
      animation: slam-impact calc(0.35s / var(--speed, 1)) cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
    }

    .shield-slam-icon {
      width: 100%;
      height: 100%;
      object-fit: contain;
      filter: drop-shadow(0 0 12px rgba(204, 51, 34, 0.8));
    }

    .shield-slam-fallback {
      width: 58px;
      height: 58px;
      margin: 7px;
      border-radius: 50%;
      background: radial-gradient(circle, #ffeedd 30%, #cc3322 80%);
      border: 3px solid #ffeedd;
      box-shadow: 0 0 16px #cc3322;
    }

    .slam-ground-crack {
      position: absolute;
      bottom: -15px;
      left: 50%;
      transform: translateX(-50%);
      width: 90px;
      height: 12px;
      border-radius: 50%;
      background: radial-gradient(ellipse, #cc3322 20%, #ffeedd 60%, transparent 100%);
      box-shadow: 0 0 20px #cc3322;
      animation: crack-expand calc(0.4s / var(--speed, 1)) ease-out forwards;
    }

    .honor-shockwave {
      position: absolute;
      transform: translate(-50%, -50%);
      width: 140px;
      height: 220px;
      pointer-events: none;
      animation: wave-travel calc(0.55s / var(--speed, 1)) ease-out forwards;
    }

    .wave-crest {
      position: absolute;
      inset: 0;
      border-radius: 50%;
      border-right: 8px solid transparent;

      &.brick-crest {
        border-color: #cc3322;
        box-shadow: 0 0 22px #cc3322;
      }
      &.cream-crest {
        inset: 15px;
        border-color: #ffeedd;
        box-shadow: 0 0 14px #ffeedd;
      }
    }

    .wave-dust {
      position: absolute;
      bottom: 0;
      width: 100%;
      height: 35px;
      background: linear-gradient(to top, rgba(204, 51, 34, 0.4), transparent);
    }

    .ally-shields-container {
      position: absolute;
      inset: 0;
    }

    .ally-barrier-crest {
      position: absolute;
      transform: translate(-50%, -50%);
      width: 80px;
      height: 100px;
      pointer-events: none;
    }

    .barrier-aura {
      position: absolute;
      inset: 0;
      border-radius: 40px;
      background: radial-gradient(ellipse at center, rgba(255, 238, 221, 0.25) 0%, rgba(204, 51, 34, 0.2) 60%, transparent 100%);
      border: 2px solid #ffeedd;
      box-shadow: 0 0 16px rgba(255, 238, 221, 0.7), inset 0 0 12px rgba(204, 51, 34, 0.4);
      animation: barrier-glow calc(0.5s / var(--speed, 1)) ease-out forwards;
    }

    .barrier-shards {
      position: absolute;
      inset: -5px;

      .shard {
        position: absolute;
        width: 10px;
        height: 10px;
        background: #ffeedd;
        border: 1px solid #cc3322;
        transform: rotate(45deg);
        box-shadow: 0 0 8px #ffeedd;
        animation: shard-float calc(0.6s / var(--speed, 1)) ease-out forwards;

        &.s1 { top: 0; left: 15%; }
        &.s2 { top: 0; right: 15%; }
        &.s3 { bottom: 10px; left: 15%; }
        &.s4 { bottom: 10px; right: 15%; }
      }
    }

    .shield-text {
      position: absolute;
      bottom: -22px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 11px;
      font-weight: 700;
      color: #ffeedd;
      background: rgba(204, 51, 34, 0.85);
      border-radius: 8px;
      padding: 1px 6px;
      white-space: nowrap;
      box-shadow: 0 0 10px #cc3322;
      animation: banner-pop calc(0.45s / var(--speed, 1)) ease-out forwards;
    }

    @keyframes slam-impact {
      0% { transform: translate(-50%, -90px) scale(0.6); opacity: 0; }
      70% { transform: translate(-50%, -50%) scale(1.15); opacity: 1; }
      100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
    }

    @keyframes crack-expand {
      0% { width: 10px; opacity: 0; }
      100% { width: 100px; opacity: 1; }
    }

    @keyframes wave-travel {
      0% { transform: translate(-50%, -50%) scale(0.4); opacity: 1; }
      100% { transform: translate(calc(120px * var(--facing)), -50%) scale(1.6); opacity: 0; }
    }

    @keyframes barrier-glow {
      0% { transform: scale(0.5); opacity: 0; }
      60% { transform: scale(1.1); opacity: 1; }
      100% { transform: scale(1); opacity: 0.9; }
    }

    @keyframes shard-float {
      0% { transform: scale(0.2) rotate(0deg); opacity: 0; }
      100% { transform: scale(1) rotate(45deg); opacity: 1; }
    }

    @keyframes banner-pop {
      0% { transform: translateX(-50%) scale(0.6); opacity: 0; }
      100% { transform: translateX(-50%) scale(1); opacity: 1; }
    }
  `]
})
export class QuangVinhSceneVfxComponent implements OnInit, OnChanges, OnDestroy {
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

  readonly barrierAssetUrl = '/assets/images/dcs-game/skills/quang-vinh-thcs/school-barrier.png';
  assetFailed = false;

  phase: 'idle' | 'slam' | 'wave' | 'barrier' = 'idle';
  actorPos = { x: 0, y: 0 };
  wavePos = { x: 0, y: 0 };
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

    // Resolve wave position towards enemy side
    const enemyX = this.actorTeamRight ? w * 0.35 : w * 0.65;
    this.wavePos = { x: (actorX + enemyX) * 0.5, y: h * 0.5 };

    // Resolve ally positions (from SHIELD_APPLIED events or ally field)
    const allyIds = this.castEvents
      .filter(e => e.eventType === 'SHIELD_APPLIED')
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
      // Default to ally team side clusters
      const allySideX = this.actorTeamRight ? w * 0.75 : w * 0.25;
      this.allyPositions = [
        { x: allySideX, y: h * 0.4 },
        { x: allySideX - 40, y: h * 0.6 },
        { x: allySideX + 40, y: h * 0.6 }
      ];
    }

    const speed = Math.max(1, this.visualSpeed);
    const slamDuration = Math.round(400 / speed);
    const waveDuration = Math.round(450 / speed);
    const barrierDuration = Math.round(550 / speed);
    const recoverDuration = Math.round(400 / speed);

    // Phase 1: Slam shield into ground
    this.phase = 'slam';
    this.cdr.markForCheck();

    const t1 = setTimeout(() => {
      // Phase 2: Shockwave travels
      this.phase = 'wave';
      this.cdr.markForCheck();
    }, slamDuration);
    this.timeouts.push(t1);

    const t2 = setTimeout(() => {
      // Phase 3: Barrier manifests over allies
      this.phase = 'barrier';
      this.cdr.markForCheck();
    }, slamDuration + waveDuration);
    this.timeouts.push(t2);

    const t3 = setTimeout(() => {
      // Phase 4: Done
      this.phase = 'idle';
      this.cdr.markForCheck();
    }, slamDuration + waveDuration + barrierDuration + recoverDuration);
    this.timeouts.push(t3);
  }
}
