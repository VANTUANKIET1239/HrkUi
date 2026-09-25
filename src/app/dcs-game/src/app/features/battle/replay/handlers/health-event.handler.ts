import { BattleEventDto } from '../../../../core/models/battle.model';
import { BattleEventHandler, BattleEventHandlerContext } from '../battle-event-handler';

export class HealthEventHandler implements BattleEventHandler {
  readonly eventTypes = ['DAMAGE', 'HEAL'];

  handle(event: BattleEventDto, context: BattleEventHandlerContext): void {
    context.updateHeroes(heroes => heroes.map(hero => hero.id === event.targetId && event.hpAfter != null
      ? { ...hero, hp: event.hpAfter! }
      : hero));
    if (event.targetId != null) context.showCombatText(event);
  }
}
