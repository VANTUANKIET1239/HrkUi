import { computed, inject, Injectable, signal } from '@angular/core';
import { BattleEventDto, StartBattleResultDto } from '../models/battle.model';
import { Hero } from '../models/hero.model';
import { INITIAL_HEROES, SKILL_LIST } from '../../features/battle/mocks/mock-battle.data';
import { BattleStatusPresenter } from '../../features/battle/presentation/battle-status.presenter';
import { BattleEventDispatcher } from '../../features/battle/replay/battle-event-dispatcher';
import { BattleEventHandlerContext } from '../../features/battle/replay/battle-event-handler';
import { CombatantEventHandler } from '../../features/battle/replay/handlers/combatant-event.handler';
import { HealthEventHandler } from '../../features/battle/replay/handlers/health-event.handler';
import { LifecycleEventHandler } from '../../features/battle/replay/handlers/lifecycle-event.handler';
import { StatusEventHandler } from '../../features/battle/replay/handlers/status-event.handler';
import { BleedEventHandler } from '../../features/battle/replay/handlers/bleed-event.handler';
import { ResourceEventHandler } from '../../features/battle/replay/handlers/resource-event.handler';
import { BattleVisualTimelineService } from '../battle-animation/battle-visual-timeline.service';
import { BattleSpeed } from '../battle-animation/battle-speed.constants';
import { Skill } from '../models/skill.model';
import { HeroSkillDto } from '../models/player-hero.model';

export interface DamageTextEvent {
  text: string;
  isCrit: boolean;
  key: number;
  value: number;
  groupKey?: string;
}

type BattlePhase = 'idle' | 'cast' | 'impact' | 'status' | 'recovery';

@Injectable({ providedIn: 'root' })
export class BattleEngineService {
  private readonly statusPresenter = inject(BattleStatusPresenter);
  readonly visualTimeline = inject(BattleVisualTimelineService);

  private readonly eventDispatcher = new BattleEventDispatcher([
    new HealthEventHandler(),
    new StatusEventHandler(),
    new CombatantEventHandler(),
    new LifecycleEventHandler(),
    new BleedEventHandler(),
    new ResourceEventHandler()
  ]);

  readonly status = signal<'idle' | 'playing' | 'paused' | 'finished'>('idle');
  readonly heroes = signal<Hero[]>([]);
  readonly currentTurn = signal(0);
  readonly speed = signal<BattleSpeed>(1);
  readonly narrativeLogs = signal<string[]>([]);

  readonly currentVisualSkillId = this.visualTimeline.currentVisualSkillId;
  readonly visualActorId = this.visualTimeline.visualActorId;
  readonly visualPhase = this.visualTimeline.visualPhase;
  readonly currentVisualSpeed = this.visualTimeline.currentVisualSpeed;
  readonly visualCastSequence = this.visualTimeline.visualCastSequence;
  readonly isVisualActive = this.visualTimeline.isVisualActive;
  readonly isVisualEmpowered = this.visualTimeline.isVisualEmpowered;

  readonly currentLogicalSkillId = signal<string | null>(null);
  readonly logicalActorId = signal<number | null>(null);

  readonly currentSkillId = this.visualTimeline.currentVisualSkillId;
  readonly activeActorId = signal<number | null>(null);
  readonly activeTargetId = signal<number | null>(null);
  readonly activeTargetIds = signal<number[]>([]);
  readonly currentSkillColor = signal('#ffffff');
  readonly currentSkillName = signal<string | null>(null);
  readonly currentSkillCategory = signal<'basic' | 'ultimate'>('basic');
  readonly battlePhase = signal<BattlePhase>('idle');
  readonly damageEvents = signal<Record<number, DamageTextEvent | null>>({});

  readonly activeActor = computed(() => {
    const actorId = this.visualActorId() ?? this.activeActorId();
    return actorId == null ? null : this.heroes().find(hero => hero.id === actorId) ?? null;
  });

  readonly isActorTeamRight = computed(() => this.activeActor()?.team === 'right');

  readonly turnQueue = computed(() => {
    const actorIds = this.serverEvents
      .slice(this.serverEventIndex() + 1)
      .filter(event => event.eventType === 'TURN_START' && event.actorId != null)
      .slice(0, 8)
      .map(event => event.actorId!);
    return actorIds
      .map(actorId => this.heroes().find(hero => hero.id === actorId))
      .filter((hero): hero is Hero => hero != null);
  });

  private serverEvents: BattleEventDto[] = [];
  private readonly serverEventIndex = signal(-1);
  private currentTimeout: ReturnType<typeof setTimeout> | null = null;
  private visualTimeouts: ReturnType<typeof setTimeout>[] = [];
  private damageEventCounter = 0;
  private readonly serverSkillMetadata = new Map<string, Skill | HeroSkillDto>();

  private eventScheduledAt = 0;
  private remainingEventDelayMs = 0;
  private pendingNextAction: (() => void) | null = null;

  resetBattle(): void {
    this.clearTimers();
    this.visualTimeline.cancelCast();
    this.serverEvents = [];
    this.serverEventIndex.set(-1);
    this.heroes.set([]);
    this.currentTurn.set(0);
    this.status.set('idle');
    this.narrativeLogs.set([]);
    this.resetActiveCast();
    this.damageEvents.set({});
    this.serverSkillMetadata.clear();
  }

  loadServerBattle(battle: StartBattleResultDto): void {
    this.clearTimers();
    this.visualTimeline.cancelCast();
    this.serverSkillMetadata.clear();
    const mapHero = (source: any, team: 'left' | 'right'): Hero => {
      const fallback = INITIAL_HEROES.find(hero => hero.name === source.name || hero.avatar === source.avatar);
      return {
        id: team === 'right' ? -Math.abs(source.id) : source.id,
        heroTemplateId: source.heroTemplateId ?? fallback?.heroTemplateId ?? fallback?.id,
        heroCode: source.heroCode,
        name: source.name,
        avatar: source.avatar,
        hp: source.stats.hp,
        maxHp: source.stats.hp,
        mana: 0,
        maxMana: 100,
        attack: source.stats.atk,
        defense: source.stats.def,
        speed: source.stats.spd,
        power: source.power,
        magicDamage: source.stats.magicDamage,
        magicResistance: source.stats.magicResistance,
        position: source.position ?? 1,
        team,
        statusEffects: [],
        battleStatuses: [],
        skills: (source.skills ?? []).map((skill: any) => skill.id),
        defaultFacing: source.defaultFacing ?? fallback?.defaultFacing ?? 'right',
        stars: Math.max(0, Math.min(5, source.stars ?? fallback?.stars ?? 1)),
        auraTier: source.auraTier,
        starAura: source.starAura ?? null,
        resources: source.resources ?? (source.heroCode === 'THANH_THAI_AURA' ? { AURA: { resourceCode: 'AURA', currentValue: 0, maxValue: 100, tier: 0, isFull: false } } : {})
      };
    };

    [...battle.initialState.leftTeam, ...battle.initialState.rightTeam]
      .flatMap(hero => hero.skills ?? [])
      .forEach(skill => this.serverSkillMetadata.set(skill.id, skill));
    this.heroes.set([
      ...battle.initialState.leftTeam.map(hero => mapHero(hero, 'left')),
      ...battle.initialState.rightTeam.map(hero => mapHero(hero, 'right'))
    ]);
    this.serverEvents = [...battle.events].sort((left, right) => left.sequence - right.sequence);
    this.serverEventIndex.set(-1);
    this.currentTurn.set(0);
    this.status.set('idle');
    this.narrativeLogs.set([]);
    this.resetActiveCast();
    this.damageEvents.set({});
  }

  isTargetHit(heroId: number): boolean {
    return this.activeTargetId() === heroId || this.activeTargetIds().includes(heroId);
  }

  getCastEvents(castSequence?: number | null): BattleEventDto[] {
    const seq = castSequence ?? this.visualCastSequence();
    if (seq == null) return [];
    return this.serverEvents.filter(e => e.castSequence === seq);
  }

  setSpeed(newSpeed: number): void {
    if ([1, 2, 4].includes(newSpeed)) {
      this.speed.set(newSpeed as BattleSpeed);
    }
  }

  startBattle(): void {
    if (!this.serverEvents.length) {
      this.narrativeLogs.set(['Không có dữ liệu trận đấu để phát lại.']);
      return;
    }
    if (this.status() !== 'idle' && this.status() !== 'paused') return;
    const wasPaused = this.status() === 'paused';
    this.status.set('playing');

    if (wasPaused) {
      this.visualTimeline.resume();
      if (this.pendingNextAction && this.remainingEventDelayMs > 0) {
        const action = this.pendingNextAction;
        const delay = this.remainingEventDelayMs;
        this.scheduleNextEvent(delay, action);
        return;
      }
    }

    this.playNextServerEvent();
  }

  pauseBattle(): void {
    if (this.status() !== 'playing') return;
    this.status.set('paused');
    if (this.currentTimeout) {
      clearTimeout(this.currentTimeout);
      this.currentTimeout = null;
      const elapsed = Date.now() - this.eventScheduledAt;
      this.remainingEventDelayMs = Math.max(0, this.remainingEventDelayMs - elapsed);
    }
    this.visualTimeline.pause();
    this.narrativeLogs.update(logs => [...logs, '⏸️ Đã tạm dừng trận đấu.']);
  }

  skipToEnd(): void {
    if (this.status() === 'finished' || !this.serverEvents.length) return;
    this.clearTimers();
    this.visualTimeline.skipToEnd();
    this.resetLogicalCast();
    this.resetVisualCast();

    const silentContext: BattleEventHandlerContext = {
      updateHeroes: updater => this.heroes.update(updater),
      findSkillEffect: event => {
        const skill = event.skillId ? this.serverSkillMetadata.get(event.skillId) : null;
        return skill?.effects?.find((effect: any) =>
          effect.effectTypeCode?.toUpperCase() === event.effectTypeCode?.toUpperCase());
      },
      createStatus: (event, effect) => this.statusPresenter.create(event, effect),
      showCombatText: () => {},
      beginSkill: () => {},
      finishBattle: () => {}
    };

    while (this.serverEventIndex() + 1 < this.serverEvents.length) {
      const nextIndex = this.serverEventIndex() + 1;
      this.serverEventIndex.set(nextIndex);
      const event = this.serverEvents[nextIndex];
      if (!event) break;
      this.currentTurn.set(event.turn);
      this.eventDispatcher.dispatch(event, silentContext);
      if (event.eventType === 'BATTLE_END') break;
    }

    this.damageEvents.set({});
    this.resetActiveCast();
    this.finishBattle();
  }

  private playNextServerEvent(): void {
    if (this.status() !== 'playing') return;
    const nextIndex = this.serverEventIndex() + 1;
    this.serverEventIndex.set(nextIndex);
    const event = this.serverEvents[nextIndex];
    if (!event) {
      if (this.visualTimeline.isVisualActive()) {
        const remainingVisual = this.visualTimeline.getRemainingDurationMs();
        if (remainingVisual > 0) {
          this.scheduleNextEvent(remainingVisual, () => {
            this.resetVisualCast();
            this.finishBattle();
          });
          return;
        }
      }
      this.finishBattle();
      return;
    }

    this.currentTurn.set(event.turn);
    if ((event.eventType === 'TURN_START' || event.eventType === 'SKILL_CAST') && event.actorId != null) {
      this.activeActorId.set(event.actorId);
      this.logicalActorId.set(event.actorId);
    }
    this.battlePhase.set(this.toBattlePhase(event.phaseCode));
    this.resolvePhaseTargets(event);
    this.visualTimeline.advancePhase(event);
    this.eventDispatcher.dispatch(event, this.createEventHandlerContext());

    if (event.eventType === 'BATTLE_END') {
      if (this.visualTimeline.isVisualActive()) {
        const remainingVisual = this.visualTimeline.getRemainingDurationMs();
        if (remainingVisual > 0) {
          this.scheduleNextEvent(remainingVisual, () => {
            this.resetVisualCast();
          });
        }
      }
      return;
    }

    const nextEvent = this.serverEvents[this.serverEventIndex() + 1];
    const sameCast = event.castSequence != null && nextEvent?.castSequence === event.castSequence;
    let baseDelay = sameCast
      ? Math.max(20, (nextEvent.timelineOffsetMs ?? 0) - (event.timelineOffsetMs ?? 0))
      : 160;

    let scaledDelay = baseDelay / this.speed();

    if (event.eventType === 'TURN_END') {
      this.resetLogicalCast();
      this.visualTimeline.requestLogicalEnd(event.castSequence ?? 0);
      if (this.visualTimeline.isVisualActive()) {
        const remainingVisualMs = this.visualTimeline.getRemainingDurationMs();
        if (remainingVisualMs > 0) {
          scaledDelay = Math.max(scaledDelay, remainingVisualMs);
        }
      }
    } else if (!sameCast && this.visualTimeline.isVisualActive()) {
      const remainingVisualMs = this.visualTimeline.getRemainingDurationMs();
      if (remainingVisualMs > 0) {
        scaledDelay = Math.max(scaledDelay, remainingVisualMs);
      }
    }

    this.scheduleNextEvent(scaledDelay, () => {
      if (event.eventType === 'TURN_END' && this.visualTimeline.isVisualSafe()) {
        this.resetVisualCast();
      }
      this.playNextServerEvent();
    });
  }

  private scheduleNextEvent(delayMs: number, action: () => void): void {
    if (this.currentTimeout) {
      clearTimeout(this.currentTimeout);
      this.currentTimeout = null;
    }
    this.remainingEventDelayMs = delayMs;
    this.eventScheduledAt = Date.now();
    this.pendingNextAction = action;

    this.currentTimeout = setTimeout(() => {
      this.currentTimeout = null;
      this.pendingNextAction = null;
      this.remainingEventDelayMs = 0;
      action();
    }, delayMs);
  }

  private resolvePhaseTargets(event: BattleEventDto): void {
    const targetEvents = ['DAMAGE', 'HEAL', 'STATUS_APPLIED', 'SHIELD_APPLIED', 'POSITION_CHANGED', 'BLEED_DAMAGE', 'BLEED_DETONATED'];
    if (event.targetId == null || !targetEvents.includes(event.eventType)) return;
    const targetIds = this.serverEvents
      .filter(candidate => candidate.castSequence === event.castSequence &&
        candidate.phaseCode === event.phaseCode && candidate.targetId != null)
      .map(candidate => candidate.targetId!)
      .filter((id, index, all) => all.indexOf(id) === index);
    this.activeTargetIds.set(targetIds.length > 1 ? targetIds : []);
    this.activeTargetId.set(targetIds.length === 1 ? targetIds[0] : null);
  }

  private createEventHandlerContext(): BattleEventHandlerContext {
    return {
      updateHeroes: updater => this.heroes.update(updater),
      findSkillEffect: event => {
        const skill = event.skillId ? this.serverSkillMetadata.get(event.skillId) : null;
        return skill?.effects?.find((effect: any) =>
          effect.effectTypeCode?.toUpperCase() === event.effectTypeCode?.toUpperCase());
      },
      createStatus: (event, effect) => this.statusPresenter.create(event, effect),
      showCombatText: event => this.showCombatText(event),
      beginSkill: event => this.beginSkill(event),
      finishBattle: () => this.finishBattle()
    };
  }

  private beginSkill(event: BattleEventDto): void {
    if (!event.skillId) return;
    const metadata = this.serverSkillMetadata.get(event.skillId);
    const mockSkill = SKILL_LIST[event.skillId];
    const isUltimate = (metadata?.skillTypeCode ?? 'NORMAL') === 'ENERGY';

    // The backend skill handler owns the rules that decide whether a cast is
    // empowered. The replay layer only consumes its generic execution marker.
    const castEvents = event.castSequence != null
      ? this.serverEvents.filter(e => e.castSequence === event.castSequence)
      : this.serverEvents.filter(e => e.turn === event.turn && e.actorId === event.actorId);
    const isEmpowered = event.executionGroup === 'EMPOWERED' ||
      castEvents.some(castEvent => castEvent.executionGroup === 'EMPOWERED');

    this.currentLogicalSkillId.set(event.skillId);
    this.currentSkillName.set(metadata?.name ?? mockSkill?.name ?? event.skillId);
    this.currentSkillColor.set(mockSkill?.color ?? '#fbbf24');
    this.currentSkillCategory.set(isUltimate ? 'ultimate' : 'basic');
    this.visualTimeline.beginCast(event, this.speed(), isUltimate, metadata?.animation, isEmpowered);
  }

  private showCombatText(event: BattleEventDto): void {
    if (event.targetId == null) return;
    const key = this.damageEventCounter++;
    // HP snapshots are authoritative. This also renders old replay events correctly
    // when their value contains calculated overkill damage.
    const hpDelta = event.hpBefore != null && event.hpAfter != null
      ? Math.abs(event.hpBefore - event.hpAfter)
      : event.value;
    const groupKey = event.eventType === 'DAMAGE' && event.actionId && event.executionGroup && event.hitIndex != null
      ? `${event.actionId}|${event.targetId}|${event.executionGroup}|${event.hitIndex}`
      : undefined;
    const previous = this.damageEvents()[event.targetId];
    const shouldMerge = groupKey != null && previous?.groupKey === groupKey;
    const displayValue = shouldMerge ? previous.value + hpDelta : hpDelta;
    const displayCrit = Boolean(event.isCrit || (shouldMerge && previous.isCrit));

    let text = event.eventType === 'HEAL' ? `+${displayValue}` : `-${displayValue}${displayCrit ? '!' : ''}`;
    if (event.eventType === 'BLEED_DAMAGE') {
      text = `🩸 Chảy Máu -${hpDelta}`;
    } else if (event.eventType === 'BLEED_DETONATED') {
      text = `💥 Chảy Máu -${hpDelta}`;
    } else if (event.eventType === 'ACTION_BAR_CHANGED') {
      text = (event.value ?? 0) >= 0 ? `⚡ +${event.value} Năng Lượng` : `⚡ ${event.value} Năng Lượng`;
    }
    this.damageEvents.update(items => ({
      ...items,
      [event.targetId!]: {
        text,
        isCrit: displayCrit,
        key,
        value: displayValue,
        groupKey
      }
    }));

    const duration = this.visualTimeline.getCombatTextDurationMs();

    const timeout = setTimeout(() => {
      this.damageEvents.update(items => items[event.targetId!]?.key === key
        ? { ...items, [event.targetId!]: null }
        : items);
      this.visualTimeouts = this.visualTimeouts.filter(item => item !== timeout);
    }, duration);
    this.visualTimeouts.push(timeout);
  }

  private toBattlePhase(phaseCode?: string | null): BattlePhase {
    const phase = (phaseCode ?? '').toLowerCase();
    return ['cast', 'impact', 'status', 'recovery'].includes(phase) ? phase as BattlePhase : 'idle';
  }

  private finishBattle(): void {
    if (this.status() === 'finished') return;
    this.status.set('finished');
    const leftAlive = this.heroes().some(hero => hero.team === 'left' && hero.hp > 0);
    const rightAlive = this.heroes().some(hero => hero.team === 'right' && hero.hp > 0);
    const message = leftAlive && !rightAlive
      ? '🏆 CHIẾN THẮNG! Đội hình DCS Coder đã vượt qua lỗi và sếp!'
      : !leftAlive && rightAlive
        ? '💀 THẤT BẠI! Lỗi và sếp đã nhấn chìm đội dự án!'
        : '🤝 HÒA NHAU! Trận đấu kết thúc bất phân thắng bại!';
    this.narrativeLogs.update(logs => [...logs, message]);
    this.resetActiveCast();
  }

  resetLogicalCast(): void {
    this.logicalActorId.set(null);
    this.currentLogicalSkillId.set(null);
    this.activeTargetId.set(null);
    this.activeTargetIds.set([]);
    this.battlePhase.set('idle');
  }

  resetVisualCast(): void {
    this.activeActorId.set(null);
    this.currentSkillName.set(null);
    this.currentSkillCategory.set('basic');
    this.visualTimeline.resetVisualCast();
  }

  private resetActiveCast(): void {
    this.resetLogicalCast();
    this.resetVisualCast();
  }

  private clearTimers(): void {
    if (this.currentTimeout) {
      clearTimeout(this.currentTimeout);
      this.currentTimeout = null;
    }
    this.pendingNextAction = null;
    this.remainingEventDelayMs = 0;
    this.visualTimeouts.forEach(timeout => clearTimeout(timeout));
    this.visualTimeouts = [];
  }
}
