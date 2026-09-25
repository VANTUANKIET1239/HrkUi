import { TestBed } from '@angular/core/testing';
import { BattleVisualTimelineService } from './battle-visual-timeline.service';
import { BattleEventDto } from '../models/battle.model';
import {
  SKILL_ANIMATION_CONFIGS,
  resolveEffectiveDuration,
  resolveSkillConfig,
  resolveVisualSpeed
} from './skill-animation-registry';
import { SkillAnimationConfig } from './skill-animation.models';

describe('BattleVisualTimeline and Speed Policy Specs', () => {
  let service: BattleVisualTimelineService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BattleVisualTimelineService]
    });
    service = TestBed.inject(BattleVisualTimelineService);
  });

  describe('resolveVisualSpeed', () => {
    it('FULL_SCALE: visual speed strictly follows battle speed', () => {
      const basicConfig: SkillAnimationConfig = {
        skillId: 'BASIC',
        totalDurationMs: 700,
        speedPolicy: 'FULL_SCALE',
        minimumVisibleDurationMs: 250
      };

      expect(resolveVisualSpeed(1, basicConfig)).toBe(1);
      expect(resolveVisualSpeed(2, basicConfig)).toBe(2);
      expect(resolveVisualSpeed(4, basicConfig)).toBe(4);
    });

    it('CLAMPED: visual speed is mapped and clamped to maxVisualSpeed', () => {
      const ricardoConfig = resolveSkillConfig('RICARDO_MILOS', true, {
        animationKey: 'RICARDO_MILOS', totalDurationMs: 2800
      });
      expect(ricardoConfig.speedPolicy).toBe('CLAMPED');
      expect(ricardoConfig.maxVisualSpeed).toBe(1.5);

      expect(resolveVisualSpeed(1, ricardoConfig)).toBe(1);
      expect(resolveVisualSpeed(2, ricardoConfig)).toBe(1.35);
      // At x4, mapped is 1.6, but clamped to 1.5
      expect(resolveVisualSpeed(4, ricardoConfig)).toBe(1.5);

      const fatalConfig = resolveSkillConfig('FATAL_ALL_IN_DIRECTIVE', true, {
        animationKey: 'FATAL_ALL_IN_DIRECTIVE', totalDurationMs: 4900
      });
      expect(fatalConfig.maxVisualSpeed).toBe(1.7);
      // At x4, mapped is 1.6 <= 1.7 -> returns 1.6
      expect(resolveVisualSpeed(4, fatalConfig)).toBe(1.6);
    });

    it('FIXED: visual speed is always 1 regardless of battle speed', () => {
      const fixedConfig: SkillAnimationConfig = {
        skillId: 'CINEMATIC',
        totalDurationMs: 3000,
        speedPolicy: 'FIXED',
        minimumVisibleDurationMs: 3000
      };

      expect(resolveVisualSpeed(1, fixedConfig)).toBe(1);
      expect(resolveVisualSpeed(2, fixedConfig)).toBe(1);
      expect(resolveVisualSpeed(4, fixedConfig)).toBe(1);
    });
  });

  describe('resolveEffectiveDuration and Minimum Visible Duration', () => {
    it('uses the server animation duration as the source of truth', () => {
      const config = resolveSkillConfig('RICARDO_MILOS', true, {
        animationKey: 'RICARDO_MILOS',
        totalDurationMs: 3600,
        phases: [{ phaseCode: 'DESCEND', startAtMs: 900, durationMs: 500 }]
      });

      expect(config.totalDurationMs).toBe(3600);
      expect(config.phases?.[0].phaseCode).toBe('DESCEND');
      expect(resolveEffectiveDuration(1, config)).toBe(3600);
    });

    it('RICARDO_MILOS: effective duration never drops below minimumVisibleDurationMs (1800ms)', () => {
      const config = resolveSkillConfig('RICARDO_MILOS', true, {
        animationKey: 'RICARDO_MILOS', totalDurationMs: 2800
      });
      // x1: 2800 / 1 = 2800 >= 1800 -> 2800ms
      expect(resolveEffectiveDuration(1, config)).toBe(2800);

      // x2: 2800 / 1.35 = 2074.07 >= 1800 -> ~2074ms
      const durationX2 = resolveEffectiveDuration(2, config);
      expect(durationX2).toBeGreaterThanOrEqual(1800);
      expect(Math.round(durationX2)).toBe(2074);

      // x4: 2800 / 1.5 = 1866.67 >= 1800 -> ~1867ms
      const durationX4 = resolveEffectiveDuration(4, config);
      expect(durationX4).toBeGreaterThanOrEqual(1800);
      expect(Math.round(durationX4)).toBe(1867);
    });

    it('CLAMPED skills enforce minimum visible duration floor', () => {
      const shortConfig: SkillAnimationConfig = {
        skillId: 'CUSTOM',
        totalDurationMs: 1000,
        speedPolicy: 'CLAMPED',
        maxVisualSpeed: 2.0,
        minimumVisibleDurationMs: 900
      };

      // At x2, 1000 / 1.35 = 740ms, but minimum is 900ms -> should return 900ms
      expect(resolveEffectiveDuration(2, shortConfig)).toBe(900);
    });
  });

  describe('BattleVisualTimelineService Lifecycle & Speed Snapshotting', () => {
    it('should snapshot visual speed per cast and activate visual signals', () => {
      const dummyEvent: BattleEventDto = {
        sequence: 1,
        round: 1,
        turn: 1,
        eventType: 'SKILL_CAST',
        actorId: 10,
        skillId: 'RICARDO_MILOS',
        castSequence: 101,
        timelineOffsetMs: 0,
        phaseCode: 'CAST',
        value: 0,
        isCrit: false
      };

      service.beginCast(dummyEvent, 4, true);

      expect(service.isVisualActive()).toBeTrue();
      expect(service.currentVisualSkillId()).toBe('RICARDO_MILOS');
      expect(service.visualActorId()).toBe(10);
      expect(service.visualCastSequence()).toBe(101);
      expect(service.currentVisualSpeed()).toBe(1.5);
      expect(service.visualPhase()).toBe('CAST');
      expect(service.getRemainingDurationMs()).toBeGreaterThan(0);
    });

    it('advancePhase updates phase on matching castSequence', () => {
      const dummyEvent: BattleEventDto = {
        sequence: 1,
        round: 1,
        turn: 1,
        eventType: 'SKILL_CAST',
        actorId: 10,
        skillId: 'RICARDO_MILOS',
        castSequence: 101,
        timelineOffsetMs: 0,
        phaseCode: 'CAST',
        value: 0,
        isCrit: false
      };
      service.beginCast(dummyEvent, 2, true);

      const impactEvent: BattleEventDto = {
        ...dummyEvent,
        eventType: 'DAMAGE',
        phaseCode: 'IMPACT',
        timelineOffsetMs: 500
      };
      service.advancePhase(impactEvent);

      expect(service.visualPhase()).toBe('IMPACT');
    });

    it('advancePhase ignores events without the active castSequence', () => {
      const castEvent: BattleEventDto = {
        sequence: 1, round: 1, turn: 1, eventType: 'SKILL_CAST', actorId: 10,
        skillId: 'RICARDO_MILOS', castSequence: 101, timelineOffsetMs: 0,
        phaseCode: 'CAST', value: 0, isCrit: false
      };
      service.beginCast(castEvent, 1, true);

      service.advancePhase({ ...castEvent, eventType: 'TURN_START', castSequence: null, phaseCode: 'IMPACT' });

      expect(service.visualPhase()).toBe('CAST');
    });

    it('skipToEnd immediately cancels timers and clears visual state', () => {
      const dummyEvent: BattleEventDto = {
        sequence: 1,
        round: 1,
        turn: 1,
        eventType: 'SKILL_CAST',
        actorId: 10,
        skillId: 'RICARDO_MILOS',
        castSequence: 101,
        timelineOffsetMs: 0,
        phaseCode: 'CAST',
        value: 0,
        isCrit: false
      };
      service.beginCast(dummyEvent, 1, true);
      expect(service.isVisualActive()).toBeTrue();

      service.skipToEnd();

      expect(service.isVisualActive()).toBeFalse();
      expect(service.currentVisualSkillId()).toBeNull();
      expect(service.visualActorId()).toBeNull();
      expect(service.getRemainingDurationMs()).toBe(0);
    });

    it('pause and resume preserve remaining visual duration', (done) => {
      let taskExecuted = false;
      const handle = service.scheduleVisualTask(() => {
        taskExecuted = true;
      }, 100);

      service.pause();
      expect(service.isPaused()).toBeTrue();

      // Wait 120ms while paused - task must NOT fire
      setTimeout(() => {
        expect(taskExecuted).toBeFalse();
        service.resume();
        expect(service.isPaused()).toBeFalse();

        // After resume, allow remaining time to finish
        setTimeout(() => {
          expect(taskExecuted).toBeTrue();
          handle.cancel();
          done();
        }, 150);
      }, 120);
    });
  });
});
