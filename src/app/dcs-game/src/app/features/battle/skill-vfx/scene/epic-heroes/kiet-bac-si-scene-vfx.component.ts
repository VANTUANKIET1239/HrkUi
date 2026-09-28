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
  selector: 'app-kiet-bac-si-scene-vfx',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="kiet-bac-si-vfx-container"
      [class.caster-right]="actorTeamRight"
      [class.caster-left]="!actorTeamRight"
      [style.--speed]="visualSpeed"
    >
      <!-- Phase 1 & 2: Floating Vital Scan Orb above caster -->
      @if (phase === 'scan' || phase === 'pulse') {
        <div
          class="vital-orb-prop"
          [style.left.px]="actorPos.x"
          [style.top.px]="actorPos.y - 70"
        >
          <img
            [src]="vitalOrbAssetUrl"
            alt="Vital Scan Orb"
            class="orb-image"
            (error)="onAssetError()"
          />
          @if (assetFailed) {
            <div class="vital-orb-fallback">
              <div class="orb-core"></div>
              <div class="orb-ecg-ring"></div>
            </div>
          }
          <div class="orb-diagnostic-pulse"></div>
        </div>
      }

      <!-- Phase 1: Team-wide Medical Scan Sweep -->
      @if (phase === 'scan') {
        <div
          class="medical-scan-beam"
          [style.left.px]="actorPos.x"
          [style.top.px]="actorPos.y"
        ></div>
      }

      <!-- Phase 2: ECG Pulse Beam Lines Connecting Caster to Allies -->
      @if (phase === 'pulse' || phase === 'heal') {
        <svg class="ecg-beams-svg">
          @for (target of targetPositions; track target.id) {
            <line
              [attr.x1]="actorPos.x"
              [attr.y1]="actorPos.y - 40"
              [attr.x2]="target.x"
              [attr.y2]="target.y"
              class="pulse-beam-line"
            />
          }
        </svg>
      }

      <!-- Phase 3: Healing Waves & Resistance Buffs at Ally Targets -->
      @if (phase === 'heal') {
        @for (target of targetPositions; track target.id) {
          <div
            class="ally-heal-burst"
            [style.left.px]="target.x"
            [style.top.px]="target.y"
          >
            <div class="heal-ring-core"></div>
            <div class="heal-pulse-circle"></div>
            <div class="vital-sparkles"></div>
            <div class="resistance-buff-badge">
              <span class="badge-text">KHÁNG +15%</span>
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

    .kiet-bac-si-vfx-container {
      position: absolute;
      inset: 0;
      overflow: hidden;
    }

    .vital-orb-prop {
      position: absolute;
      transform: translate(-50%, -50%);
      width: 58px;
      height: 58px;
      display: flex;
      align-items: center;
      justify-content: center;
      filter: drop-shadow(0 0 14px rgba(0, 240, 255, 0.85));
      animation: orb-hover calc(1.5s / var(--speed, 1)) infinite ease-in-out;

      .orb-image {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }

      .vital-orb-fallback {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background: radial-gradient(circle, #ffffff, #00f0ff 60%, #0088cc 100%);
        border: 2px solid #e0f7fa;
        position: relative;
        box-shadow: 0 0 16px #00f0ff;

        .orb-ecg-ring {
          position: absolute;
          inset: -4px;
          border: 2px dashed #00f0ff;
          border-radius: 50%;
          animation: spin calc(2s / var(--speed, 1)) linear infinite;
        }
      }

      .orb-diagnostic-pulse {
        position: absolute;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        border: 2px solid #00f0ff;
        animation: pulse-out calc(0.8s / var(--speed, 1)) infinite ease-out;
      }
    }

    .medical-scan-beam {
      position: absolute;
      transform: translateY(-50%);
      width: 320px;
      height: 220px;
      background: linear-gradient(
        90deg,
        rgba(0, 240, 255, 0.45) 0%,
        rgba(0, 240, 255, 0.05) 80%,
        transparent 100%
      );
      clip-path: polygon(0 40%, 100% 0, 100% 100%, 0 60%);
      animation: scan-sweep calc(0.45s / var(--speed, 1)) ease-out forwards;
    }

    .caster-right .medical-scan-beam {
      transform: translateY(-50%) scaleX(-1);
    }

    .ecg-beams-svg {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;

      .pulse-beam-line {
        stroke: #00f0ff;
        stroke-width: 3.5;
        stroke-dasharray: 8 4;
        filter: drop-shadow(0 0 8px #00f0ff);
        animation: ecg-dash calc(0.5s / var(--speed, 1)) linear infinite;
      }
    }

    .ally-heal-burst {
      position: absolute;
      transform: translate(-50%, -50%);
      width: 80px;
      height: 80px;
      display: flex;
      align-items: center;
      justify-content: center;

      .heal-ring-core {
        position: absolute;
        width: 70px;
        height: 70px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(0, 240, 255, 0.5) 0%, rgba(0, 240, 255, 0) 70%);
        animation: heal-bloom calc(0.5s / var(--speed, 1)) ease-out forwards;
      }

      .heal-pulse-circle {
        position: absolute;
        width: 85px;
        height: 85px;
        border: 2px solid #00f0ff;
        border-radius: 50%;
        animation: pulse-out calc(0.6s / var(--speed, 1)) ease-out forwards;
      }

      .resistance-buff-badge {
        position: absolute;
        top: -30px;
        white-space: nowrap;
        background: rgba(0, 30, 50, 0.85);
        border: 1px solid #00f0ff;
        border-radius: 4px;
        padding: 2px 6px;
        box-shadow: 0 0 10px rgba(0, 240, 255, 0.6);
        animation: badge-float calc(0.65s / var(--speed, 1)) ease-out forwards;

        .badge-text {
          font-size: 11px;
          font-weight: 700;
          color: #e0f7fa;
          letter-spacing: 0.5px;
        }
      }
    }

    @keyframes orb-hover {
      0%, 100% { transform: translate(-50%, -50%) translateY(0); }
      50% { transform: translate(-50%, -50%) translateY(-8px); }
    }

    @keyframes pulse-out {
      0% { transform: scale(0.6); opacity: 0.9; }
      100% { transform: scale(1.6); opacity: 0; }
    }

    @keyframes scan-sweep {
      0% { opacity: 0; transform: translateY(-50%) scaleX(0.2); }
      50% { opacity: 0.9; transform: translateY(-50%) scaleX(1); }
      100% { opacity: 0; transform: translateY(-50%) scaleX(1.3); }
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    @keyframes ecg-dash {
      to { stroke-dashoffset: -24; }
    }

    @keyframes heal-bloom {
      0% { transform: scale(0.3); opacity: 0.2; }
      50% { transform: scale(1.1); opacity: 1; }
      100% { transform: scale(1.3); opacity: 0; }
    }

    @keyframes badge-float {
      0% { transform: translateY(10px); opacity: 0; }
      30% { transform: translateY(0); opacity: 1; }
      80% { transform: translateY(-5px); opacity: 1; }
      100% { transform: translateY(-12px); opacity: 0; }
    }
  `]
})
export class KietBacSiSceneVfxComponent implements OnInit, OnChanges, OnDestroy {
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

  readonly vitalOrbAssetUrl = '/assets/images/dcs-game/skills/kiet-bac-si/vital-scan-orb.png';
  assetFailed = false;

  phase: 'idle' | 'scan' | 'pulse' | 'heal' = 'idle';
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

    // Resolve Target coordinates for all active targets (allies)
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
      // Fallback ally positions
      const allySideX = this.actorTeamRight ? w * 0.75 : w * 0.25;
      targets.push(
        { id: 1, x: allySideX - 30, y: h * 0.35 },
        { id: 2, x: allySideX + 30, y: h * 0.65 },
        { id: 3, x: allySideX, y: h * 0.5 }
      );
    }
    this.targetPositions = targets;

    const speed = Math.max(1, this.visualSpeed);
    const scanDuration = Math.round(450 / speed);
    const pulseDuration = Math.round(500 / speed);
    const healDuration = Math.round(650 / speed);

    // Phase 1: Team scan
    this.phase = 'scan';
    this.cdr.markForCheck();

    const t1 = setTimeout(() => {
      // Phase 2: Pulse lines
      this.phase = 'pulse';
      this.cdr.markForCheck();
    }, scanDuration);
    this.timeouts.push(t1);

    const t2 = setTimeout(() => {
      // Phase 3: Simultaneous heal & Resistance buff
      this.phase = 'heal';
      this.cdr.markForCheck();
    }, scanDuration + pulseDuration);
    this.timeouts.push(t2);

    const t3 = setTimeout(() => {
      // Phase 4: Dissipation
      this.phase = 'idle';
      this.cdr.markForCheck();
    }, scanDuration + pulseDuration + healDuration);
    this.timeouts.push(t3);
  }
}
