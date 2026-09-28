import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DungeonResult, HeroExpResult } from '../../../../core/models/dungeon.model';
import { EquipmentTooltipService } from '../../../../shared/components/equipment-tooltip/equipment-tooltip.service';
import { EquipmentRollDetailsComponent } from '../../../../shared/components/equipment-roll-details/equipment-roll-details.component';

export interface AnimatedHeroExpState {
  playerHeroId: number;
  heroName: string;
  avatar: string;
  displayedLevel: number;
  targetLevel: number;
  oldLevel: number;
  displayedExp: number;
  displayedMaxExp: number;
  expPercent: number;
  expGained: number;
  isLevelUp: boolean;
  isLevelUpFlash: boolean;
  showLevelUpBadge: boolean;
}

@Component({
  selector: 'app-battle-result-modal',
  standalone: true,
  imports: [CommonModule, EquipmentRollDetailsComponent],
  templateUrl: './battle-result-modal.component.html',
  styleUrl: './battle-result-modal.component.scss'
})
export class BattleResultModalComponent implements OnInit, OnDestroy {
  private readonly tooltipService = inject(EquipmentTooltipService);
  private readonly cdr = inject(ChangeDetectorRef);

  @Input({ required: true }) isVictory = true;
  @Input() totalTurns = 0;
  @Input() aliveCount = 0;
  @Input() totalCount = 5;
  @Input() totalRemainingHp = 0;
  @Input() dungeonResult?: DungeonResult | null;

  @Output() onReplay = new EventEmitter<void>();
  @Output() onExit = new EventEmitter<void>();

  displayedStars = 0;
  animatedHeroes: AnimatedHeroExpState[] = [];

  private activeTimers: any[] = [];
  private starInterval: any = null;

  ngOnInit(): void {
    if (this.isVictory) {
      const targetStars = this.dungeonResult?.earnedStars ?? 1;
      let cur = 0;
      this.starInterval = setInterval(() => {
        if (cur < targetStars) {
          cur++;
          this.displayedStars = cur;
          this.cdr.markForCheck();
        } else {
          clearInterval(this.starInterval);
          this.starInterval = null;
        }
      }, 260);
    }

    this.initHeroExpAnimations();
  }

  ngOnDestroy(): void {
    this.cleanUpTimers();
  }

  private cleanUpTimers(): void {
    if (this.starInterval) {
      clearInterval(this.starInterval);
      this.starInterval = null;
    }
    for (const t of this.activeTimers) {
      clearTimeout(t);
      clearInterval(t);
    }
    this.activeTimers = [];
  }

  private initHeroExpAnimations(): void {
    const rawHeroes = this.dungeonResult?.heroes ?? [];
    if (!rawHeroes.length) return;

    const prefersReducedMotion = typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

    // Initialize state
    this.animatedHeroes = rawHeroes.map(h => {
      const safeOldMax = h.oldMaxExp && h.oldMaxExp > 0 ? h.oldMaxExp : 100;
      const safeNewMax = h.newMaxExp && h.newMaxExp > 0 ? h.newMaxExp : safeOldMax;
      const isLevelUp = h.newLevel > h.oldLevel;

      if (prefersReducedMotion) {
        return {
          playerHeroId: h.playerHeroId,
          heroName: h.heroName,
          avatar: h.avatar || '',
          displayedLevel: h.newLevel,
          targetLevel: h.newLevel,
          oldLevel: h.oldLevel,
          displayedExp: h.newExp,
          displayedMaxExp: safeNewMax,
          expPercent: Math.min(100, Math.max(0, (h.newExp / safeNewMax) * 100)),
          expGained: h.expGained,
          isLevelUp,
          isLevelUpFlash: false,
          showLevelUpBadge: isLevelUp
        };
      }

      return {
        playerHeroId: h.playerHeroId,
        heroName: h.heroName,
        avatar: h.avatar || '',
        displayedLevel: h.oldLevel,
        targetLevel: h.newLevel,
        oldLevel: h.oldLevel,
        displayedExp: h.oldExp,
        displayedMaxExp: safeOldMax,
        expPercent: Math.min(100, Math.max(0, (h.oldExp / safeOldMax) * 100)),
        expGained: h.expGained,
        isLevelUp,
        isLevelUpFlash: false,
        showLevelUpBadge: false
      };
    });

    if (prefersReducedMotion) {
      this.cdr.markForCheck();
      return;
    }

    // Run staggered animations
    rawHeroes.forEach((hero, index) => {
      const staggerDelay = 250 + index * 90;
      const timer = setTimeout(() => {
        this.animateHeroExp(this.animatedHeroes[index], hero);
      }, staggerDelay);
      this.activeTimers.push(timer);
    });
  }

  private animateHeroExp(state: AnimatedHeroExpState, raw: HeroExpResult): void {
    if (!state || !raw) return;

    const safeOldMax = raw.oldMaxExp && raw.oldMaxExp > 0 ? raw.oldMaxExp : 100;
    const safeNewMax = raw.newMaxExp && raw.newMaxExp > 0 ? raw.newMaxExp : safeOldMax;

    if (raw.newLevel === raw.oldLevel) {
      // No level up: animate oldExp -> newExp
      this.interpolateExp(
        state,
        raw.oldExp,
        raw.newExp,
        safeOldMax,
        450
      );
    } else {
      // Level up: Phase 1: oldExp -> safeOldMax (100%)
      this.interpolateExp(
        state,
        raw.oldExp,
        safeOldMax,
        safeOldMax,
        320,
        () => {
          // Trigger Level-Up flash
          state.isLevelUpFlash = true;
          state.showLevelUpBadge = true;
          state.displayedLevel = raw.newLevel;
          state.displayedMaxExp = safeNewMax;
          state.displayedExp = 0;
          state.expPercent = 0;
          this.cdr.markForCheck();

          const flashTimer = setTimeout(() => {
            state.isLevelUpFlash = false;
            this.cdr.markForCheck();

            // Phase 2: 0 -> newExp
            this.interpolateExp(
              state,
              0,
              raw.newExp,
              safeNewMax,
              380
            );
          }, 160);
          this.activeTimers.push(flashTimer);
        }
      );
    }
  }

  private interpolateExp(
    state: AnimatedHeroExpState,
    startVal: number,
    endVal: number,
    maxVal: number,
    durationMs: number,
    onComplete?: () => void
  ): void {
    const steps = 18;
    const stepInterval = Math.max(16, Math.floor(durationMs / steps));
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      const progress = Math.min(1, currentStep / steps);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);

      state.displayedExp = Math.round(startVal + (endVal - startVal) * eased);
      state.expPercent = Math.min(100, Math.max(0, (state.displayedExp / maxVal) * 100));
      this.cdr.markForCheck();

      if (progress >= 1) {
        clearInterval(interval);
        state.displayedExp = endVal;
        state.expPercent = Math.min(100, Math.max(0, (endVal / maxVal) * 100));
        this.cdr.markForCheck();
        onComplete?.();
      }
    }, stepInterval);

    this.activeTimers.push(interval);
  }

  get remainingHpPercent(): number {
    if (!this.dungeonResult) return 0;
    return Math.round(Number(this.dungeonResult.remainingHpRate || 0) * 100);
  }

  onDroppedEquipHover(event: MouseEvent): void {
    if (this.dungeonResult?.droppedEquipment) {
      this.tooltipService.show(event, this.dungeonResult.droppedEquipment);
    }
  }

  onDroppedEquipLeave(): void {
    this.tooltipService.hide();
  }
}

