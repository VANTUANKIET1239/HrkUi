import { PlayerHeroDto } from './player-hero.model';

export interface StartBattleRequest {
  battleType: 'PVE' | 'CAMPAIGN';
  stageId?: number;
  formationCode?: string;
  randomSeed?: number;
}

export interface BattleInitialStateDto {
  battleId: string;
  leftTeam: PlayerHeroDto[];
  rightTeam: PlayerHeroDto[];
}

export type BattleEventType =
  | 'BATTLE_START' | 'ROUND_START' | 'TURN_START' | 'SKILL_CAST'
  | 'DAMAGE' | 'HEAL' | 'ENERGY_CHANGED' | 'STATUS_APPLIED'
  | 'STATUS_UPDATED' | 'STATUS_EXPIRED' | 'STATUS_REFRESHED'
  | 'STATUS_STACK_CHANGED' | 'STATUS_REMOVED'
  | 'RICARDO_APPLIED' | 'RICARDO_STACK_CHANGED' | 'RICARDO_RAGE_READY'
  | 'RICARDO_EMPOWERED_CAST' | 'RICARDO_CONSUMED'
  | 'SHIELD_APPLIED' | 'SHIELD_ABSORBED'
  | 'BLEED_DAMAGE' | 'BLEED_DETONATED' | 'ACTION_BAR_CHANGED'
  | 'TURN_SKIPPED' | 'POSITION_CHANGED' | 'SKILL_COMPLETED'
  | 'DEATH' | 'TURN_END' | 'BATTLE_END';

export interface BattleEventDto {
  sequence: number;
  round: number;
  turn: number;
  eventType: BattleEventType;
  actorId?: number | null;
  targetId?: number | null;
  skillId?: string | null;
  effectTypeCode?: string | null;
  damageSchoolCode?: 'PHYSICAL' | 'MAGIC' | 'TRUE' | null;
  value: number;
  hpBefore?: number | null;
  hpAfter?: number | null;
  energyBefore?: number | null;
  energyAfter?: number | null;
  isCrit: boolean;
  remainingTurns?: number | null;
  previousStacks?: number | null;
  currentStacks?: number | null;
  maxStacks?: number | null;
  castSequence?: number | null;
  timelineOffsetMs: number;
  phaseCode?: 'CAST' | 'IMPACT' | 'STATUS' | 'RECOVERY' | string | null;
  executionGroup?: string | null;
  hitIndex?: number | null;
  statModifiers?: BattleEventStatModifierDto[];
}

export interface BattleEventStatModifierDto {
  attributeCode: string;
  attributeName?: string | null;
  valueType: 'FLAT' | 'PERCENT' | string;
  value: number;
}

export interface StartBattleResultDto {
  battleId: string;
  randomSeed: number;
  status: 'COMPLETED';
  winner: 'LEFT' | 'RIGHT' | 'DRAW';
  initialState: BattleInitialStateDto;
  events: BattleEventDto[];
}
