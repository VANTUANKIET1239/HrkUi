import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { SkillNghiaPhucPrimeComponent } from './skill-nghia-phuc-prime.component';
import { Hero } from '../../../../../../core/models/hero.model';

describe('SkillNghiaPhucPrimeComponent', () => {
  let component: SkillNghiaPhucPrimeComponent;
  let fixture: ComponentFixture<SkillNghiaPhucPrimeComponent>;

  const mockHero: Hero = {
    id: 11,
    heroTemplateId: 11,
    heroCode: 'NGHIA_PHUC_PRIME',
    name: 'Nghĩa Phục Prime',
    avatar: '/assets/images/dcs-game/nghia-phuc-prime.png',
    hp: 1800,
    maxHp: 1800,
    mana: 100,
    maxMana: 100,
    attack: 95,
    defense: 220,
    speed: 85,
    magicResistance: 160,
    position: 1,
    team: 'left',
    statusEffects: [],
    battleStatuses: []
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkillNghiaPhucPrimeComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(SkillNghiaPhucPrimeComponent);
    component = fixture.componentInstance;
    component.character = { ...mockHero };
    fixture.detectChanges();
  });

  afterEach(() => {
    component.ngOnDestroy();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should detect fortitude stacks and flag max fortitude at 4 stacks', () => {
    component.character = {
      ...mockHero,
      battleStatuses: [
        {
          code: 'PRIME_FORTITUDE',
          instanceId: 'pf-1',
          name: 'Kiên Cố',
          stacks: 4,
          maxStacks: 4,
          remainingTurns: 2,
          value: 0
        } as any
      ]
    };
    component.ngOnChanges({});
    expect(component.fortitudeStacks).toBe(4);
    expect(component.hasMaxFortitude).toBeTrue();
  });

  it('should detect pressure stacks and guardian status', () => {
    component.character = {
      ...mockHero,
      battleStatuses: [
        {
          code: 'PRIME_PRESSURE',
          instanceId: 'pp-1',
          name: 'Áp Lực',
          stacks: 3,
          maxStacks: 5,
          remainingTurns: 0,
          value: 0
        } as any,
        {
          code: 'PRIME_GUARDIAN',
          instanceId: 'pg-1',
          name: 'Hộ Vệ Prime',
          stacks: 1,
          remainingTurns: 2,
          value: 35
        } as any
      ]
    };
    component.ngOnChanges({});
    expect(component.pressureStacks).toBe(3);
    expect(component.hasGuardian).toBeTrue();
  });

  it('should execute basic skill sequence with charging, bashing, and beam phases', fakeAsync(() => {
    component.activeSkillId = 'PRIME_SHIELD_WARRANTY';
    component.visualSpeed = 1;
    component.castSequence = 201;

    component.ngOnChanges({
      activeSkillId: { currentValue: 'PRIME_SHIELD_WARRANTY', previousValue: null, firstChange: true, isFirstChange: () => true }
    });
    fixture.detectChanges();

    // 1. Charging phase
    expect(component.isChargingShield).toBeTrue();
    expect(component.isBashing).toBeFalse();

    // 2. Heavy shield bash thrust (250ms)
    tick(250);
    fixture.detectChanges();
    expect(component.isChargingShield).toBeFalse();
    expect(component.isBashing).toBeTrue();

    // 3. Shield beam to lowest HP ally (350ms after)
    tick(350);
    fixture.detectChanges();
    expect(component.isBashing).toBeFalse();
    expect(component.isSendingShieldBeam).toBeTrue();

    // 4. End sequence (400ms after)
    tick(400);
    fixture.detectChanges();
    expect(component.isSendingShieldBeam).toBeFalse();
  }));
});
