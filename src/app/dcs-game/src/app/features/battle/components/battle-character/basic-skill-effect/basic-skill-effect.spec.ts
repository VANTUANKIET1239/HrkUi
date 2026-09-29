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

  describe('7. Six Rare Heroes Resolution Tests', () => {
    const rareSkills: [string, BasicEffectCode][] = [
      ['TRONG_CHUA_NO_BASIC', 'trong-chua-no'],
      ['QUANG_VINH_THCS_BASIC', 'quang-vinh-thcs'],
      ['NGUYEN_XAM_LON_BASIC', 'nguyen-xam-lon'],
      ['TIEN_DUNG_XUAN_BASIC', 'tien-dung-xuan'],
      ['VAN_TRONG_DIEN_VANG_BASIC', 'van-trong-dien-vang'],
      ['TUONG_LONG_CAP_3_BASIC', 'tuong-long-cap-3']
    ];

    rareSkills.forEach(([skillId, expectedCode]) => {
      it(`should resolve skill '${skillId}' directly to '${expectedCode}'`, () => {
        expect(resolveBasicEffectCode(null, skillId)).toBe(expectedCode);
      });
    });

    const rareHeroCodes: [string, BasicEffectCode][] = [
      ['trong-chua-no', 'trong-chua-no'],
      ['quang-vinh-thcs', 'quang-vinh-thcs'],
      ['nguyen-xam-lon', 'nguyen-xam-lon'],
      ['tien-dung-xuan', 'tien-dung-xuan'],
      ['van-trong-dien-vang', 'van-trong-dien-vang'],
      ['tuong-long-cap-3', 'tuong-long-cap-3']
    ];

    rareHeroCodes.forEach(([heroCode, expectedCode]) => {
      it(`should resolve heroCode '${heroCode}' to '${expectedCode}'`, () => {
        const hero: Hero = {
          id: 50,
          heroCode,
          name: 'Hero',
          avatar: '',
          hp: 1000,
          maxHp: 1000,
          mana: 0,
          maxMana: 100,
          attack: 100,
          defense: 50,
          speed: 100,
          position: 1,
          team: 'left'
        };
        expect(resolveBasicEffectCode(hero)).toBe(expectedCode);
      });
    });

    const rareAvatars: [string, BasicEffectCode][] = [
      ['/assets/images/dcs-game/trong-chua-no.png', 'trong-chua-no'],
      ['/assets/images/dcs-game/quang-vinh-thcs.png', 'quang-vinh-thcs'],
      ['/assets/images/dcs-game/nguyen-xam-lon.png', 'nguyen-xam-lon'],
      ['/assets/images/dcs-game/tien-dung-xuan.png', 'tien-dung-xuan'],
      ['/assets/images/dcs-game/van-trong-dien-vang.png', 'van-trong-dien-vang'],
      ['/assets/images/dcs-game/tuong-long-cap-3.png', 'tuong-long-cap-3']
    ];

    rareAvatars.forEach(([avatar, expectedCode]) => {
      it(`should resolve avatar '${avatar}' to '${expectedCode}'`, () => {
        const hero: Hero = {
          id: 51,
          name: 'Hero',
          avatar,
          hp: 1000,
          maxHp: 1000,
          mana: 0,
          maxMana: 100,
          attack: 100,
          defense: 50,
          speed: 100,
          position: 1,
          team: 'left'
        };
        expect(resolveBasicEffectCode(hero)).toBe(expectedCode);
      });
    });
  });

  describe('8. Five Epic Heroes Resolution Tests', () => {
    const epicSkills: [string, BasicEffectCode][] = [
      ['KIET_BAC_SI_BASIC', 'kiet-bac-si'],
      ['TRUONG_KIET_CHU_MO_BASIC', 'truong-kiet-chu-mo'],
      ['TIEN_DUNG_TONG_DAI_BASIC', 'tien-dung-tong-dai'],
      ['QUOC_NHAN_GIA_DIEN_BASIC', 'quoc-nhan-gia-dien'],
      ['CAU_VANG_MAT_LANH_BASIC', 'cau-vang-mat-lanh']
    ];

    epicSkills.forEach(([skillId, expectedCode]) => {
      it(`should resolve skill '${skillId}' directly to '${expectedCode}'`, () => {
        expect(resolveBasicEffectCode(null, skillId)).toBe(expectedCode);
      });
    });

    const epicHeroCodes: [string, BasicEffectCode][] = [
      ['kiet-bac-si', 'kiet-bac-si'],
      ['truong-kiet-chu-mo', 'truong-kiet-chu-mo'],
      ['tien-dung-tong-dai', 'tien-dung-tong-dai'],
      ['quoc-nhan-gia-dien', 'quoc-nhan-gia-dien'],
      ['cau-vang-mat-lanh', 'cau-vang-mat-lanh']
    ];

    epicHeroCodes.forEach(([heroCode, expectedCode]) => {
      it(`should resolve heroCode '${heroCode}' to '${expectedCode}'`, () => {
        const hero: Hero = {
          id: 60,
          heroCode,
          name: 'Hero',
          avatar: '',
          hp: 1200,
          maxHp: 1200,
          mana: 0,
          maxMana: 100,
          attack: 150,
          defense: 80,
          speed: 100,
          position: 1,
          team: 'left'
        };
        expect(resolveBasicEffectCode(hero)).toBe(expectedCode);
      });
    });

    const epicAvatars: [string, BasicEffectCode][] = [
      ['/assets/images/dcs-game/kiet-bac-si.png', 'kiet-bac-si'],
      ['/assets/images/dcs-game/kiet-bac-si-epic.png', 'kiet-bac-si'],
      ['/assets/images/dcs-game/truong-kiet-chu-mo.png', 'truong-kiet-chu-mo'],
      ['/assets/images/dcs-game/truong-kiet-chu-mo-epic.png', 'truong-kiet-chu-mo'],
      ['/assets/images/dcs-game/tien-dung-call-video.png', 'tien-dung-tong-dai'],
      ['/assets/images/dcs-game/tien-dung-tong-dai-epic.png', 'tien-dung-tong-dai'],
      ['/assets/images/dcs-game/quoc-nhan-fake.png', 'quoc-nhan-gia-dien'],
      ['/assets/images/dcs-game/quoc-nhan-gia-dien-epic.png', 'quoc-nhan-gia-dien'],
      ['/assets/images/dcs-game/meme-cho-hai-huoc.jpg', 'cau-vang-mat-lanh'],
      ['/assets/images/dcs-game/cau-vang-mat-lanh-epic.png', 'cau-vang-mat-lanh']
    ];

    epicAvatars.forEach(([avatar, expectedCode]) => {
      it(`should resolve avatar '${avatar}' to '${expectedCode}'`, () => {
        const hero: Hero = {
          id: 61,
          name: 'Hero',
          avatar,
          hp: 1200,
          maxHp: 1200,
          mana: 0,
          maxMana: 100,
          attack: 150,
          defense: 80,
          speed: 100,
          position: 1,
          team: 'left'
        };
        expect(resolveBasicEffectCode(hero)).toBe(expectedCode);
      });
    });
  });

  describe('7. Five Legendary Heroes Basic Effect Resolutions', () => {
    const legendarySkills: [string, BasicEffectCode][] = [
      ['KIET_MAI_XEO_BASIC', 'kiet-mai-xeo'],
      ['TRUONG_KIET_GRADUATION_BASIC', 'truong-kiet-tot-nghiep-cap-3'],
      ['QUOC_NHAN_GRADUATION_BASIC', 'quoc-nhan-tot-nghiep-cap-3'],
      ['LONG_LE_CAT_SCRATCH_BASIC', 'long-le-con-meo'],
      ['QUOC_NHAN_RUN_NOW_BASIC', 'quoc-nhan-chay-ngay-di']
    ];

    legendarySkills.forEach(([skillId, expectedCode]) => {
      it(`should resolve activeSkillId '${skillId}' to '${expectedCode}'`, () => {
        expect(resolveBasicEffectCode(null, skillId)).toBe(expectedCode);
      });
    });

    const legendaryAvatars: [string, BasicEffectCode][] = [
      ['HrkUi/src/assets/images/dcs-game/kiet-mai-xeo.jpg', 'kiet-mai-xeo'],
      ['/assets/images/dcs-game/kiet-mai-xeo-legendary.png', 'kiet-mai-xeo'],
      ['HrkUi/src/assets/images/dcs-game/truong-kiet-tot-nghiep-cap-3.png', 'truong-kiet-tot-nghiep-cap-3'],
      ['/assets/images/dcs-game/truong-kiet-tot-nghiep-cap-3-legendary.png', 'truong-kiet-tot-nghiep-cap-3'],
      ['HrkUi/src/assets/images/dcs-game/quoc-nhan-tot-nghiep-cap-3.png', 'quoc-nhan-tot-nghiep-cap-3'],
      ['/assets/images/dcs-game/quoc-nhan-tot-nghiep-cap-3-legendary.png', 'quoc-nhan-tot-nghiep-cap-3'],
      ['HrkUi/src/assets/images/dcs-game/long-le-con-meo.jpg', 'long-le-con-meo'],
      ['/assets/images/dcs-game/long-le-con-meo-legendary.png', 'long-le-con-meo'],
      ['HrkUi/src/assets/images/dcs-game/quoc-nhan-chay-ngay-di.png', 'quoc-nhan-chay-ngay-di'],
      ['/assets/images/dcs-game/quoc-nhan-chay-ngay-di-legendary.png', 'quoc-nhan-chay-ngay-di']
    ];

    legendaryAvatars.forEach(([avatar, expectedCode]) => {
      it(`should resolve avatar '${avatar}' to '${expectedCode}'`, () => {
        const hero: Hero = {
          id: 70,
          name: 'Legendary Hero',
          avatar,
          hp: 2000,
          maxHp: 2000,
          mana: 0,
          maxMana: 100,
          attack: 200,
          defense: 100,
          speed: 120,
          position: 1,
          team: 'left'
        };
        expect(resolveBasicEffectCode(hero)).toBe(expectedCode);
      });
    });

    const legendaryNames: [string, BasicEffectCode][] = [
      ['Kiệt Mái Xéo', 'kiet-mai-xeo'],
      ['Trường Kiệt Tốt Nghiệp Cấp 3', 'truong-kiet-tot-nghiep-cap-3'],
      ['Quốc Nhân Tốt Nghiệp Cấp 3', 'quoc-nhan-tot-nghiep-cap-3'],
      ['Long Lê Con Mèo', 'long-le-con-meo'],
      ['Quốc Nhân Chạy Ngay Đi', 'quoc-nhan-chay-ngay-di']
    ];

    legendaryNames.forEach(([name, expectedCode]) => {
      it(`should resolve hero name '${name}' to '${expectedCode}'`, () => {
        const hero: Hero = {
          id: 71,
          name,
          avatar: '',
          hp: 2000,
          maxHp: 2000,
          mana: 0,
          maxMana: 100,
          attack: 200,
          defense: 100,
          speed: 120,
          position: 1,
          team: 'left'
        };
        expect(resolveBasicEffectCode(hero)).toBe(expectedCode);
      });
    });
  });
});
