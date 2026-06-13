export type SkillCategory = 'basic' | 'rage' | 'thunder' | 'ultimate' | 'heavenly';
export type TargetRangeType = 'single' | 'front_row' | 'back_row' | 'linear' | 'all' | 'same_lane_back_row' | 'random';

export interface Skill {
  id: string;
  name: string;
  cost: number;
  costType: 'MP' | 'HP';
  category: SkillCategory;
  color: string;
  type: 'physical' | 'magical' | 'ultimate';
  description: string;
  damageMultiplier: number;
  isAoE?: boolean;
  targetType?: TargetRangeType;
}
