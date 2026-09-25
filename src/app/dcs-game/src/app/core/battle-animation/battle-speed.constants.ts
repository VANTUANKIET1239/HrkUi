export type BattleSpeed = 1 | 2 | 4;

export const VISUAL_SPEED_BY_BATTLE_SPEED: Readonly<Record<BattleSpeed, number>> = {
  1: 1,
  2: 1.35,
  4: 1.6
};
