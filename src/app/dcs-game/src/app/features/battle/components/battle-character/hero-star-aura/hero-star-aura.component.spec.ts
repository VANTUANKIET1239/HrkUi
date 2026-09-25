import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeroStarAuraComponent } from './hero-star-aura.component';
import { resolveAuraVisualKey } from './hero-star-aura.resolver';
import { Hero, HeroStarAuraConfig } from '../../../../../core/models/hero.model';

describe('HeroStarAura System', () => {
  describe('resolveAuraVisualKey', () => {
    it('should correctly resolve visual keys by heroTemplateId for all 10 heroes', () => {
      const expectedMappings: [number, string][] = [
        [1, 'kiet-red-lightning'],
        [2, 'nam-deadline-sterile-pulse'],
        [3, 'chuan-men-crimson-rhythm'],
        [4, 'coder-banh-digital-knowledge'],
        [5, 'tester-dep-obsidian-nebula'],
        [6, 'tuong-long-scorched-command'],
        [7, 'pm-hoi-ha-spectral-grooming'],
        [8, 'qa-ky-tinh-vicious-debt'],
        [9, 'kiet-noel-dark-blizzard'],
        [10, 'hoang-nguyen-heavy-iron'],
        [11, 'hai-last-smile-aura']
      ];

      for (const [id, expectedKey] of expectedMappings) {
        expect(resolveAuraVisualKey(null, id, null)).toBe(expectedKey as any);
      }
    });

    it('should resolve visual key directly from HeroStarAuraConfig.visualKey', () => {
      const config: HeroStarAuraConfig = {
        heroTemplateId: 99,
        starLevel: 3,
        auraCode: 'CUSTOM_AURA',
        visualKey: 'chuan-men-crimson-rhythm',
        name: 'Custom',
        intensity: 1.0,
        particleLevel: 3
      };
      expect(resolveAuraVisualKey(config, undefined, null)).toBe('chuan-men-crimson-rhythm');
    });

    it('should resolve visual key by hero avatar or hero id if heroTemplateId is missing', () => {
      const hero: Hero = {
        id: 9,
        name: 'Kiet Noel',
        avatar: '/assets/images/dcs-game/truongkiet-noel.png',
        hp: 100,
        maxHp: 100,
        mana: 0,
        maxMana: 100,
        attack: 10,
        defense: 10,
        speed: 10,
        position: 1,
        team: 'left',
        stars: 3
      };
      expect(resolveAuraVisualKey(null, hero.id, hero.avatar)).toBe('kiet-noel-dark-blizzard');
    });

    it('should return null for unknown or invalid inputs', () => {
      expect(resolveAuraVisualKey(null, 999, null)).toBeNull();
      expect(resolveAuraVisualKey(null, null, null)).toBeNull();
    });
  });

  describe('HeroStarAuraComponent State & Clamping', () => {
    let component: HeroStarAuraComponent;
    let fixture: ComponentFixture<HeroStarAuraComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [HeroStarAuraComponent]
      }).compileComponents();

      fixture = TestBed.createComponent(HeroStarAuraComponent);
      component = fixture.componentInstance;
    });

    it('should create component', () => {
      expect(component).toBeTruthy();
    });

    it('should have NO active aura for 0 or 1 star', () => {
      component.heroTemplateId = 1;
      component.stars = 0;
      component.ngOnChanges({});
      expect(component.hasActiveAura).toBeFalse();
      expect(component.effectiveStarLevel).toBe(0);

      component.stars = 1;
      component.ngOnChanges({});
      expect(component.hasActiveAura).toBeFalse();
      expect(component.effectiveStarLevel).toBe(0);
    });

    it('should activate aura for 2 stars (effectiveStarLevel = 2)', () => {
      component.heroTemplateId = 1;
      component.stars = 2;
      component.ngOnChanges({});
      expect(component.hasActiveAura).toBeTrue();
      expect(component.effectiveStarLevel).toBe(2);
      expect(component.visualKey).toBe('kiet-red-lightning');
    });

    it('should support progressive tiers 3, 4, and 5', () => {
      component.heroTemplateId = 2;

      component.stars = 3;
      component.ngOnChanges({});
      expect(component.effectiveStarLevel).toBe(3);

      component.stars = 4;
      component.ngOnChanges({});
      expect(component.effectiveStarLevel).toBe(4);

      component.stars = 5;
      component.ngOnChanges({});
      expect(component.effectiveStarLevel).toBe(5);
    });

    it('should render the unchanged legacy visual for an existing five-star aura', () => {
      component.heroTemplateId = 1;
      component.stars = 5;
      component.hero = {
        id: 1,
        heroTemplateId: 1,
        name: 'K Cởi Trần',
        avatar: '/assets/images/dcs-game/kiet.png',
        hp: 100,
        maxHp: 100,
        mana: 0,
        maxMana: 100,
        attack: 10,
        defense: 10,
        speed: 10,
        position: 1,
        team: 'left',
        stars: 5
      };

      component.ngOnChanges({});
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('app-pe-red-lightning')).not.toBeNull();
      expect(fixture.nativeElement.querySelector('app-kiet-aura')).toBeNull();
    });

    it('should clamp stars < 0 to 0 and stars > 5 to 5', () => {
      component.heroTemplateId = 3;

      component.stars = -3;
      component.ngOnChanges({});
      expect(component.effectiveStarLevel).toBe(0);
      expect(component.hasActiveAura).toBeFalse();

      component.stars = 10;
      component.ngOnChanges({});
      expect(component.effectiveStarLevel).toBe(5);
      expect(component.hasActiveAura).toBeTrue();
    });

    it('should forward custom colors and intensity from config', () => {
      component.heroTemplateId = 4;
      component.stars = 4;
      component.auraConfig = {
        heroTemplateId: 4,
        starLevel: 4,
        auraCode: 'DIGITAL_KNOWLEDGE_4S',
        visualKey: 'coder-banh-digital-knowledge',
        name: 'Digital Matrix Lv4',
        intensity: 1.4,
        particleLevel: 4,
        primaryColorHex: '#00ffff',
        secondaryColorHex: '#10b981'
      };
      component.ngOnChanges({});

      expect(component.effectiveStarLevel).toBe(4);
      expect(component.intensity).toBe(1.4);
      expect(component.particleLevel).toBe(4);
      expect(component.primaryColor).toBe('#00ffff');
      expect(component.secondaryColor).toBe('#10b981');
    });

    it('should resolve hai-last-smile-aura for hero 11 and render app-hai-last-smile-aura', () => {
      component.heroTemplateId = 11;
      component.stars = 5;
      component.ngOnChanges({});
      fixture.detectChanges();

      expect(component.visualKey).toBe('hai-last-smile-aura');
      expect(component.hasActiveAura).toBeTrue();
      expect(fixture.nativeElement.querySelector('app-hai-last-smile-aura')).not.toBeNull();
    });
  });
});
