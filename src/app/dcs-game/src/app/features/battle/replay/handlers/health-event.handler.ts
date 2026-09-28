import { BattleEventDto } from '../../../../core/models/battle.model';
import { BattleEventHandler, BattleEventHandlerContext } from '../battle-event-handler';

export class HealthEventHandler implements BattleEventHandler {
  readonly eventTypes = ['DAMAGE', 'HEAL', 'PRIME_GUARD_REDIRECTED'];

  handle(event: BattleEventDto, context: BattleEventHandlerContext): void {
    if (event.eventType === 'PRIME_GUARD_REDIRECTED') {
      context.updateHeroes(heroes => heroes.map(hero => hero.id === event.actorId && event.hpAfter != null
        ? { ...hero, hp: event.hpAfter! }
        : hero));
      if (event.actorId != null && event.value > 0) {
        context.showCombatText({
          ...event,
          targetId: event.actorId,
          value: event.value
        });
      }
      return;
    }
    context.updateHeroes(heroes => heroes.map(hero => hero.id === event.targetId && event.hpAfter != null
      ? { ...hero, hp: event.hpAfter! }
      : hero));
    if (event.targetId != null) context.showCombatText(event);
  }
}
