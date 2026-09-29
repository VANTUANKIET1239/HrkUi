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
import { BattleEventDto } from '../../../../../../core/models/battle.model';

export type QuocNhanRunPhase =
  | 'idle'
  | 'raise_candle'  // Screen darkens slightly, caster raises candle, flame turns crimson with smoke apparition
  | 'wave_sweep'    // Crimson pulse wave sweeps toward enemy front row (or fallback)
  | 'stamp_mark'    // Red wax marks stamped at targets' feet with thin black smoke
  | 'dissipate';

export interface WaxTargetNode {
  id: number;
  x: number;
  y: number;
}

@Component({
  selector: 'app-quoc-nhan-run-now-scene-vfx',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quoc-nhan-run-now-scene-vfx.component.html',
  styleUrl: './quoc-nhan-run-now-scene-vfx.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QuocNhanRunNowSceneVfxComponent implements OnInit, OnChanges, OnDestroy {
  @Input() skillId?: string | null = null;
  @Input() actorActive = false;
  @Input() impactActive = false;
  @Input() actorTeamRight = false;
  @Input() visualSpeed = 1;
  @Input() isEmpowered = false;
  @Input() empowered = false;
  @Input() targetCount = 0;
  @Input() castSequence?: number | null = null;
  @Input() actorId?: number | null = null;
  @Input() activeTargetIds: number[] = [];
  @Input() castEvents: BattleEventDto[] = [];

  readonly candleAsset = '/assets/images/dcs-game/skill-vfx/quoc-nhan-run-now/red-candle.png';
  readonly waxMarkAsset = '/assets/images/dcs-game/skill-vfx/quoc-nhan-run-now/red-wax-mark.png';

  phase: QuocNhanRunPhase = 'idle';
  actorPos = { x: 0, y: 0 };
  targets: WaxTargetNode[] = [];
  assetFailed = false;

  private timeouts: ReturnType<typeof setTimeout>[] = [];
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

    // Resolve target IDs (front row enemies with fallback)
    let tIds = this.activeTargetIds;
    if (tIds.length === 0) {
      for (const ev of this.castEvents) {
        if (ev.eventType === 'STATUS_APPLIED' && ev.effectTypeCode === 'CHAY_NGAY_DI' && ev.targetId) {
          if (!tIds.includes(ev.targetId)) tIds.push(ev.targetId);
        }
      }
    }
    if (tIds.length === 0) tIds = [99];

    this.targets = tIds.map(id => {
      let tx = this.actorTeamRight ? w * 0.25 : w * 0.75;
      let ty = h * 0.5;
      const el = document.querySelector(`[data-combatant-id="${id}"]`);
      if (el) {
        const r = el.getBoundingClientRect();
        tx = r.left + r.width * 0.5 - hostRect.left;
        ty = r.top + r.height * 0.5 - hostRect.top;
      }
      return { id, x: tx, y: ty };
    });

    const speed = Math.max(1, this.visualSpeed);
    const tRaise = Math.round(350 / speed);
    const tWave = Math.round(400 / speed);
    const tStamp = Math.round(800 / speed);
    const tDissipate = Math.round(350 / speed);

    // 0ms: Raise Candle
    this.phase = 'raise_candle';
    this.cdr.markForCheck();

    // 350ms: Wave Sweep
    this.timeouts.push(setTimeout(() => {
      this.phase = 'wave_sweep';
      this.cdr.markForCheck();
    }, tRaise));

    // 750ms: Stamp Mark at Targets' feet
    this.timeouts.push(setTimeout(() => {
      this.phase = 'stamp_mark';
      this.cdr.markForCheck();
    }, tRaise + tWave));

    // 1550ms: Dissipate
    this.timeouts.push(setTimeout(() => {
      this.phase = 'dissipate';
      this.cdr.markForCheck();
    }, tRaise + tWave + tStamp));

    // 1900ms: Idle
    this.timeouts.push(setTimeout(() => {
      this.phase = 'idle';
      this.cdr.markForCheck();
    }, tRaise + tWave + tStamp + tDissipate));
  }
}
