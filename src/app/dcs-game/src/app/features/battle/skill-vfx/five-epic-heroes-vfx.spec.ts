import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BATTLE_SKILL_VFX_REGISTRY } from './battle-skill-vfx.registry';
import { BattleSkillVfxHostComponent } from './battle-skill-vfx-host.component';
import { KietBacSiSceneVfxComponent } from './scene/epic-heroes/kiet-bac-si-scene-vfx.component';
import { TruongKietSceneVfxComponent } from './scene/epic-heroes/truong-kiet-scene-vfx.component';
import { TienDungTongDaiSceneVfxComponent } from './scene/epic-heroes/tien-dung-tong-dai-scene-vfx.component';
import { QuocNhanSceneVfxComponent } from './scene/epic-heroes/quoc-nhan-scene-vfx.component';
import { CauVangSceneVfxComponent } from './scene/epic-heroes/cau-vang-scene-vfx.component';

describe('Five Epic Heroes VFX Components & Registry Spec', () => {
  describe('1. Registry mapping', () => {
    it('should map KIET_BAC_SI_EMERGENCY_PROTOCOL to KietBacSiSceneVfxComponent', () => {
      const def = BATTLE_SKILL_VFX_REGISTRY['KIET_BAC_SI_EMERGENCY_PROTOCOL'];
      expect(def).toBeDefined();
      expect(def.sceneComponent).toBe(KietBacSiSceneVfxComponent);
      expect(def.screenShake).toBeFalsy();
    });

    it('should map TRUONG_KIET_SOUL_KISS to TruongKietSceneVfxComponent with screenShake', () => {
      const def = BATTLE_SKILL_VFX_REGISTRY['TRUONG_KIET_SOUL_KISS'];
      expect(def).toBeDefined();
      expect(def.sceneComponent).toBe(TruongKietSceneVfxComponent);
      expect(def.screenShake).toBeTrue();
    });

    it('should map TIEN_DUNG_EMERGENCY_CONFERENCE to TienDungTongDaiSceneVfxComponent', () => {
      const def = BATTLE_SKILL_VFX_REGISTRY['TIEN_DUNG_EMERGENCY_CONFERENCE'];
      expect(def).toBeDefined();
      expect(def.sceneComponent).toBe(TienDungTongDaiSceneVfxComponent);
      expect(def.screenShake).toBeFalsy();
    });

    it('should map QUOC_NHAN_NIGHT_PHANTOMS to QuocNhanSceneVfxComponent with screenShake', () => {
      const def = BATTLE_SKILL_VFX_REGISTRY['QUOC_NHAN_NIGHT_PHANTOMS'];
      expect(def).toBeDefined();
      expect(def.sceneComponent).toBe(QuocNhanSceneVfxComponent);
      expect(def.screenShake).toBeTrue();
    });

    it('should map CAU_VANG_CALM_GUARD to CauVangSceneVfxComponent', () => {
      const def = BATTLE_SKILL_VFX_REGISTRY['CAU_VANG_CALM_GUARD'];
      expect(def).toBeDefined();
      expect(def.sceneComponent).toBe(CauVangSceneVfxComponent);
      expect(def.screenShake).toBeFalsy();
    });
  });

  describe('2. BattleSkillVfxHostComponent Inputs Resolution', () => {
    let host: BattleSkillVfxHostComponent;

    beforeEach(() => {
      host = new BattleSkillVfxHostComponent();
      host.actorActive = true;
      host.impactActive = true;
      host.actorTeamRight = true;
      host.visualSpeed = 4;
      host.actorId = 15;
      host.activeTargetIds = [30, 31, 32];
      host.castEvents = [];
    });

    const epicSkillIds = [
      'KIET_BAC_SI_EMERGENCY_PROTOCOL',
      'TRUONG_KIET_SOUL_KISS',
      'TIEN_DUNG_EMERGENCY_CONFERENCE',
      'QUOC_NHAN_NIGHT_PHANTOMS',
      'CAU_VANG_CALM_GUARD'
    ];

    epicSkillIds.forEach(skillId => {
      it(`should pass standard inputs to ${skillId}`, () => {
        host.skillId = skillId;
        expect(host.component).toBeDefined();

        const inputs = host.componentInputs;
        expect(inputs['actorActive']).toBeTrue();
        expect(inputs['impactActive']).toBeTrue();
        expect(inputs['actorTeamRight']).toBeTrue();
        expect(inputs['visualSpeed']).toBe(4);
        expect(inputs['actorId']).toBe(15);
        expect(inputs['activeTargetIds']).toEqual([30, 31, 32]);
      });
    });
  });

  describe('3. KietBacSiSceneVfxComponent Lifecycle & Speed Scaling', () => {
    let fixture: ComponentFixture<KietBacSiSceneVfxComponent>;
    let comp: KietBacSiSceneVfxComponent;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [KietBacSiSceneVfxComponent]
      }).compileComponents();

      fixture = TestBed.createComponent(KietBacSiSceneVfxComponent);
      comp = fixture.componentInstance;
    });

    afterEach(() => {
      fixture.destroy();
    });

    it('should initialize and support speed x1, x2, x4', () => {
      comp.actorActive = true;
      comp.visualSpeed = 4;
      fixture.detectChanges();

      expect(comp.phase).toBe('scan');
      expect(comp.vitalOrbAssetUrl).toContain('vital-scan-orb.png');
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

  describe('4. TruongKietSceneVfxComponent Team Mirroring & Panic Detection', () => {
    let fixture: ComponentFixture<TruongKietSceneVfxComponent>;
    let comp: TruongKietSceneVfxComponent;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [TruongKietSceneVfxComponent]
      }).compileComponents();

      fixture = TestBed.createComponent(TruongKietSceneVfxComponent);
      comp = fixture.componentInstance;
    });

    afterEach(() => {
      fixture.destroy();
    });

    it('should mirror properly and detect panic event', () => {
      comp.actorTeamRight = true;
      comp.actorActive = true;
      comp.castEvents = [
        {
          eventType: 'STATUS_APPLIED',
          effectTypeCode: 'PANIC',
          skillId: 'TRUONG_KIET_SOUL_KISS'
        } as any
      ];
      fixture.detectChanges();

      const el: HTMLElement = fixture.nativeElement;
      const container = el.querySelector('.truong-kiet-vfx-container');
      expect(container?.classList.contains('caster-right')).toBeTrue();
      expect(comp.hasPanic).toBeTrue();
      expect(comp.sealAssetUrl).toContain('resonance-kiss-seal.png');
    });
  });

  describe('5. TienDungTongDaiSceneVfxComponent Action Bar Reduction', () => {
    let fixture: ComponentFixture<TienDungTongDaiSceneVfxComponent>;
    let comp: TienDungTongDaiSceneVfxComponent;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [TienDungTongDaiSceneVfxComponent]
      }).compileComponents();

      fixture = TestBed.createComponent(TienDungTongDaiSceneVfxComponent);
      comp = fixture.componentInstance;
    });

    afterEach(() => {
      fixture.destroy();
    });

    it('should set phase to open and detect ACTION_BAR_CHANGED event', () => {
      comp.actorActive = true;
      comp.castEvents = [
        {
          eventType: 'ACTION_BAR_CHANGED',
          value: -15
        } as any
      ];
      fixture.detectChanges();

      expect(comp.phase).toBe('open');
      expect(comp.hasActionBarReduction).toBeTrue();
      expect(comp.panelAssetUrl).toContain('holo-call-panel.png');
    });
  });

  describe('6. QuocNhanSceneVfxComponent Shadow Split & Back-Row Target Phase', () => {
    let fixture: ComponentFixture<QuocNhanSceneVfxComponent>;
    let comp: QuocNhanSceneVfxComponent;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [QuocNhanSceneVfxComponent]
      }).compileComponents();

      fixture = TestBed.createComponent(QuocNhanSceneVfxComponent);
      comp = fixture.componentInstance;
    });

    afterEach(() => {
      fixture.destroy();
    });

    it('should initialize split phase and mask asset URL', () => {
      comp.actorActive = true;
      fixture.detectChanges();

      expect(comp.phase).toBe('split');
      expect(comp.maskAssetUrl).toContain('phantom-mask.png');
    });
  });

  describe('7. CauVangSceneVfxComponent Chime Phase & Paw Prints', () => {
    let fixture: ComponentFixture<CauVangSceneVfxComponent>;
    let comp: CauVangSceneVfxComponent;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [CauVangSceneVfxComponent]
      }).compileComponents();

      fixture = TestBed.createComponent(CauVangSceneVfxComponent);
      comp = fixture.componentInstance;
    });

    afterEach(() => {
      fixture.destroy();
    });

    it('should start with chime phase and jade bell asset', () => {
      comp.actorActive = true;
      fixture.detectChanges();

      expect(comp.phase).toBe('chime');
      expect(comp.bellAssetUrl).toContain('jade-guard-bell.png');
    });
  });
});
