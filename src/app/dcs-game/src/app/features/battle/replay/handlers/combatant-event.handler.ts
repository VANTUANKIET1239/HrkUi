import { BattleEventDto } from '../../../../core/models/battle.model';
import { BattleEventHandler, BattleEventHandlerContext } from '../battle-event-handler';

export class CombatantEventHandler implements BattleEventHandler {
  readonly eventTypes = ['ENERGY_CHANGED', 'DEATH', 'POSITION_CHANGED'];

  handle(event: BattleEventDto, context: BattleEventHandlerContext): void {
    if (event.targetId == null) return;
    context.updateHeroes(heroes => heroes.map(hero => {
      if (hero.id !== event.targetId) return hero;
      if (event.eventType === 'ENERGY_CHANGED' && event.energyAfter != null)
        return { ...hero, mana: event.energyAfter! };
      if (event.eventType === 'DEATH')
        return { ...hero, hp: 0, statusEffects: [...(hero.statusEffects ?? []), 'Dead'] };
      if (event.eventType === 'POSITION_CHANGED')
        return { ...hero, position: event.value };
      return hero;
    }));
  }
}
