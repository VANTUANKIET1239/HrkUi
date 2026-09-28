import { BattleEventDto } from '../../../../core/models/battle.model';
import { BattleEventHandler, BattleEventHandlerContext } from '../battle-event-handler';

export class CombatantEventHandler implements BattleEventHandler {
  readonly eventTypes = ['ENERGY_CHANGED', 'ACTION_BAR_CHANGED', 'DEATH', 'POSITION_CHANGED'];

  handle(event: BattleEventDto, context: BattleEventHandlerContext): void {
    if (event.targetId == null) return;
    context.updateHeroes(heroes => heroes.map(hero => {
      if (hero.id !== event.targetId) return hero;
      if ((event.eventType === 'ENERGY_CHANGED' || event.eventType === 'ACTION_BAR_CHANGED')) {
        const mana = event.currentValue ?? event.energyAfter;
        if (mana != null) return { ...hero, mana };
      }
      if (event.eventType === 'DEATH')
        return { ...hero, hp: 0, statusEffects: [...(hero.statusEffects ?? []), 'Dead'] };
      if (event.eventType === 'POSITION_CHANGED')
        return { ...hero, position: event.value };
      return hero;
    }));
  }
}
