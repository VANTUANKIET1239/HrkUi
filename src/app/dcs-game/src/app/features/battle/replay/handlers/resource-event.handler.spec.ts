import { ResourceEventHandler } from './resource-event.handler';
import { BattleEventDto } from '../../../../core/models/battle.model';
import { Hero } from '../../../../core/models/hero.model';
import { resolveAuraResourceKey } from '../../components/battle-character/aura-resource/aura-resource.resolver';

describe('ResourceEventHandler & Aura Resolver Specs', () => {
  let handler: ResourceEventHandler;
  let heroes: Hero[];

  beforeEach(() => {
    handler = new ResourceEventHandler();
    heroes = [
      {
        id: 1,
        heroCode: 'THANH_THAI_AURA',
        name: 'Thanh Thái Aura',
        avatar: '/assets/images/dcs-game/thanh-thai-aura.png',
        hp: 2000,
        maxHp: 2000,
        mana: 0,
        maxMana: 100,
        attack: 400,
        defense: 120,
        speed: 100,
        position: 1,
        team: 'left',
        auraTier: 0,
        resources: {
          AURA: {
            resourceCode: 'AURA',
            currentValue: 0,
            maxValue: 100,
            tier: 0,
            isFull: false
          }
        }
      }
    ];
  });

  it('should increase AURA and update tier to 1 upon gaining 25 Bá Khí', () => {
    const event: BattleEventDto = {
      sequence: 1,
      eventType: 'AURA_GAINED',
      actorId: 1,
      resourceCode: 'AURA',
      value: 25,
      currentValue: 25,
      previousValue: 0,
      reasonCode: 'BASIC_ATTACK'
    } as any;

    const mockContext = {
      updateHeroes: (fn: (h: Hero[]) => Hero[]) => {
        heroes = fn(heroes);
      },
      showCombatText: jasmine.createSpy('showCombatText')
    };

    handler.handle(event, mockContext as any);

    const aura = heroes[0].resources?.['AURA'];
    expect(aura).toBeDefined();
    expect(aura?.currentValue).toBe(25);
    expect(aura?.tier).toBe(1);
    expect(heroes[0].auraTier).toBe(1);
    expect(aura?.isFull).toBeFalse();
  });

  it('should activate FULL_AURA when reaching 100 Bá Khí (Tier 4)', () => {
    const event: BattleEventDto = {
      sequence: 2,
      eventType: 'FULL_AURA_ACTIVATED',
      actorId: 1,
      resourceCode: 'AURA',
      currentValue: 100,
      previousValue: 85
    } as any;

    const mockContext = {
      updateHeroes: (fn: (h: Hero[]) => Hero[]) => {
        heroes = fn(heroes);
      },
      showCombatText: jasmine.createSpy('showCombatText')
    };

    handler.handle(event, mockContext as any);

    const aura = heroes[0].resources?.['AURA'];
    expect(aura?.currentValue).toBe(100);
    expect(aura?.tier).toBe(4);
    expect(aura?.isFull).toBeTrue();
    expect(mockContext.showCombatText).toHaveBeenCalled();
  });

  it('should reduce tier and drop Full Aura upon AURA_CONSUMED to 25', () => {
    heroes[0].resources!['AURA'] = {
      resourceCode: 'AURA',
      currentValue: 100,
      maxValue: 100,
      tier: 4,
      isFull: true
    };

    const event: BattleEventDto = {
      sequence: 3,
      eventType: 'AURA_CONSUMED',
      actorId: 1,
      resourceCode: 'AURA',
      value: 75,
      currentValue: 25,
      previousValue: 100,
      reasonCode: 'SKILL_CONSUMPTION'
    } as any;

    const mockContext = {
      updateHeroes: (fn: (h: Hero[]) => Hero[]) => {
        heroes = fn(heroes);
      },
      showCombatText: jasmine.createSpy('showCombatText')
    };

    handler.handle(event, mockContext as any);

    const aura = heroes[0].resources?.['AURA'];
    expect(aura?.currentValue).toBe(25);
    expect(aura?.tier).toBe(1);
    expect(aura?.isFull).toBeFalse();
  });

  it('should resolve aura resource key correctly for THANH_THAI_AURA', () => {
    expect(resolveAuraResourceKey(heroes[0].heroCode, heroes[0].avatar)).toBe('thanh-thai-aura');

    const regularHero: Hero = {
      id: 2,
      heroCode: 'CHUAN_MEN',
      name: 'Chuẩn Men',
      avatar: '/assets/images/heroes/chuan-men.png',
      hp: 1000,
      maxHp: 1000,
      mana: 0,
      maxMana: 100,
      attack: 100,
      defense: 50,
      speed: 100,
      position: 2,
      team: 'left'
    };

    expect(resolveAuraResourceKey(regularHero.heroCode, regularHero.avatar)).toBeNull();
  });
});
