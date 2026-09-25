import { Injectable, inject } from '@angular/core';
import { BattleEventDto } from '../../../core/models/battle.model';
import { BattleStatusEffectViewModel, BattleStatusModifierViewModel } from '../../../core/models/hero.model';
import { BattleAttributePresenter } from './battle-attribute.presenter';

@Injectable({ providedIn: 'root' })
export class BattleStatusPresenter {
  private readonly attributes = inject(BattleAttributePresenter);

  create(event: BattleEventDto, effect: any): BattleStatusEffectViewModel {
    const code = event.effectTypeCode!.toUpperCase();
    const controls = ['STUN', 'SILENCE', 'TAUNT'];
    const debuffs = ['MARK', 'STAT_DEBUFF', 'BLEED', 'PANIC', 'SHIELD_BLOCK'];
    const fallbackIcons: Record<string, string> = {
      STUN: '/assets/images/dcs-game/effects/stun.png',
      SHIELD: '/assets/images/dcs-game/effects/shield.png',
      MARK: '/assets/images/dcs-game/effects/mark.png',
      SILENCE: '/assets/images/dcs-game/effects/silence.png',
      DAMAGE_REDUCTION: '/assets/images/dcs-game/effects/damage-reduction.png',
      TAUNT: '/assets/images/dcs-game/effects/taunt.png',
      DAMAGE_REFLECTION: '/assets/images/dcs-game/effects/damage-reflection.png',
      STAT_BUFF: '/assets/images/dcs-game/effects/stat-buff.png',
      STAT_DEBUFF: '/assets/images/dcs-game/effects/stat-debuff.png',
      BLEED: '/assets/images/dcs-game/effects/bleed.png',
      PANIC: '/assets/images/dcs-game/effects/panic.png',
      SHIELD_BLOCK: '/assets/images/dcs-game/effects/shield-block.png',
      RICARDO: '/assets/images/dcs-game/effects/ricardo.png'
    };
    const fallbackNames: Record<string, string> = {
      STUN: 'Choáng', SHIELD: 'Khiên', MARK: 'Đánh dấu', SILENCE: 'Câm lặng',
      DAMAGE_REDUCTION: 'Giảm sát thương', TAUNT: 'Khiêu khích',
      DAMAGE_REFLECTION: 'Phản sát thương', STAT_BUFF: 'Tăng thuộc tính',
      STAT_DEBUFF: 'Giảm thuộc tính',
      BLEED: 'Chảy Máu', PANIC: 'Hoảng Loạn', SHIELD_BLOCK: 'Cấm Nhận Khiên',
      RICARDO: 'Phong Thái Nam Thần'
    };
    const fallbackDescriptions: Record<string, string> = {
      STUN: 'Không thể hành động trong lượt.',
      TAUNT: 'Bị buộc ưu tiên tấn công người đã gây Khiêu Khích.',
      BLEED: 'Mỗi đầu lượt nhận sát thương Chảy Máu.',
      PANIC: 'Giảm 20% phòng thủ và không thể nhận Khiên mới.',
      SHIELD_BLOCK: 'Không thể nhận Khiên mới trong thời gian hiệu lực.',
      RICARDO: 'Tăng 30% DEF, 30% Kháng phép. Mỗi tầng tăng 10% sát thương gây ra. Khi đạt 6 tầng, Ricardo Milos! được cường hóa.'
    };
    const modifiers: BattleStatusModifierViewModel[] = event.statModifiers?.length
      ? event.statModifiers.map(modifier => this.attributes.toViewModel(modifier))
      : (effect?.statModifiers ?? []).map((modifier: any) => ({
        attributeCode: modifier.attributeTypeCode,
        attributeName: modifier.attributeTypeName ?? this.attributes.nameOf(modifier.attributeTypeCode),
        valueType: modifier.valueType,
        value: modifier.value
      }));
    const summary = modifiers.length
      ? modifiers.map(modifier => this.attributes.format(modifier, code)).join(', ')
      : null;

    return {
      instanceId: `${event.actorId}:${event.skillId}:${code}:${event.targetId}`,
      code,
      name: summary ?? effect?.effectTypeName ?? fallbackNames[code] ?? code,
      description: summary
        ? `${summary}${event.remainingTurns ? ` trong ${event.remainingTurns} lượt` : ''}.`
        : effect?.effectDescription ?? fallbackDescriptions[code] ?? null,
      iconPath: effect?.effectImagePath ?? fallbackIcons[code] ?? fallbackIcons['STAT_DEBUFF'],
      colorHex: effect?.effectColorHex ?? (debuffs.includes(code) ? '#ef4444' : '#22c55e'),
      category: controls.includes(code) ? 'CONTROL' : debuffs.includes(code) ? 'DEBUFF' :
        effect?.isBeneficial === false ? 'SPECIAL' : 'BUFF',
      value: event.value ?? 0,
      remainingTurns: event.remainingTurns ?? 0,
      stacks: event.currentStacks ?? 1,
      maxStacks: event.maxStacks,
      modifiers,
      sourceSkillId: event.skillId
    };
  }
}
