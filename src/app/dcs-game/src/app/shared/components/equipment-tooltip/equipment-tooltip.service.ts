import { Injectable, signal } from '@angular/core';

export interface EquipmentTooltipItem {
  id?: number | null;
  name?: string | null;
  imagePath?: string | null;
  icon?: string | null;
  rarityCode?: string | null;
  rarityName?: string | null;
  rarityColorHex?: string | null;
  rarity?: string | null;
  categoryCode?: string | null;
  categoryName?: string | null;
  category?: string | null;
  levelReq?: number | null;
  enhancement?: number | null;
  enhancementGrowthPercent?: number | null;
  enhancementGrowthMinPercent?: number | null;
  enhancementGrowthMaxPercent?: number | null;
  stars?: number | null;
  maxStars?: number | null;
  stats?: unknown;
  attributes?: Array<{
    attributeCode: string;
    attributeName: string;
    isPercentage: boolean;
    value: number;
    baseRolledValue?: number | null;
    rollMinValue?: number | null;
    rollMaxValue?: number | null;
    rollQualityPercent?: number | null;
    displayOrder: number;
  }> | null;
  rolledAttributes?: Array<{
    attributeTypeId: number;
    attributeCode: string;
    attributeName: string;
    isPercentage: boolean;
    baseRolledValue: number;
    currentValue: number;
    rollMinValue: number;
    rollMaxValue: number;
    rollQualityPercent: number;
  }> | null;
  combatPower?: number | null;
  equippedHeroName?: string | null;
  isEquipped?: boolean | null;
  description?: string | null;
  desc?: string | null;
  sellPrice?: number | null;
  count?: number | null;
}

export interface TooltipState {
  visible: boolean;
  item: EquipmentTooltipItem | null;
  comparedItem?: EquipmentTooltipItem | null;
  x: number;
  y: number;
  isPinned: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class EquipmentTooltipService {
  readonly state = signal<TooltipState>({
    visible: false,
    item: null,
    comparedItem: null,
    x: 0,
    y: 0,
    isPinned: false
  });

  show(target: MouseEvent | HTMLElement, item: EquipmentTooltipItem, comparedItem?: EquipmentTooltipItem | null): void {
    if (this.state().isPinned) {
      return; // Do not overwrite pinned tooltip on hover
    }

    const pos = this.calculatePosition(target);
    this.state.set({
      visible: true,
      item,
      comparedItem: comparedItem || null,
      x: pos.x,
      y: pos.y,
      isPinned: false
    });
  }

  pin(target: MouseEvent | HTMLElement, item: EquipmentTooltipItem, comparedItem?: EquipmentTooltipItem | null): void {
    const pos = this.calculatePosition(target);
    this.state.set({
      visible: true,
      item,
      comparedItem: comparedItem || null,
      x: pos.x,
      y: pos.y,
      isPinned: true
    });
  }

  hide(force: boolean = false): void {
    if (this.state().isPinned && !force) {
      return;
    }
    this.state.set({
      visible: false,
      item: null,
      comparedItem: null,
      x: 0,
      y: 0,
      isPinned: false
    });
  }

  private calculatePosition(target: MouseEvent | HTMLElement): { x: number; y: number } {
    if (target instanceof MouseEvent) {
      return { x: target.clientX, y: target.clientY };
    }
    if (target && typeof target.getBoundingClientRect === 'function') {
      const rect = target.getBoundingClientRect();
      return {
        x: rect.right + 10,
        y: rect.top
      };
    }
    return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  }
}
