import { TestBed } from '@angular/core/testing';
import { BattleEngineService } from './battle-engine.service';
import { StartBattleResultDto } from '../models/battle.model';

describe('BattleEngineService Speed & Visual Safety Specs', () => {
  let engine: BattleEngineService;

  const mockBattleData: StartBattleResultDto = {
    battleId: 'test-battle-001',
    initialState: {
      battleId: 'test-battle-001',
      leftTeam: [
        {
          id: 1,
          name: 'Chuẩn Men',
          avatar: '/assets/images/heroes/chuan-men.png',
          stats: {
            hp: 2000,
            atk: 500,
            def: 100,
            spd: 120,
            crit: 20,
            critDmg: 150,
            lifesteal: 0,
            accuracy: 0,
            resistance: 0
          },
          power: 1000,
          position: 1,
          skills: [
            {
              id: 'RICARDO_MILOS',
              name: 'Ricardo Milos',
              icon: 'bi-star',
              skillTypeCode: 'ENERGY'
            }
          ]
        }
      ],
      rightTeam: [
        {
          id: -2,
          name: 'Enemy Dummy',
          avatar: '/assets/images/heroes/dummy.png',
          stats: {
            hp: 1000,
            atk: 100,
            def: 50,
            spd: 80,
            crit: 5,
            critDmg: 150,
            lifesteal: 0,
            accuracy: 0,
            resistance: 0
          },
          power: 500,
          position: 1,
          skills: []
        }
      ]
    },
    events: [
      {
        sequence: 1,
        round: 1,
        turn: 1,
        eventType: 'BATTLE_START',
        timelineOffsetMs: 0,
        value: 0,
        isCrit: false
      },
      {
        sequence: 2,
        round: 1,
        turn: 1,
        eventType: 'TURN_START',
        actorId: 1,
        timelineOffsetMs: 100,
        value: 0,
        isCrit: false
      },
      {
        sequence: 3,
        round: 1,
        turn: 1,
        eventType: 'SKILL_CAST',
        actorId: 1,
        skillId: 'RICARDO_MILOS',
        castSequence: 1,
        timelineOffsetMs: 300,
        phaseCode: 'CAST',
        value: 0,
        isCrit: false
      },
      {
        sequence: 4,
        round: 1,
        turn: 1,
        eventType: 'DAMAGE',
        actorId: 1,
        targetId: -2,
        skillId: 'RICARDO_MILOS',
        castSequence: 1,
        timelineOffsetMs: 600,
        phaseCode: 'IMPACT',
        value: 1000,
        hpAfter: 0,
        isCrit: false
      },
      {
        sequence: 5,
        round: 1,
        turn: 1,
        eventType: 'TURN_END',
        actorId: 1,
        castSequence: 1,
        timelineOffsetMs: 700,
        phaseCode: 'RECOVERY',
        value: 0,
        isCrit: false
      },
      {
        sequence: 6,
        round: 1,
        turn: 1,
        eventType: 'BATTLE_END',
        timelineOffsetMs: 800,
        value: 0,
        isCrit: false
      }
    ]
  } as any;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BattleEngineService]
    });
    engine = TestBed.inject(BattleEngineService);
  });

  afterEach(() => {
    engine.resetBattle();
  });

  it('setSpeed allows only valid speeds [1, 2, 4]', () => {
    engine.setSpeed(2);
    expect(engine.speed()).toBe(2);

    engine.setSpeed(4);
    expect(engine.speed()).toBe(4);

    engine.setSpeed(3 as any);
    expect(engine.speed()).toBe(4); // rejected, stays 4

    engine.setSpeed(1);
    expect(engine.speed()).toBe(1);
  });

  it('skipToEnd cancels all timers and produces immediate battle completion', () => {
    engine.loadServerBattle(mockBattleData);
    engine.startBattle();

    expect(engine.status()).toBe('playing');
    engine.skipToEnd();

    expect(engine.status()).toBe('finished');
    expect(engine.currentVisualSkillId()).toBeNull();
    expect(engine.visualActorId()).toBeNull();

    // Verify right team hero received 1000 damage and is dead (0 HP)
    const enemy = engine.heroes().find(h => h.name === 'Enemy Dummy');
    expect(enemy).toBeDefined();
    expect(enemy?.hp).toBe(0);
  });

  it('x1, x2, and x4 produce identical gameplay outcomes', () => {
    const runBattleAtSpeed = (speed: 1 | 2 | 4) => {
      engine.resetBattle();
      engine.setSpeed(speed);
      engine.loadServerBattle(mockBattleData);
      engine.skipToEnd();
      return {
        heroes: engine.heroes().map(h => ({ id: h.id, hp: h.hp })),
        turns: engine.currentTurn(),
        finished: engine.status() === 'finished'
      };
    };

    const resultX1 = runBattleAtSpeed(1);
    const resultX2 = runBattleAtSpeed(2);
    const resultX4 = runBattleAtSpeed(4);

    expect(resultX1).toEqual(resultX2);
    expect(resultX2).toEqual(resultX4);
    expect(resultX4.heroes.find(h => h.id === -2)?.hp).toBe(0);
    expect(resultX4.heroes.find(h => h.id === 1)?.hp).toBe(2000);
  });

  it('TURN_END resets logical cast immediately, while visual cast is preserved until safe', () => {
    engine.loadServerBattle(mockBattleData);
    engine.setSpeed(4);

    // Simulate SKILL_CAST
    const castEvent = mockBattleData.events[2];
    (engine as any).eventDispatcher.dispatch(castEvent, (engine as any).createEventHandlerContext());

    expect(engine.currentVisualSkillId()).toBe('RICARDO_MILOS');
    expect(engine.visualActorId()).toBe(1);

    // Set active target
    engine.activeTargetId.set(-2);
    expect(engine.activeTargetId()).toBe(-2);

    // Call resetLogicalCast
    engine.resetLogicalCast();

    // Logical targets are wiped
    expect(engine.activeTargetId()).toBeNull();
    expect(engine.currentLogicalSkillId()).toBeNull();

    // Visual cast remains active because effective duration is running
    expect(engine.currentVisualSkillId()).toBe('RICARDO_MILOS');
    expect(engine.visualActorId()).toBe(1);

    // Now reset visual cast
    engine.resetVisualCast();
    expect(engine.currentVisualSkillId()).toBeNull();
    expect(engine.visualActorId()).toBeNull();
  });

  it('preserves isVisualEmpowered snapshot during empowered cast at speed x2 despite status removal', () => {
    const empoweredBattleData: StartBattleResultDto = {
      ...mockBattleData,
      events: [
        ...mockBattleData.events.slice(0, 2),
        {
          sequence: 3,
          round: 1,
          turn: 1,
          eventType: 'SKILL_CAST',
          actorId: 1,
          skillId: 'RICARDO_MILOS',
          castSequence: 1,
          executionGroup: 'EMPOWERED',
          timelineOffsetMs: 300,
          phaseCode: 'CAST',
          value: 0,
          isCrit: false
        },
        {
          sequence: 4,
          round: 1,
          turn: 1,
          eventType: 'STATUS_REMOVED',
          actorId: 1,
          targetId: 1,
          skillId: 'RICARDO_MILOS',
          castSequence: 1,
          executionGroup: 'EMPOWERED',
          timelineOffsetMs: 1700,
          phaseCode: 'CLEANUP',
          value: 0,
          isCrit: false
        }
      ]
    };

    engine.loadServerBattle(empoweredBattleData);
    engine.setSpeed(2);

    // Simulate SKILL_CAST with EMPOWERED group
    const castEvent = empoweredBattleData.events[2];
    (engine as any).eventDispatcher.dispatch(castEvent, (engine as any).createEventHandlerContext());

    expect(engine.isVisualEmpowered()).toBeTrue();
    expect(engine.currentVisualSkillId()).toBe('RICARDO_MILOS');

    // Simulate STATUS_REMOVED occurring mid-cast
    const statusRemovedEvent = empoweredBattleData.events[3];
    (engine as any).eventDispatcher.dispatch(statusRemovedEvent, (engine as any).createEventHandlerContext());

    // isVisualEmpowered MUST remain true throughout the visual cast even after status is removed
    expect(engine.isVisualEmpowered()).toBeTrue();

    // Resetting visual cast clears it
    engine.resetVisualCast();
    expect(engine.isVisualEmpowered()).toBeFalse();
  });
});
