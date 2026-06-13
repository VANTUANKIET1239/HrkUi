import { Injectable, signal, computed } from '@angular/core';
import { Hero } from '../models/hero.model';
import { BattleLog } from '../models/battle-log.model';
import { INITIAL_HEROES, MOCK_BATTLE_LOGS, SKILL_LIST } from '../../features/battle/mocks/mock-battle.data';
import { Skill, TargetRangeType } from '../models/skill.model';

export interface DamageTextEvent {
  text: string;
  isCrit: boolean;
  key: number;
}

@Injectable({
  providedIn: 'root'
})
export class BattleEngineService {
  // Signals representing the core state
  readonly status = signal<'idle' | 'playing' | 'paused' | 'finished'>('idle');
  readonly heroes = signal<Hero[]>([]);
  readonly currentTurn = signal<number>(0);
  readonly currentLogIndex = signal<number>(-1);
  readonly speed = signal<number>(1);
  readonly narrativeLogs = signal<string[]>([]);

  // Animation/Replay active combatants
  readonly activeActorId = signal<number | null>(null);
  readonly activeTargetId = signal<number | null>(null);
  readonly activeTargetIds = signal<number[]>([]);
  readonly currentSkillColor = signal<string>('#ffffff');
  readonly currentSkillName = signal<string | null>(null);
  readonly currentSkillId = signal<string | null>(null);

  // Floating damage text tracker by Hero ID
  readonly damageEvents = signal<{ [heroId: number]: DamageTextEvent | null }>({});

  // Turn queue & active actor signals for timeline
  readonly turnQueue = computed(() => {
    const currentIndex = this.currentLogIndex();
    const queue: Hero[] = [];
    for (let i = 1; i <= 8; i++) {
      const nextIndex = currentIndex + i;
      if (nextIndex < this.allLogs.length) {
        const nextLog = this.allLogs[nextIndex];
        const hero = this.heroes().find(h => h.id === nextLog.actorId);
        if (hero) {
          queue.push(hero);
        }
      }
    }
    return queue;
  });

  readonly activeActor = computed(() => {
    const actorId = this.activeActorId();
    return actorId !== null ? this.heroes().find(h => h.id === actorId) : null;
  });

  private allLogs: BattleLog[] = [];
  private currentTimeout: any = null;
  private damageEventCounter = 0;

  constructor() {
    this.resetBattle();
  }

  resetBattle(): void {
    if (this.currentTimeout) {
      clearTimeout(this.currentTimeout);
      this.currentTimeout = null;
    }

    // Reset to deep copied initial heroes to avoid side effects
    this.heroes.set(JSON.parse(JSON.stringify(INITIAL_HEROES)));
    this.allLogs = JSON.parse(JSON.stringify(MOCK_BATTLE_LOGS));
    this.currentTurn.set(0);
    this.currentLogIndex.set(-1);
    this.status.set('idle');
    this.narrativeLogs.set([]);
    this.activeActorId.set(null);
    this.activeTargetId.set(null);
    this.currentSkillName.set(null);
    this.currentSkillId.set(null);
    this.activeTargetIds.set([]);
    this.damageEvents.set({});
  }

  isTargetHit(heroId: number): boolean {
    return this.activeTargetId() === heroId || this.activeTargetIds().includes(heroId);
  }

  setSpeed(newSpeed: number): void {
    if ([1, 2, 4].includes(newSpeed)) {
      this.speed.set(newSpeed);
    }
  }

  startBattle(): void {
    if (this.status() === 'idle') {
      this.status.set('playing');
      this.narrativeLogs.update(logs => [...logs, '🗡️ Trận đấu bắt đầu!']);
      this.playNextLog();
    } else if (this.status() === 'paused') {
      this.status.set('playing');
      this.playNextLog();
    }
  }

  pauseBattle(): void {
    if (this.status() === 'playing') {
      this.status.set('paused');
      if (this.currentTimeout) {
        clearTimeout(this.currentTimeout);
        this.currentTimeout = null;
      }
      this.narrativeLogs.update(logs => [...logs, '⏸️ Đã tạm dừng trận đấu.']);
    }
  }

  private getBattleSpeeds(speedMultiplier: number): { phase1Duration: number, phase2Duration: number, phase3Duration: number } {
    // Step Timing: Total action takes 1200ms at 1x speed.
    const phase1Duration = 800 / speedMultiplier; // Charge & Skill flash
    const phase2Duration = 800 / speedMultiplier; // Hit, Damage Apply, HP decrease
    const phase3Duration = 800 / speedMultiplier; // Return to position
    return { phase1Duration, phase2Duration, phase3Duration };
  }

  private playNextLog(): void {
    const nextIndex = this.currentLogIndex() + 1;
    if (nextIndex >= this.allLogs.length) {
      this.finishBattle();
      return;
    }

    const log = this.allLogs[nextIndex];
    this.currentLogIndex.set(nextIndex);
    this.currentTurn.set(log.turn);

    const actor = this.heroes().find(h => h.id === log.actorId);
    const target = this.heroes().find(h => h.id === log.targetId);

    if (!actor || !target) {
      // If characters not found, skip to next
      this.playNextLog();
      return;
    }

    const speedMultiplier = this.speed();
    const { phase1Duration, phase2Duration, phase3Duration } = this.getBattleSpeeds(speedMultiplier);

    // Get Skill Information
    const skillDetail = SKILL_LIST[log.skillId] || {
      id: log.skillId,
      name: 'Đánh Thường',
      cost: 0,
      costType: 'MP',
      category: 'basic',
      color: '#aaaaaa',
      type: 'physical',
      description: 'Đòn đánh thường',
      damageMultiplier: 1.0
    };
    this.currentSkillColor.set(skillDetail.color);
    this.currentSkillName.set(skillDetail.name);
    this.currentSkillId.set(log.skillId);




    // Determine Target Range Type
    // Use targetType if defined, fallback to isAoE (all) or single
    const targetType = skillDetail.targetType || (skillDetail.isAoE ? 'all' : 'single');
    const enemyTargets: number[] = this.getEnemyTargets(target, actor, targetType);

    const isMultipleTargets = enemyTargets.length > 1;

    // 1. PHASE 1: Actor dashes forward, skill visual triggers
    this.activeActorId.set(actor.id);
    if (isMultipleTargets) {
      this.activeTargetIds.set(enemyTargets);
      this.activeTargetId.set(null);
    } else {
      this.activeTargetId.set(enemyTargets[0] || target.id);
      this.activeTargetIds.set([]);
    }

    // Add entry in Narrative Log
    const critText = log.isCrit ? ' 💥 CHÍ MẠNG' : '';
    let targetDesc = '';
    if (targetType === 'all') targetDesc = 'TOÀN BỘ ĐỘI HÌNH địch';
    else if (targetType === 'front_row') targetDesc = 'HÀNG TRƯỚC địch';
    else if (targetType === 'back_row') targetDesc = 'HÀNG SAU địch';
    else if (targetType === 'same_lane_back_row') targetDesc = 'hàng sau cùng làn';
    else if (targetType === 'linear') targetDesc = 'ĐƯỜNG THẲNG đối diện';
    else targetDesc = `**${target.name}**`;

    const skillLog = isMultipleTargets
      ? `[Lượt ${log.turn}] **${actor.name}** dùng **${skillDetail.name}** tấn công ${targetDesc}, gây ${log.damage} sát thương${critText} cho mỗi mục tiêu!`
      : `[Lượt ${log.turn}] **${actor.name}** dùng **${skillDetail.name}** tấn công ${targetDesc}, gây ${log.damage} sát thương${critText}!`;
    this.narrativeLogs.update(logs => [...logs, skillLog]);

    // Update Actor's Mana (consume or gain mana on action)
    this.heroes.update(allHeroes => {
      return allHeroes.map(h => {
        if (h.id === actor.id) {
          let newMana = h.mana;
          if (skillDetail.cost > 0) {
            newMana = Math.max(0, h.mana - skillDetail.cost);
          } else {
            newMana = Math.min(h.maxMana, h.mana + 25);
          }
          return { ...h, mana: newMana };
        }
        return h;
      });
    });

    this.currentTimeout = setTimeout(() => {
      // 2. PHASE 2: Target(s) take damage, HP bar decreases, floating text appears
      this.heroes.update(allHeroes => {
        return allHeroes.map(h => {
          if (enemyTargets.includes(h.id)) {
            const nextHp = Math.max(0, h.hp - log.damage);
            return { ...h, hp: nextHp };
          }
          return h;
        });
      });

      // Trigger Floating Damage Text for all targets
      this.damageEvents.update(events => {
        const nextEvents = { ...events };
        enemyTargets.forEach(id => {
          nextEvents[id] = {
            text: `-${log.damage}${log.isCrit ? '!' : ''}`,
            isCrit: log.isCrit,
            key: this.damageEventCounter++
          };
        });
        return nextEvents;
      });

      this.currentTimeout = setTimeout(() => {
        // 3. PHASE 3: Actor returns back to original position
        this.activeActorId.set(null);
        this.activeTargetId.set(null);
        this.activeTargetIds.set([]);
        this.currentSkillName.set(null);
        this.currentSkillId.set(null);

        // Clear target damage text after float animation
        this.currentTimeout = setTimeout(() => {
          this.damageEvents.update(events => {
            const nextEvents = { ...events };
            enemyTargets.forEach(id => {
              nextEvents[id] = null;
            });
            return nextEvents;
          });

          // Check if any character died
          this.heroes.update(allHeroes => {
            return allHeroes.map(h => {
              if (enemyTargets.includes(h.id) && h.hp <= 0 && !h.statusEffects?.includes('Dead')) {
                const updatedEffects = [...(h.statusEffects || []), 'Dead'];
                this.narrativeLogs.update(logs => [...logs, `💀 **${h.name}** đã gục ngã!`]);
                return { ...h, hp: 0, statusEffects: updatedEffects };
              }
              return h;
            });
          });

          // Check Win/Loss conditions
          const leftAlive = this.heroes().some(h => h.team === 'left' && h.hp > 0);
          const rightAlive = this.heroes().some(h => h.team === 'right' && h.hp > 0);

          if (!leftAlive || !rightAlive) {
            this.finishBattle();
          } else {
            // Wait slightly before the next actor turn
            this.currentTimeout = setTimeout(() => {
              this.playNextLog();
            }, 300 / speedMultiplier);
          }
        }, phase3Duration);

      }, phase2Duration);

    }, phase1Duration);
  }

  private finishBattle(): void {
    this.status.set('finished');
    const leftAlive = this.heroes().some(h => h.team === 'left' && h.hp > 0);
    const rightAlive = this.heroes().some(h => h.team === 'right' && h.hp > 0);

    let winnerMsg = '🎉 Trận chiến kết thúc!';
    if (leftAlive && !rightAlive) {
      winnerMsg = '🏆 CHIẾN THẮNG! Đội hình DCS Coder đã vượt qua lỗi và sếp!';
    } else if (!leftAlive && rightAlive) {
      winnerMsg = '💀 THẤT BẠI! Lỗi và sếp đã nhấn chìm đội dự án!';
    } else {
      winnerMsg = '🤝 HÒA NHAU! Trận đấu kết thúc bất phân thắng bại!';
    }

    this.narrativeLogs.update(logs => [...logs, winnerMsg]);
    this.activeActorId.set(null);
    this.activeTargetId.set(null);
    this.activeTargetIds.set([]);
    this.currentSkillName.set(null);
    this.currentSkillId.set(null);
  }

  private getEnemyTargets(target: Hero, actor: Hero, targetType: TargetRangeType): number[] {
    const enemyTeam = target.team;
    let enemyTargets: number[] = [];

    if (targetType === 'single') {
      enemyTargets = [target.id];
    } else if (targetType === 'all') {
      enemyTargets = this.heroes()
        .filter(h => h.team === enemyTeam && h.hp > 0)
        .map(h => h.id);
    } else if (targetType === 'front_row') {
      // Front row positions: 1, 3, 5
      enemyTargets = this.heroes()
        .filter(h => h.team === enemyTeam && h.hp > 0 && [1, 3, 5].includes(h.position))
        .map(h => h.id);
    } else if (targetType === 'back_row') {
      // Back row positions: 2, 4
      enemyTargets = this.heroes()
        .filter(h => h.team === enemyTeam && h.hp > 0 && [2, 4].includes(h.position))
        .map(h => h.id);
    } else if (targetType === 'same_lane_back_row') {
      // Find same lane back row
      let actorRow = 1;
      if (actor.position === 3) actorRow = 3;
      else if (actor.position === 4 || actor.position === 5) actorRow = 5;

      let targetPositions: number[] = [];
      if (actorRow === 1) targetPositions = [2]; // Back row of row 1
      else if (actorRow === 5) targetPositions = [4]; // Back row of row 5
      else targetPositions = [2, 4]; // Fallback if row 3: target any back row

      enemyTargets = this.heroes()
        .filter(h => h.team === enemyTeam && h.hp > 0 && targetPositions.includes(h.position))
        .map(h => h.id);

      if (enemyTargets.length > 0) {
        enemyTargets = [enemyTargets[0]];
      }
    } else if (targetType === 'linear') {
      // Linear targets are in the same grid-row (y-axis line) as the actor
      // actor position 1, 2 -> row 1. Enemy matching positions: 1, 2
      // actor position 3 -> row 3. Enemy matching positions: 3
      // actor position 4, 5 -> row 5. Enemy matching positions: 4, 5
      let actorRow = 1;
      if (actor.position === 3) actorRow = 3;
      else if (actor.position === 4 || actor.position === 5) actorRow = 5;

      let targetPositions: number[] = [];
      if (actorRow === 1) targetPositions = [1, 2];
      else if (actorRow === 3) targetPositions = [3];
      else if (actorRow === 5) targetPositions = [4, 5];

      enemyTargets = this.heroes()
        .filter(h => h.team === enemyTeam && h.hp > 0 && targetPositions.includes(h.position))
        .map(h => h.id);
    } else if (targetType === 'random') {
      const aliveEnemies = this.heroes().filter(h => h.team === enemyTeam && h.hp > 0);
      if (aliveEnemies.length > 0) {
        const randomIndex = Math.floor(Math.random() * aliveEnemies.length);
        enemyTargets = [aliveEnemies[randomIndex].id];
      } else {
        enemyTargets = [target.id];
      }
    }
    return enemyTargets;
  }
}
