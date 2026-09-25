import { BattleEventDto } from '../../../core/models/battle.model';
import { BattleStatusEffectViewModel, Hero } from '../../../core/models/hero.model';

export interface BattleEventHandlerContext {
  updateHeroes(updater: (heroes: Hero[]) => Hero[]): void;
  findSkillEffect(event: BattleEventDto): any;
  createStatus(event: BattleEventDto, effect: any): BattleStatusEffectViewModel;
  showCombatText(event: BattleEventDto): void;
  beginSkill(event: BattleEventDto): void;
  finishBattle(): void;
}

export interface BattleEventHandler {
  readonly eventTypes: readonly string[];
  handle(event: BattleEventDto, context: BattleEventHandlerContext): void;
}
