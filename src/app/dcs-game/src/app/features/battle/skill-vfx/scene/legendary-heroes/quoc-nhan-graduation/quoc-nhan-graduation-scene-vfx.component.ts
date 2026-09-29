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

export type QuocNhanGradPhase =
  | 'idle'
  | 'podiums'      // 3 thesis manuscripts appear, pages flipping
  | 'pen_lock'     // Red pen marks lock onto targets
  | 'debate_stamp' // Massive Debate Committee Seal stamps down
  | 'thesis_burst' // Luận Điểm drawn in, individual explosions
  | 'silence_seal' // Mystic purple-red silence seal locks on silenced targets
  | 'dissipate';

export interface QuocNhanTargetVfxNode {
  id: number;
  x: number;
  y: number;
  luanDiemStacks: number;
  isSilenced: boolean;
}

@Component({
  selector: 'app-quoc-nhan-graduation-scene-vfx',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quoc-nhan-graduation-scene-vfx.component.html',
  styleUrl: './quoc-nhan-graduation-scene-vfx.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QuocNhanGraduationSceneVfxComponent implements OnInit, OnChanges, OnDestroy {
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

  phase: QuocNhanGradPhase = 'idle';
  actorPos = { x: 0, y: 0 };
  targets: QuocNhanTargetVfxNode[] = [];

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

    // Resolve up to 3 targets from activeTargetIds
    const tIds = this.activeTargetIds.slice(0, 3);
    if (tIds.length === 0) tIds.push(99);

    this.targets = tIds.map(id => {
      let tx = this.actorTeamRight ? w * 0.25 : w * 0.75;
      let ty = h * 0.5;
      const el = document.querySelector(`[data-combatant-id="${id}"]`);
      if (el) {
        const r = el.getBoundingClientRect();
        tx = r.left + r.width * 0.5 - hostRect.left;
        ty = r.top + r.height * 0.5 - hostRect.top;
      }

      // Check events for stacks and silence on this specific target
      let stacks = 0;
      let silenced = false;
      for (const ev of this.castEvents) {
        if (ev.targetId === id) {
          if (ev.eventType === 'STATUS_REMOVED' && ev.effectTypeCode === 'LUAN_DIEM') {
            stacks = ev.previousStacks ?? 3;
          }
          if (ev.eventType === 'STATUS_APPLIED' && ev.effectTypeCode === 'SILENCE') {
            silenced = true;
          }
        }
      }
      if (stacks === 0 && this.isEmpowered) stacks = 3;

      return {
        id,
        x: tx,
        y: ty,
        luanDiemStacks: stacks,
        isSilenced: silenced
      };
    });

    const speed = Math.max(1, this.visualSpeed);
    const tPodiums = Math.round(350 / speed);
    const tPenLock = Math.round(300 / speed);
    const tStamp = Math.round(400 / speed);
    const tBurst = Math.round(500 / speed);
    const tSilence = Math.round(600 / speed);
    const tDissipate = Math.round(300 / speed);

    // 0ms: Podiums appear
    this.phase = 'podiums';
    this.cdr.markForCheck();

    // Pen lock
    this.timeouts.push(setTimeout(() => {
      this.phase = 'pen_lock';
      this.cdr.markForCheck();
    }, tPodiums));

    // Debate Stamp
    this.timeouts.push(setTimeout(() => {
      this.phase = 'debate_stamp';
      this.cdr.markForCheck();
    }, tPodiums + tPenLock));

    // Thesis Burst
    this.timeouts.push(setTimeout(() => {
      this.phase = 'thesis_burst';
      this.cdr.markForCheck();
    }, tPodiums + tPenLock + tStamp));

    // Silence Seal (if any silenced)
    this.timeouts.push(setTimeout(() => {
      this.phase = 'silence_seal';
      this.cdr.markForCheck();
    }, tPodiums + tPenLock + tStamp + tBurst));

    // Dissipate
    this.timeouts.push(setTimeout(() => {
      this.phase = 'dissipate';
      this.cdr.markForCheck();
    }, tPodiums + tPenLock + tStamp + tBurst + tSilence));

    // Idle
    this.timeouts.push(setTimeout(() => {
      this.phase = 'idle';
      this.cdr.markForCheck();
    }, tPodiums + tPenLock + tStamp + tBurst + tSilence + tDissipate));
  }
}
