import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import { firstValueFrom, of } from 'rxjs';
import catalog from '../../../../../tools/localization/catalog.json';
import { GameHomeComponent } from '../../../app/dcs-game/src/app/features/home/pages/game-home/game-home.component';
import { GameAuthComponent } from '../../../app/dcs-game/src/app/features/auth/pages/game-auth/game-auth.component';
import { HeroLevelUpTabComponent } from '../../../app/dcs-game/src/app/features/home/components/hero-management/hero-feature-tabs/hero-level-up-tab.component';
import { GameTemplateCacheService } from '../../../app/dcs-game/src/app/core/services/game-template-cache.service';
import { GameModalConfigService } from '../../../app/dcs-game/src/app/core/services/game-modal-config.service';
import { GameToastService } from '../../../app/dcs-game/src/app/core/services/game-toast.service';
import { HrkConfirmationService } from '../../shared/ui/modal/hrk-confirmation.service';
import { TokenManagerService } from '../auth/services/token-manager';
import { HrkApiService } from '../http/hrk-api/hrk-api.service';
import { PlayerService } from '../../../app/dcs-game/src/app/core/services/player.service';
import { GameHomeInitializationService } from '../../../app/dcs-game/src/app/features/home/services/game-home-initialization.service';
import { GameFeatureConfigService } from '../../../app/dcs-game/src/app/core/services/game-feature-config.service';
import { DungeonApiService } from '../../../app/dcs-game/src/app/core/services/dungeon-api.service';
import { ProcessRealtimeService } from '../../../app/dcs-game/src/app/core/services/process-realtime.service';
import { HrkTranslatePipe } from './hrk-translate.pipe';
import { preferredLanguage } from './language-preference';
import { textKey } from './text-key';
import { BrowserCookieService } from '../storage/browser-cookie.service';
import { LOCALIZATION_CONFIG } from './localization.config';
import { LanguageLoader } from './language-loader';
import { LanguageService } from './language.service';
import { GameSettingsComponent } from '../../../app/dcs-game/src/app/features/home/components/game-settings/game-settings.component';

describe('Screen localization', () => {
  beforeEach(() => {
    document.cookie = 'hrk_language=; Path=/; Max-Age=0';
    TestBed.configureTestingModule({ providers: [provideTranslateService(), provideRouter([]),
      { provide: LanguageLoader, useValue: { hasLoaded: () => true,
        loadGroup: (group: string, culture: string) => of({ group, culture, revision: 1, translations: {} }) } },
      { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap({}) } } },
      ...[GameTemplateCacheService, GameModalConfigService, GameToastService, HrkConfirmationService,
        TokenManagerService, HrkApiService, PlayerService, GameHomeInitializationService,
        GameFeatureConfigService, DungeonApiService, ProcessRealtimeService].map(provide => ({ provide, useValue: {} }))
    ] });
    for (const component of [GameHomeComponent, GameAuthComponent])
      TestBed.overrideComponent(component, { set: {
        imports: [CommonModule, HrkTranslatePipe, ...(component === GameHomeComponent ? [GameSettingsComponent] : [])],
        schemas: [NO_ERRORS_SCHEMA] } });
    const translate = TestBed.inject(TranslateService);
    for (const language of ['vi-VN', 'en-US']) {
      const rows = [...catalog.common, ...catalog.auth, ...catalog.game];
      translate.setTranslation(language, Object.fromEntries(rows.map(row => [textKey(row[0]), language === 'en-US' ? row[1] : row[2] ?? row[0]])));
    }
  });

  afterEach(() => { document.cookie = 'hrk_language=; Path=/; Max-Age=0'; });

  it('opens settings from the player HUD, changes language, persists it and restores focus after closing', async () => {
    spyOn(GameHomeComponent.prototype, 'ngOnInit');
    const translate = TestBed.inject(TranslateService);
    await firstValueFrom(translate.use('vi-VN'));
    const fixture = TestBed.createComponent(GameHomeComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('hrk-language-selector')).toBeNull();
    const opener = fixture.nativeElement.querySelector('.player-profile .btn-settings') as HTMLButtonElement;
    opener.focus(); opener.click(); fixture.detectChanges();
    const dialog = fixture.nativeElement.querySelector('dialog') as HTMLDialogElement;
    expect(dialog.open).toBeTrue();
    expect(opener.getAttribute('aria-expanded')).toBe('true');
    const select = dialog.querySelector('hrk-language-selector select') as HTMLSelectElement;
    expect(select.value).toBe('vi-VN');
    select.value = 'en-US';
    select.dispatchEvent(new Event('change', { bubbles: true }));
    fixture.detectChanges();
    expect(select.disabled).toBeTrue();
    await fixture.whenStable(); fixture.detectChanges();
    expect(select.disabled).toBeFalse();
    expect(translate.getCurrentLang()).toBe('en-US');
    expect(preferredLanguage(TestBed.inject(BrowserCookieService).get(LOCALIZATION_CONFIG.cookie.name))).toBe('en-US');
    expect(dialog.querySelector('h2')?.textContent).toBe('Settings');
    expect(fixture.nativeElement.querySelector('.ach-text').textContent).toContain('Achievements');
    dialog.dispatchEvent(new Event('cancel', { cancelable: true }));
    fixture.detectChanges(); await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('app-game-settings')).toBeNull();
    expect(opener.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(opener);
    opener.click(); fixture.detectChanges(); await fixture.whenStable(); fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('hrk-language-selector select').value).toBe('en-US');
    expect(TestBed.inject(LanguageService).current()).toBe('en-US');
  });

  it('changes lobby labels, API menu names and tooltips without changing player names or navigation values', async () => {
    spyOn(GameHomeComponent.prototype, 'ngOnInit');
    const fixture = TestBed.createComponent(GameHomeComponent);
    const component = fixture.componentInstance;
    component.playerInfo.name = 'Người chơi Trần';
    const feature = { name: 'Hành trang', code: 'INVENTORY', actionCode: 'INVENTORY', hasNotification: false };
    component.bottomFeaturesLeft = [feature];
    const click = spyOn(component, 'onFeatureClick');
    const translate = TestBed.inject(TranslateService);
    await firstValueFrom(translate.use('en-US'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.nav-name').textContent).toContain('Inventory');
    expect(fixture.nativeElement.querySelector('.ach-text').textContent).toContain('Achievements');
    expect(fixture.nativeElement.querySelector('.chinh-tuyen-label')).toBeNull();
    expect(fixture.nativeElement.querySelector('.editable-avatar').title).toBe('Change avatar');
    expect(fixture.nativeElement.querySelector('.player-name').textContent).toBe('Người chơi Trần');
    fixture.nativeElement.querySelector('.nav-item').click();
    expect(click).toHaveBeenCalledWith(feature);
    expect(feature.name).toBe('Hành trang');
    await firstValueFrom(translate.use('vi-VN'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.nav-name').textContent).toContain('Hành trang');
    expect(fixture.nativeElement.querySelector('.ach-text').textContent).toContain('Thành tựu');
    expect(fixture.nativeElement.querySelector('.editable-avatar').title).toBe('Đổi ảnh đại diện');
  });

  it('changes the real login and registration tabs when the language changes', async () => {
    const fixture = TestBed.createComponent(GameAuthComponent);
    const translate = TestBed.inject(TranslateService);
    await firstValueFrom(translate.use('en-US'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.tab-header').textContent).toContain('SIGN IN');
    expect(fixture.nativeElement.querySelector('.tab-header').textContent).toContain('REGISTER');
    await firstValueFrom(translate.use('vi-VN'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.tab-header').textContent).toContain('ĐĂNG NHẬP');
  });

  it('translates inline feature templates with numbers while preserving button actions', async () => {
    const fixture = TestBed.createComponent(HeroLevelUpTabComponent);
    const upgrade = jasmine.createSpy('upgrade');
    fixture.componentRef.setInput('context', { upgradeHero: upgrade, isUpgradingHero: false,
      upgradePreview: { currentLevel: 3, nextLevel: 4, maxLevel: 100, goldCost: 120, materialCost: 2,
        statIncrease: { hp: 10, atk: 2, def: 1, spd: 1 } } });
    const translate = TestBed.inject(TranslateService);
    await firstValueFrom(translate.use('en-US'));
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Level 3 → 4');
    expect(fixture.nativeElement.textContent).toContain('Upgrade stones');
    fixture.nativeElement.querySelector('button').click();
    expect(upgrade).toHaveBeenCalledWith(1);
    await firstValueFrom(translate.use('vi-VN'));
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Cấp 3 → 4');
  });
});
