import { BattleEventDto } from '../../../../core/models/battle.model';
import { BattleEventHandler, BattleEventHandlerContext } from '../battle-event-handler';

export class BleedEventHandler implements BattleEventHandler {
  readonly eventTypes = ['BLEED_DAMAGE', 'BLEED_DETONATED', 'STATUS_REFRESHED', 'ACTION_BAR_CHANGED'] as const;

  handle(event: BattleEventDto, context: BattleEventHandlerContext): void {
    if (event.eventType === 'BLEED_DAMAGE' && event.targetId != null) {
      context.updateHeroes(heroes => heroes.map(hero => hero.id === event.targetId && event.hpAfter != null
        ? { ...hero, hp: event.hpAfter! }
        : hero));
      context.showCombatText(event);
      return;
    }

    if (event.eventType === 'BLEED_DETONATED' && event.targetId != null) {
      context.updateHeroes(heroes => heroes.map(hero => hero.id === event.targetId
        ? {
            ...hero,
            hp: event.hpAfter != null ? event.hpAfter! : hero.hp,
            statusEffects: (hero.statusEffects ?? []).filter(code => code !== 'BLEED'),
            battleStatuses: (hero.battleStatuses ?? []).filter(status => status.code !== 'BLEED')
          }
        : hero));
      context.showCombatText(event);
      return;
    }

    if (event.eventType === 'STATUS_REFRESHED' && event.targetId != null && event.effectTypeCode) {
      context.updateHeroes(heroes => heroes.map(hero => hero.id === event.targetId
        ? {
            ...hero,
            battleStatuses: (hero.battleStatuses ?? []).map(status => status.code === event.effectTypeCode
              ? { ...status, remainingTurns: event.remainingTurns ?? status.remainingTurns }
              : status)
          }
        : hero));
      return;
    }

    if (event.eventType === 'ACTION_BAR_CHANGED' && event.targetId != null) {
      context.updateHeroes(heroes => heroes.map(hero => hero.id === event.targetId
        ? {
            ...hero,
            mana: event.energyAfter != null ? event.energyAfter : Math.min(hero.maxMana, hero.mana + (event.value || 0))
          }
        : hero));
    }
  }
}
