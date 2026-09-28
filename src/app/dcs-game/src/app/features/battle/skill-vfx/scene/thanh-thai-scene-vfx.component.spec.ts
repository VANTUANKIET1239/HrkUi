import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ThanhThaiSceneVfxComponent } from './thanh-thai-scene-vfx.component';
import { BattleEventDto } from '../../../../core/models/battle.model';

describe('ThanhThaiSceneVfxComponent Specs', () => {
  let component: ThanhThaiSceneVfxComponent;
  let fixture: ComponentFixture<ThanhThaiSceneVfxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThanhThaiSceneVfxComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ThanhThaiSceneVfxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create successfully', () => {
    expect(component).toBeTruthy();
  });

  it('should fall back to balanced formation coordinates when DOM nodes are not present', () => {
    component.actorId = 1;
    component.activeTargetIds = [10, 20, 30];
    component.actorTeamRight = false;

    component.measureCoordinates();

    expect(component.sourcePoint).toBeTruthy();
    expect(component.sourcePoint?.combatantId).toBe(1);
    expect(component.targetPoints.length).toBe(3);
    expect(component.targetPoints[0].combatantId).toBe(10);
    expect(component.targetPoints[1].combatantId).toBe(20);
    expect(component.targetPoints[2].combatantId).toBe(30);
  });

  it('should plan sequential chain for 3 targets', fakeAsync(() => {
    component.actorId = 1;
    component.activeTargetIds = [10, 20, 30];
    component.actorActive = true;
    component.impactActive = true;
    component.empowered = false;
    component.visualSpeed = 1;
    component.castSequence = 101;

    component.ngOnChanges({
      actorActive: { currentValue: true, previousValue: false, firstChange: true, isFirstChange: () => true }
    });
    fixture.detectChanges();

    expect(component.isCharging).toBeTrue();

    // Advance past charge phase (~360ms)
    tick(400);
    fixture.detectChanges();

    // Branch 1 (Actor -> T1) should be active
    expect(component.activeBranches.length).toBeGreaterThanOrEqual(1);

    // Advance past hit 2 & 3
    tick(600);
    fixture.detectChanges();

    expect(component.activeBranches.length).toBe(3);

    // Complete whole sequence
    tick(2500);
    fixture.detectChanges();

    expect(component.activeBranches.length).toBe(0);
  }));

  it('should handle single target by striking with vertical rebound bolts', fakeAsync(() => {
    component.actorId = 1;
    component.activeTargetIds = [10];
    component.actorActive = true;
    component.impactActive = true;
    component.empowered = true; // Empowered single target -> 4 hits total
    component.visualSpeed = 1;
    component.castSequence = 202;

    component.ngOnChanges({
      actorActive: { currentValue: true, previousValue: false, firstChange: true, isFirstChange: () => true }
    });
    fixture.detectChanges();

    // Advance past charge and all strikes
    tick(400); // 1st strike
    tick(300); // 2nd strike
    tick(300); // 3rd strike
    tick(300); // 4th strike
    fixture.detectChanges();

    expect(component.activeBranches.length).toBe(4);

    // Final shockwave should be triggered
    expect(component.showFinalShockwave).toBeTrue();

    tick(2500);
    fixture.detectChanges();
  }));

  it('should handle 2 targets by bouncing back and forth (rebound)', fakeAsync(() => {
    component.actorId = 1;
    component.activeTargetIds = [10, 20];
    component.actorActive = true;
    component.impactActive = true;
    component.empowered = false; // Normal -> 3 hits: Actor->T1, T1->T2, T2->T1
    component.visualSpeed = 1;
    component.castSequence = 303;

    component.ngOnChanges({
      actorActive: { currentValue: true, previousValue: false, firstChange: true, isFirstChange: () => true }
    });
    fixture.detectChanges();

    tick(1200);
    fixture.detectChanges();

    expect(component.activeBranches.length).toBe(3);
    // End points should bounce: T1 -> T2 -> T1
    expect(component.activeBranches[0].endPoint.x).toBe(component.targetPoints[0].x);
    expect(component.activeBranches[1].endPoint.x).toBe(component.targetPoints[1].x);
    expect(component.activeBranches[2].endPoint.x).toBe(component.targetPoints[0].x);

    tick(2500);
    fixture.detectChanges();
  }));

  it('should render Loss of Confidence floating banners when events are present', fakeAsync(() => {
    const mockEvents: BattleEventDto[] = [
      {
        sequence: 1,
        castSequence: 404,
        eventType: 'STATUS_APPLIED',
        effectTypeCode: 'LOSS_OF_CONFIDENCE',
        actorId: 1,
        targetId: 10
      } as any,
      {
        sequence: 2,
        castSequence: 404,
        eventType: 'LOSS_OF_CONFIDENCE_DETONATED',
        actorId: 1,
        targetId: 10,
        value: 3
      } as any
    ];

    component.actorId = 1;
    component.activeTargetIds = [10];
    component.castEvents = mockEvents;
    component.actorActive = true;
    component.impactActive = true;
    component.castSequence = 404;

    component.ngOnChanges({
      actorActive: { currentValue: true, previousValue: false, firstChange: true, isFirstChange: () => true }
    });
    fixture.detectChanges();

    tick(800);
    fixture.detectChanges();

    const bannerTexts = component.statusBanners.map(b => b.text);
    expect(bannerTexts).toContain('GIẢM TỰ TIN +1');
    expect(bannerTexts).toContain('MẤT TỰ TIN BÙNG NỔ');

    tick(2500);
    fixture.detectChanges();
  }));

  it('should clear all timers on ngOnDestroy without throwing errors', fakeAsync(() => {
    component.actorId = 1;
    component.activeTargetIds = [10, 20];
    component.actorActive = true;
    component.impactActive = true;
    component.castSequence = 505;

    component.ngOnChanges({
      actorActive: { currentValue: true, previousValue: false, firstChange: true, isFirstChange: () => true }
    });
    fixture.detectChanges();

    expect(() => {
      component.ngOnDestroy();
    }).not.toThrow();

    tick(3000);
  }));
});
