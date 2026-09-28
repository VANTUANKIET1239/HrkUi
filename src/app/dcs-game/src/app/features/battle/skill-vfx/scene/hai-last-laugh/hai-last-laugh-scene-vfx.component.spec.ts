import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HaiLastLaughSceneVfxComponent } from './hai-last-laugh-scene-vfx.component';
import { BattleEventDto } from '../../../../../core/models/battle.model';

describe('HaiLastLaughSceneVfxComponent Specs', () => {
  let component: HaiLastLaughSceneVfxComponent;
  let fixture: ComponentFixture<HaiLastLaughSceneVfxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HaiLastLaughSceneVfxComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(HaiLastLaughSceneVfxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create successfully', () => {
    expect(component).toBeTruthy();
    expect(component.visualPhase).toBe('idle');
  });

  it('should resolve fallback coordinates and CSS variables when DOM nodes are not present', () => {
    component.actorId = 1;
    component.activeTargetIds = [10];
    component.actorTeamRight = false;

    component.measureCoordinates();

    expect(component.casterX).toBeGreaterThan(0);
    expect(component.casterY).toBeGreaterThan(0);
    expect(component.targetX).toBeGreaterThan(0);
    expect(component.targetY).toBeGreaterThan(0);
    expect(component.facing).toBe(1);
    expect(component.travelX).toBe(component.targetX - component.casterX);
  });

  it('should resolve target coordinates from [data-character-id] in DOM', () => {
    // Create mock DOM elements
    const hostEl = fixture.nativeElement;
    const actorDiv = document.createElement('div');
    actorDiv.setAttribute('data-character-id', '5');
    document.body.appendChild(actorDiv);

    const targetDiv = document.createElement('div');
    targetDiv.setAttribute('data-character-id', '15');
    document.body.appendChild(targetDiv);

    component.actorId = 5;
    component.activeTargetIds = [15];
    component.actorTeamRight = true;

    component.measureCoordinates();

    expect(component.facing).toBe(-1);

    // Clean up mock elements
    document.body.removeChild(actorDiv);
    document.body.removeChild(targetDiv);
  });

  function createMockEvent(partial: Partial<BattleEventDto> & { eventType: BattleEventDto['eventType'] }): BattleEventDto {
    return {
      sequence: 1,
      round: 1,
      turn: 1,
      isCrit: false,
      timelineOffsetMs: 0,
      value: 0,
      ...partial
    };
  }

  it('should execute full 3-hit sequence with lock, dash, hit1, hit2, hit3, lingering, and return', fakeAsync(() => {
    const mockCastEvents: BattleEventDto[] = [
      createMockEvent({
        sequence: 1,
        eventType: 'DAMAGE',
        actorId: 1,
        targetId: 10,
        skillId: 'HAI_LAST_LAUGH',
        executionGroup: 'HIT_1',
        hitIndex: 1,
        value: 1500,
        timelineOffsetMs: 1050
      }),
      createMockEvent({
        sequence: 2,
        eventType: 'DAMAGE',
        actorId: 1,
        targetId: 10,
        skillId: 'HAI_LAST_LAUGH',
        executionGroup: 'HIT_2',
        hitIndex: 2,
        value: 1800,
        timelineOffsetMs: 1400
      }),
      createMockEvent({
        sequence: 3,
        eventType: 'DAMAGE',
        actorId: 1,
        targetId: 10,
        skillId: 'HAI_LAST_LAUGH',
        executionGroup: 'HIT_3',
        hitIndex: 3,
        value: 2600,
        timelineOffsetMs: 1900
      })
    ];

    component.actorId = 1;
    component.activeTargetIds = [10];
    component.actorActive = true;
    component.impactActive = true;
    component.visualSpeed = 1;
    component.castSequence = 301;
    component.castEvents = mockCastEvents;

    component.ngOnChanges({
      actorActive: { currentValue: true, previousValue: false, firstChange: true, isFirstChange: () => true }
    });
    fixture.detectChanges();

    // 1. Prep phase
    expect(component.visualPhase).toBe('prep');
    expect(component.showTargetLock).toBeTrue();

    // 2. Lock phase (~450ms)
    tick(460);
    fixture.detectChanges();
    expect(component.visualPhase).toBe('lock');

    // 3. Dash phase (~800ms)
    tick(350);
    fixture.detectChanges();
    expect(component.visualPhase).toBe('dash');
    expect(component.showDash).toBeTrue();
    expect(component.showTargetLock).toBeFalse();

    // 4. Hit 1 (~1000ms)
    tick(210);
    fixture.detectChanges();
    expect(component.visualPhase).toBe('strike');
    expect(component.showPhantomStriker).toBeTrue();
    expect(component.slashStage).toBe('hit1');

    // 5. Hit 2 (~1280ms)
    tick(290);
    fixture.detectChanges();
    expect(component.slashStage).toBe('hit2');

    // 6. Hit 3 (~1580ms)
    tick(310);
    fixture.detectChanges();
    expect(component.slashStage).toBe('hit3');

    // 7. Lingering 3 (~2050ms)
    tick(480);
    fixture.detectChanges();
    expect(component.slashStage).toBe('lingering3');

    // 8. Return phase (~2350ms)
    tick(320);
    fixture.detectChanges();
    expect(component.visualPhase).toBe('return');
    expect(component.showReturnDash).toBeTrue();

    // 9. Fully settled back to idle
    tick(400);
    fixture.detectChanges();
    expect(component.visualPhase).toBe('idle');
  }));

  it('should increment bleed stacks on HIT_1 and HIT_2 when bleed events are present', fakeAsync(() => {
    const mockCastEvents: BattleEventDto[] = [
      createMockEvent({
        sequence: 1,
        eventType: 'DAMAGE',
        actorId: 1,
        targetId: 10,
        skillId: 'HAI_LAST_LAUGH',
        executionGroup: 'HIT_1',
        hitIndex: 1,
        value: 1200
      }),
      createMockEvent({
        sequence: 2,
        eventType: 'STATUS_APPLIED',
        actorId: 1,
        targetId: 10,
        skillId: 'HAI_LAST_LAUGH',
        effectTypeCode: 'BLEED',
        executionGroup: 'HIT_1',
        hitIndex: 1,
        currentStacks: 1
      }),
      createMockEvent({
        sequence: 3,
        eventType: 'DAMAGE',
        actorId: 1,
        targetId: 10,
        skillId: 'HAI_LAST_LAUGH',
        executionGroup: 'HIT_2',
        hitIndex: 2,
        value: 1400
      }),
      createMockEvent({
        sequence: 4,
        eventType: 'STATUS_STACK_CHANGED',
        actorId: 1,
        targetId: 10,
        skillId: 'HAI_LAST_LAUGH',
        effectTypeCode: 'BLEED',
        executionGroup: 'HIT_2',
        hitIndex: 2,
        previousStacks: 1,
        currentStacks: 2
      })
    ];

    component.actorId = 1;
    component.activeTargetIds = [10];
    component.actorActive = true;
    component.visualSpeed = 1;
    component.castSequence = 402;
    component.castEvents = mockCastEvents;

    component.ngOnChanges({
      actorActive: { currentValue: true, previousValue: false, firstChange: true, isFirstChange: () => true }
    });
    fixture.detectChanges();

    // Advance to Hit 1
    tick(1050);
    fixture.detectChanges();
    expect(component.bleedStacks).toBe(1);

    // Advance to Hit 2
    tick(300);
    fixture.detectChanges();
    expect(component.bleedStacks).toBe(2);
    expect(component.isStackingUp).toBeTrue();

    // Advance past stack pulse
    tick(300);
    fixture.detectChanges();
    expect(component.isStackingUp).toBeFalse();

    tick(2000);
  }));

  it('should trigger BLEED_DETONATED explosion ONLY when event is present in castEvents', fakeAsync(() => {
    const mockCastEvents: BattleEventDto[] = [
      createMockEvent({
        sequence: 1,
        eventType: 'DAMAGE',
        actorId: 1,
        targetId: 10,
        executionGroup: 'HIT_1',
        hitIndex: 1,
        value: 1000
      }),
      createMockEvent({
        sequence: 2,
        eventType: 'BLEED_DETONATED',
        actorId: 1,
        targetId: 10,
        skillId: 'HAI_LAST_LAUGH',
        value: 3500
      })
    ];

    component.actorId = 1;
    component.activeTargetIds = [10];
    component.actorActive = true;
    component.visualSpeed = 1;
    component.castSequence = 503;
    component.castEvents = mockCastEvents;

    component.ngOnChanges({
      actorActive: { currentValue: true, previousValue: false, firstChange: true, isFirstChange: () => true }
    });
    fixture.detectChanges();

    // Fast-forward to detonation phase
    tick(2400);
    fixture.detectChanges();

    expect(component.showBleedDetonation).toBeTrue();
    expect(component.visualPhase).toBe('detonate');
    expect(component.bleedStacks).toBe(0);

    tick(1500);
  }));

  it('should skip hits and return early if target is killed on hit 1', fakeAsync(() => {
    const mockCastEvents: BattleEventDto[] = [
      createMockEvent({
        sequence: 1,
        eventType: 'DAMAGE',
        actorId: 1,
        targetId: 10,
        executionGroup: 'HIT_1',
        hitIndex: 1,
        value: 9999
      }),
      createMockEvent({
        sequence: 2,
        eventType: 'DEATH',
        actorId: 1,
        targetId: 10
      })
      // Note: No HIT_2 or HIT_3 events because target died!
    ];

    component.actorId = 1;
    component.activeTargetIds = [10];
    component.actorActive = true;
    component.visualSpeed = 1;
    component.castSequence = 604;
    component.castEvents = mockCastEvents;

    component.ngOnChanges({
      actorActive: { currentValue: true, previousValue: false, firstChange: true, isFirstChange: () => true }
    });
    fixture.detectChanges();

    // Advance to Hit 1
    tick(1050);
    fixture.detectChanges();
    expect(component.slashStage).toBe('hit1');

    // Should NOT transition to hit 2, but immediately transition to return
    tick(250);
    fixture.detectChanges();
    expect(component.visualPhase).toBe('return');

    tick(1000);
  }));

  it('should clean up all active timers on destroy', fakeAsync(() => {
    component.actorId = 1;
    component.activeTargetIds = [10];
    component.actorActive = true;
    component.castSequence = 705;

    component.ngOnChanges({
      actorActive: { currentValue: true, previousValue: false, firstChange: true, isFirstChange: () => true }
    });
    fixture.detectChanges();

    tick(200);
    component.ngOnDestroy();
    tick(3000);

    expect(component.visualPhase).toBe('idle');
  }));
});
