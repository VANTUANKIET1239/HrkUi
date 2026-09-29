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

export type TruongKietGradPhase =
  | 'idle'
  | 'slam'          // Caster slams shield, giant graduation crest appears behind
  | 'shockwave'     // Shockwave sweeps through enemy front row with heavy impact
  | 'reflect'       // Light curves back toward ally formation
  | 'ally_shields'  // Each ally receives individual hemispherical shield dome
  | 'dissipate';

export interface VfxNodePos {
  id: number;
  x: number;
  y: number;
}

@Component({
  selector: 'app-truong-kiet-graduation-scene-vfx',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './truong-kiet-graduation-scene-vfx.component.html',
  styleUrl: './truong-kiet-graduation-scene-vfx.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TruongKietGraduationSceneVfxComponent implements OnInit, OnChanges, OnDestroy {
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

  phase: TruongKietGradPhase = 'idle';
  actorPos = { x: 0, y: 0 };
  enemyTargetNodes: VfxNodePos[] = [];
  allyTargetNodes: VfxNodePos[] = [];

  consumedCredits = 0;
  isMaxCredits = false;

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

    // Resolve enemy target positions
    this.enemyTargetNodes = [];
    const targetIds = this.activeTargetIds.length > 0 ? this.activeTargetIds : [99];
    for (const tId of targetIds) {
      let tx = this.actorTeamRight ? w * 0.25 : w * 0.75;
      let ty = h * 0.5;
      const el = document.querySelector(`[data-combatant-id="${tId}"]`);
      if (el) {
        const r = el.getBoundingClientRect();
        tx = r.left + r.width * 0.5 - hostRect.left;
        ty = r.top + r.height * 0.5 - hostRect.top;
      }
      this.enemyTargetNodes.push({ id: tId, x: tx, y: ty });
    }

    // Resolve ally target positions for shields
    this.allyTargetNodes = [];
    const myTeam = this.actorTeamRight ? 'right' : 'left';
    const allyElements = document.querySelectorAll(`[data-team="${myTeam}"]:not(.is-dead)`);
    if (allyElements.length > 0) {
      allyElements.forEach(el => {
        const idAttr = el.getAttribute('data-combatant-id');
        const id = idAttr ? parseInt(idAttr, 10) : 0;
        const r = el.getBoundingClientRect();
        this.allyTargetNodes.push({
          id,
          x: r.left + r.width * 0.5 - hostRect.left,
          y: r.top + r.height * 0.5 - hostRect.top
        });
      });
    } else {
      // Fallback: at least caster position
      this.allyTargetNodes.push({ id: this.actorId ?? 1, x: actorX, y: actorY });
    }

    // Check credits consumed
    this.consumedCredits = 0;
    for (const ev of this.castEvents) {
      if ((ev.eventType === 'STATUS_REMOVED' && ev.effectTypeCode === 'TIN_CHI_DANH_DU') ||
          (ev.eventType === 'RESOURCE_CHANGED' && ev.resourceCode === 'TIN_CHI_DANH_DU')) {
        this.consumedCredits = ev.previousStacks ?? ev.previousValue ?? 3;
      }
    }
    if (this.isEmpowered || this.empowered || this.consumedCredits >= 3) {
      this.isMaxCredits = true;
    }

    const speed = Math.max(1, this.visualSpeed);
    const tSlam = Math.round(350 / speed);
    const tShock = Math.round(450 / speed);
    const tReflect = Math.round(300 / speed);
    const tShields = Math.round(750 / speed);
    const tDissipate = Math.round(350 / speed);

    // 0ms: Slam phase
    this.phase = 'slam';
    this.cdr.markForCheck();

    // Slam -> Shockwave
    this.timeouts.push(setTimeout(() => {
      this.phase = 'shockwave';
      this.cdr.markForCheck();
    }, tSlam));

    // Shockwave -> Reflect
    this.timeouts.push(setTimeout(() => {
      this.phase = 'reflect';
      this.cdr.markForCheck();
    }, tSlam + tShock));

    // Reflect -> Individual Ally Shields
    this.timeouts.push(setTimeout(() => {
      this.phase = 'ally_shields';
      this.cdr.markForCheck();
    }, tSlam + tShock + tReflect));

    // Shields -> Dissipate
    this.timeouts.push(setTimeout(() => {
      this.phase = 'dissipate';
      this.cdr.markForCheck();
    }, tSlam + tShock + tReflect + tShields));

    // Idle
    this.timeouts.push(setTimeout(() => {
      this.phase = 'idle';
      this.cdr.markForCheck();
    }, tSlam + tShock + tReflect + tShields + tDissipate));
  }
}
