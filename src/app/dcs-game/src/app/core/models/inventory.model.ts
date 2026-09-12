import { BaseResponse } from './player.model';

export interface InventoryItemDto {
  id: number;
  itemTemplateId: number;
  name: string;
  imagePath?: string;
  icon: string;
  rarityId: number;
  rarityCode: string;
  rarityName: string;
  rarityColorHex?: string;
  categoryId: number;
  categoryCode: string;
  categoryName: string;
  isEquipment: boolean;
  count: number;
  levelReq: number;
  description?: string;
  stats?: any;
  isLocked: boolean;
  isEquipped: boolean;
  equippedHeroId?: number;
  enhancement: number;
  stars: number;
  slotIndex?: number;
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
}

export interface ItemRarityDto {
  id: number;
  code: string;
  name: string;
  colorHex?: string;
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
