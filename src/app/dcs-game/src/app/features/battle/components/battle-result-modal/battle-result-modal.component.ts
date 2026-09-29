import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ChangeDetectorRef, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DungeonResult, HeroExpResult } from '../../../../core/models/dungeon.model';
import { BattleHeroStatisticsDto } from '../../../../core/models/battle.model';
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

export interface ProcessedHeroStat {
  combatantId: number;
  sourceHeroId: number;
  team: number;
  heroName: string;
  avatar: string;

  // Damage Dealt (Stacked)
  physicalDamageDealt: number;
  magicDamageDealt: number;
  totalDamageDealt: number;
  damageDealtBarHeight: number;
  damageDealtPhysicalRatio: number;
  damageDealtMagicRatio: number;
  damageDealtPhysicalPercent: number;
  damageDealtMagicPercent: number;
  damageDealtTeamPercent: number;

  // Healing (Single)
  healingDone: number;
  healingBarHeight: number;
  healingFormatted: string;

  // Damage Taken (Stacked)
  physicalDamageTaken: number;
  magicDamageTaken: number;
  totalDamageTaken: number;
  damageTakenBarHeight: number;
  damageTakenPhysicalRatio: number;
  damageTakenMagicRatio: number;
  damageTakenPhysicalPercent: number;
  damageTakenMagicPercent: number;
  damageTakenTeamPercent: number;
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
  @Input() heroStatistics: BattleHeroStatisticsDto[] = [];

  @Output() onReplay = new EventEmitter<void>();
  @Output() onExit = new EventEmitter<void>();

  displayedStars = 0;
  animatedHeroes: AnimatedHeroExpState[] = [];
  selectedStatsTeam: 0 | 1 = 0; // 0 = Player team, 1 = Enemy team
  activeTooltip: { id: number; type: 'dealt' | 'heal' | 'taken' } | null = null;

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

  // --- Statistics Logic ---

  get allHeroStats(): BattleHeroStatisticsDto[] {
    if (this.heroStatistics && this.heroStatistics.length > 0) {
      return this.heroStatistics;
    }
    if (this.dungeonResult?.heroStatistics && this.dungeonResult.heroStatistics.length > 0) {
      return this.dungeonResult.heroStatistics;
    }
    return [];
  }

  get hasHeroStatistics(): boolean {
    return this.allHeroStats.length > 0;
  }

  get hasEnemyTeamStats(): boolean {
    return this.allHeroStats.some(s => s.team === 1);
  }

  get processedTeamStats(): ProcessedHeroStat[] {
    const list = this.allHeroStats.filter(s => s.team === this.selectedStatsTeam);
    if (!list.length) return [];

    const totalTeamDamageDealt = list.reduce((sum, h) => sum + (h.physicalDamageDealt + h.magicDamageDealt), 0);
    const totalTeamDamageTaken = list.reduce((sum, h) => sum + (h.physicalDamageTaken + h.magicDamageTaken), 0);

    const maxHeroDamageDealt = Math.max(0, ...list.map(h => h.physicalDamageDealt + h.magicDamageDealt));
    const maxHeroHealing = Math.max(0, ...list.map(h => h.healingDone));
    const maxHeroDamageTaken = Math.max(0, ...list.map(h => h.physicalDamageTaken + h.magicDamageTaken));

    return list.map(h => {
      const totalDmgDealt = h.physicalDamageDealt + h.magicDamageDealt;
      const totalDmgTaken = h.physicalDamageTaken + h.magicDamageTaken;

      // Independent normalized bar heights (0 to 100%, min 6% if > 0)
      const dealtHeight = maxHeroDamageDealt > 0 ? (totalDmgDealt / maxHeroDamageDealt) * 100 : 0;
      const damageDealtBarHeight = totalDmgDealt > 0 ? Math.max(6, Math.min(100, dealtHeight)) : 0;

      const healHeight = maxHeroHealing > 0 ? (h.healingDone / maxHeroHealing) * 100 : 0;
      const healingBarHeight = h.healingDone > 0 ? Math.max(6, Math.min(100, healHeight)) : 0;

      const takenHeight = maxHeroDamageTaken > 0 ? (totalDmgTaken / maxHeroDamageTaken) * 100 : 0;
      const damageTakenBarHeight = totalDmgTaken > 0 ? Math.max(6, Math.min(100, takenHeight)) : 0;

      // Internal ratios for stacked bars
      const damageDealtPhysicalRatio = totalDmgDealt > 0 ? (h.physicalDamageDealt / totalDmgDealt) * 100 : 0;
      const damageDealtMagicRatio = totalDmgDealt > 0 ? (h.magicDamageDealt / totalDmgDealt) * 100 : 0;

      const damageTakenPhysicalRatio = totalDmgTaken > 0 ? (h.physicalDamageTaken / totalDmgTaken) * 100 : 0;
      const damageTakenMagicRatio = totalDmgTaken > 0 ? (h.magicDamageTaken / totalDmgTaken) * 100 : 0;

      // Team Contribution Percentages
      const damageDealtTeamPercent = totalTeamDamageDealt > 0 ? (totalDmgDealt / totalTeamDamageDealt) * 100 : 0;
      const damageTakenTeamPercent = totalTeamDamageTaken > 0 ? (totalDmgTaken / totalTeamDamageTaken) * 100 : 0;

      return {
        combatantId: h.combatantId,
        sourceHeroId: h.sourceHeroId,
        team: h.team,
        heroName: h.heroName || 'Võ Tướng',
        avatar: h.avatar || '/assets/images/dcs-game/heroes/default.png',

        physicalDamageDealt: h.physicalDamageDealt,
        magicDamageDealt: h.magicDamageDealt,
        totalDamageDealt: totalDmgDealt,
        damageDealtBarHeight,
        damageDealtPhysicalRatio,
        damageDealtMagicRatio,
        damageDealtPhysicalPercent: damageDealtPhysicalRatio,
        damageDealtMagicPercent: damageDealtMagicRatio,
        damageDealtTeamPercent,

        healingDone: h.healingDone,
        healingBarHeight,
        healingFormatted: this.formatShortNumber(h.healingDone),

        physicalDamageTaken: h.physicalDamageTaken,
        magicDamageTaken: h.magicDamageTaken,
        totalDamageTaken: totalDmgTaken,
        damageTakenBarHeight,
        damageTakenPhysicalRatio,
        damageTakenMagicRatio,
        damageTakenPhysicalPercent: damageTakenPhysicalRatio,
        damageTakenMagicPercent: damageTakenMagicRatio,
        damageTakenTeamPercent
      };
    });
  }

  formatShortNumber(val: number): string {
    const v = Math.max(0, Math.round(val || 0));
    if (v >= 1_000_000) {
      const m = (v / 1_000_000).toFixed(1).replace('.', ',');
      return `${m}M`;
    }
    if (v >= 10_000) {
      const k = (v / 1_000).toFixed(1).replace('.', ',');
      return `${k}K`;
    }
    return v.toLocaleString('vi-VN');
  }

  formatFullNumber(val: number): string {
    return Math.max(0, Math.round(val || 0)).toLocaleString('vi-VN');
  }

  setStatsTeam(team: 0 | 1): void {
    this.selectedStatsTeam = team;
    this.activeTooltip = null;
  }

  showTooltip(id: number, type: 'dealt' | 'heal' | 'taken'): void {
    this.activeTooltip = { id, type };
  }

  hideTooltip(): void {
    this.activeTooltip = null;
  }

  toggleTooltip(id: number, type: 'dealt' | 'heal' | 'taken', event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    if (this.activeTooltip?.id === id && this.activeTooltip?.type === type) {
      this.activeTooltip = null;
    } else {
      this.activeTooltip = { id, type };
    }
  }

  isTooltipActive(id: number, type: 'dealt' | 'heal' | 'taken'): boolean {
    return this.activeTooltip?.id === id && this.activeTooltip?.type === type;
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.activeTooltip = null;
  }

  // --- Hero EXP Animations ---

  private initHeroExpAnimations(): void {
    const rawHeroes = this.dungeonResult?.heroes ?? [];
    if (!rawHeroes.length) return;

    const prefersReducedMotion = typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

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
      this.interpolateExp(
        state,
        raw.oldExp,
        raw.newExp,
        safeOldMax,
        450
      );
    } else {
      this.interpolateExp(
        state,
        raw.oldExp,
        safeOldMax,
        safeOldMax,
        320,
        () => {
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
