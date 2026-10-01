import { GenericRewardItem, TowerChest, TowerFloorEnemy, TowerQuickClimbJob } from './event.model';
import { HeroExpResult } from './dungeon.model';
import { StartBattleResultDto } from './battle.model';

export interface WireFloor {
  floorNumber: number; name: string; floorType: 'NORMAL' | 'ELITE' | 'BOSS';
  recommendedPower: number; state: 'CLEARED' | 'CURRENT' | 'LOCKED';
  representativeEnemy?: TowerFloorEnemy; hasMilestoneChest: boolean; chestInfo?: TowerChest;
  rewards: GenericRewardItem[]; enemies: TowerFloorEnemy[];
  playerPower: number; enemyPower: number; remainingLives: number; maxLives: number;
  canStart: boolean; lockedReason?: string;
}
export interface WireProgress {
  eventId: number; eventName: string; periodKey: string; periodEndUtc: string;
  secondsUntilReset: number; currentFloor: number; maxFloor: number;
  remainingLives: number; initialLives: number; highestFloorInPeriod: number;
  highestFloorAllTime: number; isCompleted: boolean; hasActiveQuickClimb: boolean;
  activeQuickClimbJobId?: string; pendingRewardsCount: number; playerPower: number;
  leadHero?: { id: number; name: string; avatar: string; level: number; stars: number; power: number; rarityColorHex?: string };
  milestoneChests: TowerChest[]; floors: WireFloor[];
}
export interface WireEvent {
  id: number; code: string; name: string; eventType: string; description: string;
  bannerImagePath?: string; icon?: string; status: 'OPEN' | 'LOCKED' | 'ENDED';
  lockReason?: string; remainingSecondsToReset: number; nextResetTimeUtc: string;
  initialLives: number; maxFloor: number; playerProgress?: Partial<WireProgress>;
  highlightRewards: GenericRewardItem[];
}
export interface WireTowerResult {
  battle: StartBattleResultDto; floorNumber: number; nextFloorNumber?: number;
  livesBefore: number; livesAfter: number; isVictory: boolean; isRunEnded: boolean;
  isTowerCompleted: boolean; isMilestoneChestUnlocked: boolean; unlockedChest?: TowerChest;
  earnedRewards: GenericRewardItem[]; pendingRewards: GenericRewardItem[];
  playerExpGained: number; newPlayerLevel: number; newPlayerExp: number; heroes: HeroExpResult[];
}
export interface WirePendingReward {
  id: number; sourceType: string; description: string; status: string;
  createdOnUtc: string; rewardItems: GenericRewardItem[];
}
export interface WireQuickJob extends Omit<TowerQuickClimbJob, 'logs' | 'isCompleted'> {
  logs: { floorNumber: number; floorName: string; isVictory: boolean; totalTurns: number; livesRemaining: number }[];
}
