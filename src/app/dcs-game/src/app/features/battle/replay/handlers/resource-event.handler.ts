import { BattleEventDto, BattleResourceViewModel } from '../../../../core/models/battle.model';
import { BattleEventHandler, BattleEventHandlerContext } from '../battle-event-handler';

export class ResourceEventHandler implements BattleEventHandler {
  readonly eventTypes = [
    'RESOURCE_CHANGED',
    'AURA_GAINED',
    'AURA_CONSUMED',
    'FULL_AURA_ACTIVATED',
    'FULL_AURA_REMOVED'
  ] as const;

  handle(event: BattleEventDto, context: BattleEventHandlerContext): void {
    const actorId = event.actorId;
    if (actorId == null) return;

    const resourceCode = event.resourceCode || 'AURA';
    const isFullAuraEvent = event.eventType === 'FULL_AURA_ACTIVATED';
    const isFullAuraRemoved = event.eventType === 'FULL_AURA_REMOVED';

    context.updateHeroes(heroes => heroes.map(hero => {
      if (hero.id !== actorId) return hero;

      const existingResource = hero.resources?.[resourceCode];
      const currentValue = event.currentValue != null
        ? event.currentValue
        : event.eventType === 'AURA_GAINED'
          ? Math.min(100, (existingResource?.currentValue ?? 0) + (event.value || 0))
          : event.eventType === 'AURA_CONSUMED'
            ? Math.max(0, (existingResource?.currentValue ?? 0) - (event.value || 0))
            : existingResource?.currentValue ?? 0;

      const previousValue = event.previousValue != null
        ? event.previousValue
        : existingResource?.currentValue ?? 0;

      const maxValue = resourceCode === 'ANGEL_BLESSING' ? 5 : 100;
      const tier = resourceCode === 'ANGEL_BLESSING' ? currentValue : this.resolveTier(currentValue);
      const isFull = resourceCode === 'ANGEL_BLESSING'
        ? currentValue >= 5
        : (isFullAuraEvent || (currentValue >= 100 && !isFullAuraRemoved));
      const physicalBonus = event.statModifiers?.find(modifier =>
        modifier.attributeCode.toUpperCase() === 'ATK')?.value;
      const magicBonus = event.statModifiers?.find(modifier =>
        ['MAGIC_DAMAGE', 'MAGIC_ATK', 'MATK'].includes(modifier.attributeCode.toUpperCase()))?.value;

      const updatedResource: BattleResourceViewModel = {
        resourceCode,
        currentValue,
        maxValue,
        previousValue,
        reasonCode: event.reasonCode ?? existingResource?.reasonCode,
        tier,
        isFull,
        physicalDamageBonusPercent: physicalBonus ?? existingResource?.physicalDamageBonusPercent ?? currentValue * 0.25,
        magicDamageBonusPercent: magicBonus ?? existingResource?.magicDamageBonusPercent ?? currentValue * 0.25
      };

      return {
        ...hero,
        auraTier: resourceCode === 'AURA' ? tier : hero.auraTier,
        resources: {
          ...(hero.resources ?? {}),
          [resourceCode]: updatedResource
        }
      };
    }));

    // Show floating resource text for impactful events
    if (event.eventType === 'FULL_AURA_ACTIVATED') {
      context.showCombatText({
        ...event,
        value: 100,
        eventType: 'STATUS_APPLIED' as any,
        isCrit: true,
        phaseCode: 'STATUS'
      });
    }
  }

  private resolveTier(val: number): number {
    if (val >= 100) return 4;
    if (val >= 75) return 3;
    if (val >= 50) return 2;
    if (val >= 25) return 1;
    return 0;
  }
}
