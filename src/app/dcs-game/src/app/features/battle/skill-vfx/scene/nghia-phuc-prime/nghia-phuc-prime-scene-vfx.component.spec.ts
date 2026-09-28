import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NghiaPhucPrimeSceneVfxComponent } from './nghia-phuc-prime-scene-vfx.component';
import { BattleEventDto } from '../../../../../core/models/battle.model';

describe('NghiaPhucPrimeSceneVfxComponent', () => {
  let component: NghiaPhucPrimeSceneVfxComponent;
  let fixture: ComponentFixture<NghiaPhucPrimeSceneVfxComponent>;

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

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NghiaPhucPrimeSceneVfxComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(NghiaPhucPrimeSceneVfxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    component.ngOnDestroy();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should compute facing direction correctly based on actorTeamRight', () => {
    component.actorTeamRight = false;
    component.measureCoordinates();
    expect(component.facing).toBe(1);

    component.actorTeamRight = true;
    component.measureCoordinates();
    expect(component.facing).toBe(-1);
  });

  it('should resolve broken morale targets correctly from backend events', () => {
    component.actorId = 11;
    component.castEvents = [
      createMockEvent({
        sequence: 1,
        eventType: 'DAMAGE',
        actorId: 11,
        targetId: 21,
        skillId: 'PRIME_FORTRESS_CHARGE',
        value: 120
      }),
      createMockEvent({
        sequence: 2,
        eventType: 'STATUS_APPLIED',
        actorId: 11,
        targetId: 21,
        effectTypeCode: 'PRIME_BROKEN_MORALE',
        skillId: 'PRIME_FORTRESS_CHARGE'
      }),
      createMockEvent({
        sequence: 3,
        eventType: 'STATUS_APPLIED',
        actorId: 11,
        targetId: 22,
        effectTypeCode: 'PRIME_BROKEN_MORALE',
        skillId: 'PRIME_FORTRESS_CHARGE'
      }),
      createMockEvent({
        sequence: 4,
        eventType: 'STATUS_APPLIED',
        actorId: 11,
        targetId: 23,
        effectTypeCode: 'PRIME_BROKEN_MORALE',
        skillId: 'PRIME_FORTRESS_CHARGE'
      }),
      createMockEvent({
        sequence: 5,
        eventType: 'STATUS_APPLIED',
        actorId: 11,
        targetId: 24,
        effectTypeCode: 'PRIME_BROKEN_MORALE',
        skillId: 'PRIME_FORTRESS_CHARGE'
      })
    ];

    // Create mock DOM targets
    const d1 = document.createElement('div');
    d1.setAttribute('data-combatant-id', '21');
    d1.setAttribute('data-team', 'right');
    const d2 = document.createElement('div');
    d2.setAttribute('data-combatant-id', '22');
    d2.setAttribute('data-team', 'right');
    const d3 = document.createElement('div');
    d3.setAttribute('data-combatant-id', '23');
    d3.setAttribute('data-team', 'right');
    document.body.appendChild(d1);
    document.body.appendChild(d2);
    document.body.appendChild(d3);

    component.measureCoordinates();

    expect(component.brokenMoraleTargets.length).toBeLessThanOrEqual(3);
    const targetIds = component.brokenMoraleTargets.map(t => t.targetId);
    expect(targetIds).toContain(21);
    expect(targetIds).toContain(22);
    expect(targetIds).toContain(23);

    document.body.removeChild(d1);
    document.body.removeChild(d2);
    document.body.removeChild(d3);
  });

  it('should run full cinematic sequence and clean up state', fakeAsync(() => {
    component.actorId = 11;
    component.actorTeamRight = false;
    component.visualSpeed = 1;
    component.castSequence = 101;
    component.actorActive = true;

    component.ngOnChanges({
      actorActive: { currentValue: true, previousValue: false, firstChange: true, isFirstChange: () => true }
    });
    fixture.detectChanges();

    // 1. Prep phase
    expect(component.visualPhase).toBe('prep');
    expect(component.showAssemblyRune).toBeTrue();

    // 2. Assemble phase (500ms)
    tick(500);
    fixture.detectChanges();
    expect(component.visualPhase).toBe('assemble');

    // 3. Charge phase (400ms after)
    tick(400);
    fixture.detectChanges();
    expect(component.visualPhase).toBe('charge');
    expect(component.showChargeTrail).toBeTrue();

    // 4. Impact phase (550ms after)
    tick(550);
    fixture.detectChanges();
    expect(component.visualPhase).toBe('impact');
    expect(component.showImpactShockwave).toBeTrue();
    expect(component.showGroundCracks).toBeTrue();

    // 5. Broken Morale phase (300ms after)
    tick(300);
    fixture.detectChanges();
    expect(component.visualPhase).toBe('broken_morale');
    expect(component.showBrokenMoraleMarkers).toBeTrue();

    // 6. Return phase (300ms after)
    tick(300);
    fixture.detectChanges();
    expect(component.visualPhase).toBe('return');
    expect(component.showReturningShields).toBeTrue();

    // 7. Dome phase (400ms after)
    tick(400);
    fixture.detectChanges();
    expect(component.visualPhase).toBe('dome');
    expect(component.showTeamDome).toBeTrue();

    // 8. End sequence & settle (450ms after)
    tick(450);
    fixture.detectChanges();
    expect(component.visualPhase).toBe('idle');
    expect(component.showTeamDome).toBeFalse();
  }));
});
