export const LONG_LE_CAT_PROJECTILE_ASSET = '/assets/images/dcs-game/skill-vfx/long-le-cat/long-le-cat-projectile.png';
export const LONG_LE_CAT_AIRBORNE_ASSET = '/assets/images/dcs-game/skill-vfx/long-le-cat/long-le-cat-airborne.png';
export const LONG_LE_CAT_LANDING_ASSET = '/assets/images/dcs-game/skill-vfx/long-le-cat/long-le-cat-landing.png';
export const LONG_LE_CAT_COMPANION_ASSET = '/assets/images/dcs-game/skill-vfx/long-le-cat/long-le-cat-companion.png';

export const CAT_SCRATCH_EFFECT_ASSET = '/assets/images/dcs-game/effects/cat-scratch.png';
export const DEEP_CAT_SCRATCH_EFFECT_ASSET = '/assets/images/dcs-game/effects/deep-cat-scratch.png';

export type LongLeCatEnergyPhase =
  | 'idle'
  | 'summon_circle' // 0-250ms: Summoning circle & paw prints around Long Lê
  | 'throw_motion'  // 250-500ms: Upward throw motion arc
  | 'airborne'      // 500-850ms: Cats flying in high parabolic arc
  | 'descend'       // 850-1150ms: Cats descending toward allies, landing markers
  | 'landing'       // 1150-1400ms: Landing dust ring, pulse confirmation
  | 'complete';     // 1400ms+: Settled / Cleanup

export type LongLeCatBasicPhase =
  | 'idle'
  | 'crouch_prep'   // 0-180ms: Gold prep ring at caster foot, crouching cat
  | 'pounce_flight' // 180-500ms: Parabolic flight from caster to target
  | 'claw_impact'   // 500-750ms: 3 staggered golden claw slashes on target
  | 'mark_placed'   // 700-900ms: 3 claws condense into CAT_SCRATCH pulse
  | 'cat_return'    // 750-1100ms: Cat bounces back to caster with golden blur & dissolves
  | 'complete';

export interface CatAllyTargetNode {
  id: number;
  x: number;
  y: number;
  catX: number;
  catY: number;
  apexX: number;
  apexY: number;
  landingX: number;
  landingY: number;
  currentAsset: string;
}
