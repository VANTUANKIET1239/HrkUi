import { Component } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { SimpleChange } from '@angular/core';
import { ThanhThaiAuraComponent } from './thanh-thai-aura.component';

@Component({
  standalone: true,
  imports: [ThanhThaiAuraComponent],
  template: `
    <app-thanh-thai-aura-resource
      [currentAura]="currentAura"
      [maxAura]="maxAura"
      [auraTier]="auraTier"
      [isFullAura]="isFullAura"
      [visualSpeed]="visualSpeed"
      [team]="team"
      [facing]="facing">
    </app-thanh-thai-aura-resource>
  `
})
class TestHostComponent {
  currentAura = 0;
  maxAura = 100;
  auraTier = 0;
  isFullAura = false;
  visualSpeed = 1;
  team: 'left' | 'right' = 'left';
  facing: 'left' | 'right' = 'right';
}

describe('ThanhThaiAuraComponent', () => {
  let hostComponent: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let auraComponent: ThanhThaiAuraComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent, ThanhThaiAuraComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    fixture.detectChanges();

    const auraDebugEl = fixture.debugElement.children[0];
    auraComponent = auraDebugEl.componentInstance;
  });

  it('should create the component', () => {
    expect(auraComponent).toBeTruthy();
  });

  describe('Tier Milestone Progression (0, 24, 25, 49, 50, 74, 75, 99, 100 Bá Khí)', () => {
    it('Tier 0: at 0 Bá Khí, should be Tier 0 and have 0 visible particles', () => {
      hostComponent.currentAura = 0;
      hostComponent.auraTier = 0;
      fixture.detectChanges();

      expect(auraComponent.effectiveTier).toBe(0);
      expect(auraComponent.visibleParticles.length).toBe(0);

      const hostEl: HTMLElement = fixture.nativeElement;
      const container = hostEl.querySelector('.thanh-thai-aura-container');
      expect(container?.classList.contains('tier-0')).toBeTrue();
    });

    it('Tier 0: at 24 Bá Khí, should still be Tier 0', () => {
      hostComponent.currentAura = 24;
      hostComponent.auraTier = 0;
      fixture.detectChanges();

      expect(auraComponent.effectiveTier).toBe(0);
      expect(auraComponent.visibleParticles.length).toBe(0);
    });

    it('Tier 1: at 25 Bá Khí, should reach Tier 1 and show Tier 1 particles', () => {
      hostComponent.currentAura = 25;
      hostComponent.auraTier = 1;
      fixture.detectChanges();

      expect(auraComponent.effectiveTier).toBe(1);
      expect(auraComponent.visibleParticles.length).toBeGreaterThan(0);
      expect(auraComponent.visibleParticles.every(p => p.minTier <= 1)).toBeTrue();

      const hostEl: HTMLElement = fixture.nativeElement;
      const container = hostEl.querySelector('.thanh-thai-aura-container');
      expect(container?.classList.contains('tier-1')).toBeTrue();
    });

    it('Tier 1: at 49 Bá Khí, should remain Tier 1', () => {
      hostComponent.currentAura = 49;
      hostComponent.auraTier = 1;
      fixture.detectChanges();

      expect(auraComponent.effectiveTier).toBe(1);
    });

    it('Tier 2: at 50 Bá Khí, should reach Tier 2', () => {
      hostComponent.currentAura = 50;
      hostComponent.auraTier = 2;
      fixture.detectChanges();

      expect(auraComponent.effectiveTier).toBe(2);
      expect(auraComponent.visibleParticles.length).toBeGreaterThan(auraComponent.particles.filter(p => p.minTier <= 1).length);

      const hostEl: HTMLElement = fixture.nativeElement;
      const container = hostEl.querySelector('.thanh-thai-aura-container');
      expect(container?.classList.contains('tier-2')).toBeTrue();
    });

    it('Tier 2: at 74 Bá Khí, should remain Tier 2', () => {
      hostComponent.currentAura = 74;
      hostComponent.auraTier = 2;
      fixture.detectChanges();

      expect(auraComponent.effectiveTier).toBe(2);
    });

    it('Tier 3: at 75 Bá Khí, should reach Tier 3', () => {
      hostComponent.currentAura = 75;
      hostComponent.auraTier = 3;
      fixture.detectChanges();

      expect(auraComponent.effectiveTier).toBe(3);

      const hostEl: HTMLElement = fixture.nativeElement;
      const container = hostEl.querySelector('.thanh-thai-aura-container');
      expect(container?.classList.contains('tier-3')).toBeTrue();
    });

    it('Tier 3: at 99 Bá Khí, should remain Tier 3', () => {
      hostComponent.currentAura = 99;
      hostComponent.auraTier = 3;
      fixture.detectChanges();

      expect(auraComponent.effectiveTier).toBe(3);
    });

    it('Tier 4 / Full Aura: at 100 Bá Khí or isFullAura, should reach Tier 4 with all 20 particles', () => {
      hostComponent.currentAura = 100;
      hostComponent.isFullAura = true;
      fixture.detectChanges();

      expect(auraComponent.effectiveTier).toBe(4);
      expect(auraComponent.visibleParticles.length).toBe(20);

      const hostEl: HTMLElement = fixture.nativeElement;
      const container = hostEl.querySelector('.thanh-thai-aura-container');
      expect(container?.classList.contains('tier-4')).toBeTrue();
      expect(container?.classList.contains('is-full-aura')).toBeTrue();
    });
  });

  describe('Facing and Team orientation', () => {
    it('should reflect facing-left class when facing is left', () => {
      hostComponent.facing = 'left';
      hostComponent.team = 'right';
      fixture.detectChanges();

      const hostEl: HTMLElement = fixture.nativeElement;
      const container = hostEl.querySelector('.thanh-thai-aura-container');
      expect(container?.classList.contains('facing-left')).toBeTrue();
      expect(container?.classList.contains('team-right')).toBeTrue();
    });

    it('should reflect facing-right class when facing is right', () => {
      hostComponent.facing = 'right';
      hostComponent.team = 'left';
      fixture.detectChanges();

      const hostEl: HTMLElement = fixture.nativeElement;
      const container = hostEl.querySelector('.thanh-thai-aura-container');
      expect(container?.classList.contains('facing-right')).toBeTrue();
    });
  });

  describe('Full Aura Activation Shockwave', () => {
    it('should trigger activationBurst when transitioning into 100 Bá Khí', fakeAsync(() => {
      hostComponent.currentAura = 75;
      fixture.detectChanges();
      expect(auraComponent.activationBurst).toBeFalse();

      hostComponent.currentAura = 100;
      fixture.detectChanges();
      expect(auraComponent.activationBurst).toBeTrue();

      tick(1500);
      fixture.detectChanges();
      expect(auraComponent.activationBurst).toBeFalse();
    }));
  });
});
