import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EquipmentRolledAttributeDto } from '../../../core/models/inventory.model';

@Component({
  selector: 'app-equipment-roll-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './equipment-roll-details.component.html',
  styleUrl: './equipment-roll-details.component.scss'
})
export class EquipmentRollDetailsComponent {
  @Input() attributes: EquipmentRolledAttributeDto[] = [];
  @Input() showEnhancement = false;
  @Input() compact = false;

  private readonly nameMap: Record<string, string> = {
    HP: 'Sinh lực',
    HEALTH: 'Sinh lực',
    ATK: 'Tấn công',
    PHYSICAL_ATK: 'Tấn công',
    DEF: 'Phòng thủ',
    ARMOR: 'Phòng thủ',
    SPD: 'Tốc độ',
    SPEED: 'Tốc độ',
    CRIT: 'Bạo kích',
    CRIT_RATE: 'Tỷ lệ bạo',
    CRIT_DMG: 'ST Bạo kích',
    CRIT_DAMAGE: 'ST Bạo kích',
    MAGIC_DAMAGE: 'Công phép',
    MAGIC_ATK: 'Công phép',
    MAGIC_RESISTANCE: 'Kháng phép',
    MAGIC_RESIST: 'Kháng phép',
    LIFESTEAL: 'Hút máu',
    ACCURACY: 'Chính xác',
    DODGE: 'Né tránh',
    RESISTANCE: 'Kháng hiệu ứng'
  };

  getAttributeName(attr: EquipmentRolledAttributeDto): string {
    if (attr.attributeName && attr.attributeName !== attr.attributeCode) {
      return attr.attributeName;
    }
    const code = (attr.attributeCode || '').toUpperCase();
    return this.nameMap[code] || attr.attributeName || attr.attributeCode;
  }

  isPercent(attr: EquipmentRolledAttributeDto): boolean {
    return attr.isPercentage || attr.valueType === 'PERCENT';
  }

  formatValue(value: number, isPct: boolean): string {
    if (value === undefined || value === null) return '0';
    if (isPct) {
      const normalized = Math.abs(value) <= 1 && value !== 0 ? value * 100 : value;
      return `${normalized.toLocaleString('vi-VN', { maximumFractionDigits: 2 })}%`;
    }
    return Math.round(value).toLocaleString('vi-VN');
  }

  getQualityPercent(attr: EquipmentRolledAttributeDto): number {
    const raw = attr.rollPercent ?? attr.rollQualityPercent ?? 0;
    return Math.min(100, Math.max(0, Math.round(raw)));
  }

  getQualityColor(percent: number): string {
    if (percent >= 90) return '#ff9800'; // Vàng/Cam
    if (percent >= 70) return '#ab47bc'; // Tím
    if (percent >= 40) return '#2196f3'; // Xanh
    return '#9e9e9e';                    // Xám
  }

  getQualityClass(percent: number): string {
    if (percent >= 90) return 'gold';
    if (percent >= 70) return 'purple';
    if (percent >= 40) return 'blue';
    return 'gray';
  }

  getMinRange(attr: EquipmentRolledAttributeDto): number {
    return attr.minValue ?? attr.rollMinValue ?? 0;
  }

  getMaxRange(attr: EquipmentRolledAttributeDto): number {
    return attr.maxValue ?? attr.rollMaxValue ?? 0;
  }
}
