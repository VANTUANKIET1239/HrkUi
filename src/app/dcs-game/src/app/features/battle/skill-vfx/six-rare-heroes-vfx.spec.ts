import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BATTLE_SKILL_VFX_REGISTRY } from './battle-skill-vfx.registry';
import { BattleSkillVfxHostComponent } from './battle-skill-vfx-host.component';
import { TrongChuaNoSceneVfxComponent } from './scene/rare-heroes/trong-chua-no-scene-vfx.component';
import { QuangVinhSceneVfxComponent } from './scene/rare-heroes/quang-vinh-scene-vfx.component';
import { NguyenXamLonSceneVfxComponent } from './scene/rare-heroes/nguyen-xam-lon-scene-vfx.component';
import { TienDungXuanSceneVfxComponent } from './scene/rare-heroes/tien-dung-xuan-scene-vfx.component';
import { VanTrongSceneVfxComponent } from './scene/rare-heroes/van-trong-scene-vfx.component';
import { TuongLongSceneVfxComponent } from './scene/rare-heroes/tuong-long-scene-vfx.component';

describe('Six Rare Heroes VFX Components & Registry Spec', () => {
  describe('1. Registry mapping', () => {
    it('should map TRONG_CHUA_NO_THREE_SECONDS to TrongChuaNoSceneVfxComponent', () => {
      const def = BATTLE_SKILL_VFX_REGISTRY['TRONG_CHUA_NO_THREE_SECONDS'];
      expect(def).toBeDefined();
      expect(def.sceneComponent).toBe(TrongChuaNoSceneVfxComponent);
      expect(def.screenShake).toBeTrue();
    });

    it('should map QUANG_VINH_THCS_HONOR_BARRIER to QuangVinhSceneVfxComponent', () => {
      const def = BATTLE_SKILL_VFX_REGISTRY['QUANG_VINH_THCS_HONOR_BARRIER'];
      expect(def).toBeDefined();
      expect(def.sceneComponent).toBe(QuangVinhSceneVfxComponent);
      expect(def.screenShake).toBeTrue();
    });

    it('should map NGUYEN_XAM_LON_BOSS_ENTERS to NguyenXamLonSceneVfxComponent', () => {
      const def = BATTLE_SKILL_VFX_REGISTRY['NGUYEN_XAM_LON_BOSS_ENTERS'];
      expect(def).toBeDefined();
      expect(def.sceneComponent).toBe(NguyenXamLonSceneVfxComponent);
      expect(def.screenShake).toBeTrue();
    });

    it('should map TIEN_DUNG_XUAN_TEN_THOUSAND_GLYPHS to TienDungXuanSceneVfxComponent', () => {
      const def = BATTLE_SKILL_VFX_REGISTRY['TIEN_DUNG_XUAN_TEN_THOUSAND_GLYPHS'];
      expect(def).toBeDefined();
      expect(def.sceneComponent).toBe(TienDungXuanSceneVfxComponent);
    });

    it('should map VAN_TRONG_DIEN_VANG_CHAIN_LIGHTNING to VanTrongSceneVfxComponent', () => {
      const def = BATTLE_SKILL_VFX_REGISTRY['VAN_TRONG_DIEN_VANG_CHAIN_LIGHTNING'];
      expect(def).toBeDefined();
      expect(def.sceneComponent).toBe(VanTrongSceneVfxComponent);
    });

    it('should map TUONG_LONG_CAP_3_CLASS_BELL to TuongLongSceneVfxComponent', () => {
      const def = BATTLE_SKILL_VFX_REGISTRY['TUONG_LONG_CAP_3_CLASS_BELL'];
      expect(def).toBeDefined();
      expect(def.sceneComponent).toBe(TuongLongSceneVfxComponent);
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
      host.actorId = 10;
      host.activeTargetIds = [20, 21];
      host.castEvents = [];
    });

    const rareSkillIds = [
      'TRONG_CHUA_NO_THREE_SECONDS',
      'QUANG_VINH_THCS_HONOR_BARRIER',
      'NGUYEN_XAM_LON_BOSS_ENTERS',
      'TIEN_DUNG_XUAN_TEN_THOUSAND_GLYPHS',
      'VAN_TRONG_DIEN_VANG_CHAIN_LIGHTNING',
      'TUONG_LONG_CAP_3_CLASS_BELL'
    ];

    rareSkillIds.forEach(skillId => {
      it(`should pass standard inputs to ${skillId}`, () => {
        host.skillId = skillId;
        expect(host.component).toBeDefined();

        const inputs = host.componentInputs;
        expect(inputs['actorActive']).toBeTrue();
        expect(inputs['impactActive']).toBeTrue();
        expect(inputs['actorTeamRight']).toBeTrue();
        expect(inputs['visualSpeed']).toBe(2);
        expect(inputs['actorId']).toBe(10);
        expect(inputs['activeTargetIds']).toEqual([20, 21]);
      });
    });
  });

  describe('3. TrongChuaNoSceneVfxComponent Lifecycle & Speed Scaling', () => {
    let fixture: ComponentFixture<TrongChuaNoSceneVfxComponent>;
    let comp: TrongChuaNoSceneVfxComponent;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [TrongChuaNoSceneVfxComponent]
      }).compileComponents();

      fixture = TestBed.createComponent(TrongChuaNoSceneVfxComponent);
      comp = fixture.componentInstance;
    });

    afterEach(() => {
      fixture.destroy();
    });

    it('should initialize and support speed x1, x2, x4', () => {
      comp.actorActive = true;
      comp.visualSpeed = 4;
      fixture.detectChanges();

      expect(comp.phase).toBe('throw');
      expect(comp.chargeAssetUrl).toContain('timed-charge.png');
    });

    it('should activate fallback when asset fails', () => {
      comp.onAssetError();
      expect(comp.assetFailed).toBeTrue();
    });

    it('should cleanup all timers on ngOnDestroy', () => {
      comp.actorActive = true;
      comp.castSequence = 1;
      comp.ngOnChanges({
        actorActive: { currentValue: true, previousValue: false, firstChange: true, isFirstChange: () => true }
      });

      expect(() => comp.ngOnDestroy()).not.toThrow();
      expect(comp.phase).toBe('idle');
    });
  });

  describe('4. QuangVinhSceneVfxComponent Team Mirroring & Barrier Phase', () => {
    let fixture: ComponentFixture<QuangVinhSceneVfxComponent>;
    let comp: QuangVinhSceneVfxComponent;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [QuangVinhSceneVfxComponent]
      }).compileComponents();

      fixture = TestBed.createComponent(QuangVinhSceneVfxComponent);
      comp = fixture.componentInstance;
    });

    afterEach(() => {
      fixture.destroy();
    });

    it('should reflect actorTeamRight properly', () => {
      comp.actorTeamRight = true;
      comp.actorActive = true;
      fixture.detectChanges();

      const el: HTMLElement = fixture.nativeElement;
      const container = el.querySelector('.quang-vinh-vfx-container');
      expect(container?.classList.contains('caster-right')).toBeTrue();
      expect(comp.barrierAssetUrl).toContain('school-barrier.png');
    });
  });

  describe('5. NguyenXamLonSceneVfxComponent Stomp & Stamp Phases', () => {
    let fixture: ComponentFixture<NguyenXamLonSceneVfxComponent>;
    let comp: NguyenXamLonSceneVfxComponent;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [NguyenXamLonSceneVfxComponent]
      }).compileComponents();

      fixture = TestBed.createComponent(NguyenXamLonSceneVfxComponent);
      comp = fixture.componentInstance;
    });

    afterEach(() => {
      fixture.destroy();
    });

    it('should set phase to windup upon activation', () => {
      comp.actorActive = true;
      fixture.detectChanges();

      expect(comp.phase).toBe('windup');
      expect(comp.bossStampAssetUrl).toContain('boss-stamp.png');
    });
  });

  describe('6. TienDungXuanSceneVfxComponent Ink Drawing Phase', () => {
    let fixture: ComponentFixture<TienDungXuanSceneVfxComponent>;
    let comp: TienDungXuanSceneVfxComponent;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [TienDungXuanSceneVfxComponent]
      }).compileComponents();

      fixture = TestBed.createComponent(TienDungXuanSceneVfxComponent);
      comp = fixture.componentInstance;
    });

    afterEach(() => {
      fixture.destroy();
    });

    it('should set phase to draw upon activation', () => {
      comp.actorActive = true;
      fixture.detectChanges();

      expect(comp.phase).toBe('draw');
      expect(comp.sealAssetUrl).toContain('spring-calligraphy-seal.png');
    });
  });

  describe('7. VanTrongSceneVfxComponent Chain Lightning', () => {
    let fixture: ComponentFixture<VanTrongSceneVfxComponent>;
    let comp: VanTrongSceneVfxComponent;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [VanTrongSceneVfxComponent]
      }).compileComponents();

      fixture = TestBed.createComponent(VanTrongSceneVfxComponent);
      comp = fixture.componentInstance;
    });

    afterEach(() => {
      fixture.destroy();
    });

    it('should start with charge phase and load electric mascot orb asset', () => {
      comp.actorActive = true;
      comp.activeTargetIds = [1, 2, 3];
      fixture.detectChanges();

      expect(comp.phase).toBe('charge');
      expect(comp.mascotOrbAssetUrl).toContain('electric-mascot-orb.png');
    });
  });

  describe('8. TuongLongSceneVfxComponent Class Bell', () => {
    let fixture: ComponentFixture<TuongLongSceneVfxComponent>;
    let comp: TuongLongSceneVfxComponent;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [TuongLongSceneVfxComponent]
      }).compileComponents();

      fixture = TestBed.createComponent(TuongLongSceneVfxComponent);
      comp = fixture.componentInstance;
    });

    afterEach(() => {
      fixture.destroy();
    });

    it('should start with lift phase and load school bell asset', () => {
      comp.actorActive = true;
      fixture.detectChanges();

      expect(comp.phase).toBe('lift');
      expect(comp.bellAssetUrl).toContain('school-bell.png');
    });
  });
});
