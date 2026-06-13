export interface BattleLog {
  turn: number;
  actorId: number;
  targetId: number;
  skillId: string;
  damage: number;
  isCrit: boolean;
  actorPosition?: number;
  targetPosition?: number;
}
