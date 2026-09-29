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
  | 'RESOURCE_CHANGED' | 'AURA_GAINED' | 'AURA_CONSUMED'
  | 'FULL_AURA_ACTIVATED' | 'FULL_AURA_REMOVED' | 'LOSS_OF_CONFIDENCE_DETONATED'
  | 'THANH_THAI_EMPOWERED_CAST' | 'SIBA_EMPOWERED_CAST'
  | 'SHIELD_APPLIED' | 'SHIELD_ABSORBED'
  | 'BLEED_DAMAGE' | 'BLEED_DETONATED' | 'ACTION_BAR_CHANGED'
  | 'PRIME_FORTITUDE_GAINED' | 'PRIME_FORTITUDE_CONSUMED' | 'PRIME_GUARDIAN_APPLIED'
  | 'PRIME_GUARD_REDIRECTED' | 'PRIME_PRESSURE_CHANGED' | 'PRIME_PRESSURE_RELEASED'
  | 'PRIME_STAGGER_APPLIED' | 'PRIME_FORTRESS_CHARGE_STARTED' | 'PRIME_FORTRESS_IMPACT'
  | 'PRIME_FORTRESS_RETURNED'
  | 'TURN_SKIPPED' | 'POSITION_CHANGED' | 'SKILL_COMPLETED'
  | 'DEATH' | 'TURN_END' | 'BATTLE_END';

export interface BattleResourceViewModel {
  resourceCode: string;
  currentValue: number;
  maxValue: number;
  previousValue?: number;
  reasonCode?: string;
  tier?: number;
  isFull?: boolean;
  physicalDamageBonusPercent?: number;
  magicDamageBonusPercent?: number;
}

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
  resourceCode?: string | null;
  previousValue?: number | null;
  currentValue?: number | null;
  reasonCode?: string | null;
  actionId?: string | null;
  statusInstanceId?: string | null;
  sourceHeroId?: number | null;
  originalDamage?: number | null;
  redirectRequested?: number | null;
  redirectActual?: number | null;
  allyDamageAfterRedirect?: number | null;
  guardianHpBefore?: number | null;
  guardianHpAfter?: number | null;
}

export interface BattleEventStatModifierDto {
  attributeCode: string;
  attributeName?: string | null;
  valueType: 'FLAT' | 'PERCENT' | string;
  value: number;
}

export interface BattleHeroStatisticsDto {
  combatantId: number;
  sourceHeroId: number;
  team: number;
  heroName: string;
  avatar?: string | null;
  physicalDamageDealt: number;
  magicDamageDealt: number;
  healingDone: number;
  physicalDamageTaken: number;
  magicDamageTaken: number;
}

export interface StartBattleResultDto {
  battleId: string;
  randomSeed: number;
  status: 'COMPLETED';
  winner: 'LEFT' | 'RIGHT' | 'DRAW';
  initialState: BattleInitialStateDto;
  events: BattleEventDto[];
  heroStatistics?: BattleHeroStatisticsDto[];
}
