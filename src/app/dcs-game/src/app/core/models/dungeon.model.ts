import { StartBattleResultDto } from './battle.model';
import { EquipmentRolledAttributeDto } from './inventory.model';

export type DungeonMapState = 'COMPLETED' | 'AVAILABLE' | 'NOT_REACHED' | 'LEVEL_LOCKED';
export type DungeonStageState = 'CLEARED' | 'AVAILABLE' | 'LOCKED';
export type StarChestState = 'LOCKED' | 'CLAIMABLE' | 'CLAIMED';

export interface DungeonPossibleDrop {
  itemTemplateId: number;
  code: string;
  name: string;
  imagePath?: string | null;
  rarityCode: string;
  rarityName: string;
  rarityColorHex?: string | null;
  categoryCode: string;
  categoryName?: string | null;
  dropRatePercent: number;
}

export interface DungeonDroppedEquipment {
  inventoryItemId: number;
  itemTemplateId: number;
  code: string;
  name: string;
  imagePath?: string | null;
  rarityCode: string;
  rarityName: string;
  rarityColorHex?: string | null;
  categoryCode: string;
  count: number;
  enhancementGrowthPercent?: number | null;
  enhancementGrowthMinPercent?: number | null;
  enhancementGrowthMaxPercent?: number | null;
  overallRollPercent?: number | null;
  rolledAttributes?: EquipmentRolledAttributeDto[] | null;
  currentStats?: Record<string, number> | null;
  combatPower?: number | null;
}

export interface BattleFormationPosition {
  slot: number;
  heroId: number | null;
}

export interface BattleFormationDraft {
  formationCode: string;
  positions: BattleFormationPosition[];
}

export interface FormationPreviewResponse {
  formationCode: string;
  formationName: string;
  formationLevel: number;
  currentBonus: any;
  slots: any[];
  baseHeroPower: number;
  formationBonusPower: number;
  totalPower: number;
  isValid: boolean;
  validationErrors: string[];
}

export interface DungeonStarChest {
  id: number;
  dungeonMapId: number;
  requiredStars: number;
  state: StarChestState;
  goldReward: number;
  diamondReward: number;
  upgradeMaterialsReward: number;
  guaranteedItem?: DungeonPossibleDrop | null;
  displayOrder: number;
  description?: string | null;
  claimedOn?: string | null;
}

export interface ClaimStarChestResult {
  chestId: number;
  requiredStars: number;
  goldGained: number;
  diamondsGained: number;
  upgradeMaterialsGained: number;
  droppedEquipment?: DungeonDroppedEquipment | null;
  chest: DungeonStarChest;
}

export interface DungeonEnemy {
  position: number;
  name: string;
  imagePath: string;
  level: number;
  stars: number;
  isBoss: boolean;
  power: number;
}

export interface DungeonStage {
  id: number;
  stageNumber: number;
  name: string;
  stageType: 'NORMAL' | 'MINI_BOSS' | 'BOSS';
  state: DungeonStageState;
  bestStars: number;
  staminaCost: number;
  recommendedPower: number;
  playerPower: number;
  enemyPower: number;
  goldReward: number;
  firstClearGoldReward: number;
  playerExpReward: number;
  heroExpReward: number;
  backgroundPath?: string | null;
  enemies: DungeonEnemy[];
  possibleDrops?: DungeonPossibleDrop[];
}

export interface DungeonMap {
  id: number;
  code: string;
  name: string;
  description?: string | null;
  imagePath: string;
  backgroundPath: string;
  requiredPlayerLevel: number;
  clearedStages: number;
  totalStages: number;
  state: DungeonMapState;
}

export interface DungeonMapDetail extends DungeonMap {
  totalStars: number;
  starChests: DungeonStarChest[];
  stages: DungeonStage[];
}

export interface DungeonStamina {
  current: number;
  max: number;
  nextRecoverySeconds: number;
  purchaseCount: number;
  nextPurchaseCost: number;
  purchaseAmount: number;
}

export interface HeroExpResult {
  playerHeroId: number;
  heroName: string;
  avatar?: string;
  expGained: number;
  oldLevel: number;
  newLevel: number;
  oldExp: number;
  newExp: number;
  oldMaxExp?: number;
  newMaxExp?: number;
}

export interface DungeonResult {
  runId: number;
  result: 'VICTORY' | 'DEFEAT';
  earnedStars: number;
  previousBestStars: number;
  bestStars: number;
  isNewStarRecord: boolean;
  remainingHpRate: number;
  totalMapStars: number;
  staminaSpent: number;
  staminaRemaining: number;
  goldGained: number;
  isFirstClear: boolean;
  playerExpGained: number;
  oldPlayerLevel: number;
  newPlayerLevel: number;
  oldPlayerExp: number;
  newPlayerExp: number;
  unlockedStageId?: number | null;
  heroes: HeroExpResult[];
  droppedEquipment?: DungeonDroppedEquipment | null;
  isBagFull?: boolean;
  heroStatistics?: import('./battle.model').BattleHeroStatisticsDto[];
}

export interface StartDungeonStageResult {
  battle: StartBattleResultDto;
  result: DungeonResult;
}

