export interface EquipmentRolledAttributeDto {
  attributeTypeId: number;
  attributeCode: string;
  attributeName: string;
  valueType?: 'FLAT' | 'PERCENT';
  isPercentage: boolean;
  baseRolledValue: number;
  enhancementValue?: number;
  currentValue: number;
  minValue: number;
  maxValue: number;
  rollMinValue: number;
  rollMaxValue: number;
  rollPercent: number;
  rollQualityPercent: number;
  displayOrder?: number;
}

export interface InventoryItemDto {
  id: number;
  itemTemplateId: number;
  itemCode: string;
  name: string;
  imagePath?: string;
  icon: string;
  rarityId: number;
  rarityCode: string;
  rarityName: string;
  rarityColorHex?: string;
  rarityDisplayOrder: number;
  categoryId: number;
  categoryCode: string;
  categoryName: string;
  categoryDisplayOrder: number;
  isEquipment: boolean;
  count: number;
  levelReq: number;
  description?: string;
  sellPrice: number;
  stats?: any;
  attributes?: ItemAttributeDto[];
  rolledAttributes?: EquipmentRolledAttributeDto[];
  enhancementGrowthPercent?: number;
  enhancementGrowthMinPercent?: number;
  enhancementGrowthMaxPercent?: number;
  overallRollPercent?: number;
  combatPower?: number;
  isLocked: boolean;
  isEquipped: boolean;
  equippedHeroId?: number;
  equippedHeroName?: string;
  enhancement: number;
  stars: number;
  slotIndex?: number;
}

export interface ItemAttributeDto {
  attributeTypeId: number;
  attributeCode: string;
  attributeName: string;
  isPercentage: boolean;
  valueType?: 'FLAT' | 'PERCENT';
  value: number;
  baseRolledValue?: number;
  enhancementValue?: number;
  currentValue?: number;
  minValue?: number;
  maxValue?: number;
  rollPercent?: number;
  displayOrder: number;
}

export interface HeroEquipmentDto {
  heroId: number;
  weapon?: InventoryItemDto;
  armor?: InventoryItemDto;
  helmet?: InventoryItemDto;
  boots?: InventoryItemDto;
  ring?: InventoryItemDto;
  artifact?: InventoryItemDto;
}

export interface ItemCategoryDto {
  id: number;
  code: string;
  name: string;
  icon?: string;
  description?: string;
  displayOrder: number;
  isEquipment: boolean;
}

export interface ItemRarityDto {
  id: number;
  code: string;
  name: string;
  colorHex?: string;
  displayOrder: number;
}

export interface SellItemRequestItem {
  inventoryItemId: number;
  count: number;
}

export interface SellItemsResponseDto {
  earnedGold: number;
  currentGold: number;
  soldItemsCount: number;
}
