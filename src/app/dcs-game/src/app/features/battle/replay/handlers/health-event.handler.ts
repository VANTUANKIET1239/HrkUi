import { BattleEventDto } from '../../../../core/models/battle.model';
import { BattleEventHandler, BattleEventHandlerContext } from '../battle-event-handler';

export class HealthEventHandler implements BattleEventHandler {
  readonly eventTypes = ['DAMAGE', 'HEAL', 'PRIME_GUARD_REDIRECTED'];

  handle(event: BattleEventDto, context: BattleEventHandlerContext): void {
    if (event.eventType === 'PRIME_GUARD_REDIRECTED') {
      // actorId is the attacker; these HP snapshots belong to the guardian.
      // The backend emits a separate DAMAGE event targeting the guardian.
      // Keep this redirect marker visual-only to avoid wrong HP and duplicate text.
      return;
    }
    context.updateHeroes(heroes => heroes.map(hero => hero.id === event.targetId && event.hpAfter != null
      ? { ...hero, hp: event.hpAfter! }
      : hero));
    if (event.targetId != null) context.showCombatText(event);
  }
}
