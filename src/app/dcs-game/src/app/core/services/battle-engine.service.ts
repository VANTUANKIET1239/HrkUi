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

  private getBattleSpeeds(speedMultiplier: number, skillId: string | null): { phase1Duration: number, phase2Duration: number, phase3Duration: number } {
    const skill = skillId ? SKILL_LIST[skillId] : null;
    const p1 = (skill?.phase1Duration || 800) / speedMultiplier;
    const p2 = (skill?.phase2Duration || 800) / speedMultiplier;
    const p3 = (skill?.phase3Duration || 800) / speedMultiplier;
    return { phase1Duration: p1, phase2Duration: p2, phase3Duration: p3 };
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

    // Decrement or clear Jackpot / Bankruptcy status effects at start of actor's turn
    this.heroes.update(allHeroes => {
      return allHeroes.map(h => {
        if (h.id === actor.id) {
          let statusEffects = h.statusEffects || [];
          
          if (statusEffects.includes('Jackpot')) {
            statusEffects = statusEffects.filter(e => e !== 'Jackpot' && e !== 'ATK Buff +50%');
            setTimeout(() => {
              this.narrativeLogs.update(logs => [...logs, `✨ Hiệu ứng Jackpot của **${h.name}** đã hết tác dụng.`]);
            }, 0);
          }
          
          if (statusEffects.includes('Bankruptcy_2')) {
            statusEffects = statusEffects.filter(e => e !== 'Bankruptcy_2').concat('Bankruptcy_1');
          } else if (statusEffects.includes('Bankruptcy_1')) {
            statusEffects = statusEffects.filter(e => e !== 'Bankruptcy_1' && e !== 'Silent' && e !== 'DEF -50%');
            setTimeout(() => {
              this.narrativeLogs.update(logs => [...logs, `🔓 **${h.name}** đã thoát khỏi trạng thái Phá Sản!`]);
            }, 0);
          }
          
          if (statusEffects.includes('Da Thịt Vững Chãi (2 lượt)')) {
            statusEffects = statusEffects.filter(e => e !== 'Da Thịt Vững Chãi (2 lượt)').concat('Da Thịt Vững Chãi (1 lượt)');
          } else if (statusEffects.includes('Da Thịt Vững Chãi (1 lượt)')) {
            statusEffects = statusEffects.filter(e => e !== 'Da Thịt Vững Chãi (1 lượt)');
            setTimeout(() => {
              this.narrativeLogs.update(logs => [...logs, `🛡️ Hiệu ứng **Da Thịt Vững Chãi** của **${h.name}** đã hết tác dụng.`]);
            }, 0);
          }

          if (statusEffects.includes('Quà Bảo Kê (2 lượt)')) {
            statusEffects = statusEffects.filter(e => e !== 'Quà Bảo Kê (2 lượt)').concat('Quà Bảo Kê (1 lượt)');
          } else if (statusEffects.includes('Quà Bảo Kê (1 lượt)')) {
            statusEffects = statusEffects.filter(e => e !== 'Quà Bảo Kê (1 lượt)');
            setTimeout(() => {
              this.narrativeLogs.update(logs => [...logs, `🎁 Hiệu ứng **Quà Bảo Kê** của **${h.name}** đã hết tác dụng.`]);
            }, 0);
          }

          if (statusEffects.includes('Deadlift Shield (2 lượt)')) {
            statusEffects = statusEffects.filter(e => e !== 'Deadlift Shield (2 lượt)').concat('Deadlift Shield (1 lượt)');
          } else if (statusEffects.includes('Deadlift Shield (1 lượt)')) {
            statusEffects = statusEffects.filter(e => e !== 'Deadlift Shield (1 lượt)');
            setTimeout(() => {
              this.narrativeLogs.update(logs => [...logs, `✨ Lớp giáp tạ xích của **${h.name}** đã biến mất.`]);
            }, 0);
          }

          if (statusEffects.includes('Khóa Khớp (2 lượt)')) {
            statusEffects = statusEffects.filter(e => e !== 'Khóa Khớp (2 lượt)').concat('Khóa Khớp (1 lượt)');
          } else if (statusEffects.includes('Khóa Khớp (1 lượt)')) {
            statusEffects = statusEffects.filter(e => e !== 'Khóa Khớp (1 lượt)');
            setTimeout(() => {
              this.narrativeLogs.update(logs => [...logs, `🔓 Trạng thái **Khóa Khớp** của **${h.name}** đã hết tác dụng.`]);
            }, 0);
          }

          if (statusEffects.includes('Taunted (2 lượt)')) {
            statusEffects = statusEffects.filter(e => e !== 'Taunted (2 lượt)').concat('Taunted (1 lượt)');
          } else if (statusEffects.includes('Taunted (1 lượt)')) {
            statusEffects = statusEffects.filter(e => e !== 'Taunted (1 lượt)');
            setTimeout(() => {
              this.narrativeLogs.update(logs => [...logs, `⚡ **${h.name}** đã thoát khỏi trạng thái Khiêu Khích.`]);
            }, 0);
          }

          // Rep stack increment on Hoàng Nguyên's action (gains +1)
          if (h.id === 10) {
            let repCount = 0;
            const repEffect = statusEffects.find(e => e.startsWith('Rep:'));
            if (repEffect) {
              const match = repEffect.match(/Rep:\s*(\d+)/);
              if (match) {
                repCount = parseInt(match[1], 10);
              }
              statusEffects = statusEffects.filter(e => !e.startsWith('Rep:'));
            }
            repCount = Math.min(10, repCount + 1);
            statusEffects = [...statusEffects, `Rep: ${repCount}`];
            
            setTimeout(() => {
              this.narrativeLogs.update(logs => [
                ...logs,
                `🏋️ **${h.name}** bắt đầu hành động, tích lũy thêm 1 tầng Rep (Hiện tại: ${repCount} Rep)!`
              ]);
            }, 0);
          }
          
          return { ...h, statusEffects };
        }
        return h;
      });
    });

    const speedMultiplier = this.speed();
    const { phase1Duration, phase2Duration, phase3Duration } = this.getBattleSpeeds(speedMultiplier, log.skillId);

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
    if (log.skillId === 'FATAL_ALL_IN_DIRECTIVE') {
      this.heroes.update(allHeroes => {
        return allHeroes.map(h => {
          if (h.id === actor.id) {
            const sacrificedHp = Math.floor(h.hp * 0.5);
            const nextHp = Math.max(1, h.hp - sacrificedHp);
            setTimeout(() => {
              this.narrativeLogs.update(logs => [
                ...logs,
                `💸 **${h.name}** kích hoạt **Lệnh All-In Hủy Diệt**! Tự hiến tế 50% HP hiện tại (-${sacrificedHp} HP)!`
              ]);
            }, 0);
            return { ...h, hp: nextHp };
          }
          return h;
        });
      });
    }

    // For DEADLIFT_DIA_CHAN: defer target highlighting to phase 2 so effects only fire when character visually arrives
    if (log.skillId === 'DEADLIFT_DIA_CHAN') {
      this.activeTargetIds.set([]);
      this.activeTargetId.set(null);
    } else if (isMultipleTargets) {
      this.activeTargetIds.set(enemyTargets);
      this.activeTargetId.set(null);
    } else {
      this.activeTargetId.set(enemyTargets[0] || target.id);
      this.activeTargetIds.set([]);
    }

    // Add entry in Narrative Log
    const critText = log.isCrit ? ' 💥 CHÍ MẠNG' : '';
    let targetDesc = '';
    if (targetType === 'friendly_all') targetDesc = 'TOÀN BỘ ĐỒNG ĐỘI';
    else if (targetType === 'all') targetDesc = 'TOÀN BỘ ĐỘI HÌNH địch';
    else if (targetType === 'front_row') targetDesc = 'HÀNG TRƯỚC địch';
    else if (targetType === 'back_row') targetDesc = 'HÀNG SAU địch';
    else if (targetType === 'same_lane_back_row') targetDesc = 'hàng sau cùng làn';
    else if (targetType === 'linear') targetDesc = 'ĐƯỜNG THẲNG đối diện';
    else targetDesc = `**${target.name}**`;

    let skillLog = '';
    if (log.skillId === 'DARK_KNOWLEDGE_SHIELD_CONVERSION') {
      const totalShield = enemyTargets.length * log.damage;
      skillLog = `[Lượt ${log.turn}] **${actor.name}** dùng **${skillDetail.name}** đè bẹp ${targetDesc}, gây ${log.damage} sát thương cho mỗi mục tiêu và tích lũy ${totalShield} Giáp Hư Không!`;
    } else if (log.skillId === 'WINTER_NIGHT_BLESSINGS') {
      skillLog = `[Lượt ${log.turn}] **${actor.name}** dùng **${skillDetail.name}** hồi máu và ban quà bảo vệ cho ${targetDesc}!`;
    } else if (log.skillId === 'DEADLIFT_DIA_CHAN') {
      skillLog = `[Lượt ${log.turn}] **${actor.name}** dùng **${skillDetail.name}** deadlift vung tạ đập mạnh xuống đất chấn động ${targetDesc}, gây ${log.damage} sát thương!`;
    } else {
      skillLog = isMultipleTargets
        ? `[Lượt ${log.turn}] **${actor.name}** dùng **${skillDetail.name}** tấn công ${targetDesc}, gây ${log.damage} sát thương${critText} cho mỗi mục tiêu!`
        : `[Lượt ${log.turn}] **${actor.name}** dùng **${skillDetail.name}** tấn công ${targetDesc}, gây ${log.damage} sát thương${critText}!`;
    }
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
      // For DEADLIFT_DIA_CHAN: now set targets so isHit + lightning fire at the same time as damage
      if (log.skillId === 'DEADLIFT_DIA_CHAN') {
        this.activeTargetIds.set(enemyTargets);
        this.activeTargetId.set(null);
      }

      // Check which targets have the shield before updating
      const targetsWithShield = enemyTargets.filter(id => {
        const h = this.heroes().find(hero => hero.id === id);
        return h?.statusEffects?.includes('Giáp Hư Không') || false;
      });

      // 2. PHASE 2: Target(s) take damage, HP bar decreases, floating text appears
      let hasKilled = false;
      this.heroes.update(allHeroes => {
        enemyTargets.forEach(id => {
          const h = allHeroes.find(hero => hero.id === id);
          if (h && h.hp > 0 && h.hp - log.damage <= 0) {
            hasKilled = true;
          }
        });

        let updatedHeroes = allHeroes.map(h => {
          if (enemyTargets.includes(h.id)) {
            if (log.skillId === 'WINTER_NIGHT_BLESSINGS') {
              const healAmount = Math.floor(actor.maxHp * 0.30);
              const nextHp = Math.min(h.maxHp, h.hp + healAmount);
              return { ...h, hp: nextHp };
            } else {
              if (h.id === 10) {
                let statusEffects = h.statusEffects || [];
                let repCount = 0;
                const repEffect = statusEffects.find(e => e.startsWith('Rep:'));
                if (repEffect) {
                  const match = repEffect.match(/Rep:\s*(\d+)/);
                  if (match) {
                    repCount = parseInt(match[1], 10);
                  }
                  statusEffects = statusEffects.filter(e => !e.startsWith('Rep:'));
                }
                repCount = Math.min(10, repCount + 1);
                statusEffects = [...statusEffects, `Rep: ${repCount}`];

                setTimeout(() => {
                  this.narrativeLogs.update(logs => [
                    ...logs,
                    `🏋️ **${h.name}** bị tấn công, tích lũy thêm 1 tầng Rep (Hiện tại: ${repCount} Rep)!`
                  ]);
                }, 0);

                const isTargetWithDeadliftShield = statusEffects.some(e => e.startsWith('Deadlift Shield')) || false;
                let nextHp = h.hp;
                if (targetsWithShield.includes(h.id)) {
                  statusEffects = statusEffects.filter(e => e !== 'Giáp Hư Không');
                } else if (isTargetWithDeadliftShield) {
                  // Absorbed by Deadlift Shield, keep HP unchanged
                } else {
                  let finalDamage = log.damage;
                  if (statusEffects.some(e => e.startsWith('Quà Bảo Kê'))) {
                    finalDamage = Math.floor(log.damage * 0.5);
                  }
                  if (statusEffects.some(e => e.startsWith('Da Thịt Vững Chãi'))) {
                    finalDamage = Math.floor(finalDamage * 0.6);
                  }
                  nextHp = Math.max(0, h.hp - finalDamage);
                }
                return { ...h, hp: nextHp, statusEffects };
              }

              const isTargetWithDeadliftShield = h.statusEffects?.some(e => e.startsWith('Deadlift Shield')) || false;
              if (targetsWithShield.includes(h.id)) {
                const nextEffects = h.statusEffects?.filter(e => e !== 'Giáp Hư Không') || [];
                return { ...h, statusEffects: nextEffects };
              } else if (isTargetWithDeadliftShield) {
                // Absorbed by Deadlift Shield, keep HP unchanged
                return h;
              } else {
                let finalDamage = log.damage;
                if (h.statusEffects?.some(e => e.startsWith('Quà Bảo Kê'))) {
                  finalDamage = Math.floor(log.damage * 0.5);
                }
                if (h.statusEffects?.some(e => e.startsWith('Da Thịt Vững Chãi'))) {
                  finalDamage = Math.floor(finalDamage * 0.6);
                }
                const nextHp = Math.max(0, h.hp - finalDamage);
                return { ...h, hp: nextHp };
              }
            }
          }
          return h;
        });

        // Handle Winter Night Blessings Buff Application in Phase 2
        if (log.skillId === 'WINTER_NIGHT_BLESSINGS') {
          const teammates = updatedHeroes.filter(h => h.team === actor.team && h.hp > 0 && h.id !== actor.id);
          const shuffled = [...teammates].sort(() => 0.5 - Math.random());
          const selectedTeammates = shuffled.slice(0, 2);
          const selectedIds = selectedTeammates.map(h => h.id);

          setTimeout(() => {
            if (selectedTeammates.length > 0) {
              const namesList = selectedTeammates.map(h => h.name).join(', ');
              this.narrativeLogs.update(logs => [
                ...logs,
                `🎁 **Quà Bảo Kê** đã được trao cho: **${namesList}**!`
              ]);
            }
            this.narrativeLogs.update(logs => [
              ...logs,
              `🛡️ **${actor.name}** kích hoạt **Da Thịt Vững Chãi (2 lượt)**, giảm 40% sát thương!`
            ]);
          }, 0);

          updatedHeroes = updatedHeroes.map(h => {
            let statusEffects = h.statusEffects || [];
            if (selectedIds.includes(h.id)) {
              statusEffects = statusEffects.filter(e => !e.startsWith('Quà Bảo Kê'));
              statusEffects.push('Quà Bảo Kê (2 lượt)');
            }
            if (h.id === actor.id) {
              statusEffects = statusEffects.filter(e => !e.startsWith('Da Thịt Vững Chãi'));
              statusEffects.push('Da Thịt Vững Chãi (2 lượt)');
            }
            return { ...h, statusEffects };
          });
        }

        // Handle Deadlift Dia Chan Buff & Taunt Application in Phase 2
        if (log.skillId === 'DEADLIFT_DIA_CHAN') {
          // Get the rep count before consuming
          const actorBefore = this.heroes().find(hero => hero.id === actor.id);
          const repEffect = actorBefore?.statusEffects?.find(e => e.startsWith('Rep:'));
          let repCount = 0;
          if (repEffect) {
            const match = repEffect.match(/Rep:\s*(\d+)/);
            if (match) {
              repCount = parseInt(match[1], 10);
            }
          }
          
          const shieldPercent = repCount * 5;
          const isMaxRep = repCount === 10;

          setTimeout(() => {
            const logsToAdd = [
              `😤 **${actor.name}** thu hồi ${repCount} cộng dồn Rep, tích lũy lớp giáp tạ xích hấp thụ ${shieldPercent}% Max HP!`
            ];
            if (isMaxRep) {
              logsToAdd.push(`⚡ **${actor.name}** đạt tối đa cộng dồn Rep, kích hoạt trạng thái **Khóa Khớp (2 lượt)**, phản hồi 30% sát thương!`);
            }
            logsToAdd.push(`🎯 Khiêu khích toàn bộ kẻ địch hàng trước: **Taunted (2 lượt)**!`);
            this.narrativeLogs.update(logs => [...logs, ...logsToAdd]);
          }, 0);

          updatedHeroes = updatedHeroes.map(h => {
            let statusEffects = h.statusEffects || [];
            if (h.id === actor.id) {
              statusEffects = statusEffects.filter(e => !e.startsWith('Deadlift Shield') && !e.startsWith('Khóa Khớp') && !e.startsWith('Rep:'));
              statusEffects.push('Deadlift Shield (2 lượt)');
              if (isMaxRep) {
                statusEffects.push('Khóa Khớp (2 lượt)');
              }
            }
            if (enemyTargets.includes(h.id) && h.hp > 0) {
              statusEffects = statusEffects.filter(e => !e.startsWith('Taunted'));
              statusEffects.push('Taunted (2 lượt)');
            }
            return { ...h, statusEffects };
          });
        }

        // Redirect damage from Quà Bảo Kê to Noel (ID 9)
        if (log.skillId !== 'WINTER_NIGHT_BLESSINGS') {
          enemyTargets.forEach(id => {
            const h = allHeroes.find(hero => hero.id === id);
            if (h && h.statusEffects?.some(e => e.startsWith('Quà Bảo Kê')) && h.id !== 9) {
              const noel = updatedHeroes.find(hero => hero.id === 9 && hero.hp > 0);
              if (noel) {
                const redirectedDamage = log.damage - Math.floor(log.damage * 0.5);
                let finalNoelDamage = redirectedDamage;
                if (noel.statusEffects?.some(e => e.startsWith('Da Thịt Vững Chãi'))) {
                  finalNoelDamage = Math.floor(redirectedDamage * 0.6);
                }
                updatedHeroes = updatedHeroes.map(hero => {
                  if (hero.id === 9) {
                    const nextHp = Math.max(0, hero.hp - finalNoelDamage);
                    return { ...hero, hp: nextHp };
                  }
                  return hero;
                });
                setTimeout(() => {
                  this.narrativeLogs.update(logs => [
                    ...logs,
                    `🔗 **Quà Bảo Kê** chuyển hướng ${redirectedDamage} sát thương từ **${h.name}** sang **${noel.name}** (Noel nhận ${finalNoelDamage} sát thương sau giảm trừ)!`
                  ]);
                }, 0);
              }
            }
          });
        }

        // Handle damage reflection for Khóa Khớp in Phase 2
        if (log.skillId !== 'WINTER_NIGHT_BLESSINGS') {
          enemyTargets.forEach(id => {
            const h = allHeroes.find(hero => hero.id === id);
            if (h && h.statusEffects?.some(e => e.startsWith('Khóa Khớp'))) {
              // Attacker is actor. Apply reflection damage (30% of log.damage) to actor
              const reflectedDamage = Math.floor(log.damage * 0.3);
              updatedHeroes = updatedHeroes.map(hero => {
                if (hero.id === actor.id) {
                  const nextHp = Math.max(0, hero.hp - reflectedDamage);
                  return { ...hero, hp: nextHp };
                }
                return hero;
              });
              setTimeout(() => {
                this.narrativeLogs.update(logs => [
                  ...logs,
                  `⚡ **${h.name}** kích hoạt Khóa Khớp, phản hồi lại ${reflectedDamage} sát thương phép phản hồi lên **${actor.name}**!`
                ]);
              }, 0);
            }
          });
        }

        if (log.skillId === 'DARK_KNOWLEDGE_SHIELD_CONVERSION') {
          updatedHeroes = updatedHeroes.map(h => {
            if (h.id === actor.id) {
              const currentEffects = h.statusEffects || [];
              if (!currentEffects.includes('Giáp Hư Không')) {
                return { ...h, statusEffects: [...currentEffects, 'Giáp Hư Không'] };
              }
            }
            return h;
          });
        }

        if (log.skillId === 'TACTICAL_AIR_STRIKE') {
          updatedHeroes = updatedHeroes.map(h => {
            if (enemyTargets.includes(h.id) && h.hp > 0) {
              const currentEffects = h.statusEffects || [];
              if (!currentEffects.includes('Đánh Dấu')) {
                // Run outside map or keep side effect inside, but since this is mock logic, updating narrativeLogs signal is fine.
                setTimeout(() => {
                  this.narrativeLogs.update(logs => [...logs, `🎯 **${h.name}** đã bị nhắm bắn & **Đánh Dấu**!`]);
                }, 0);
                return { ...h, statusEffects: [...currentEffects, 'Đánh Dấu'] };
              }
            }
            return h;
          });
        }

        if (log.skillId === 'DOI_NGOI_DAU_DOC') {
          if (enemyTargets.length >= 2) {
            const t1 = updatedHeroes.find(h => h.id === enemyTargets[0]);
            const t2 = updatedHeroes.find(h => h.id === enemyTargets[1]);
            if (t1 && t2) {
              const pos1 = t1.position;
              const pos2 = t2.position;
              updatedHeroes = updatedHeroes.map(h => {
                if (h.id === t1.id) return { ...h, position: pos2 };
                if (h.id === t2.id) return { ...h, position: pos1 };
                return h;
              });
              
              setTimeout(() => {
                this.narrativeLogs.update(logs => [
                  ...logs,
                  `🔄 **${t1.name}** và **${t2.name}** đã bị **Đổi Ngôi** hoán đổi vị trí!`
                ]);
              }, 0);
            }
          }

          updatedHeroes = updatedHeroes.map(h => {
            if (enemyTargets.includes(h.id) && h.hp > 0) {
              const currentEffects = h.statusEffects || [];
              if (!currentEffects.includes('Choáng Váng')) {
                setTimeout(() => {
                  this.narrativeLogs.update(logs => [
                    ...logs,
                    `💫 **${h.name}** bị choáng váng: Giảm 15% Tốc độ!`
                  ]);
                }, 0);
                return { ...h, statusEffects: [...currentEffects, 'Choáng Váng'] };
              }
            }
            return h;
          });
        }
        return updatedHeroes;
      });

      // If any target absorbed damage, log it in the narrative!
      targetsWithShield.forEach(id => {
        const targetHero = this.heroes().find(h => h.id === id);
        if (targetHero) {
          this.narrativeLogs.update(logs => [
            ...logs,
            `🛡️ **Giáp Hư Không** của **${targetHero.name}** đã hấp thụ toàn bộ ${log.damage} sát thương!`
          ]);
        }
      });

      // Trigger Floating Damage Text for all targets
      this.damageEvents.update(events => {
        const nextEvents = { ...events };
        enemyTargets.forEach(id => {
          if (log.skillId === 'WINTER_NIGHT_BLESSINGS') {
            const healAmount = Math.floor(actor.maxHp * 0.30);
            nextEvents[id] = {
              text: `+${healAmount}`,
              isCrit: false,
              key: this.damageEventCounter++
            };
          } else {
            const targetHero = this.heroes().find(hero => hero.id === id);
            const hasShield = targetsWithShield.includes(id) || targetHero?.statusEffects?.some(e => e.startsWith('Deadlift Shield')) || false;
            let finalDmg = log.damage;
            if (targetHero && targetHero.statusEffects?.some(e => e.startsWith('Quà Bảo Kê'))) {
              finalDmg = Math.floor(log.damage * 0.5);
            }
            if (targetHero && targetHero.statusEffects?.some(e => e.startsWith('Da Thịt Vững Chãi'))) {
              finalDmg = Math.floor(finalDmg * 0.6);
            }
            nextEvents[id] = {
              text: hasShield ? 'HẤP THỤ' : `-${finalDmg}${log.isCrit ? '!' : ''}`,
              isCrit: hasShield ? false : log.isCrit,
              key: this.damageEventCounter++
            };
          }
        });

        // Noel redirected damage floating text
        if (log.skillId !== 'WINTER_NIGHT_BLESSINGS') {
          enemyTargets.forEach(id => {
            const h = this.heroes().find(hero => hero.id === id);
            if (h && h.statusEffects?.some(e => e.startsWith('Quà Bảo Kê')) && h.id !== 9) {
              const noel = this.heroes().find(hero => hero.id === 9 && hero.hp > 0);
              if (noel) {
                const redirectedDamage = log.damage - Math.floor(log.damage * 0.5);
                let finalNoelDamage = redirectedDamage;
                if (noel.statusEffects?.some(e => e.startsWith('Da Thịt Vững Chãi'))) {
                  finalNoelDamage = Math.floor(redirectedDamage * 0.6);
                }
                nextEvents[9] = {
                  text: `-${finalNoelDamage}`,
                  isCrit: false,
                  key: this.damageEventCounter++
                };
              }
            }
          });
        }

        // Khóa Khớp reflection floating text on attacker (actor.id)
        if (log.skillId !== 'WINTER_NIGHT_BLESSINGS') {
          enemyTargets.forEach(id => {
            const h = this.heroes().find(hero => hero.id === id);
            if (h && h.statusEffects?.some(e => e.startsWith('Khóa Khớp'))) {
              const reflectedDamage = Math.floor(log.damage * 0.3);
              nextEvents[actor.id] = {
                text: `-${reflectedDamage}`,
                isCrit: false,
                key: this.damageEventCounter++
              };
            }
          });
        }
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
            nextEvents[9] = null; // Also clear Noel's floating redirected damage
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

          // Handle Fatal All-In Directive gamble outcome
          if (log.skillId === 'FATAL_ALL_IN_DIRECTIVE') {
            this.heroes.update(allHeroes => {
              return allHeroes.map(h => {
                if (h.id === actor.id) {
                  const currentEffects = h.statusEffects || [];
                  if (hasKilled) {
                    const nextEffects = [...currentEffects.filter(e => e !== 'Bankruptcy_2' && e !== 'Bankruptcy_1' && e !== 'Silent' && e !== 'DEF -50%'), 'Jackpot', 'ATK Buff +50%'];
                    setTimeout(() => {
                      this.narrativeLogs.update(logs => [
                        ...logs,
                        `🎰 **JACKPOT!** **${h.name}** thắng cược! Hồi 100% HP và nhận buff +50% Tấn công!`
                      ]);
                    }, 0);
                    return { ...h, hp: h.maxHp, statusEffects: nextEffects };
                  } else {
                    const nextEffects = [...currentEffects.filter(e => e !== 'Jackpot' && e !== 'ATK Buff +50%'), 'Bankruptcy_2', 'Silent', 'DEF -50%'];
                    setTimeout(() => {
                      this.narrativeLogs.update(logs => [
                        ...logs,
                        `📉 **PHÁ SẢN!** **${h.name}** thua cược! Bị cấm thuật (Silence) và giảm 50% Phòng thủ trong 2 lượt!`
                      ]);
                    }, 0);
                    return { ...h, statusEffects: nextEffects };
                  }
                }
                return h;
              });
            });
          }



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

    if (targetType === 'friendly_all') {
      enemyTargets = this.heroes()
        .filter(h => h.team === actor.team && h.hp > 0)
        .map(h => h.id);
    } else if (targetType === 'single') {
      enemyTargets = [target.id];
    } else if (targetType === 'all' || targetType === 'aoe_all') {
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
    } else if (targetType === 'random_4') {
      const aliveEnemies = this.heroes().filter(h => h.team === enemyTeam && h.hp > 0);
      const shuffled = [...aliveEnemies].sort(() => 0.5 - Math.random());
      enemyTargets = shuffled.slice(0, 4).map(h => h.id);
      if (enemyTargets.length === 0) {
        enemyTargets = [target.id];
      }
    } else if (targetType === 'front_and_back') {
      const front = this.heroes().find(h => h.team === enemyTeam && h.hp > 0 && [1, 3, 5].includes(h.position));
      const back = this.heroes().find(h => h.team === enemyTeam && h.hp > 0 && [2, 4].includes(h.position));
      enemyTargets = [];
      if (front) enemyTargets.push(front.id);
      if (back) enemyTargets.push(back.id);
      if (enemyTargets.length === 0) {
        enemyTargets = [target.id];
      }
    }
    return enemyTargets;
  }
}
