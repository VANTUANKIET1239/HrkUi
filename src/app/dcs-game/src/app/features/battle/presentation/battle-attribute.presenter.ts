import { Injectable } from '@angular/core';
import { BattleEventStatModifierDto } from '../../../core/models/battle.model';
import { BattleStatusModifierViewModel } from '../../../core/models/hero.model';

@Injectable({ providedIn: 'root' })
export class BattleAttributePresenter {
  private readonly names: Readonly<Record<string, string>> = {
    ATK: 'sát thương',
    DEF: 'giáp', ARMOR: 'giáp',
    SPD: 'tốc độ', SPEED: 'tốc độ',
    PHYSICAL_ATK: 'sát thương vật lý', PHYSICAL_DAMAGE: 'sát thương vật lý',
    MAGIC_ATK: 'sát thương phép', MAGIC_DAMAGE: 'sát thương phép', MATK: 'sát thương phép',
    MAGIC_RESIST: 'kháng phép', MAGIC_RESISTANCE: 'kháng phép',
    HP: 'máu tối đa', MAX_HP: 'máu tối đa',
    CRIT_RATE: 'tỷ lệ chí mạng', CRIT: 'tỷ lệ chí mạng',
    CRIT_DAMAGE: 'sát thương chí mạng',
    DODGE_RATE: 'né tránh', DODGE: 'né tránh',
    ACCURACY: 'chính xác',
    ARMOR_PEN: 'xuyên giáp',
    MAGIC_PEN: 'xuyên kháng phép'
  };

  toViewModel(modifier: BattleEventStatModifierDto): BattleStatusModifierViewModel {
    return {
      attributeCode: modifier.attributeCode,
      attributeName: modifier.attributeName || this.nameOf(modifier.attributeCode),
      valueType: modifier.valueType,
      value: modifier.value
    };
  }

  nameOf(attributeCode: string): string {
    const code = attributeCode?.toUpperCase() ?? '';
    return this.names[code] ?? code;
  }

  format(modifier: BattleStatusModifierViewModel, effectCode: string): string {
    const isDecrease = modifier.value < 0 || (modifier.value === 0 && effectCode === 'STAT_DEBUFF');
    const suffix = modifier.valueType?.toUpperCase() === 'PERCENT' ? '%' : '';
    return `${isDecrease ? 'Giảm' : 'Tăng'} ${Math.abs(modifier.value)}${suffix} ${modifier.attributeName || this.nameOf(modifier.attributeCode)}`;
  }
}
