import { StartBattleResultDto, BattleHeroStatisticsDto } from './battle.model';
import { DungeonPossibleDrop, HeroExpResult } from './dungeon.model';

export interface GenericRewardItem {
  type: string; // GOLD, DIAMOND, HERO, ITEM, EQUIPMENT, ENHANCEMENT_STONE, UNIVERSAL_STAR_STONE, HERO_SHARDS
  name: string;
  imagePath?: string;
  quantity: number;
  referenceId?: number;
  itemRarity?: string;
  itemQuality?: string;
  attributesSummary?: string;
}

export interface GameEventItem {
  id: number;
  code: string;
  name: string;
  eventType: string; // TOWER, etc.
  description: string;
  bannerImagePath?: string;
  icon?: string;
  status: 'OPEN' | 'LOCKED' | 'ENDED';
  lockReason?: string;
  participationCondition?: string;
  currentFloor: number;
  maxFloor: number;
  remainingLives: number;
  initialLives: number;
  resetTimeText: string;
  secondsUntilReset: number;
  pendingRewardsCount: number;
  highlightRewards: GenericRewardItem[];
}

export interface TowerChest {
  id: number;
  floorNumber: number;
  chestName: string;
  chestIcon?: string;
  description?: string;
  state: 'LOCKED' | 'UNLOCKED' | 'CLAIMED';
  rewards: GenericRewardItem[];
}

export interface TowerFloorEnemy {
  heroTemplateId: number;
  name: string;
  imagePath?: string;
  level: number;
  stars: number;
  power: number;
  position: number;
  isBoss: boolean;
}

export interface TowerFloorSummary {
  floorNumber: number;
  floorType: 'NORMAL' | 'ELITE' | 'BOSS';
  recommendedPower: number;
  isMilestone: boolean;
  chest?: TowerChest;
  representativeEnemyName?: string;
  representativeEnemyAvatar?: string;
  representativeEnemyPower?: number;
  rewards: GenericRewardItem[];
  isCleared: boolean;
  isCurrent: boolean;
  isLocked: boolean;
}

export interface TowerFloorDetail {
  floorNumber: number;
  floorType: 'NORMAL' | 'ELITE' | 'BOSS';
  recommendedPower: number;
  playerPower: number;
  remainingLives: number;
  initialLives: number;
  isUnlocked: boolean;
  isCurrent: boolean;
  isCleared: boolean;
  lockReason?: string;
  playerExpReward: number;
  heroExpReward: number;
  rewards: GenericRewardItem[];
  enemies: TowerFloorEnemy[];
}

export interface TowerProgress {
  eventId: number;
  eventName: string;
  periodKey: string;
  resetTimeUtc: string;
  secondsUntilReset: number;
  currentFloor: number;
  maxFloor: number;
  remainingLives: number;
  initialLives: number;
  highestFloorInPeriod: number;
  highestFloorAllTime: number;
  quickClimbRunsUsed: number;
  quickClimbDailyLimit: number;
  quickClimbRunsRemaining: number;
  canStartQuickClimb: boolean;
  isCompleted: boolean;
  hasActiveQuickClimbJob: boolean;
  activeQuickClimbJobId?: string;
  pendingRewardsCount: number;
  playerPower: number;
  activeFormationCode?: string;
  leadHero?: {
    heroId: number;
    name: string;
    avatar: string;
    level: number;
    stars: number;
    power: number;
    rarityColorHex?: string;
  };
  milestoneChests: TowerChest[];
  floors: TowerFloorSummary[];
}

export interface StartTowerBattleResult {
  isVictory: boolean;
  floorNumber: number;
  livesBefore: number;
  livesAfter: number;
  nextFloorNumber?: number;
  isTowerCompleted: boolean;
  isRunEnded: boolean;
  earnedRewards: GenericRewardItem[];
  pendingRewards: GenericRewardItem[];
  milestoneUnlocked: boolean;
  unlockedChest?: TowerChest;
  battleSimulation: StartBattleResultDto;
  heroExpResults: HeroExpResult[];
  playerExpGained: number;
  playerNewLevel?: number;
  playerNewExp?: number;
}

export interface TowerQuickClimbJob {
  jobId: string;
  version: number;
  status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'STOPPED_DEFEAT' | 'CANCELLED' | 'EXPIRED' | 'ERROR';
  stopReason?: 'FIRST_DEFEAT' | 'TOWER_COMPLETED' | 'USER_CANCELLED' | 'PERIOD_EXPIRED' | 'EVENT_CLOSED' | 'RULES_CHANGED' | 'ERROR';
  startFloor: number;
  currentFloor: number;
  targetFloor: number;
  initialLives: number;
  remainingLives: number;
  clearedFloorsCount: number;
  dailyRunNumber: number;
  failedFloor?: number;
  accumulatedRewards: GenericRewardItem[];
  logs: string[];
  lastBattleId?: string;
  isCompleted: boolean;
}

export interface PendingReward {
  id: number;
  sourceType: string;
  description: string;
  status: string;
  createdOnUtc: string;
  items: GenericRewardItem[];
}

export interface ClaimMilestoneChestResult {
  chestId: number;
  floorNumber: number;
  rewards: GenericRewardItem[];
}
