import { GameEventItem, TowerProgress, TowerFloorSummary, TowerFloorDetail, StartTowerBattleResult, PendingReward, TowerQuickClimbJob } from '../models/event.model';
import { WireEvent, WireProgress, WireFloor, WireTowerResult, WirePendingReward, WireQuickJob } from '../models/tower-wire.model';

export const mapEvent = (x: WireEvent): GameEventItem => ({
  ...x, currentFloor: x.playerProgress?.currentFloor ?? 1,
  remainingLives: x.playerProgress?.remainingLives ?? x.initialLives,
  pendingRewardsCount: x.playerProgress?.pendingRewardsCount ?? 0,
  secondsUntilReset: x.remainingSecondsToReset,
  resetTimeText: new Date(x.nextResetTimeUtc).toLocaleTimeString('vi-VN')
});
export const mapFloor = (x: WireFloor): TowerFloorSummary => ({
  ...x, isMilestone: x.hasMilestoneChest, chest: x.chestInfo,
  representativeEnemyName: x.representativeEnemy?.name,
  representativeEnemyAvatar: x.representativeEnemy?.imagePath,
  representativeEnemyPower: x.representativeEnemy?.power,
  isCleared: x.state === 'CLEARED', isCurrent: x.state === 'CURRENT', isLocked: x.state === 'LOCKED'
});
export const mapProgress = (x: WireProgress): TowerProgress => ({
  ...x, resetTimeUtc: x.periodEndUtc,
  hasActiveQuickClimbJob: x.hasActiveQuickClimb,
  leadHero: x.leadHero ? { ...x.leadHero, heroId: x.leadHero.id } : undefined,
  floors: x.floors.map(mapFloor)
});
export const mapFloorDetail = (x: WireFloor): TowerFloorDetail => ({
  ...x, initialLives: x.maxLives,
  isUnlocked: x.canStart, isCurrent: x.state === 'CURRENT', isCleared: x.state === 'CLEARED',
  lockReason: x.lockedReason, playerExpReward: x.rewards.find(r => r.type === 'PLAYER_EXP')?.quantity ?? 0,
  heroExpReward: x.rewards.find(r => r.type === 'HERO_EXP')?.quantity ?? 0
});
export const mapResult = (x: WireTowerResult): StartTowerBattleResult => ({
  ...x, milestoneUnlocked: x.isMilestoneChestUnlocked, battleSimulation: x.battle,
  heroExpResults: x.heroes, playerNewLevel: x.newPlayerLevel, playerNewExp: x.newPlayerExp
});
export const mapPending = (x: WirePendingReward): PendingReward => ({ ...x, items: x.rewardItems });
export const isQuickClimbFinished = (status: string): boolean =>
  ['COMPLETED', 'STOPPED_DEFEAT', 'CANCELLED', 'EXPIRED', 'ERROR'].includes(status);
export const mapJob = (x: WireQuickJob): TowerQuickClimbJob => ({
  ...x, isCompleted: isQuickClimbFinished(x.status),
  logs: x.logs.map(l => `Tầng ${l.floorNumber}: ${l.isVictory ? 'Thắng' : 'Thua'} · ${l.totalTurns} lượt`)
});
