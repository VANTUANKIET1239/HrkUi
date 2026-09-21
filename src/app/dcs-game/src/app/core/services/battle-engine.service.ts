import { Injectable, signal, computed } from '@angular/core';
import { Hero } from '../models/hero.model';
import { BattleLog } from '../models/battle-log.model';
import { SKILL_LIST, INITIAL_HEROES } from '../../features/battle/mocks/mock-battle.data';
import { Skill, TargetRangeType } from '../models/skill.model';
import { BattleEventDto, StartBattleResultDto } from '../models/battle.model';

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
  readonly currentSkillCategory = signal<'basic' | 'ultimate'>('basic');
  readonly battlePhase = signal<'idle' | 'cast' | 'impact' | 'status' | 'recovery'>('idle');

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

  readonly isActorTeamRight = computed(() => {
    return this.activeActor()?.team === 'right';
  });

  private allLogs: BattleLog[] = [];
  private serverEvents: BattleEventDto[] = [];
  private serverEventIndex = -1;
  private currentTimeout: any = null;
  private visualTimeouts: ReturnType<typeof setTimeout>[] = [];
  private damageEventCounter = 0;
  private serverSkillMetadata = new Map<string, any>();

  constructor() {
    this.resetBattle();
  }

  resetBattle(): void {
    if (this.currentTimeout) {
      clearTimeout(this.currentTimeout);
      this.currentTimeout = null;
    }
    this.visualTimeouts.forEach(timeout => clearTimeout(timeout));
    this.visualTimeouts = [];

    this.serverEvents = [];
    this.serverEventIndex = -1;
    // Never silently show mock combatants in the server-authoritative flow.
    this.heroes.set([]);
    this.allLogs = [];
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
    this.serverSkillMetadata.clear();
    this.battlePhase.set('idle');
  }

  /** Initializes an authoritative replay. All HP/energy values come from backend events. */
  loadServerBattle(battle: StartBattleResultDto): void {
    if (this.currentTimeout) clearTimeout(this.currentTimeout);
    this.visualTimeouts.forEach(timeout => clearTimeout(timeout));
    this.visualTimeouts = [];
    this.serverSkillMetadata.clear();
    const mapHero = (h: any, team: 'left' | 'right'): Hero => ({
      id: team === 'left' ? h.id : -h.id,
      heroTemplateId: h.heroTemplateId 
        ?? INITIAL_HEROES.find(ih => ih.name === h.name || ih.avatar === h.avatar)?.heroTemplateId 
        ?? INITIAL_HEROES.find(ih => ih.name === h.name || ih.avatar === h.avatar)?.id,
      heroCode: h.heroCode,
      name: h.name,
      avatar: h.avatar,
      hp: h.stats.hp,
      maxHp: h.stats.hp,
      mana: 0,
      maxMana: 100,
      attack: h.stats.atk,
      defense: h.stats.def,
      speed: h.stats.spd,
      power: h.power,
      magicDamage: h.stats.magicDamage,
      magicResistance: h.stats.magicResistance,
      position: h.position ?? 1,
      team,
      statusEffects: [],
      battleStatuses: [],
      skills: (h.skills ?? []).map((s: any) => s.id),
      defaultFacing: h.defaultFacing 
        ?? INITIAL_HEROES.find(ih => ih.name === h.name || ih.avatar === h.avatar)?.defaultFacing 
        ?? 'right',
      stars: Math.max(0, Math.min(5, h.stars ?? INITIAL_HEROES.find(ih => ih.name === h.name || ih.avatar === h.avatar)?.stars ?? 1)),
      auraTier: h.auraTier,
      starAura: h.starAura ?? null
    });
    [...battle.initialState.leftTeam, ...battle.initialState.rightTeam]
      .flatMap(hero => hero.skills ?? [])
      .forEach(skill => this.serverSkillMetadata.set(skill.id, skill));
    this.heroes.set([
      ...battle.initialState.leftTeam.map(h => mapHero(h, 'left')),
      ...battle.initialState.rightTeam.map(h => mapHero(h, 'right'))
    ]);
    this.serverEvents = [...battle.events].sort((a, b) => a.sequence - b.sequence);
    this.serverEventIndex = -1;
    this.allLogs = [];
    this.currentTurn.set(0);
    this.currentLogIndex.set(-1);
    this.status.set('idle');
    this.narrativeLogs.set([]);
    this.activeActorId.set(null);
    this.activeTargetId.set(null);
    this.activeTargetIds.set([]);
    this.damageEvents.set({});
    this.battlePhase.set('idle');
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
    if (this.serverEvents.length > 0 && (this.status() === 'idle' || this.status() === 'paused')) {
      this.status.set('playing');
      this.playNextServerEvent();
      return;
    }
    if (this.status() === 'idle') {
      this.status.set('playing');
      this.narrativeLogs.update(logs => [...logs, '🗡️ Trận đấu bắt đầu!']);
      this.playNextLog();
    } else if (this.status() === 'paused') {
      this.status.set('playing');
      this.playNextLog();
    }
  }

  private playNextServerEvent(): void {
    if (this.status() !== 'playing') return;
    const event = this.serverEvents[++this.serverEventIndex];
    if (!event) { this.finishBattle(); return; }
    this.currentTurn.set(event.turn);
    if ((event.eventType === 'TURN_START' || event.eventType === 'SKILL_CAST') && event.actorId != null)
      this.activeActorId.set(event.actorId);
    if (event.eventType === 'SKILL_CAST' && event.skillId) {
      const metadata = this.serverSkillMetadata.get(event.skillId);
      const mockSkill = SKILL_LIST[event.skillId];
      this.currentSkillId.set(event.skillId);
      this.currentSkillName.set(metadata?.name ?? mockSkill?.name ?? event.skillId);
      this.currentSkillColor.set(mockSkill?.color ?? '#fbbf24');
      this.currentSkillCategory.set((metadata?.skillTypeCode ?? 'NORMAL') === 'ENERGY' ? 'ultimate' : 'basic');
    }
    this.battlePhase.set(this.toBattlePhase(event.phaseCode));

    if (event.targetId != null && ['DAMAGE', 'HEAL', 'STATUS_APPLIED', 'SHIELD_APPLIED', 'POSITION_CHANGED'].includes(event.eventType)) {
      const phaseTargets = this.serverEvents
        .filter(e => e.castSequence === event.castSequence && e.phaseCode === event.phaseCode && e.targetId != null)
        .map(e => e.targetId!)
        .filter((id, index, all) => all.indexOf(id) === index);
      this.activeTargetIds.set(phaseTargets.length > 1 ? phaseTargets : []);
      this.activeTargetId.set(phaseTargets.length === 1 ? phaseTargets[0] : null);
    }

    if (event.eventType === 'DAMAGE' || event.eventType === 'HEAL') {
      this.heroes.update(heroes => heroes.map(h => h.id === event.targetId && event.hpAfter != null
        ? { ...h, hp: event.hpAfter }
        : h));
      if (event.targetId != null) {
        const damageKey = this.damageEventCounter++;
        this.damageEvents.update(items => ({
          ...items, [event.targetId!]: {
            text: event.eventType === 'HEAL' ? `+${event.value}` : `-${event.value}${event.isCrit ? '!' : ''}`,
            isCrit: event.isCrit,
            key: damageKey
          }
        }));
        this.scheduleCombatTextClear(event.targetId, damageKey);
      }
    } else if (event.eventType === 'ENERGY_CHANGED' && event.targetId != null && event.energyAfter != null) {
      this.heroes.update(heroes => heroes.map(h => h.id === event.targetId ? { ...h, mana: event.energyAfter! } : h));
    } else if (event.eventType === 'DEATH' && event.targetId != null) {
      this.heroes.update(heroes => heroes.map(h => h.id === event.targetId
        ? { ...h, hp: 0, statusEffects: [...(h.statusEffects ?? []), 'Dead'] }
        : h));
    } else if ((event.eventType === 'STATUS_APPLIED' || event.eventType === 'SHIELD_APPLIED') &&
      event.targetId != null && event.effectTypeCode) {
      const skill = event.skillId ? this.serverSkillMetadata.get(event.skillId) : null;
      const effect = skill?.effects?.find((item: any) =>
        item.effectTypeCode?.toUpperCase() === event.effectTypeCode?.toUpperCase());
      const status = this.createBattleStatus(event, effect);
      this.heroes.update(heroes => heroes.map(h => h.id === event.targetId
        ? {
          ...h,
          statusEffects: [...new Set([...(h.statusEffects ?? []), event.effectTypeCode!])],
          battleStatuses: [
            ...(h.battleStatuses ?? []).filter(item => item.instanceId !== status.instanceId),
            status
          ]
        }
        : h));
    } else if (event.eventType === 'STATUS_UPDATED' && event.targetId != null && event.effectTypeCode) {
      this.heroes.update(heroes => heroes.map(h => h.id === event.targetId
        ? {
          ...h, battleStatuses: (h.battleStatuses ?? []).map(status => status.code === event.effectTypeCode
            ? { ...status, remainingTurns: event.remainingTurns ?? status.remainingTurns }
            : status)
        }
        : h));
    } else if (event.eventType === 'STATUS_EXPIRED' && event.targetId != null && event.effectTypeCode) {
      this.heroes.update(heroes => heroes.map(h => h.id === event.targetId
        ? {
          ...h,
          statusEffects: (h.statusEffects ?? []).filter(code => code !== event.effectTypeCode),
          battleStatuses: (h.battleStatuses ?? []).filter(status => status.code !== event.effectTypeCode)
        }
        : h));
    } else if (event.eventType === 'SHIELD_ABSORBED' && event.targetId != null) {
      this.heroes.update(heroes => heroes.map(h => h.id === event.targetId
        ? {
          ...h, battleStatuses: (h.battleStatuses ?? []).map(status => status.code === 'SHIELD'
            ? { ...status, value: Math.max(0, status.value - event.value) }
            : status)
        }
        : h));
    } else if (event.eventType === 'POSITION_CHANGED' && event.targetId != null) {
      this.heroes.update(heroes => heroes.map(h => h.id === event.targetId ? { ...h, position: event.value } : h));
    } else if (event.eventType === 'BATTLE_END') {
      this.finishBattle();
      return;
    }

    const nextEvent = this.serverEvents[this.serverEventIndex + 1];
    const sameCast = event.castSequence != null && nextEvent?.castSequence === event.castSequence;
    const timelineDelay = sameCast
      ? Math.max(20, (nextEvent.timelineOffsetMs ?? 0) - (event.timelineOffsetMs ?? 0))
      : 160;
    const delay = timelineDelay;
    this.currentTimeout = setTimeout(() => {
      if (event.eventType === 'TURN_END') {
        this.activeActorId.set(null);
        this.activeTargetId.set(null);
        this.currentSkillId.set(null);
        this.currentSkillName.set(null);
        this.currentSkillCategory.set('basic');
        this.battlePhase.set('idle');
        this.activeTargetIds.set([]);
      }
      this.playNextServerEvent();
    }, delay / this.speed());
  }

  private scheduleCombatTextClear(heroId: number, eventKey: number): void {
    const timeout = setTimeout(() => {
      this.damageEvents.update(items => items[heroId]?.key === eventKey
        ? { ...items, [heroId]: null }
        : items);
      this.visualTimeouts = this.visualTimeouts.filter(item => item !== timeout);
    }, 1250 / this.speed());
    this.visualTimeouts.push(timeout);
  }

  private toBattlePhase(phaseCode?: string | null): 'idle' | 'cast' | 'impact' | 'status' | 'recovery' {
    switch ((phaseCode ?? '').toUpperCase()) {
      case 'CAST': return 'cast';
      case 'IMPACT': return 'impact';
      case 'STATUS': return 'status';
      case 'RECOVERY': return 'recovery';
      default: return 'idle';
    }
  }

  private createBattleStatus(event: BattleEventDto, effect: any): import('../models/hero.model').BattleStatusEffectViewModel {
    const code = event.effectTypeCode!.toUpperCase();
    const controls = ['STUN', 'SILENCE', 'TAUNT'];
    const debuffs = ['MARK', 'STAT_DEBUFF'];
    const fallbackIcons: Record<string, string> = {
      STUN: '/assets/images/dcs-game/effects/stun.png',
      SHIELD: '/assets/images/dcs-game/effects/shield.png',
      MARK: '/assets/images/dcs-game/effects/mark.png',
      SILENCE: '/assets/images/dcs-game/effects/silence.png',
      DAMAGE_REDUCTION: '/assets/images/dcs-game/effects/damage-reduction.png',
      TAUNT: '/assets/images/dcs-game/effects/taunt.png',
      DAMAGE_REFLECTION: '/assets/images/dcs-game/effects/damage-reflection.png',
      STAT_BUFF: '/assets/images/dcs-game/effects/stat-buff.png',
      STAT_DEBUFF: '/assets/images/dcs-game/effects/stat-debuff.png'
    };
    const fallbackNames: Record<string, string> = {
      STUN: 'Choáng', SHIELD: 'Khiên', MARK: 'Đánh dấu', SILENCE: 'Câm lặng',
      DAMAGE_REDUCTION: 'Giảm sát thương', TAUNT: 'Khiêu khích',
      DAMAGE_REFLECTION: 'Phản sát thương', STAT_BUFF: 'Tăng thuộc tính',
      STAT_DEBUFF: 'Giảm thuộc tính'
    };
    const fallbackDescriptions: Record<string, string> = {
      STUN: 'Không thể hành động trong lượt.',
      TAUNT: 'Bị buộc ưu tiên tấn công người đã gây Khiêu Khích.'
    };
    return {
      instanceId: `${event.actorId}:${event.skillId}:${code}:${event.targetId}`,
      code,
      name: effect?.effectTypeName ?? fallbackNames[code] ?? code,
      description: effect?.effectDescription ?? fallbackDescriptions[code] ?? null,
      iconPath: effect?.effectImagePath ?? fallbackIcons[code] ?? fallbackIcons['STAT_DEBUFF'],
      colorHex: effect?.effectColorHex ?? (debuffs.includes(code) ? '#ef4444' : '#22c55e'),
      category: controls.includes(code) ? 'CONTROL' : debuffs.includes(code) ? 'DEBUFF' :
        effect?.isBeneficial === false ? 'SPECIAL' : 'BUFF',
      value: event.value ?? 0,
      remainingTurns: event.remainingTurns ?? 0,
      stacks: 1,
      modifiers: (effect?.statModifiers ?? []).map((modifier: any) => ({
        attributeCode: modifier.attributeTypeCode,
        attributeName: modifier.attributeTypeName,
        valueType: modifier.valueType,
        value: modifier.value
      })),
      sourceSkillId: event.skillId
    };
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

    if (!actor || actor.hp <= 0) {
      // A defeated hero must never receive an action, even if a malformed
      // replay log still contains a turn for them.
      this.playNextLog();
      return;
    }

    if (!target || target.hp <= 0) {
      // A replay log points at the resolved target at battle-generation time.
      // Do not animate an attack against a target that has already been defeated.
      this.playNextLog();
      return;
    }

    // 1. Decrement or clear status effects at start of actor's turn (data-driven turn countdown)
    this.heroes.update(allHeroes => {
      return allHeroes.map(h => {
        if (h.id === actor.id) {
          const rawEffects = h.statusEffects || [];
          const nextEffects: string[] = [];
          const expiringEffects: string[] = [];

          for (const eff of rawEffects) {
            // Check turn pattern: "EffectName (N lượt)" or "EffectName (N turns)"
            const turnMatch = eff.match(/^(.*?)\s*\((\d+)\s*(?:lượt|turns?)\)$/i);
            if (turnMatch) {
              const baseName = turnMatch[1].trim();
              const turns = parseInt(turnMatch[2], 10);
              if (turns > 1) {
                nextEffects.push(`${baseName} (${turns - 1} lượt)`);
              } else {
                expiringEffects.push(baseName);
              }
              continue;
            }

            // Check numbered phase pattern: "EffectName_2" -> "EffectName_1"
            const phaseMatch = eff.match(/^(.*?)_(\d+)$/);
            if (phaseMatch) {
              const baseName = phaseMatch[1];
              const phase = parseInt(phaseMatch[2], 10);
              if (phase > 1) {
                nextEffects.push(`${baseName}_${phase - 1}`);
              } else {
                expiringEffects.push(baseName);
              }
              continue;
            }

            // Single-turn standalone buffs like 'Jackpot'
            if (eff === 'Jackpot') {
              expiringEffects.push(eff);
              continue;
            }

            nextEffects.push(eff);
          }

          // Clean up secondary effects tied to expiring buffs/debuffs
          let cleanedEffects = nextEffects;
          if (expiringEffects.includes('Jackpot')) {
            cleanedEffects = cleanedEffects.filter(e => e !== 'ATK Buff +50%');
          }
          if (expiringEffects.includes('Bankruptcy') || expiringEffects.includes('Phá Sản')) {
            cleanedEffects = cleanedEffects.filter(e => e !== 'Silent' && e !== 'DEF -50%');
          }

          // Rep / stack increment on action if character has a stacking effect (e.g. 'Rep: X')
          const repIndex = cleanedEffects.findIndex(e => e.startsWith('Rep:'));
          if (repIndex !== -1) {
            const repMatch = cleanedEffects[repIndex].match(/Rep:\s*(\d+)/);
            let repCount = repMatch ? parseInt(repMatch[1], 10) : 0;
            repCount = Math.min(10, repCount + 1);
            cleanedEffects[repIndex] = `Rep: ${repCount}`;
            setTimeout(() => {
              this.narrativeLogs.update(logs => [
                ...logs,
                `🏋️ **${h.name}** bắt đầu hành động, tích lũy thêm 1 tầng Rep (${repCount}/10)!`
              ]);
            }, 0);
          }

          if (expiringEffects.length > 0) {
            setTimeout(() => {
              expiringEffects.forEach(eff => {
                this.narrativeLogs.update(logs => [...logs, `✨ Hiệu ứng **${eff}** của **${h.name}** đã hết tác dụng.`]);
              });
            }, 0);
          }

          return { ...h, statusEffects: cleanedEffects };
        }
        return h;
      });
    });

    const speedMultiplier = this.speed();
    const { phase1Duration, phase2Duration, phase3Duration } = this.getBattleSpeeds(speedMultiplier, log.skillId);

    // Get Skill Information from Data-Driven catalog
    const skillDetail = SKILL_LIST[log.skillId] || {
      id: log.skillId,
      name: 'Đánh Thường',
      cost: 0,
      costType: 'MP',
      category: 'basic',
      color: '#aaaaaa',
      type: 'physical',
      description: 'Đòn đánh thường',
      damageMultiplier: 1.0,
      effects: [
        {
          effectTypeCode: 'DAMAGE',
          effectTypeName: 'Sát thương vật lý',
          targetTypeCode: 'ENEMY_SINGLE',
          damageSchoolCode: 'PHYSICAL',
          scalings: [{ attributeTypeCode: 'ATK', attributeTypeName: 'Công', coefficient: 1.0, flatValue: 0 }]
        }
      ]
    };
    this.currentSkillColor.set(skillDetail.color || '#ffffff');
    this.currentSkillName.set(skillDetail.name);
    this.currentSkillId.set(log.skillId);

    // Determine Target Range Type from Skill Effects or definition
    const targetType = (skillDetail.targetType as TargetRangeType) || (skillDetail.isAoE ? 'all' : 'single');
    const enemyTargets: number[] = this.getEnemyTargets(target, actor, targetType);
    const isMultipleTargets = enemyTargets.length > 1;

    // 1. PHASE 1: Actor dashes forward, skill visual triggers
    this.activeActorId.set(actor.id);

    // Data-driven HP Sacrifice (e.g. skills with HP_SACRIFICE effect)
    const sacrificeEffect = skillDetail.effects?.find(e => e.effectTypeCode === 'HP_SACRIFICE');
    if (sacrificeEffect) {
      const sacrificePercent = sacrificeEffect.baseValue || 50;
      this.heroes.update(allHeroes => {
        return allHeroes.map(h => {
          if (h.id === actor.id) {
            const sacrificedHp = Math.floor(h.hp * (sacrificePercent / 100));
            const nextHp = Math.max(1, h.hp - sacrificedHp);
            setTimeout(() => {
              this.narrativeLogs.update(logs => [
                ...logs,
                `💸 **${h.name}** thi triển **${skillDetail.name}**! Tự tiêu hao ${sacrificePercent}% HP hiện tại (-${sacrificedHp} HP)!`
              ]);
            }, 0);
            return { ...h, hp: nextHp };
          }
          return h;
        });
      });
    }

    // Defer target highlighting for heavy slam/jump skills (e.g. phase1 >= 1800ms)
    const deferTargetHighlight = (skillDetail.phase1Duration || 0) >= 1800;
    if (deferTargetHighlight) {
      this.activeTargetIds.set([]);
      this.activeTargetId.set(null);
    } else if (isMultipleTargets) {
      this.activeTargetIds.set(enemyTargets);
      this.activeTargetId.set(null);
    } else {
      this.activeTargetId.set(enemyTargets[0] || target.id);
      this.activeTargetIds.set([]);
    }

    // Add entry in Narrative Log based on data-driven effects
    const critText = log.isCrit ? ' 💥 CHÍ MẠNG' : '';
    let targetDesc = '';
    if (targetType === 'friendly_all') targetDesc = 'TOÀN BỘ ĐỒNG ĐỘI';
    else if (targetType === 'friendly_random') targetDesc = 'MỘT ĐỒNG ĐỘI NGẪU NHIÊN';
    else if (targetType === 'all') targetDesc = 'TOÀN BỘ ĐỘI HÌNH địch';
    else if (targetType === 'front_row') targetDesc = 'HÀNG TRƯỚC địch';
    else if (targetType === 'back_row') targetDesc = 'HÀNG SAU địch';
    else if (targetType === 'same_lane_back_row') targetDesc = 'hàng sau cùng làn';
    else if (targetType === 'linear') targetDesc = 'ĐƯỜNG THẲNG đối diện';
    else targetDesc = `**${target.name}**`;

    const hasHealEffect = skillDetail.effects?.some(e => e.effectTypeCode === 'HEAL');
    const hasShieldEffect = skillDetail.effects?.some(e => e.effectTypeCode === 'SHIELD');
    const hasDamageEffect = skillDetail.effects?.some(e => e.effectTypeCode === 'DAMAGE');

    let skillLog = '';
    if (hasHealEffect && !hasDamageEffect) {
      skillLog = `[Lượt ${log.turn}] **${actor.name}** dùng **${skillDetail.name}** hồi máu và hỗ trợ ${targetDesc}!`;
    } else if (hasDamageEffect && hasShieldEffect) {
      skillLog = `[Lượt ${log.turn}] **${actor.name}** dùng **${skillDetail.name}** tấn công ${targetDesc}, gây ${log.damage} sát thương và tích lũy giáp bảo hộ!`;
    } else {
      skillLog = isMultipleTargets
        ? `[Lượt ${log.turn}] **${actor.name}** dùng **${skillDetail.name}** tấn công ${targetDesc}, gây ${log.damage} sát thương${critText} cho mỗi mục tiêu!`
        : `[Lượt ${log.turn}] **${actor.name}** dùng **${skillDetail.name}** tấn công ${targetDesc}, gây ${log.damage} sát thương${critText}!`;
    }
    this.narrativeLogs.update(logs => [...logs, skillLog]);

    // Update Actor's Energy/Mana (consume on energy skill, gain +25 on normal attack)
    const effectiveCost = skillDetail.energyCost !== undefined ? skillDetail.energyCost : (skillDetail.cost || 0);
    this.heroes.update(allHeroes => {
      return allHeroes.map(h => {
        if (h.id === actor.id) {
          let newMana = h.mana;
          if (effectiveCost > 0) {
            newMana = Math.max(0, h.mana - effectiveCost);
          } else {
            newMana = Math.min(h.maxMana, h.mana + 25);
          }
          return { ...h, mana: newMana };
        }
        return h;
      });
    });

    this.currentTimeout = setTimeout(() => {
      // If target highlight was deferred, apply it now at phase 2 impact
      if (deferTargetHighlight) {
        if (isMultipleTargets) {
          this.activeTargetIds.set(enemyTargets);
          this.activeTargetId.set(null);
        } else {
          this.activeTargetId.set(enemyTargets[0] || target.id);
          this.activeTargetIds.set([]);
        }
      }

      // Check which targets have an active shield
      const targetsWithShield = enemyTargets.filter(id => {
        const h = this.heroes().find(hero => hero.id === id);
        return h?.statusEffects?.some(e => e.includes('Shield') || e.includes('Giáp')) || false;
      });

      // Data-driven effect types extraction
      const healEffect = skillDetail.effects?.find(e => e.effectTypeCode === 'HEAL');
      const damageEffect = skillDetail.effects?.find(e => e.effectTypeCode === 'DAMAGE');
      const shieldEffects = skillDetail.effects?.filter(e => e.effectTypeCode === 'SHIELD') || [];
      const tauntEffects = skillDetail.effects?.filter(e => e.effectTypeCode === 'TAUNT') || [];
      const markEffects = skillDetail.effects?.filter(e => e.effectTypeCode === 'MARK') || [];
      const swapEffect = skillDetail.effects?.find(e => e.effectTypeCode === 'POSITION_SWAP');
      const debuffEffects = skillDetail.effects?.filter(e => e.effectTypeCode === 'STAT_DEBUFF') || [];
      const reductionEffects = skillDetail.effects?.filter(e => e.effectTypeCode === 'DAMAGE_REDUCTION') || [];
      const reflectionEffects = skillDetail.effects?.filter(e => e.effectTypeCode === 'DAMAGE_REFLECTION') || [];

      // 2. PHASE 2: Target(s) take damage / heal, HP bar decreases, floating text appears
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
            // Case A: HEAL effect (targets are allies)
            if (healEffect && !damageEffect) {
              const coef = healEffect.scalings?.[0]?.coefficient || 0.30;
              const healAmount = Math.floor(actor.maxHp * coef);
              const nextHp = Math.min(h.maxHp, h.hp + healAmount);
              return { ...h, hp: nextHp };
            }

            // Case B: DAMAGE effect
            let statusEffects = h.statusEffects || [];

            // Target passive: If target has stacking 'Rep:', gain +1 on hit
            const repEffect = statusEffects.find(e => e.startsWith('Rep:'));
            if (repEffect) {
              let repCount = 0;
              const match = repEffect.match(/Rep:\s*(\d+)/);
              if (match) repCount = parseInt(match[1], 10);
              statusEffects = statusEffects.filter(e => !e.startsWith('Rep:'));
              repCount = Math.min(10, repCount + 1);
              statusEffects = [...statusEffects, `Rep: ${repCount}`];
              setTimeout(() => {
                this.narrativeLogs.update(logs => [
                  ...logs,
                  `🏋️ **${h.name}** bị tấn công, tích lũy thêm 1 tầng Rep (${repCount}/10)!`
                ]);
              }, 0);
            }

            const hasActiveShield = targetsWithShield.includes(h.id);
            if (hasActiveShield) {
              // Shield absorbs the damage! Consume single-instance shield or log absorption
              statusEffects = statusEffects.filter(e => e !== 'Giáp Hư Không');
              return { ...h, statusEffects };
            }

            // Calculate mitigated damage based on damage school
            const damageSchool = damageEffect?.damageSchoolCode || (skillDetail.type === 'magical' ? 'MAGIC' : 'PHYSICAL');
            let finalDamage = log.damage;

            if (damageSchool === 'MAGIC' && (h.magicResistance ?? 0) > 0) {
              // Magic damage mitigated by MagicResistance
              finalDamage = Math.max(1, Math.round(finalDamage * (100 / (100 + (h.magicResistance ?? 0) * 0.5))));
            }

            // Damage reduction buffs
            if (statusEffects.some(e => e.startsWith('Quà Bảo Kê'))) {
              finalDamage = Math.floor(finalDamage * 0.5);
            }
            if (statusEffects.some(e => e.startsWith('Da Thịt Vững Chãi'))) {
              finalDamage = Math.floor(finalDamage * 0.6);
            }

            const nextHp = Math.max(0, h.hp - finalDamage);
            return { ...h, hp: nextHp, statusEffects };
          }
          return h;
        });

        // Apply Damage Reduction Buffs (e.g. Quà Bảo Kê to allies, Da Thịt Vững Chãi to self)
        if (reductionEffects.length > 0) {
          reductionEffects.forEach(re => {
            const duration = re.durationTurns || 2;
            if (re.targetTypeCode === 'ALLY_RANDOM_2' || re.targetTypeCode === 'ALLY_ALL') {
              const teammates = updatedHeroes.filter(h => h.team === actor.team && h.hp > 0 && h.id !== actor.id);
              const shuffled = [...teammates].sort(() => 0.5 - Math.random());
              const selectedTeammates = shuffled.slice(0, 2);
              const selectedIds = selectedTeammates.map(h => h.id);

              if (selectedTeammates.length > 0) {
                const namesList = selectedTeammates.map(h => h.name).join(', ');
                setTimeout(() => {
                  this.narrativeLogs.update(logs => [
                    ...logs,
                    `🎁 **${re.effectTypeName || 'Quà Bảo Kê'}** đã được trao cho: **${namesList}**!`
                  ]);
                }, 0);
              }

              updatedHeroes = updatedHeroes.map(h => {
                if (selectedIds.includes(h.id)) {
                  let effs = h.statusEffects || [];
                  effs = effs.filter(e => !e.startsWith('Quà Bảo Kê'));
                  effs.push(`Quà Bảo Kê (${duration} lượt)`);
                  return { ...h, statusEffects: effs };
                }
                return h;
              });
            } else if (re.targetTypeCode === 'SELF') {
              setTimeout(() => {
                this.narrativeLogs.update(logs => [
                  ...logs,
                  `🛡️ **${actor.name}** kích hoạt **${re.effectTypeName || 'Da Thịt Vững Chãi'} (${duration} lượt)**, giảm ${re.baseValue || 40}% sát thương!`
                ]);
              }, 0);

              updatedHeroes = updatedHeroes.map(h => {
                if (h.id === actor.id) {
                  let effs = h.statusEffects || [];
                  effs = effs.filter(e => !e.startsWith('Da Thịt Vững Chãi'));
                  effs.push(`Da Thịt Vững Chãi (${duration} lượt)`);
                  return { ...h, statusEffects: effs };
                }
                return h;
              });
            }
          });
        }

        // Apply Shield Effects
        if (shieldEffects.length > 0) {
          shieldEffects.forEach(se => {
            const duration = se.durationTurns || 2;
            const actorBefore = this.heroes().find(hero => hero.id === actor.id);
            const repEffect = actorBefore?.statusEffects?.find(e => e.startsWith('Rep:'));
            let repCount = 0;
            if (repEffect) {
              const match = repEffect.match(/Rep:\s*(\d+)/);
              if (match) repCount = parseInt(match[1], 10);
            }
            const isMaxRep = repCount === 10;
            const shieldPercent = repCount > 0 ? repCount * 5 : 30;

            if (repCount > 0) {
              setTimeout(() => {
                const logsToAdd = [
                  `😤 **${actor.name}** giải phóng ${repCount} tầng Rep, tích lũy lớp giáp hấp thụ ${shieldPercent}% Max HP!`
                ];
                if (isMaxRep) {
                  logsToAdd.push(`⚡ **${actor.name}** đạt tối đa cộng dồn Rep, kích hoạt trạng thái **Khóa Khớp (2 lượt)**, phản hồi 30% sát thương!`);
                }
                this.narrativeLogs.update(logs => [...logs, ...logsToAdd]);
              }, 0);
            }

            updatedHeroes = updatedHeroes.map(h => {
              if (h.id === actor.id) {
                let effs = h.statusEffects || [];
                effs = effs.filter(e => !e.startsWith('Deadlift Shield') && !e.startsWith('Giáp Hư Không') && !e.startsWith('Rep:'));
                effs.push(se.effectTypeName ? `${se.effectTypeName} (${duration} lượt)` : `Giáp (${duration} lượt)`);
                if (isMaxRep) {
                  effs.push('Khóa Khớp (2 lượt)');
                }
                return { ...h, statusEffects: effs };
              }
              return h;
            });
          });
        }

        // Apply Taunt Effects
        if (tauntEffects.length > 0) {
          tauntEffects.forEach(te => {
            const duration = te.durationTurns || 2;
            setTimeout(() => {
              this.narrativeLogs.update(logs => [
                ...logs,
                `🎯 Khiêu khích toàn bộ mục tiêu: **Taunted (${duration} lượt)**!`
              ]);
            }, 0);

            updatedHeroes = updatedHeroes.map(h => {
              if (enemyTargets.includes(h.id) && h.hp > 0) {
                let effs = h.statusEffects || [];
                effs = effs.filter(e => !e.startsWith('Taunted'));
                effs.push(`Taunted (${duration} lượt)`);
                return { ...h, statusEffects: effs };
              }
              return h;
            });
          });
        }

        // Apply Mark Effects
        if (markEffects.length > 0) {
          markEffects.forEach(me => {
            const duration = me.durationTurns || 2;
            setTimeout(() => {
              this.narrativeLogs.update(logs => [
                ...logs,
                `🎯 Mục tiêu đã bị nhắm bắn & **Đánh Dấu (${duration} lượt)**!`
              ]);
            }, 0);

            updatedHeroes = updatedHeroes.map(h => {
              if (enemyTargets.includes(h.id) && h.hp > 0) {
                let effs = h.statusEffects || [];
                if (!effs.includes('Đánh Dấu')) {
                  effs.push(`Đánh Dấu (${duration} lượt)`);
                }
                return { ...h, statusEffects: effs };
              }
              return h;
            });
          });
        }

        // Apply Position Swap Effect
        if (swapEffect && enemyTargets.length >= 2) {
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

        // Apply Stat Debuff Effects (e.g. Slow, Armor Break)
        if (debuffEffects.length > 0) {
          debuffEffects.forEach(de => {
            const duration = de.durationTurns || 2;
            updatedHeroes = updatedHeroes.map(h => {
              if (enemyTargets.includes(h.id) && h.hp > 0) {
                let effs = h.statusEffects || [];
                const label = de.effectTypeName || 'Giảm Chỉ Số';
                effs.push(`${label} (${duration} lượt)`);
                setTimeout(() => {
                  this.narrativeLogs.update(logs => [
                    ...logs,
                    `💫 **${h.name}** trúng hiệu ứng: ${label}!`
                  ]);
                }, 0);
                return { ...h, statusEffects: effs };
              }
              return h;
            });
          });
        }

        // Redirect damage from Quà Bảo Kê to the protecting ally (e.g. teammate with Da Thịt Vững Chãi)
        if (!healEffect) {
          enemyTargets.forEach(id => {
            const h = allHeroes.find(hero => hero.id === id);
            if (h && h.statusEffects?.some(e => e.startsWith('Quà Bảo Kê'))) {
              const protector = updatedHeroes.find(hero =>
                hero.team === h.team &&
                hero.id !== h.id &&
                hero.hp > 0 &&
                hero.statusEffects?.some(e => e.startsWith('Da Thịt Vững Chãi'))
              );
              if (protector) {
                const redirectedDamage = log.damage - Math.floor(log.damage * 0.5);
                let finalProtectorDamage = redirectedDamage;
                if (protector.statusEffects?.some(e => e.startsWith('Da Thịt Vững Chãi'))) {
                  finalProtectorDamage = Math.floor(redirectedDamage * 0.6);
                }
                updatedHeroes = updatedHeroes.map(hero => {
                  if (hero.id === protector.id) {
                    const nextHp = Math.max(0, hero.hp - finalProtectorDamage);
                    return { ...hero, hp: nextHp };
                  }
                  return hero;
                });
                setTimeout(() => {
                  this.narrativeLogs.update(logs => [
                    ...logs,
                    `🔗 **Quà Bảo Kê** chuyển hướng ${redirectedDamage} sát thương từ **${h.name}** sang **${protector.name}** (${protector.name} nhận ${finalProtectorDamage} sát thương sau giảm trừ)!`
                  ]);
                }, 0);
              }
            }
          });
        }

        // Handle Damage Reflection (e.g. Khóa Khớp or DAMAGE_REFLECTION)
        if (!healEffect) {
          enemyTargets.forEach(id => {
            const h = allHeroes.find(hero => hero.id === id);
            if (h && h.statusEffects?.some(e => e.startsWith('Khóa Khớp') || e.startsWith('Phản Sát Thương'))) {
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
                  `⚡ **${h.name}** phản hồi lại ${reflectedDamage} sát thương phản đòn lên **${actor.name}**!`
                ]);
              }, 0);
            }
          });
        }

        return updatedHeroes;
      });

      // If any target absorbed damage, log it in narrative
      targetsWithShield.forEach(id => {
        const targetHero = this.heroes().find(h => h.id === id);
        if (targetHero) {
          this.narrativeLogs.update(logs => [
            ...logs,
            `🛡️ Lớp giáp bảo hộ của **${targetHero.name}** đã hấp thụ toàn bộ ${log.damage} sát thương!`
          ]);
        }
      });

      // Trigger Floating Damage Text for all targets
      this.damageEvents.update(events => {
        const nextEvents = { ...events };
        enemyTargets.forEach(id => {
          if (healEffect && !damageEffect) {
            const coef = healEffect.scalings?.[0]?.coefficient || 0.30;
            const healAmount = Math.floor(actor.maxHp * coef);
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

        // Floating text for redirected damage onto protector
        if (!healEffect) {
          enemyTargets.forEach(id => {
            const h = this.heroes().find(hero => hero.id === id);
            if (h && h.statusEffects?.some(e => e.startsWith('Quà Bảo Kê'))) {
              const protector = this.heroes().find(hero =>
                hero.team === h.team &&
                hero.id !== h.id &&
                hero.hp > 0 &&
                hero.statusEffects?.some(e => e.startsWith('Da Thịt Vững Chãi'))
              );
              if (protector) {
                const redirectedDamage = log.damage - Math.floor(log.damage * 0.5);
                let finalProtDamage = redirectedDamage;
                if (protector.statusEffects?.some(e => e.startsWith('Da Thịt Vững Chãi'))) {
                  finalProtDamage = Math.floor(redirectedDamage * 0.6);
                }
                nextEvents[protector.id] = {
                  text: `-${finalProtDamage}`,
                  isCrit: false,
                  key: this.damageEventCounter++
                };
              }
            }
          });
        }

        // Floating text for reflected damage on attacker (actor.id)
        if (!healEffect) {
          enemyTargets.forEach(id => {
            const h = this.heroes().find(hero => hero.id === id);
            if (h && h.statusEffects?.some(e => e.startsWith('Khóa Khớp') || e.startsWith('Phản Sát Thương'))) {
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
            nextEvents[actor.id] = null;
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

          // Data-driven Gamble on-kill resolution (for skills with HP_SACRIFICE)
          if (sacrificeEffect) {
            this.heroes.update(allHeroes => {
              return allHeroes.map(h => {
                if (h.id === actor.id) {
                  const currentEffects = h.statusEffects || [];
                  if (hasKilled) {
                    const nextEffects = [...currentEffects.filter(e => !e.startsWith('Bankruptcy') && e !== 'Silent' && e !== 'DEF -50%'), 'Jackpot', 'ATK Buff +50%'];
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
                        `📉 **PHÁ SẢN!** **${h.name}** thua cược! Bị câm lặng (Silence) và giảm 50% Phòng thủ trong 2 lượt!`
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
    } else if (targetType === 'friendly_random') {
      const livingAllies = this.heroes()
        .filter(h => h.team === actor.team && h.hp > 0);
      if (livingAllies.length > 0) {
        const randomIndex = Math.floor(Math.random() * livingAllies.length);
        enemyTargets = [livingAllies[randomIndex].id];
      }
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
      // The battle log already contains the target selected when the battle
      // was generated. Reusing it makes replay deterministic instead of
      // rolling a different victim on every playback.
      enemyTargets = [target.id];
    } else if (targetType === 'random_4') {
      const aliveEnemies = this.heroes().filter(h => h.team === enemyTeam && h.hp > 0);
      // Keep the recorded primary target first, then consistently fill the
      // remaining slots. A production battle log should persist all target
      // ids; this stable fallback keeps the current mock replay reproducible.
      enemyTargets = [target.id, ...aliveEnemies
        .filter(h => h.id !== target.id)
        .sort((a, b) => a.position - b.position || a.id - b.id)
        .slice(0, 3)
        .map(h => h.id)];
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
