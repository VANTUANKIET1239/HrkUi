import { Component, ElementRef, HostListener, Input, ViewChild, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EquipmentTooltipItem, EquipmentTooltipService } from './equipment-tooltip.service';

export interface StatComparisonRow {
  key: string;
  label: string;
  icon: string;
  value: number;
  hasValue: boolean;
  baseRolledValue?: number | null;
  rollMinValue?: number | null;
  rollMaxValue?: number | null;
  rollQualityPercent?: number | null;
  comparedValue?: number;
  comparedBaseRolledValue?: number | null;
  diff?: number;
  diffFormatted?: string;
  isPercent?: boolean;
}

@Component({
  selector: 'app-equipment-tooltip',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './equipment-tooltip.component.html',
  styleUrls: ['./equipment-tooltip.component.scss']
})
export class EquipmentTooltipComponent {
  readonly tooltipService = inject(EquipmentTooltipService);

  @Input() item: EquipmentTooltipItem | null = null;
  @Input() comparedItem: EquipmentTooltipItem | null | undefined = undefined;
  @Input() isFloating = true;
  @Input() customX?: number;
  @Input() customY?: number;

  @ViewChild('tooltipCard') tooltipCardRef?: ElementRef<HTMLDivElement>;

  // Read either direct inputs or global service state
  readonly activeItem = computed(() => this.item || this.tooltipService.state().item);
  readonly activeComparedItem = computed(() => this.comparedItem !== undefined ? this.comparedItem : this.tooltipService.state().comparedItem);
  readonly isVisible = computed(() => {
    if (this.item) return true;
    return this.tooltipService.state().visible;
  });
  readonly isPinned = computed(() => this.tooltipService.state().isPinned);

  get posX(): number {
    if (this.customX !== undefined) return this.customX;
    return this.tooltipService.state().x;
  }

  get posY(): number {
    if (this.customY !== undefined) return this.customY;
    return this.tooltipService.state().y;
  }

  get calculatedPosition(): { left: string; top: string } {
    if (!this.isFloating) {
      return { left: 'auto', top: 'auto' };
    }

    const margin = 16;
    const rect = this.tooltipCardRef?.nativeElement.getBoundingClientRect();
    const tooltipWidth = rect?.width ?? 320;
    const tooltipHeight = rect?.height ?? 440;

    let x = this.posX + 15;
    let y = this.posY - 30;

    // Viewport bounds check
    if (typeof window !== 'undefined') {
      if (x + tooltipWidth > window.innerWidth - margin) {
        x = this.posX - tooltipWidth - 15;
      }
      if (x < margin) {
        x = margin;
      }

      if (y + tooltipHeight > window.innerHeight - margin) {
        y = window.innerHeight - tooltipHeight - margin;
      }
      if (y < margin) {
        y = margin;
      }
    }

    return {
      left: `${Math.round(x)}px`,
      top: `${Math.round(y)}px`
    };
  }

  get rarityClass(): string {
    const item = this.activeItem();
    if (!item) return 'common';
    return String(item.rarityCode || item.rarity || 'common')
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '-');
  }

  get rarityColor(): string {
    return this.activeItem()?.rarityColorHex || '#9e9e9e';
  }

  get rarityDisplayName(): string {
    const item = this.activeItem();
    if (!item) return 'Thông Thường';
    if (item.rarityName) return item.rarityName;
    return item.rarityCode || item.rarity || 'Trang bị';
  }

  get categoryDisplayName(): string {
    const item = this.activeItem();
    if (!item) return 'Trang bị';
    if (item.categoryName) return item.categoryName;
    return item.categoryCode || item.category || 'Trang bị';
  }

  get starSlots(): number[] {
    const configuredMax = Number(this.activeItem()?.maxStars);
    const maximum = Number.isFinite(configuredMax) && configuredMax > 0 ? configuredMax : 5;
    return Array.from({ length: maximum }, (_, index) => index + 1);
  }

  get growthPercent(): number | null {
    const item = this.activeItem();
    if (!item) return null;
    const g = item.enhancementGrowthPercent;
    return g !== undefined && g !== null ? Number(g) : null;
  }

  get growthRange(): { min: number; max: number } | null {
    const item = this.activeItem();
    if (!item) return null;
    const min = item.enhancementGrowthMinPercent;
    const max = item.enhancementGrowthMaxPercent;
    if (min !== undefined && min !== null && max !== undefined && max !== null) {
      return { min: Number(min), max: Number(max) };
    }
    return null;
  }

  get comparedGrowthPercent(): number | null {
    const item = this.activeComparedItem();
    if (!item) return null;
    const g = item.enhancementGrowthPercent;
    return g !== undefined && g !== null ? Number(g) : null;
  }

  get statRows(): StatComparisonRow[] {
    const currentItem = this.activeItem();
    const comparedItem = this.activeComparedItem();
    const current = this.parseStats(currentItem?.stats);
    const compared = this.parseStats(comparedItem?.stats);
    const definitions = this.mergeAttributeDefinitions(currentItem, comparedItem);

    const rows: StatComparisonRow[] = [];

    for (const def of definitions) {
      const rawVal = current[def.key] ?? def.currentValue;
      const rawCompVal = compared[def.key] ?? def.comparedValue;
      const val = rawVal !== undefined && def.isPercent && Math.abs(rawVal) <= 1 ? rawVal * 100 : rawVal;
      const compVal = rawCompVal !== undefined && def.isPercent && Math.abs(rawCompVal) <= 1 ? rawCompVal * 100 : rawCompVal;

      if (val !== undefined || compVal !== undefined) {
        const itemVal = val ?? 0;
        let diff: number | undefined = undefined;
        let diffFormatted: string | undefined = undefined;

        if (compVal !== undefined) {
          diff = itemVal - compVal;
          const sign = diff > 0 ? '+' : '';
          diffFormatted = `${sign}${diff}${def.isPercent ? '%' : ''}`;
        }

        rows.push({
          key: def.key,
          label: def.label,
          icon: 'bi-activity',
          value: itemVal,
          hasValue: val !== undefined,
          baseRolledValue: def.baseRolledValue,
          rollMinValue: def.rollMinValue,
          rollMaxValue: def.rollMaxValue,
          rollQualityPercent: def.rollQualityPercent,
          comparedValue: compVal,
          comparedBaseRolledValue: def.comparedBaseRolledValue,
          diff,
          diffFormatted,
          isPercent: def.isPercent
        });
      }
    }

    return rows;
  }

  get powerDiff(): { text: string; isPositive: boolean; value: number } | null {
    if (!this.activeComparedItem()) return null;
    const powerA = Number(this.activeItem()?.combatPower);
    const powerB = Number(this.activeComparedItem()?.combatPower);
    if (!Number.isFinite(powerA) || !Number.isFinite(powerB)) return null;
    const diff = powerA - powerB;
    if (diff === 0) return null;
    return {
      text: diff > 0 ? `+${diff}` : `${diff}`,
      isPositive: diff > 0,
      value: diff
    };
  }

  private parseStats(stats: any): Record<string, number> {
    if (!stats) return {};
    let parsed: any = stats;
    if (typeof stats === 'string') {
      try {
        parsed = JSON.parse(stats);
      } catch {
        return {};
      }
    }

    const res: Record<string, number> = {};
    for (const [key, rawValue] of Object.entries(parsed)) {
      const value = Number(rawValue);
      if (Number.isFinite(value)) {
        res[key.toUpperCase()] = value;
      }
    }
    return res;
  }

  private mergeAttributeDefinitions(
    currentItem?: EquipmentTooltipItem | null,
    comparedItem?: EquipmentTooltipItem | null
  ): Array<{
    key: string;
    label: string;
    isPercent: boolean;
    currentValue?: number;
    baseRolledValue?: number | null;
    rollMinValue?: number | null;
    rollMaxValue?: number | null;
    rollQualityPercent?: number | null;
    comparedValue?: number;
    comparedBaseRolledValue?: number | null;
    displayOrder: number;
  }> {
    const definitions = new Map<string, any>();

    const addAttr = (attr: any, side: 'current' | 'compared') => {
      const key = String(attr?.attributeCode || '').toUpperCase();
      if (!key) return;
      const existing = definitions.get(key) || {
        key,
        label: attr.attributeName || key,
        isPercent: Boolean(attr.isPercentage),
        displayOrder: Number(attr.displayOrder) || 0
      };

      const rawVal = Number(attr.currentValue ?? attr.value);
      const isPercent = existing.isPercent;
      const normalizedVal = isPercent && Math.abs(rawVal) <= 1 ? rawVal * 100 : rawVal;

      if (side === 'current') {
        existing.currentValue = normalizedVal;
        existing.baseRolledValue = attr.baseRolledValue !== undefined ? Number(attr.baseRolledValue) : undefined;
        const minV = attr.rollMinValue ?? attr.minValue;
        const maxV = attr.rollMaxValue ?? attr.maxValue;
        const qualityV = attr.rollQualityPercent ?? attr.rollPercent;
        existing.rollMinValue = minV !== undefined && minV !== null ? Number(minV) : undefined;
        existing.rollMaxValue = maxV !== undefined && maxV !== null ? Number(maxV) : undefined;
        existing.rollQualityPercent = qualityV !== undefined && qualityV !== null ? Number(qualityV) : undefined;
      } else {
        existing.comparedValue = normalizedVal;
        existing.comparedBaseRolledValue = attr.baseRolledValue !== undefined ? Number(attr.baseRolledValue) : undefined;
      }

      definitions.set(key, existing);
    };

    // Extract attributes from currentItem (attributes or rolledAttributes)
    const currentAttrs = currentItem?.rolledAttributes?.length
      ? currentItem.rolledAttributes
      : currentItem?.attributes;
    currentAttrs?.forEach(a => addAttr(a, 'current'));

    // Extract attributes from comparedItem
    const comparedAttrs = comparedItem?.rolledAttributes?.length
      ? comparedItem.rolledAttributes
      : comparedItem?.attributes;
    comparedAttrs?.forEach(a => addAttr(a, 'compared'));

    return [...definitions.values()].sort((a, b) => a.displayOrder - b.displayOrder);
  }

  close(): void {
    this.tooltipService.hide(true);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close();
  }
}
