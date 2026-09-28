import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BATTLE_SKILL_VFX_REGISTRY } from './battle-skill-vfx.registry';
import { BattleSkillVfxHostComponent } from './battle-skill-vfx-host.component';
import { SibaSceneVfxComponent } from './scene/siba-thien-than/siba-scene-vfx.component';
import { SibaHaloComponent } from './scene/siba-thien-than/siba-halo.component';
import { SibaCelestialBeamComponent } from './scene/siba-thien-than/siba-celestial-beam.component';
import { SibaBlessingWingsComponent } from './scene/siba-thien-than/siba-blessing-wings.component';
import { SibaDispelParticlesComponent } from './scene/siba-thien-than/siba-dispel-particles.component';
import { resolveBasicEffectCode } from '../components/battle-character/basic-skill-effect/basic-effect-resolver.util';
import { resolveAuraResourceKey } from '../components/battle-character/aura-resource/aura-resource.resolver';
import { Hero } from '../../../core/models/hero.model';
import { BattleEventDto } from '../../../core/models/battle.model';

describe('Siba Thiên Thần Mythic VFX Suite Spec', () => {
  describe('1. Registry mapping', () => {
    it('should map SIBA_CELESTIAL_PROTECTION to SibaSceneVfxComponent', () => {
      const def = BATTLE_SKILL_VFX_REGISTRY['SIBA_CELESTIAL_PROTECTION'];
      expect(def).toBeDefined();
      expect(def.sceneComponent).toBe(SibaSceneVfxComponent);
      expect(def.screenShake).toBeFalse();
    });

    it('should map SIBA_ANGEL_GENTLE_WING to SibaSceneVfxComponent', () => {
      const def = BATTLE_SKILL_VFX_REGISTRY['SIBA_ANGEL_GENTLE_WING'];
      expect(def).toBeDefined();
      expect(def.sceneComponent).toBe(SibaSceneVfxComponent);
      expect(def.screenShake).toBeFalse();
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
      host.isEmpowered = true;
      host.actorId = 31;
      host.activeTargetIds = [1, 2, 3];
      host.castEvents = [];
    });

    it('should pass correct inputs to SIBA_CELESTIAL_PROTECTION', () => {
      host.skillId = 'SIBA_CELESTIAL_PROTECTION';
      expect(host.component).toBe(SibaSceneVfxComponent);

      const inputs = host.componentInputs;
      expect(inputs['skillId']).toBe('SIBA_CELESTIAL_PROTECTION');
      expect(inputs['actorActive']).toBeTrue();
      expect(inputs['impactActive']).toBeTrue();
      expect(inputs['actorTeamRight']).toBeTrue();
      expect(inputs['visualSpeed']).toBe(2);
      expect(inputs['isEmpowered']).toBeTrue();
      expect(inputs['actorId']).toBe(31);
      expect(inputs['activeTargetIds']).toEqual([1, 2, 3]);
    });

    it('should pass correct inputs to SIBA_ANGEL_GENTLE_WING', () => {
      host.skillId = 'SIBA_ANGEL_GENTLE_WING';
      expect(host.component).toBe(SibaSceneVfxComponent);

      const inputs = host.componentInputs;
      expect(inputs['skillId']).toBe('SIBA_ANGEL_GENTLE_WING');
      expect(inputs['actorActive']).toBeTrue();
      expect(inputs['impactActive']).toBeTrue();
    });
  });

  describe('3. Basic Effect Resolver for Siba', () => {
    it('should resolve SIBA_ANGEL_GENTLE_WING to siba-thien-than', () => {
      const code = resolveBasicEffectCode(null, 'SIBA_ANGEL_GENTLE_WING');
      expect(code).toBe('siba-thien-than');
    });

    it('should resolve by heroCode siba-thien-than', () => {
      const hero = { heroCode: 'siba-thien-than' } as Hero;
      const code = resolveBasicEffectCode(hero, null);
      expect(code).toBe('siba-thien-than');
    });

    it('should resolve by avatar filename siba-thien-than-mythic.png', () => {
      const hero = { avatar: '/assets/images/dcs-game/siba-thien-than-mythic.png' } as Hero;
      const code = resolveBasicEffectCode(hero, null);
      expect(code).toBe('siba-thien-than');
    });

    it('should resolve by heroTemplateId 31', () => {
      const hero = { heroTemplateId: 31 } as Hero;
      const code = resolveBasicEffectCode(hero, null);
      expect(code).toBe('siba-thien-than');
    });
  });

  describe('4. Aura Resource Resolver for Ân Phúc', () => {
    it('should resolve siba-thien-than heroCode to siba-angel-blessing', () => {
      expect(resolveAuraResourceKey('siba-thien-than')).toBe('siba-angel-blessing');
      expect(resolveAuraResourceKey('SIBA_THIEN_THAN')).toBe('siba-angel-blessing');
    });

    it('should resolve siba avatar to siba-angel-blessing', () => {
      expect(
        resolveAuraResourceKey(null, '/assets/images/dcs-game/siba-thien-than-mythic.png')
      ).toBe('siba-angel-blessing');
    });
  });

  describe('5. SibaSceneVfxComponent Mode & Timeline Mechanics', () => {
    let fixture: ComponentFixture<SibaSceneVfxComponent>;
    let comp: SibaSceneVfxComponent;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [
          SibaSceneVfxComponent,
          SibaHaloComponent,
          SibaCelestialBeamComponent,
          SibaBlessingWingsComponent,
          SibaDispelParticlesComponent
        ]
      }).compileComponents();

      fixture = TestBed.createComponent(SibaSceneVfxComponent);
      comp = fixture.componentInstance;
    });

    it('should identify basic skill mode and run basic timeline phases', () => {
      comp.skillId = 'SIBA_ANGEL_GENTLE_WING';
      comp.actorActive = true;
      comp.visualSpeed = 1;
      comp.actorId = 31;
      comp.activeTargetIds = [1];
      comp.castEvents = [
        {
          eventType: 'SKILL_CAST',
          actorId: 31,
          targetId: 1,
          skillId: 'SIBA_ANGEL_GENTLE_WING'
        } as BattleEventDto,
        {
          eventType: 'HEAL',
          actorId: 31,
          targetId: 1,
          value: 399
        } as BattleEventDto,
        {
          eventType: 'ENERGY_CHANGED',
          actorId: 31,
          targetId: 1,
          value: 10
        } as BattleEventDto
      ];

      fixture.detectChanges();

      expect(comp.isBasicSkill).toBeTrue();
      expect(comp.isEmpoweredSkill).toBeFalse();
      expect(comp.visualPhase).toBe('cast');
      expect(comp.targetNodes.length).toBe(1);

      comp.ngOnDestroy();
      expect(comp.visualPhase).toBe('idle');
    });

    it('should identify normal energy skill mode without empowered flags', () => {
      comp.skillId = 'SIBA_CELESTIAL_PROTECTION';
      comp.isEmpowered = false;
      comp.empowered = false;
      comp.actorActive = true;
      comp.visualSpeed = 2;
      comp.actorId = 31;
      comp.activeTargetIds = [1, 2, 3];
      comp.castEvents = [
        {
          eventType: 'STATUS_APPLIED',
          targetId: 1,
          effectTypeCode: 'CELESTIAL_PROTECTION'
        } as BattleEventDto,
        {
          eventType: 'STATUS_REMOVED',
          targetId: 2,
          effectTypeCode: 'POISON'
        } as BattleEventDto
      ];

      fixture.detectChanges();

      expect(comp.isBasicSkill).toBeFalse();
      expect(comp.isEmpoweredSkill).toBeFalse();
      expect(comp.visualPhase).toBe('cast');
      expect(comp.targetNodes.length).toBe(3);

      // Target 2 has dispel
      const target2 = comp.targetNodes.find(n => n.id === 2);
      expect(target2?.hasDispel).toBeTrue();

      // Target 1 does not have dispel
      const target1 = comp.targetNodes.find(n => n.id === 1);
      expect(target1?.hasDispel).toBeFalse();

      comp.ngOnDestroy();
    });

    it('should identify empowered energy skill mode via isEmpowered input', () => {
      comp.skillId = 'SIBA_CELESTIAL_PROTECTION';
      comp.isEmpowered = true;
      comp.actorActive = true;
      comp.visualSpeed = 1;
      comp.activeTargetIds = [1, 2];

      fixture.detectChanges();

      expect(comp.isBasicSkill).toBeFalse();
      expect(comp.isEmpoweredSkill).toBeTrue();
      expect(comp.visualPhase).toBe('empowered_cast');

      comp.ngOnDestroy();
    });

    it('should identify empowered energy skill mode via SIBA_EMPOWERED_CAST event', () => {
      comp.skillId = 'SIBA_CELESTIAL_PROTECTION';
      comp.isEmpowered = false;
      comp.empowered = false;
      comp.actorActive = true;
      comp.castEvents = [
        {
          eventType: 'SIBA_EMPOWERED_CAST',
          actorId: 31
        } as BattleEventDto
      ];

      fixture.detectChanges();

      expect(comp.isEmpoweredSkill).toBeTrue();
      expect(comp.visualPhase).toBe('empowered_cast');

      comp.ngOnDestroy();
    });

    it('should recognize Cổ Vũ front row vs back row variants', () => {
      comp.skillId = 'SIBA_CELESTIAL_PROTECTION';
      comp.isEmpowered = true;
      comp.actorActive = true;
      comp.activeTargetIds = [1, 2];
      comp.castEvents = [
        {
          eventType: 'STATUS_REFRESHED',
          targetId: 1,
          effectTypeCode: 'ENCOURAGEMENT_DEFENSE'
        } as BattleEventDto,
        {
          eventType: 'STATUS_REFRESHED',
          targetId: 2,
          effectTypeCode: 'ENCOURAGEMENT_OFFENSE'
        } as BattleEventDto
      ];

      fixture.detectChanges();

      const node1 = comp.targetNodes.find(n => n.id === 1);
      const node2 = comp.targetNodes.find(n => n.id === 2);

      expect(node1?.hasEncouragement).toBeTrue();
      expect(node2?.hasEncouragement).toBeTrue();

      // Helper check
      expect(comp.shouldShowEncouragementWings(node1!)).toBeFalse(); // Not yet impact phase
      comp.visualPhase = 'impact';
      expect(comp.shouldShowEncouragementWings(node1!)).toBeTrue();

      comp.ngOnDestroy();
    });

    it('should scale timings with visualSpeed x4 and clear all timeouts on ngOnDestroy', () => {
      comp.skillId = 'SIBA_CELESTIAL_PROTECTION';
      comp.visualSpeed = 4;
      comp.actorActive = true;

      fixture.detectChanges();

      expect(comp.visualPhase).toBe('cast');
      expect(comp.phase).toBe('cast');

      comp.ngOnDestroy();
      expect(comp.visualPhase).toBe('idle');
      expect(comp.phase).toBe('idle');
    });

    it('should support team mirroring cleanly without exceptions', () => {
      comp.skillId = 'SIBA_CELESTIAL_PROTECTION';
      comp.actorTeamRight = true;
      comp.actorActive = true;

      fixture.detectChanges();

      expect(comp.actorPos.x).toBeGreaterThan(0);
      comp.ngOnDestroy();
    });
  });
});
