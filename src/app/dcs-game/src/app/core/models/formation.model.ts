import { PlayerHeroDto } from './player-hero.model';

export interface FormationStatBonusDto {
  hpPercent: number;
  atkPercent: number;
  defPercent: number;
  spdPercent: number;
  magicDamagePercent: number;
  magicResistancePercent: number;
}

export interface PlayerFormationSummaryDto {
  templateId: number;
  code: string;
  name: string;
  description?: string;
  imagePath?: string;
  level: number;
  maxLevel: number;
  isUnlocked: boolean;
  isSelected: boolean;
  baseHeroPower: number;
  formationBonusPower: number;
  totalPower: number;
  heroCount: number;
  currentBonus: FormationStatBonusDto;
  displayOrder: number;
}

export interface FormationSlotDto {
  slot: number;
  rowType: 'FRONT' | 'BACK' | string;
  lane: number;
  displayX: number;
  displayY: number;
  hero: PlayerHeroDto | null;
}

export interface FormationUpgradeCostDto {
  goldCost: number;
  stoneCost: number;
  stoneItemTemplateId: number;
  playerGold: number;
  playerStones: number;
  canUpgrade: boolean;
  cannotUpgradeReason?: string | null;
}

export interface FormationDetailDto {
  templateId: number;
  code: string;
  name: string;
  description?: string;
  imagePath?: string;
  level: number;
  maxLevel: number;
  isSelected: boolean;
  isUnlocked: boolean;
  slots: FormationSlotDto[];
  baseHeroPower: number;
  formationBonusPower: number;
  totalPower: number;
  currentBonus: FormationStatBonusDto;
  nextLevelBonus?: FormationStatBonusDto | null;
  upgradeCost?: FormationUpgradeCostDto | null;
}

export interface SlotHeroPositionDto {
  slot: number;
  heroId: number | null;
}

export interface UpdateFormationPositionsRequest {
  positions: SlotHeroPositionDto[];
}

export interface FormationUpgradeResultDto {
  code: string;
  newLevel: number;
  newBonus: FormationStatBonusDto;
  newWalletGold: number;
  newStoneQuantity: number;
  baseHeroPower: number;
  formationBonusPower: number;
  totalPower: number;
  nextUpgradeCost?: FormationUpgradeCostDto | null;
}
