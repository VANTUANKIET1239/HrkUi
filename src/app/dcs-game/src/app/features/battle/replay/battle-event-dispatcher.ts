import { BattleEventDto } from '../../../core/models/battle.model';
import { BattleEventHandler, BattleEventHandlerContext } from './battle-event-handler';

export class BattleEventDispatcher {
  private readonly handlers = new Map<string, BattleEventHandler>();

  constructor(handlers: BattleEventHandler[]) {
    for (const handler of handlers)
      for (const eventType of handler.eventTypes)
        this.handlers.set(eventType, handler);
  }

  dispatch(event: BattleEventDto, context: BattleEventHandlerContext): void {
    this.handlers.get(event.eventType)?.handle(event, context);
  }
}
