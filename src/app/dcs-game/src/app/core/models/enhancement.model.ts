import { BaseResponse } from './player.model';

export interface EnhanceEquipmentRequest {
  requestId: string;
  inventoryItemId: number;
  stoneInventoryItemIds: number[];
  charmInventoryItemId?: number | null;
}

export interface ConsumedMaterialItem {
  itemTemplateId: number;
  code: string;
  name: string;
  quantity: number;
  successRateBonus: number;
}

export interface ConsumedResources {
  gold: number;
  stones: ConsumedMaterialItem[];
  charm?: ConsumedMaterialItem | null;
}

export interface EnhanceEquipmentResult {
  requestId: string;
  success: boolean;
  oldEnhancement: number;
  targetEnhancement: number;
  newEnhancement: number;
  baseSuccessRate: number;
  stoneBonusRate: number;
  charmBonusRate: number;
  finalSuccessRate: number;
  wasLevelProtected: boolean;
  currentStats: { [key: string]: number };
  currentStatsJson?: string;
  consumed: ConsumedResources;
  message: string;
}

export interface EnhancementLevelConfig {
  currentLevel: number;
  nextLevel: number;
  baseSuccessRate: number;
  goldCost: number;
  failureDropLevels: number;
  maxStoneSlots: number;
}

export interface EnhancementMaterialConfig {
  itemTemplateId: number;
  code: string;
  name: string;
  icon?: string;
  imagePath?: string;
  rarityCode: string;
  rarityName: string;
  rarityColorHex?: string;
  materialType: string; // 'STONE' | 'CHARM'
  successRateBonus: number;
  preventLevelDrop: boolean;
  description?: string;
}

export interface EnhancementConfigResponse {
  levelConfigs: EnhancementLevelConfig[];
  materials: EnhancementMaterialConfig[];
}

export interface ForgeEquipmentItem {
  inventoryItemId: number;
  itemTemplateId: number;
  code: string;
  name: string;
  imagePath?: string;
  icon?: string;
  categoryCode: string;
  categoryName: string;
  rarityCode: string;
  rarityName: string;
  rarityColorHex?: string;
  rarityOrder: number;
  levelReq: number;
  enhancement: number;
  stars: number;
  isEquipped: boolean;
  isLocked: boolean;
  canEnhance: boolean;
  enhancementBlockedReasonCode?: string | null;
  enhancementBlockedMessage?: string | null;
}

export interface EquipmentEnhancementPreview {
  inventoryItemId: number;
  currentEnhancement: number;
  targetEnhancement: number;
  currentStats: { [key: string]: number };
  nextStats: { [key: string]: number };
  baseSuccessRate: number;
  goldCost: number;
  failureDropLevels: number;
  maxStoneSlots: number;
  canEnhance: boolean;
  reasonCode?: string | null;
  message?: string | null;
}

