import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BATTLE_SKILL_VFX_REGISTRY } from './battle-skill-vfx.registry';
import { BattleSkillVfxHostComponent } from './battle-skill-vfx-host.component';
import { KietMaiXeoSceneVfxComponent } from './scene/legendary-heroes/kiet-mai-xeo/kiet-mai-xeo-scene-vfx.component';
import { TruongKietGraduationSceneVfxComponent } from './scene/legendary-heroes/truong-kiet-graduation/truong-kiet-graduation-scene-vfx.component';
import { QuocNhanGraduationSceneVfxComponent } from './scene/legendary-heroes/quoc-nhan-graduation/quoc-nhan-graduation-scene-vfx.component';
import { LongLeCatSceneVfxComponent } from './scene/legendary-heroes/long-le-cat/long-le-cat-scene-vfx.component';
import { LongLeCatBasicSceneVfxComponent } from './scene/legendary-heroes/long-le-cat/long-le-cat-basic-scene-vfx.component';
import { QuocNhanRunNowSceneVfxComponent } from './scene/legendary-heroes/quoc-nhan-run-now/quoc-nhan-run-now-scene-vfx.component';
import { resolveBasicEffectCode } from '../components/battle-character/basic-skill-effect/basic-effect-resolver.util';
import { BattleEventDto } from '../../../core/models/battle.model';

describe('Five Legendary Heroes VFX Suite Spec', () => {
  describe('1. Registry mapping', () => {
    it('should map KIET_MAI_XEO_ENERGY to KietMaiXeoSceneVfxComponent with screenShake', () => {
      const def = BATTLE_SKILL_VFX_REGISTRY['KIET_MAI_XEO_ENERGY'];
      expect(def).toBeDefined();
      expect(def.sceneComponent).toBe(KietMaiXeoSceneVfxComponent);
      expect(def.screenShake).toBeTrue();
    });

    it('should map TRUONG_KIET_GRADUATION_ENERGY to TruongKietGraduationSceneVfxComponent with screenShake', () => {
      const def = BATTLE_SKILL_VFX_REGISTRY['TRUONG_KIET_GRADUATION_ENERGY'];
      expect(def).toBeDefined();
      expect(def.sceneComponent).toBe(TruongKietGraduationSceneVfxComponent);
      expect(def.screenShake).toBeTrue();
    });

    it('should map QUOC_NHAN_GRADUATION_ENERGY to QuocNhanGraduationSceneVfxComponent with screenShake', () => {
      const def = BATTLE_SKILL_VFX_REGISTRY['QUOC_NHAN_GRADUATION_ENERGY'];
      expect(def).toBeDefined();
      expect(def.sceneComponent).toBe(QuocNhanGraduationSceneVfxComponent);
      expect(def.screenShake).toBeTrue();
    });

    it('should map LONG_LE_CAT_COMPANIONS to LongLeCatSceneVfxComponent without screenShake', () => {
      const def = BATTLE_SKILL_VFX_REGISTRY['LONG_LE_CAT_COMPANIONS'];
      expect(def).toBeDefined();
      expect(def.sceneComponent).toBe(LongLeCatSceneVfxComponent);
      expect(def.screenShake).toBeFalse();
    });

    it('should map LONG_LE_CAT_SCRATCH_BASIC to LongLeCatBasicSceneVfxComponent without screenShake', () => {
      const def = BATTLE_SKILL_VFX_REGISTRY['LONG_LE_CAT_SCRATCH_BASIC'];
      expect(def).toBeDefined();
      expect(def.sceneComponent).toBe(LongLeCatBasicSceneVfxComponent);
      expect(def.screenShake).toBeFalse();
    });

    it('should map QUOC_NHAN_RUN_NOW_ENERGY to QuocNhanRunNowSceneVfxComponent with screenShake', () => {
      const def = BATTLE_SKILL_VFX_REGISTRY['QUOC_NHAN_RUN_NOW_ENERGY'];
      expect(def).toBeDefined();
      expect(def.sceneComponent).toBe(QuocNhanRunNowSceneVfxComponent);
      expect(def.screenShake).toBeTrue();
    });
  });

  describe('2. BattleSkillVfxHostComponent Inputs Resolution', () => {
    let host: BattleSkillVfxHostComponent;

    beforeEach(() => {
      host = new BattleSkillVfxHostComponent();
      host.actorActive = true;
      host.impactActive = true;
      host.actorTeamRight = true;
      host.visualSpeed = 2;
      host.actorId = 101;
      host.activeTargetIds = [201, 202, 203];
      host.castEvents = [];
    });

    const legendarySkillIds = [
      'KIET_MAI_XEO_ENERGY',
      'TRUONG_KIET_GRADUATION_ENERGY',
      'QUOC_NHAN_GRADUATION_ENERGY',
      'LONG_LE_CAT_COMPANIONS',
      'QUOC_NHAN_RUN_NOW_ENERGY'
    ];

    legendarySkillIds.forEach(skillId => {
      it(`should pass standard inputs to ${skillId}`, () => {
        host.skillId = skillId;
        expect(host.component).toBeDefined();

        const inputs = host.componentInputs;
        expect(inputs['actorActive']).toBeTrue();
        expect(inputs['impactActive']).toBeTrue();
        expect(inputs['actorTeamRight']).toBeTrue();
        expect(inputs['visualSpeed']).toBe(2);
        expect(inputs['actorId']).toBe(101);
        expect(inputs['activeTargetIds']).toEqual([201, 202, 203]);
      });
    });
  });

  describe('3. Basic Effect Resolver for 5 Legendary Heroes', () => {
    it('should resolve KIET_MAI_XEO_BASIC to kiet-mai-xeo', () => {
      const code = resolveBasicEffectCode(null, 'KIET_MAI_XEO_BASIC');
      expect(code).toBe('kiet-mai-xeo');
    });

    it('should resolve TRUONG_KIET_GRADUATION_BASIC to truong-kiet-tot-nghiep-cap-3', () => {
      const code = resolveBasicEffectCode(null, 'TRUONG_KIET_GRADUATION_BASIC');
      expect(code).toBe('truong-kiet-tot-nghiep-cap-3');
    });

    it('should resolve QUOC_NHAN_GRADUATION_BASIC to quoc-nhan-tot-nghiep-cap-3', () => {
      const code = resolveBasicEffectCode(null, 'QUOC_NHAN_GRADUATION_BASIC');
      expect(code).toBe('quoc-nhan-tot-nghiep-cap-3');
    });

    it('should resolve LONG_LE_CAT_SCRATCH_BASIC to long-le-con-meo', () => {
      const code = resolveBasicEffectCode(null, 'LONG_LE_CAT_SCRATCH_BASIC');
      expect(code).toBe('long-le-con-meo');
    });

    it('should resolve QUOC_NHAN_RUN_NOW_BASIC to quoc-nhan-chay-ngay-di', () => {
      const code = resolveBasicEffectCode(null, 'QUOC_NHAN_RUN_NOW_BASIC');
      expect(code).toBe('quoc-nhan-chay-ngay-di');
    });
  });

  describe('4. KietMaiXeoSceneVfxComponent Timeline & Stacks', () => {
    let fixture: ComponentFixture<KietMaiXeoSceneVfxComponent>;
    let comp: KietMaiXeoSceneVfxComponent;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [KietMaiXeoSceneVfxComponent]
      }).compileComponents();

      fixture = TestBed.createComponent(KietMaiXeoSceneVfxComponent);
      comp = fixture.componentInstance;
    });

    it('should initialize and progress through phases', () => {
      comp.actorActive = true;
      comp.activeTargetIds = [50];
      comp.visualSpeed = 10; // Fast for testing
      comp.ngOnInit();

      expect(comp.phase).toBe('gather');
      expect(comp.targetPos).toBeDefined();
    });

    it('should detect 3 Phong An stack consumption and crit from castEvents', () => {
      comp.actorActive = true;
      comp.castEvents = [
        {
          eventType: 'STATUS_REMOVED',
          effectTypeCode: 'PHONG_AN',
          previousStacks: 3
        } as unknown as BattleEventDto,
        {
          eventType: 'DAMAGE_DEALT',
          isCrit: true
        } as unknown as BattleEventDto
      ];
      comp.ngOnInit();

      expect(comp.consumedSeals).toBe(3);
      expect(comp.isMaxStacks).toBeTrue();
      expect(comp.hasCrit).toBeTrue();
    });
  });

  describe('5. TruongKietGraduationSceneVfxComponent Multi-Target Shields', () => {
    let fixture: ComponentFixture<TruongKietGraduationSceneVfxComponent>;
    let comp: TruongKietGraduationSceneVfxComponent;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [TruongKietGraduationSceneVfxComponent]
      }).compileComponents();

      fixture = TestBed.createComponent(TruongKietGraduationSceneVfxComponent);
      comp = fixture.componentInstance;
    });

    it('should map front-row targets and detect 3 Tin Chi consumption', () => {
      comp.actorActive = true;
      comp.activeTargetIds = [10, 11];
      comp.castEvents = [
        {
          eventType: 'STATUS_REMOVED',
          effectTypeCode: 'TIN_CHI_DANH_DU',
          previousStacks: 3
        } as unknown as BattleEventDto
      ];
      comp.ngOnInit();

      expect(comp.phase).toBe('slam');
      expect(comp.enemyTargetNodes.length).toBe(2);
      expect(comp.isMaxCredits).toBeTrue();
    });
  });

  describe('6. QuocNhanGraduationSceneVfxComponent Target Resolution & Silence', () => {
    let fixture: ComponentFixture<QuocNhanGraduationSceneVfxComponent>;
    let comp: QuocNhanGraduationSceneVfxComponent;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [QuocNhanGraduationSceneVfxComponent]
      }).compileComponents();

      fixture = TestBed.createComponent(QuocNhanGraduationSceneVfxComponent);
      comp = fixture.componentInstance;
    });

    it('should track Luận Điểm stacks and Silence status on specific targets', () => {
      comp.actorActive = true;
      comp.activeTargetIds = [15, 16];
      comp.castEvents = [
        {
          targetId: 15,
          eventType: 'STATUS_REMOVED',
          effectTypeCode: 'LUAN_DIEM',
          previousStacks: 3
        } as unknown as BattleEventDto,
        {
          targetId: 15,
          eventType: 'STATUS_APPLIED',
          effectTypeCode: 'SILENCE'
        } as unknown as BattleEventDto
      ];
      comp.ngOnInit();

      expect(comp.targets.length).toBe(2);
      const target15 = comp.targets.find(t => t.id === 15);
      expect(target15).toBeDefined();
      expect(target15?.luanDiemStacks).toBe(3);
      expect(target15?.isSilenced).toBeTrue();
    });
  });

  describe('7. LongLeCatSceneVfxComponent Asset Paths & No Emoji', () => {
    let fixture: ComponentFixture<LongLeCatSceneVfxComponent>;
    let comp: LongLeCatSceneVfxComponent;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [LongLeCatSceneVfxComponent]
      }).compileComponents();

      fixture = TestBed.createComponent(LongLeCatSceneVfxComponent);
      comp = fixture.componentInstance;
    });

    it('should reference dedicated PNG assets and not emojis', () => {
      expect(comp.catAirborneAsset).toBe('/assets/images/dcs-game/skill-vfx/long-le-cat/long-le-cat-airborne.png');
      expect(comp.catLandingAsset).toBe('/assets/images/dcs-game/skill-vfx/long-le-cat/long-le-cat-landing.png');
      expect(comp.catCompanionAsset).toBe('/assets/images/dcs-game/skill-vfx/long-le-cat/long-le-cat-companion.png');
      expect(comp.catProjectileAsset).toBe('/assets/images/dcs-game/skill-vfx/long-le-cat/long-le-cat-projectile.png');
    });

    it('should assign companion cats to backend-chosen allies (exact count)', () => {
      comp.actorActive = true;
      comp.actorId = 5;
      comp.activeTargetIds = [20, 21, 22];
      comp.ngOnInit();

      expect(comp.allyNodes.length).toBe(3);
      expect(comp.allyNodes[0].id).toBe(20);
      expect(comp.allyNodes[1].id).toBe(21);
      expect(comp.allyNodes[2].id).toBe(22);
    });

    it('should create only 2 cats if backend chose 2 allies', () => {
      comp.actorActive = true;
      comp.actorId = 5;
      comp.activeTargetIds = [101, 102];
      comp.ngOnInit();

      expect(comp.allyNodes.length).toBe(2);
      expect(comp.allyNodes[0].id).toBe(101);
      expect(comp.allyNodes[1].id).toBe(102);
    });
  });

  describe('7b. LongLeCatBasicSceneVfxComponent Trajectory & Phases', () => {
    let fixture: ComponentFixture<LongLeCatBasicSceneVfxComponent>;
    let comp: LongLeCatBasicSceneVfxComponent;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [LongLeCatBasicSceneVfxComponent]
      }).compileComponents();

      fixture = TestBed.createComponent(LongLeCatBasicSceneVfxComponent);
      comp = fixture.componentInstance;
    });

    it('should reference projectile asset and cat scratch asset', () => {
      expect(comp.catProjectileAsset).toBe('/assets/images/dcs-game/skill-vfx/long-le-cat/long-le-cat-projectile.png');
      expect(comp.catScratchAsset).toBe('/assets/images/dcs-game/effects/cat-scratch.png');
    });

    it('should initialize and progress starting from crouch_prep', () => {
      comp.actorActive = true;
      comp.actorId = 1;
      comp.activeTargetIds = [10];
      comp.visualSpeed = 10;
      comp.ngOnInit();

      expect(comp.phase).toBe('crouch_prep');
      expect(comp.startX).toBeDefined();
      expect(comp.targetX).toBeDefined();
    });

    it('should mirror properly when actorTeamRight is true', () => {
      comp.actorActive = true;
      comp.actorTeamRight = true;
      comp.actorId = 2;
      comp.activeTargetIds = [11];
      comp.ngOnInit();

      expect(comp.actorTeamRight).toBeTrue();
    });
  });

  describe('8. QuocNhanRunNowSceneVfxComponent Candle & Wax Mark Assets', () => {
    let fixture: ComponentFixture<QuocNhanRunNowSceneVfxComponent>;
    let comp: QuocNhanRunNowSceneVfxComponent;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [QuocNhanRunNowSceneVfxComponent]
      }).compileComponents();

      fixture = TestBed.createComponent(QuocNhanRunNowSceneVfxComponent);
      comp = fixture.componentInstance;
    });

    it('should reference red candle and red wax mark assets', () => {
      expect(comp.candleAsset).toBe('/assets/images/dcs-game/skill-vfx/quoc-nhan-run-now/red-candle.png');
      expect(comp.waxMarkAsset).toBe('/assets/images/dcs-game/skill-vfx/quoc-nhan-run-now/red-wax-mark.png');
    });

    it('should create targets for each front-row enemy', () => {
      comp.actorActive = true;
      comp.activeTargetIds = [31, 32];
      comp.ngOnInit();

      expect(comp.targets.length).toBe(2);
      expect(comp.targets[0].id).toBe(31);
      expect(comp.targets[1].id).toBe(32);
    });
  });
});
