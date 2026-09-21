/**
 * Pure helper function to determine whether a character sprite should be horizontally flipped (`scaleX(-1)`).
 * 
 * Rules:
 * - Left team characters must face RIGHT towards the enemy.
 * - Right team characters must face LEFT towards the enemy.
 * - If asset's defaultFacing matches the desired direction, no flip is needed (`false`).
 * - If asset's defaultFacing is opposite to the desired direction, flip is needed (`true`).
 * 
 * @param team Team side of the character: 'left' or 'right'
 * @param defaultFacing Intrinsic facing direction of the raw asset image: 'left' | 'right' (defaults to 'right')
 * @returns boolean `true` if `scaleX(-1)` is needed, `false` otherwise
 */
export function getSpriteFlipState(team: 'left' | 'right', defaultFacing?: 'left' | 'right'): boolean {
  const facing = defaultFacing || 'right';
  if (team === 'left') {
    return facing === 'left';
  } else {
    return facing === 'right';
  }
}
