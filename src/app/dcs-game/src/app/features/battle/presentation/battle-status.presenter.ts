import { Injectable, inject } from '@angular/core';
import { BattleEventDto } from '../../../core/models/battle.model';
import { BattlePresentationEffect, BattleStatusEffectViewModel, BattleStatusModifierViewModel, Hero } from '../../../core/models/hero.model';
import { BattleAttributePresenter } from './battle-attribute.presenter';

@Injectable({ providedIn: 'root' })
export class BattleStatusPresenter {
  private readonly attributes = inject(BattleAttributePresenter);

  create(event: BattleEventDto, effect: any): BattleStatusEffectViewModel {
    const code = event.effectTypeCode!.toUpperCase();
    const controls = ['STUN', 'SILENCE', 'TAUNT'];
    const debuffs = [
      'MARK', 'STAT_DEBUFF', 'BLEED', 'PANIC', 'SHIELD_BLOCK', 'LOSS_OF_CONFIDENCE',
      'PRIME_STAGGER', 'PRIME_BROKEN_MORALE', 'LUAN_DIEM', 'CAT_SCRATCH', 'DEEP_CAT_SCRATCH', 'CHAY_NGAY_DI'
    ];
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
      RICARDO: '/assets/images/dcs-game/effects/ricardo.png',
      LOSS_OF_CONFIDENCE: '/assets/images/dcs-game/effects/mark.png',
      FULL_AURA_FARMING: '/assets/images/dcs-game/effects/stat-buff.png',
      PRIME_FORTITUDE: '/assets/images/dcs-game/effects/shield.png',
      PRIME_GUARDIAN: '/assets/images/dcs-game/effects/shield.png',
      PRIME_PRESSURE: '/assets/images/dcs-game/effects/stat-buff.png',
      PRIME_STAGGER: '/assets/images/dcs-game/effects/stat-debuff.png',
      PRIME_BROKEN_MORALE: '/assets/images/dcs-game/effects/damage-reduction.png',
      ENCOURAGEMENT_OFFENSE: '/assets/images/dcs-game/effects/stat-buff.png',
      ENCOURAGEMENT_DEFENSE: '/assets/images/dcs-game/effects/shield.png',
      CELESTIAL_PROTECTION: '/assets/images/dcs-game/effects/stat-buff.png',
      PHONG_AN: '/assets/images/dcs-game/effects/stat-buff.png',
      TIN_CHI_DANH_DU: '/assets/images/dcs-game/effects/shield.png',
      LUAN_DIEM: '/assets/images/dcs-game/effects/mark.png',
      CAT_SCRATCH: '/assets/images/dcs-game/effects/mark.png',
      DEEP_CAT_SCRATCH: '/assets/images/dcs-game/effects/mark.png',
      CAT_COMPANION: '/assets/images/dcs-game/effects/stat-buff.png',
      CHAY_NGAY_DI: '/assets/images/dcs-game/effects/stat-debuff.png'
    };
    const fallbackNames: Record<string, string> = {
      STUN: 'Choáng', SHIELD: 'Khiên', MARK: 'Đánh dấu', SILENCE: 'Câm lặng',
      DAMAGE_REDUCTION: 'Giảm sát thương', TAUNT: 'Khiêu khích',
      DAMAGE_REFLECTION: 'Phản sát thương', STAT_BUFF: 'Tăng thuộc tính',
      STAT_DEBUFF: 'Giảm thuộc tính',
      BLEED: 'Chảy Máu', PANIC: 'Hoảng Loạn', SHIELD_BLOCK: 'Cấm Nhận Khiên',
      RICARDO: 'Phong Thái Nam Thần',
      LOSS_OF_CONFIDENCE: 'Mất Tự Tin',
      FULL_AURA_FARMING: 'Full Aura Farming',
      PRIME_FORTITUDE: 'Kiên Cố',
      PRIME_GUARDIAN: 'Hộ Vệ Prime',
      PRIME_PRESSURE: 'Áp Lực',
      PRIME_STAGGER: 'Lung Lay',
      PRIME_BROKEN_MORALE: 'Vỡ Trận',
      ENCOURAGEMENT_OFFENSE: 'Cổ Vũ (Công)',
      ENCOURAGEMENT_DEFENSE: 'Cổ Vũ (Thủ)',
      CELESTIAL_PROTECTION: 'Thiên Hộ',
      PHONG_AN: 'Phong Ấn',
      TIN_CHI_DANH_DU: 'Tín Chỉ Danh Dự',
      LUAN_DIEM: 'Luận Điểm',
      CAT_SCRATCH: 'Vết Cào',
      DEEP_CAT_SCRATCH: 'Vết Cào Sâu',
      CAT_COMPANION: 'Mèo Đồng Hành',
      CHAY_NGAY_DI: 'Chạy Ngay Đi'
    };
    const fallbackDescriptions: Record<string, string> = {
      STUN: 'Không thể hành động trong lượt.',
      TAUNT: 'Bị buộc ưu tiên tấn công người đã gây Khiêu Khích.',
      BLEED: 'Mỗi đầu lượt nhận sát thương Chảy Máu.',
      PANIC: 'Giảm 20% phòng thủ và không thể nhận Khiên mới.',
      SHIELD_BLOCK: 'Không thể nhận Khiên mới trong thời gian hiệu lực.',
      RICARDO: 'Tăng 30% DEF, 30% Kháng phép. Mỗi tầng tăng 10% sát thương gây ra. Khi đạt 6 tầng, Ricardo Milos! được cường hóa.',
      LOSS_OF_CONFIDENCE: 'Mỗi tầng nhận thêm +10% sát thương từ Thanh Thái Aura (tối đa +30%). Bị kích nổ bởi Lôi Chổi Xích Hồng.',
      FULL_AURA_FARMING: 'Đạt đỉnh cao 100 Bá Khí. Đòn đánh thường có Độ Chính Xác Tuyệt Đối và gây dấu Mất Tự Tin.',
      PRIME_FORTITUDE: 'Mỗi tầng tăng 5% DEF và 5% Kháng Phép (tối đa 4 tầng). Khi đạt 4 tầng tạo khiên 12% Max HP và kích hoạt tiêu thụ.',
      PRIME_GUARDIAN: 'Chuyển hướng 35% sát thương trực tiếp từ đồng minh về Nghĩa Phục Prime. Tích tầng Áp Lực khi bảo vệ.',
      PRIME_PRESSURE: 'Tích lũy khi nhận sát thương thay đồng đội. Khi giải phóng hồi 2% Max HP và gây 20% DEF sát thương vật lý mỗi tầng.',
      PRIME_STAGGER: 'Thanh hành động -15, Tốc độ -10% trong 1 lượt.',
      PRIME_BROKEN_MORALE: 'Sát thương gây ra -15% trong 2 lượt.',
      ENCOURAGEMENT_OFFENSE: 'Tăng 20% sát thương vật lý và 20% sát thương phép.',
      ENCOURAGEMENT_DEFENSE: 'Tăng 20% phòng thủ và 20% kháng phép.',
      CELESTIAL_PROTECTION: 'Tăng 20% tốc độ và 20% kháng hiệu ứng.',
      PHONG_AN: 'Mỗi tầng tăng 5% Tốc độ. Tiêu thụ bởi Tam Phong Đoạn Ảnh tăng 12% sát thương mỗi tầng (3 tầng bỏ qua 20% DEF).',
      TIN_CHI_DANH_DU: 'Mỗi tầng tăng 6% DEF và 6% Kháng Phép. Tiêu thụ bởi Thủ Khoa Đứng Tuyến Đầu tăng giá trị khiên (3 tầng nhận 20% Giảm sát thương).',
      LUAN_DIEM: 'Chịu thêm 4% sát thương phép từ Quốc Nhân mỗi tầng (tối đa 12%). Tiêu thụ bởi Hội Đồng Phản Biện gây thêm 18% sát thương mỗi tầng (3 tầng: 50% Câm Lặng).',
      CAT_SCRATCH: 'Đồng minh tấn công trực tiếp tăng 10% sát thương và hồi HP bằng 5% sát thương thực tế.',
      DEEP_CAT_SCRATCH: 'Đồng minh tấn công trực tiếp tăng 20% sát thương và hồi HP bằng 10% sát thương thực tế.',
      CAT_COMPANION: 'Mèo của Long Lê hỗ trợ chiến đấu. Khi tấn công trực tiếp, mèo hỗ trợ cào gây Vết Cào Sâu lên mục tiêu.',
      CHAY_NGAY_DI: 'Giảm 30% Kháng Phép trong 3 lượt. Khi bị Lửa Nến Xuyên Hàng đánh trúng, kích nổ vệt lửa gây thêm 75% sát thương phép và Choáng 1 lượt.'
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

    const customColorHex = code === 'LOSS_OF_CONFIDENCE'
      ? '#b91c1c'
      : code === 'FULL_AURA_FARMING'
        ? '#dc2626'
        : code === 'PRIME_FORTITUDE'
          ? '#3b82f6'
          : code === 'PRIME_GUARDIAN'
            ? '#2563eb'
            : code === 'PRIME_PRESSURE'
              ? '#60a5fa'
              : code === 'PRIME_STAGGER'
                ? '#f59e0b'
                : code === 'PRIME_BROKEN_MORALE'
                  ? '#64748b'
                  : code === 'ENCOURAGEMENT_OFFENSE'
                    ? '#f59e0b'
                    : code === 'ENCOURAGEMENT_DEFENSE'
                      ? '#38bdf8'
                      : code === 'CELESTIAL_PROTECTION'
                        ? '#eab308'
                        : code === 'PHONG_AN'
                          ? '#0d9488'
                          : code === 'TIN_CHI_DANH_DU'
                            ? '#eab308'
                            : code === 'LUAN_DIEM'
                              ? '#a855f7'
                              : code === 'CAT_SCRATCH'
                                ? '#facc15'
                                : code === 'DEEP_CAT_SCRATCH'
                                  ? '#dc2626'
                                  : code === 'CAT_COMPANION'
                                    ? '#f59e0b'
                                    : code === 'CHAY_NGAY_DI'
                                      ? '#ef4444'
                                      : effect?.effectColorHex ?? (debuffs.includes(code) ? '#ef4444' : '#22c55e');

    return {
      instanceId: event.statusInstanceId ?? `${event.actorId}:${event.skillId}:${code}:${event.targetId}`,
      code,
      name: summary ?? effect?.effectTypeName ?? fallbackNames[code] ?? code,
      description: summary
        ? `${summary}${event.remainingTurns ? ` trong ${event.remainingTurns} lượt` : ''}.`
        : effect?.effectDescription ?? fallbackDescriptions[code] ?? null,
      iconPath: effect?.effectImagePath ?? fallbackIcons[code] ?? fallbackIcons['STAT_DEBUFF'],
      colorHex: customColorHex,
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

  getPresentationEffects(character: Hero): BattlePresentationEffect[] {
    const results: BattlePresentationEffect[] = [];

    // 1. Backend status effects
    if (character.battleStatuses && character.battleStatuses.length > 0) {
      for (const status of character.battleStatuses) {
        const valueLines: string[] = [];
        if (status.code === 'PRIME_FORTITUDE') {
          const stacks = status.stacks || 1;
          valueLines.push(`DEF +${stacks * 5}%`);
          valueLines.push(`Kháng phép +${stacks * 5}%`);
        } else if (status.code === 'PRIME_GUARDIAN') {
          valueLines.push('Chuyển hướng 35% sát thương trực tiếp');
          if (status.remainingTurns && status.remainingTurns > 0) {
            valueLines.push(`Còn ${status.remainingTurns} lượt`);
          }
        } else if (status.code === 'PRIME_PRESSURE') {
          const stacks = status.stacks || 1;
          valueLines.push(`Khi giải phóng: hồi ${stacks * 2}% Max HP`);
          valueLines.push(`Gây ${stacks * 20}% DEF sát thương`);
        } else if (status.code === 'PRIME_STAGGER') {
          valueLines.push('Thanh hành động -15');
          valueLines.push('Tốc độ -10%');
          if (status.remainingTurns && status.remainingTurns > 0) {
            valueLines.push(`Còn ${status.remainingTurns} lượt`);
          }
        } else if (status.code === 'PRIME_BROKEN_MORALE') {
          valueLines.push('Sát thương gây ra -15%');
          if (status.remainingTurns && status.remainingTurns > 0) {
            valueLines.push(`Còn ${status.remainingTurns} lượt`);
          }
        } else if (status.code === 'PHONG_AN') {
          const stacks = status.stacks || 1;
          valueLines.push(`Tốc độ +${stacks * 5}%`);
          valueLines.push(`Tầng: ${stacks}/3`);
        } else if (status.code === 'TIN_CHI_DANH_DU') {
          const stacks = status.stacks || 1;
          valueLines.push(`Phòng thủ +${stacks * 6}%`);
          valueLines.push(`Kháng phép +${stacks * 6}%`);
          valueLines.push(`Tầng: ${stacks}/3`);
        } else if (status.code === 'LUAN_DIEM') {
          const stacks = status.stacks || 1;
          valueLines.push(`Chịu thêm +${stacks * 4}% sát thương phép từ Quốc Nhân`);
          valueLines.push(`Tầng: ${stacks}/3`);
          if (status.remainingTurns && status.remainingTurns > 0) {
            valueLines.push(`Còn ${status.remainingTurns} lượt`);
          }
        } else if (status.code === 'CAT_SCRATCH') {
          valueLines.push('Sát thương nhận từ đồng minh +10%');
          valueLines.push('Người tấn công hồi 5% sát thương thực tế');
          if (status.remainingTurns && status.remainingTurns > 0) {
            valueLines.push(`Còn ${status.remainingTurns} lượt`);
          }
        } else if (status.code === 'DEEP_CAT_SCRATCH') {
          valueLines.push('Sát thương nhận từ đồng minh +20%');
          valueLines.push('Người tấn công hồi 10% sát thương thực tế');
          if (status.remainingTurns && status.remainingTurns > 0) {
            valueLines.push(`Còn ${status.remainingTurns} lượt`);
          }
        } else if (status.code === 'CAT_COMPANION') {
          valueLines.push('Mèo cào hỗ trợ đặt Vết Cào Sâu khi tấn công');
          if (status.remainingTurns && status.remainingTurns > 0) {
            valueLines.push(`Còn ${status.remainingTurns} lượt`);
          }
        } else if (status.code === 'CHAY_NGAY_DI') {
          valueLines.push('Kháng phép -30%');
          valueLines.push('Kích nổ vệt lửa khi trúng Lửa Nến Xuyên Hàng');
          if (status.remainingTurns && status.remainingTurns > 0) {
            valueLines.push(`Còn ${status.remainingTurns} lượt`);
          }
        } else if (status.code === 'SHIELD') {
          valueLines.push(`Khiên còn lại: ${status.value.toLocaleString('vi-VN')}`);
        } else if (status.value && status.code !== 'RICARDO') {
          valueLines.push(`Giá trị: ${status.value}%`);
        }
        for (const mod of status.modifiers || []) {
          const sign = mod.value > 0 ? '+' : '';
          const pct = mod.valueType === 'PERCENT' ? '%' : '';
          valueLines.push(`${mod.attributeName || mod.attributeCode}: ${sign}${mod.value}${pct}`);
        }

        let displayName = status.name;
        if (status.code === 'PRIME_FORTITUDE') {
          displayName = `Kiên Cố ${status.stacks || 1}/4`;
        } else if (status.code === 'PRIME_PRESSURE') {
          displayName = `Áp Lực ${status.stacks || 1}/5`;
        } else if (status.code === 'PRIME_GUARDIAN') {
          displayName = 'Hộ Vệ Prime';
        } else if (status.code === 'PRIME_STAGGER') {
          displayName = 'Lung Lay';
        } else if (status.code === 'PRIME_BROKEN_MORALE') {
          displayName = 'Vỡ Trận';
        } else if (status.code === 'PHONG_AN') {
          displayName = `Phong Ấn ${status.stacks || 1}/3`;
        } else if (status.code === 'TIN_CHI_DANH_DU') {
          displayName = `Tín Chỉ ${status.stacks || 1}/3`;
        } else if (status.code === 'LUAN_DIEM') {
          displayName = `Luận Điểm ${status.stacks || 1}/3`;
        } else if (status.code === 'CAT_SCRATCH') {
          displayName = 'Vết Cào';
        } else if (status.code === 'DEEP_CAT_SCRATCH') {
          displayName = 'Vết Cào Sâu';
        } else if (status.code === 'CAT_COMPANION') {
          displayName = 'Mèo Đồng Hành';
        } else if (status.code === 'CHAY_NGAY_DI') {
          displayName = 'Chạy Ngay Đi';
        }

        results.push({
          code: status.code,
          name: displayName,
          icon: status.iconPath,
          color: status.colorHex,
          description: status.description ?? undefined,
          valueLines,
          stacks: status.stacks,
          remainingTurns: status.remainingTurns,
          category: status.category,
          isPermanent: status.remainingTurns <= 0,
          sourceType: 'STATUS'
        });
      }
    }

    // 2. Resource-derived effects (AURA -> AURA_DAMAGE_BONUS)
    const aura = character.resources?.['AURA'];
    const currentAura = aura?.currentValue ?? 0;
    if (currentAura > 0) {
      const maxAura = aura?.maxValue || 100;
      const tier = aura?.tier ?? (currentAura >= 100 ? 4 : currentAura >= 75 ? 3 : currentAura >= 50 ? 2 : currentAura >= 25 ? 1 : 0);
      const isFull = (aura?.isFull ?? false) || currentAura >= 100 || tier === 4;

      const physBonus = aura?.physicalDamageBonusPercent ?? (currentAura * 0.25);
      const magBonus = aura?.magicDamageBonusPercent ?? (currentAura * 0.25);

      const color = isFull
        ? '#ef4444'
        : tier === 3
          ? '#f97316'
          : tier === 2
            ? '#3b82f6'
            : '#10b981';

      results.push({
        code: 'AURA_DAMAGE_BONUS',
        name: isFull ? 'Bá Khí Cường Hóa (Full Aura)' : 'Bá Khí Cường Hóa',
        icon: '/assets/images/dcs-game/effects/stat-buff.png',
        color,
        description: `Bá Khí hiện tại: ${currentAura}/${maxAura}`,
        valueLines: [
          `⚔ +${this.formatPercentBonus(physBonus)}% sát thương vật lý`,
          `✦ +${this.formatPercentBonus(magBonus)}% sát thương phép`
        ],
        stacks: currentAura,
        tier,
        isPermanent: true,
        category: 'BUFF',
        sourceType: 'RESOURCE'
      });
    }

    // 3. Passive presentation effects (if any standalone status string exists)
    if (character.statusEffects && character.statusEffects.length > 0) {
      const existingCodes = new Set(results.map(r => r.code.toUpperCase()));
      for (const eff of character.statusEffects) {
        const upper = eff.toUpperCase();
        if (!existingCodes.has(upper) && !['AURA'].includes(upper)) {
          results.push({
            code: upper,
            name: eff,
            icon: '/assets/images/dcs-game/effects/stat-buff.png',
            color: '#3b82f6',
            valueLines: [],
            isPermanent: true,
            category: 'BUFF',
            sourceType: 'PASSIVE'
          });
        }
      }
    }

    return results;
  }

  private formatPercentBonus(val: number): string {
    const safeVal = Math.max(0, val);
    return Number.isInteger(safeVal)
      ? safeVal.toFixed(0)
      : safeVal.toFixed(2).replace(/0+$/, '').replace(/\.$/, '').replace('.', ',');
  }
}
