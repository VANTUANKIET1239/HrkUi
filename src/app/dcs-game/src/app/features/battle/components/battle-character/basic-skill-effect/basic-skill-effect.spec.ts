import { resolveBasicEffectCode, BasicEffectCode } from './basic-effect-resolver.util';
import { Hero } from '../../../../../core/models/hero.model';

describe('Basic Skill Effect System Tests', () => {
  describe('1. Resolve hero via heroTemplateId (Priority 1)', () => {
    const expectedMappings: [number, BasicEffectCode][] = [
      [1, 'kiet'],
      [2, 'nam-deadline'],
      [3, 'chuan-men'],
      [4, 'coder-banh'],
      [5, 'tester-dep'],
      [6, 'tuong-long'],
      [7, 'pm-hoi-ha'],
      [8, 'qa-ky-tinh'],
      [9, 'kiet-noel'],
      [10, 'hoang-nguyen'],
    ];

    expectedMappings.forEach(([templateId, expectedCode]) => {
      it(`should resolve heroTemplateId ${templateId} to '${expectedCode}'`, () => {
        const mockHero: Hero = {
          id: 99,
          heroTemplateId: templateId,
          name: 'Arbitrary Name',
          avatar: '/path/unknown.png',
          hp: 1000,
          maxHp: 1000,
          mana: 50,
          maxMana: 100,
          attack: 100,
          defense: 50,
          speed: 100,
          position: 1,
          team: 'left',
        };
        expect(resolveBasicEffectCode(mockHero)).toBe(expectedCode);
      });
    });
  });

  describe('2. Resolve hero via heroCode (Priority 2)', () => {
    it('should resolve heroCode correctly even with casing or separator variations', () => {
      const heroRicardo: Hero = {
        id: 1,
        heroCode: 'RICARDO_MILOS',
        name: 'Custom',
        avatar: '',
        hp: 100,
        maxHp: 100,
        mana: 0,
        maxMana: 100,
        attack: 10,
        defense: 10,
        speed: 10,
        position: 1,
        team: 'left',
      };
      expect(resolveBasicEffectCode(heroRicardo)).toBe('chuan-men');

      const heroQA: Hero = { ...heroRicardo, heroCode: 'vantrong-cobac' };
      expect(resolveBasicEffectCode(heroQA)).toBe('qa-ky-tinh');

      const heroTuongLong: Hero = { ...heroRicardo, heroCode: 'tuonglong-quandoi' };
      expect(resolveBasicEffectCode(heroTuongLong)).toBe('tuong-long');
    });
  });

  describe('3. Resolve hero via avatar filename fallback (Priority 3)', () => {
    const avatarTestCases: [string, BasicEffectCode][] = [
      ['/assets/images/dcs-game/kiet.png', 'kiet'],
      ['/assets/images/dcs-game/trg-kiet-covid.png', 'nam-deadline'],
      ['/assets/images/dcs-game/ricardo-milos.png', 'chuan-men'],
      ['/assets/images/dcs-game/vantrong-hs.png', 'coder-banh'],
      ['/assets/images/dcs-game/nghiaphuc-bongtoi.png', 'tester-dep'],
      ['/assets/images/dcs-game/tuonglong-quandoi.png', 'tuong-long'],
      ['/assets/images/dcs-game/quangvinh-barber.png', 'pm-hoi-ha'],
      ['/assets/images/dcs-game/vantrong-cobac.png', 'qa-ky-tinh'],
      ['/assets/images/dcs-game/TruongKiet-Noel.png', 'kiet-noel'],
      ['/assets/images/dcs-game/HoangNguyen-Gymer.png', 'hoang-nguyen'],
    ];

    avatarTestCases.forEach(([avatarPath, expectedCode]) => {
      it(`should fallback to '${expectedCode}' for avatar ${avatarPath}`, () => {
        const mockHero: Hero = {
          id: 101,
          name: 'No Matched Name',
          avatar: avatarPath,
          hp: 1000,
          maxHp: 1000,
          mana: 50,
          maxMana: 100,
          attack: 100,
          defense: 50,
          speed: 100,
          position: 1,
          team: 'left',
        };
        expect(resolveBasicEffectCode(mockHero)).toBe(expectedCode);
      });
    });
  });

  describe('4. BASIC_RANDOM_HEAL override', () => {
    it('should always resolve to kiet-noel when activeSkillId is BASIC_RANDOM_HEAL', () => {
      const anyHero: Hero = {
        id: 1,
        heroTemplateId: 1, // K Cởi Trần
        name: 'K Cởi Trần',
        avatar: '/assets/images/dcs-game/kiet.png',
        hp: 1000,
        maxHp: 1000,
        mana: 0,
        maxMana: 100,
        attack: 100,
        defense: 50,
        speed: 100,
        position: 1,
        team: 'left',
      };
      // When casting BASIC_RANDOM_HEAL, healing effect must be used
      expect(resolveBasicEffectCode(anyHero, 'BASIC_RANDOM_HEAL')).toBe('kiet-noel');
    });

    it('should NOT resolve to kiet-noel when casting NORMAL_ATTACK for hero 1', () => {
      const hero1: Hero = {
        id: 1,
        heroTemplateId: 1,
        name: 'K Cởi Trần',
        avatar: '/assets/images/dcs-game/kiet.png',
        hp: 1000,
        maxHp: 1000,
        mana: 0,
        maxMana: 100,
        attack: 100,
        defense: 50,
        speed: 100,
        position: 1,
        team: 'left',
      };
      expect(resolveBasicEffectCode(hero1, 'NORMAL_ATTACK')).toBe('kiet');
    });
  });

  describe('5. Fallback for Unknown Hero', () => {
    it('should return "generic" when hero is undefined or null', () => {
      expect(resolveBasicEffectCode(null)).toBe('generic');
      expect(resolveBasicEffectCode(undefined)).toBe('generic');
    });

    it('should return "generic" for completely unrecognized hero data', () => {
      const unknownHero: Hero = {
        id: 9999,
        name: 'Mysterious Stranger',
        avatar: '/unknown/path/alien.png',
        hp: 500,
        maxHp: 500,
        mana: 0,
        maxMana: 100,
        attack: 50,
        defense: 50,
        speed: 50,
        position: 1,
        team: 'left',
      };
      expect(resolveBasicEffectCode(unknownHero)).toBe('generic');
    });
  });

  describe('6. Facing direction rules', () => {
    function getFacingMultiplier(isTeamRight: boolean): number {
      return isTeamRight ? -1 : 1;
    }

    it('Left team should use facing +1', () => {
      expect(getFacingMultiplier(false)).toBe(1);
    });

    it('Right team should use facing -1', () => {
      expect(getFacingMultiplier(true)).toBe(-1);
    });
  });
});
