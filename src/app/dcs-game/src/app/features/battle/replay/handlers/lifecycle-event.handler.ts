import { BattleEventDto } from '../../../../core/models/battle.model';
import { BattleEventHandler, BattleEventHandlerContext } from '../battle-event-handler';

export class LifecycleEventHandler implements BattleEventHandler {
  readonly eventTypes = ['SKILL_CAST', 'BATTLE_END'];

  handle(event: BattleEventDto, context: BattleEventHandlerContext): void {
    if (event.eventType === 'SKILL_CAST') context.beginSkill(event);
    else context.finishBattle();
  }
}
