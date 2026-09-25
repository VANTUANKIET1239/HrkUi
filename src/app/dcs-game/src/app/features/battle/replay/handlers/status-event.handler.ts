import { BattleEventDto } from '../../../../core/models/battle.model';
import { BattleEventHandler, BattleEventHandlerContext } from '../battle-event-handler';

export class StatusEventHandler implements BattleEventHandler {
  readonly eventTypes = [
    'STATUS_APPLIED', 'SHIELD_APPLIED', 'STATUS_UPDATED', 'STATUS_EXPIRED', 'SHIELD_ABSORBED',
    'STATUS_REFRESHED', 'STATUS_STACK_CHANGED', 'STATUS_REMOVED'
  ];

  handle(event: BattleEventDto, context: BattleEventHandlerContext): void {
    if (event.targetId == null) return;
    if ((event.eventType === 'STATUS_APPLIED' || event.eventType === 'SHIELD_APPLIED') && event.effectTypeCode) {
      const status = context.createStatus(event, context.findSkillEffect(event));
      if (event.currentStacks != null) {
        status.stacks = event.currentStacks;
      }
      context.updateHeroes(heroes => heroes.map(hero => hero.id === event.targetId ? {
        ...hero,
        statusEffects: [...new Set([...(hero.statusEffects ?? []), event.effectTypeCode!])],
        battleStatuses: [...(hero.battleStatuses ?? []).filter(item => item.instanceId !== status.instanceId), status]
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
        battleStatuses: (hero.battleStatuses ?? []).map(status => status.code === event.effectTypeCode
          ? { ...status, remainingTurns: event.remainingTurns ?? status.remainingTurns }
          : status)
      } : hero));
      return;
    }
    if ((event.eventType === 'STATUS_EXPIRED' || event.eventType === 'STATUS_REMOVED') && event.effectTypeCode) {
      context.updateHeroes(heroes => heroes.map(hero => hero.id === event.targetId ? {
        ...hero,
        statusEffects: (hero.statusEffects ?? []).filter(code => code !== event.effectTypeCode),
        battleStatuses: (hero.battleStatuses ?? []).filter(status => status.code !== event.effectTypeCode)
      } : hero));
      return;
    }
    if (event.eventType === 'SHIELD_ABSORBED') {
      context.updateHeroes(heroes => heroes.map(hero => hero.id === event.targetId ? {
        ...hero,
        battleStatuses: (hero.battleStatuses ?? []).map(status => status.code === 'SHIELD'
          ? { ...status, value: Math.max(0, status.value - event.value) }
          : status)
      } : hero));
    }
  }
}
