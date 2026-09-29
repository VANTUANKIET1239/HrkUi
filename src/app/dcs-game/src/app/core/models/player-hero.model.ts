import { InventoryItemDto, HeroEquipmentDto } from './inventory.model';
import { SkillEffect, SkillTypeCode, SkillTriggerCode } from './skill.model';

export type EquipmentSlot =
  | 'Weapon'
  | 'Armor'
  | 'Helmet'
  | 'Boots'
  | 'Ring'
  | 'Artifact';

export interface HeroEquipmentSlot {
  slot: EquipmentSlot;
  displayName: string;
  icon: string;
  item: InventoryItemDto | null;
}

export interface HeroStatsDto {
  hp: number;
  atk: number;
  def: number;
  spd: number;
  crit: number;
  critDmg: number;
  lifesteal: number;
  accuracy: number;
  resistance: number;
  magicDamage?: number;
  magicResistance?: number;
}

export interface HeroUpgradePreviewDto {
  heroId: number;
  currentLevel: number;
  nextLevel: number;
  maxLevel: number;
  goldCost: number;
  materialCost: number;
  currentStats: HeroStatsDto;
  nextStats: HeroStatsDto;
  statIncrease: HeroStatsDto;
}

export interface HeroStatSourceDto {
  sourceType: 'BASE' | 'HERO_GROWTH' | 'EQUIPMENT' | 'AURA' | 'OTHER' | string;
  sourceName: string;
  itemName?: string;
  inventoryItemId?: number;
  value: number;
}

export interface HeroStatBreakdownDto {
  statCode: string;
  displayName: string;
  total: number;
  baseValue: number;
  heroGrowthValue: number;
  equipmentValue: number;
  auraValue: number;
  otherValue: number;
  sources: HeroStatSourceDto[];
}

export interface HeroSkillDto {
  id: string;
  name: string;
  imagePath?: string | null;
  icon: string;
  description?: string;
  skillTypeCode?: SkillTypeCode;
  triggerCode?: SkillTriggerCode | string;
  energyCost?: number;
  displayOrder?: number;
  effects?: SkillEffect[];
  animation?: SkillAnimationConfigDto | null;

  // Legacy fields
  cost?: number;
  costTypeCode?: string;
  costTypeName?: string;
  categoryCode?: string;
  categoryName?: string;
  damageTypeCode?: string;
  damageTypeName?: string;
  effectTypeCode?: string;
  effectTypeName?: string;
  isDebuff?: boolean;
  targetType?: string;
  cooldown?: string;
}

export interface SkillTimelinePhaseDto {
  phaseCode: string;
  startAtMs: number;
  durationMs: number;
  triggerEventType?: string | null;
  displayOrder: number;
}

export interface SkillAnimationConfigDto {
  animationKey: string;
  totalDurationMs: number;
  defaultPlaybackSpeed: number;
  phases: SkillTimelinePhaseDto[];
}

import { HeroStarAuraConfig } from './hero.model';

export interface PlayerHeroDto {
  id: number;
  heroTemplateId?: number;
  heroCode?: string;
  name: string;
  avatar: string;
  factionName: string;
  className: string;
  rarityId: number;
  rarityCode: string;
  rarityName: string;
  rarityColorHex?: string;
  level: number;
  exp: number;
  maxExp: number;
  stars: number;
  power: number;
  auraTier: number;
  isLocked: boolean;
  isFavorite: boolean;
  position?: number | null;
  stats: HeroStatsDto;
  skills: HeroSkillDto[];
  starAura?: HeroStarAuraConfig | null;
}

export interface PlayerHeroDetailDto extends PlayerHeroDto {
  equipment: HeroEquipmentDto;
  statBreakdowns: HeroStatBreakdownDto[];
  starBonusAttributes: HeroBonusAttributeDto[];
}

export interface SwapHeroEquipmentResultDto {
  sourceHero: PlayerHeroDetailDto;
  targetHero: PlayerHeroDetailDto;
}
export interface StarMaterialRequirementDto { itemTemplateId:number; name:string; imagePath?:string; required:number; owned:number; }
export interface HeroBonusAttributeDto { unlockedAtStar:number; code:string; name:string; value:number; isPercentage:boolean; }
export interface HeroStarUpgradePreviewDto { heroId:number; currentStar:number; nextStar:number; currentLevel:number; maxStar:number; goldRequired:number; goldOwned:number; universalStone:StarMaterialRequirementDto; heroStone:StarMaterialRequirementDto; currentStats:HeroStatsDto; nextStats:HeroStatsDto; statIncrease:HeroStatsDto; currentGrowthRate:number; nextGrowthRate:number; currentBonusAttributes:HeroBonusAttributeDto[]; willUnlockBonusAttribute:boolean; currentCombatPower:number; nextCombatPower:number; canUpgrade:boolean; reasonCode?:string; message?:string; }

export type EquipmentDragPayload =
  | {
      source: 'inventory';
      inventoryItemId: string | number;
    }
  | {
      source: 'equipped';
      heroId: string | number;
      slotCode: string;
      inventoryItemId?: string | number;
    };
