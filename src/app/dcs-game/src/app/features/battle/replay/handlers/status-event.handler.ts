import { BattleEventDto } from '../../../../core/models/battle.model';
import { BattleEventHandler, BattleEventHandlerContext } from '../battle-event-handler';

export class StatusEventHandler implements BattleEventHandler {
  readonly eventTypes = [
    'STATUS_APPLIED', 'SHIELD_APPLIED', 'STATUS_UPDATED', 'STATUS_EXPIRED', 'SHIELD_ABSORBED',
    'STATUS_REFRESHED', 'STATUS_STACK_CHANGED', 'STATUS_REMOVED',
    'PRIME_FORTITUDE_GAINED', 'PRIME_FORTITUDE_CONSUMED', 'PRIME_GUARDIAN_APPLIED',
    'PRIME_PRESSURE_CHANGED', 'PRIME_PRESSURE_RELEASED', 'PRIME_STAGGER_APPLIED'
  ];

  handle(event: BattleEventDto, context: BattleEventHandlerContext): void {
    if (event.targetId == null) return;

    if (event.eventType === 'PRIME_FORTITUDE_CONSUMED' || event.eventType === 'PRIME_PRESSURE_RELEASED') {
      const codeToRemove = event.eventType === 'PRIME_FORTITUDE_CONSUMED' ? 'PRIME_FORTITUDE' : 'PRIME_PRESSURE';
      context.updateHeroes(heroes => heroes.map(hero => hero.id === event.targetId ? {
        ...hero,
        statusEffects: (hero.statusEffects ?? []).filter(code => code !== codeToRemove),
        battleStatuses: (hero.battleStatuses ?? []).filter(status => status.code !== codeToRemove)
      } : hero));
      return;
    }

    if (event.eventType === 'PRIME_PRESSURE_CHANGED') {
      const stacks = event.currentStacks ?? event.value ?? 1;
      context.updateHeroes(heroes => heroes.map(hero => {
        if (hero.id !== event.targetId) return hero;
        const exists = (hero.battleStatuses ?? []).some(s => s.code === 'PRIME_PRESSURE');
        if (!exists) {
          const status = context.createStatus({ ...event, effectTypeCode: 'PRIME_PRESSURE' }, context.findSkillEffect(event));
          status.stacks = stacks;
          return {
            ...hero,
            statusEffects: [...new Set([...(hero.statusEffects ?? []), 'PRIME_PRESSURE'])],
            battleStatuses: [...(hero.battleStatuses ?? []), status]
          };
        }
        return {
          ...hero,
          battleStatuses: (hero.battleStatuses ?? []).map(status => status.code === 'PRIME_PRESSURE'
            ? { ...status, stacks, maxStacks: event.maxStacks ?? status.maxStacks }
            : status)
        };
      }));
      return;
    }

    if ((event.eventType === 'STATUS_APPLIED' || event.eventType === 'SHIELD_APPLIED' ||
         event.eventType === 'PRIME_FORTITUDE_GAINED' || event.eventType === 'PRIME_GUARDIAN_APPLIED' ||
         event.eventType === 'PRIME_STAGGER_APPLIED') && event.effectTypeCode) {
      const status = context.createStatus(event, context.findSkillEffect(event));
      if (event.currentStacks != null) {
        status.stacks = event.currentStacks;
      }
      context.updateHeroes(heroes => heroes.map(hero => hero.id === event.targetId ? {
        ...hero,
        statusEffects: [...new Set([...(hero.statusEffects ?? []), event.effectTypeCode!])],
        battleStatuses: [
          ...(hero.battleStatuses ?? []).filter(item => item.instanceId !== status.instanceId),
          status
        ]
      } : hero));
      return;
    }
    if (event.eventType === 'STATUS_STACK_CHANGED' && event.effectTypeCode) {
      const stacks = event.currentStacks ?? event.value ?? 1;
      context.updateHeroes(heroes => heroes.map(hero => hero.id === event.targetId ? {
        ...hero,
        battleStatuses: (hero.battleStatuses ?? []).map(status => status.code === event.effectTypeCode
          ? {
              ...status,
              stacks,
              maxStacks: event.maxStacks ?? status.maxStacks,
              remainingTurns: event.remainingTurns ?? status.remainingTurns
            }
          : status)
      } : hero));
      return;
    }
    if ((event.eventType === 'STATUS_UPDATED' || event.eventType === 'STATUS_REFRESHED') && event.effectTypeCode) {
      context.updateHeroes(heroes => heroes.map(hero => hero.id === event.targetId ? {
        ...hero,
        battleStatuses: (hero.battleStatuses ?? []).map(status =>
          this.matchesStatus(status.instanceId, status.code, event)
          ? {
              ...status,
              remainingTurns: event.remainingTurns ?? status.remainingTurns,
              value: event.eventType === 'STATUS_REFRESHED' ? event.value : status.value
            }
          : status)
      } : hero));
      return;
    }
    if ((event.eventType === 'STATUS_EXPIRED' || event.eventType === 'STATUS_REMOVED') && event.effectTypeCode) {
      context.updateHeroes(heroes => heroes.map(hero => {
        if (hero.id !== event.targetId) return hero;
        const battleStatuses = (hero.battleStatuses ?? []).filter(status =>
          !this.matchesStatus(status.instanceId, status.code, event));
        const hasSameEffect = battleStatuses.some(status => status.code === event.effectTypeCode);
        return {
          ...hero,
          statusEffects: hasSameEffect
            ? hero.statusEffects
            : (hero.statusEffects ?? []).filter(code => code !== event.effectTypeCode),
          battleStatuses
        };
      }));
      return;
    }
    if (event.eventType === 'SHIELD_ABSORBED') {
      context.updateHeroes(heroes => heroes.map(hero => {
        if (hero.id !== event.targetId) return hero;

        const battleStatuses = (hero.battleStatuses ?? [])
          .map(status => this.matchesStatus(status.instanceId, status.code, event)
            ? { ...status, value: Math.max(0, status.value - event.value) }
            : status)
          .filter(status => status.code !== 'SHIELD' || status.value > 0);
        const hasShield = battleStatuses.some(status => status.code === 'SHIELD');

        return {
          ...hero,
          statusEffects: hasShield
            ? hero.statusEffects
            : (hero.statusEffects ?? []).filter(code => code !== 'SHIELD'),
          battleStatuses
        };
      }));
    }
  }

  private matchesStatus(instanceId: string, code: string, event: BattleEventDto): boolean {
    return event.statusInstanceId
      ? instanceId === event.statusInstanceId
      : code === event.effectTypeCode;
  }
}
