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

export type KietVisualPhase =
  | 'idle'
  | 'gather'      // 0-250ms: sword aura + 3 seals spin fast
  | 'blur_dash'   // 250-500ms: caster blurs into shadow
  | 'slash_1'     // 500-850ms: horizontal slash
  | 'slash_2'     // 850-1200ms: reverse diagonal slash
  | 'slash_3'     // 1200-1650ms: massive mái xéo cross cleave (armor shatter if 3 stacks)
  | 'dissipate';  // 1650-2050ms: afterimages converge, ki fragments fade

@Component({
  selector: 'app-kiet-mai-xeo-scene-vfx',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './kiet-mai-xeo-scene-vfx.component.html',
  styleUrl: './kiet-mai-xeo-scene-vfx.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KietMaiXeoSceneVfxComponent implements OnInit, OnChanges, OnDestroy {
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

  phase: KietVisualPhase = 'idle';
  actorPos = { x: 0, y: 0 };
  targetPos = { x: 0, y: 0 };
  dashPos = { x: 0, y: 0 };

  consumedSeals = 0;
  isMaxStacks = false;
  hasCrit = false;

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
    this.targetPos = { x: targetX, y: targetY };
    this.dashPos = { x: actorX, y: actorY };

    // Inspect castEvents for stack consumptions and crit
    this.consumedSeals = 0;
    for (const ev of this.castEvents) {
      if ((ev.eventType === 'STATUS_REMOVED' && ev.effectTypeCode === 'PHONG_AN') ||
          (ev.eventType === 'RESOURCE_CHANGED' && ev.resourceCode === 'PHONG_AN')) {
        this.consumedSeals = ev.previousStacks ?? ev.previousValue ?? 3;
      }
      if (ev.isCrit) {
        this.hasCrit = true;
      }
    }
    if (this.isEmpowered || this.empowered || this.consumedSeals >= 3) {
      this.isMaxStacks = true;
    }

    const speed = Math.max(1, this.visualSpeed);
    const tGather = Math.round(250 / speed);
    const tBlur = Math.round(250 / speed);
    const tSlash1 = Math.round(350 / speed);
    const tSlash2 = Math.round(350 / speed);
    const tSlash3 = Math.round(450 / speed);
    const tDissipate = Math.round(400 / speed);

    // 0ms: Phase 1 - Gather
    this.phase = 'gather';
    this.cdr.markForCheck();

    // 250ms: Phase 2 - Blur Dash
    this.timeouts.push(setTimeout(() => {
      this.phase = 'blur_dash';
      // Shift dash afterimage toward target
      const dir = this.actorTeamRight ? -1 : 1;
      this.dashPos = {
        x: targetX - dir * 60,
        y: targetY
      };
      this.cdr.markForCheck();
    }, tGather));

    // 500ms: Phase 3 - Slash 1 (Low Horizontal)
    this.timeouts.push(setTimeout(() => {
      this.phase = 'slash_1';
      this.cdr.markForCheck();
    }, tGather + tBlur));

    // 850ms: Phase 4 - Slash 2 (Reverse Diagonal)
    this.timeouts.push(setTimeout(() => {
      this.phase = 'slash_2';
      this.cdr.markForCheck();
    }, tGather + tBlur + tSlash1));

    // 1200ms: Phase 5 - Slash 3 (Massive Mái Xéo Cross Cut)
    this.timeouts.push(setTimeout(() => {
      this.phase = 'slash_3';
      this.cdr.markForCheck();
    }, tGather + tBlur + tSlash1 + tSlash2));

    // 1650ms: Phase 6 - Dissipate
    this.timeouts.push(setTimeout(() => {
      this.phase = 'dissipate';
      this.cdr.markForCheck();
    }, tGather + tBlur + tSlash1 + tSlash2 + tSlash3));

    // 2050ms: Idle cleanup
    this.timeouts.push(setTimeout(() => {
      this.phase = 'idle';
      this.cdr.markForCheck();
    }, tGather + tBlur + tSlash1 + tSlash2 + tSlash3 + tDissipate));
  }
}
