import { TestBed } from '@angular/core/testing';
import { BattleStatusPresenter } from './battle-status.presenter';
import { BattleAttributePresenter } from './battle-attribute.presenter';
import { Hero } from '../../../core/models/hero.model';

describe('BattleStatusPresenter Presentation Effects', () => {
  let presenter: BattleStatusPresenter;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BattleStatusPresenter, BattleAttributePresenter]
    });
    presenter = TestBed.inject(BattleStatusPresenter);
  });

  function createHero(auraValue = 0, tier = 0): Hero {
    return {
      id: 1,
      heroCode: 'THANH_THAI_AURA',
      name: 'Thanh Thái Aura',
      avatar: '/avatar.png',
      hp: 1000,
      maxHp: 1000,
      mana: 100,
      maxMana: 100,
      attack: 200,
      defense: 100,
      speed: 120,
      position: 1,
      team: 'left',
      resources: auraValue > 0 ? {
        AURA: {
          resourceCode: 'AURA',
          currentValue: auraValue,
          maxValue: 100,
          tier,
          physicalDamageBonusPercent: auraValue * 0.25,
          magicDamageBonusPercent: auraValue * 0.25
        }
      } : {}
    };
  }

  it('Bá Khí = 0: không hiển thị presentation effect AURA_DAMAGE_BONUS', () => {
    const hero = createHero(0);
    const effects = presenter.getPresentationEffects(hero);
    const auraEffect = effects.find(e => e.code === 'AURA_DAMAGE_BONUS');
    expect(auraEffect).toBeUndefined();
  });

  it('Bá Khí = 25: hiển thị đúng 1 effect với Tier 1 và bonus tương ứng', () => {
    const hero = createHero(25, 1);
    const effects = presenter.getPresentationEffects(hero);
    const auraEffect = effects.find(e => e.code === 'AURA_DAMAGE_BONUS');

    expect(auraEffect).toBeDefined();
    expect(auraEffect!.tier).toBe(1);
    expect(auraEffect!.sourceType).toBe('RESOURCE');
    expect(auraEffect!.valueLines[0]).toContain('+6,25%');
    expect(auraEffect!.valueLines[1]).toContain('+6,25%');
  });

  it('Bá Khí = 75: hiển thị Tier 3 và bonus +18,75%', () => {
    const hero = createHero(75, 3);
    const effects = presenter.getPresentationEffects(hero);
    const auraEffect = effects.find(e => e.code === 'AURA_DAMAGE_BONUS');

    expect(auraEffect).toBeDefined();
    expect(auraEffect!.tier).toBe(3);
    expect(auraEffect!.description).toBe('Bá Khí hiện tại: 75/100');
    expect(auraEffect!.valueLines[0]).toContain('+18,75%');
    expect(auraEffect!.valueLines[1]).toContain('+18,75%');
  });

  it('Bá Khí = 100: hiển thị Full Aura trạng thái đỉnh cao và màu đỏ', () => {
    const hero = createHero(100, 4);
    const effects = presenter.getPresentationEffects(hero);
    const auraEffect = effects.find(e => e.code === 'AURA_DAMAGE_BONUS');

    expect(auraEffect).toBeDefined();
    expect(auraEffect!.tier).toBe(4);
    expect(auraEffect!.name).toContain('Full Aura');
    expect(auraEffect!.color).toBe('#ef4444');
    expect(auraEffect!.valueLines[0]).toContain('+25%');
  });

  it('Hợp nhất chính xác backend status effects và resource effects', () => {
    const hero = createHero(50, 2);
    hero.battleStatuses = [
      {
        instanceId: '1:1:SHIELD:1',
        code: 'SHIELD',
        name: 'Khiên Hộ Thể',
        iconPath: '/shield.png',
        colorHex: '#3b82f6',
        category: 'BUFF',
        value: 500,
        remainingTurns: 2,
        stacks: 1,
        modifiers: []
      }
    ];

    const effects = presenter.getPresentationEffects(hero);
    expect(effects.length).toBe(2);
    expect(effects[0].code).toBe('SHIELD');
    expect(effects[0].sourceType).toBe('STATUS');
    expect(effects[1].code).toBe('AURA_DAMAGE_BONUS');
    expect(effects[1].sourceType).toBe('RESOURCE');
  });
});
