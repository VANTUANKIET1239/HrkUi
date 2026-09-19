export type SkillCategory = 'basic' | 'rage' | 'thunder' | 'ultimate' | 'heavenly';
export type TargetRangeType =
  | 'single'
  | 'front_row'
  | 'back_row'
  | 'linear'
  | 'all'
  | 'same_lane_back_row'
  | 'random'
  | 'aoe_all'
  | 'front_and_back'
  | 'random_4'
  | 'friendly_all'
  | 'friendly_random';

export type SkillTypeCode = 'NORMAL' | 'ENERGY' | 'PASSIVE';
export type SkillTriggerCode =
  | 'MANUAL_ENERGY_FULL'
  | 'BATTLE_START'
  | 'ON_ATTACK'
  | 'ON_HIT'
  | 'ON_CRIT'
  | 'ON_LOW_HP'
  | 'ON_DEATH'
  | 'ON_ALLY_DEATH';

export type DamageSchoolCode = 'PHYSICAL' | 'MAGIC' | 'TRUE';

export interface SkillEffectScaling {
  attributeTypeCode: string;
  attributeTypeName?: string;
  coefficient: number;
  flatValue: number;
}

export interface SkillEffectStatModifier {
  attributeTypeCode: string;
  attributeTypeName?: string;
  valueType: 'FLAT' | 'PERCENT';
  value: number;
}

export interface SkillEffect {
  id?: number;
  effectTypeCode: string;
  effectTypeName?: string;
  effectGroup?: string;
  isBeneficial?: boolean;
  targetTypeCode: string;
  targetTypeName?: string;
  targetSide?: string;
  selectionRule?: string;
  damageSchoolCode?: DamageSchoolCode | string | null;
  baseValue?: number;
  durationTurns?: number | null;
  chancePercent?: number;
  maxStacks?: number | null;
  displayOrder?: number;
  scalings?: SkillEffectScaling[];
  statModifiers?: SkillEffectStatModifier[];
}

export interface Skill {
  id: string;
  name: string;
  imagePath?: string | null;
  icon?: string;
  skillTypeCode?: SkillTypeCode;
  triggerCode?: SkillTriggerCode;
  energyCost?: number;
  displayOrder?: number;
  effects?: SkillEffect[];

  // Legacy properties for backward compatibility
  cost?: number;
  costType?: 'MP' | 'HP' | string;
  category?: SkillCategory;
  color?: string;
  type?: 'physical' | 'magical' | 'ultimate' | string;
  description?: string;
  damageMultiplier?: number;
  isAoE?: boolean;
  targetType?: TargetRangeType | string;
  phase1Duration?: number;
  phase2Duration?: number;
  phase3Duration?: number;
  healMultiplier?: number;
  damageReductionMultiplier?: number;
  redirectRatio?: number;
}
