import { Component } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { HttpClient, HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideTranslateLoader, provideTranslateService, TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { provideRouter } from '@angular/router';
import { LanguageLoader } from './language-loader';
import { HrkTranslatePipe } from './hrk-translate.pipe';
import { preferredLanguage } from './language-preference';
import { textKey } from './text-key';
import { LOCALIZATION_CONFIG } from './localization.config';
import { BrowserCookieService } from '../storage/browser-cookie.service';
import { HrkApiService } from '../http/hrk-api/hrk-api.service';
import { LOADING_MODE } from '../loading/loading.tokens';
import { LanguageService } from './language.service';
import { LanguageInterceptor } from './language.interceptor';
import { environment } from '../../../../environments/dev/environment';
import { GameToastService } from '../../../app/dcs-game/src/app/core/services/game-toast.service';
import { LoadingInterceptor } from '../loading/loading.interceptor';
import { AuthInterceptor } from '../http/hrk-api/interceptors/auth.interceptor';

@Component({ standalone: true, imports: [HrkTranslatePipe], template: `{{ 'Đóng' | hrkTranslate }} / {{ message | hrkTranslate:{level:8}:key }}` })
class ProbeComponent { message = 'Cần đạt cấp 8.'; key = 'LEVEL'; }

describe('Localization', () => {
  let http: HttpTestingController;
  beforeEach(() => {
    document.cookie = 'hrk_language=; Path=/; Max-Age=0';
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting(), provideRouter([]),
        provideTranslateService({ loader: provideTranslateLoader(LanguageLoader) }),
        { provide: HTTP_INTERCEPTORS, useClass: LanguageInterceptor, multi: true }]
    });
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => { http.verify(); document.cookie = 'hrk_language=; Path=/; Max-Age=0'; });

  it('normalizes supported preferences and uses stable keys shared with the backend', () => {
    expect(preferredLanguage('en-US')).toBe('en-US');
    expect(preferredLanguage('en')).toBe('en-US');
    expect(preferredLanguage('fr')).toBe(LOCALIZATION_CONFIG.defaultCulture);
    expect(preferredLanguage(null)).toBe(LOCALIZATION_CONFIG.defaultCulture);
    expect(textKey('hello')).toBe('text_a430d84680aabd0b');
  });

  it('loads common and application dictionaries once and joins duplicate in-flight requests', async () => {
    const api = spyOn(TestBed.inject(HrkApiService), 'CallApi').and.callThrough();
    const loader = TestBed.inject(LanguageLoader);
    const first = firstValueFrom(loader.loadGroup('game', 'en-US'));
    const second = firstValueFrom(loader.loadGroup('game', 'en-US'));
    const request = http.expectOne(environment.baseUrl + 'language/bundles/game/en-US');
    expect(api).toHaveBeenCalledTimes(1);
    expect(request.request.context.get(LOADING_MODE)).toBe('none');
    expect(request.request.headers.has('Content-Type')).toBeFalse();
    request.flush({ group:'game', culture:'en-US', revision:11, translations:{ HELLO:'Hello' } });
    expect((await first).revision).toBe(11);
    expect(await second).toEqual(await first);
  });

  it('keeps the configured loader timeout and retries a failed bundle on the next load', fakeAsync(() => {
    const loader = TestBed.inject(LanguageLoader);
    let failed = false;
    loader.loadGroup('game', 'en-US').subscribe({ error: () => failed = true });
    const pending = http.expectOne(environment.baseUrl + 'language/bundles/game/en-US');
    tick(LOCALIZATION_CONFIG.bundleTimeoutMs);
    expect(failed).toBeTrue();
    expect(pending.cancelled).toBeTrue();
    expect(loader.hasLoaded('game', 'en-US')).toBeFalse();
    loader.loadGroup('game', 'en-US').subscribe();
    http.expectOne(environment.baseUrl + 'language/bundles/game/en-US')
      .flush({ group: 'game', culture: 'en-US', revision: 2, translations: {} });
    expect(loader.hasLoaded('game', 'en-US')).toBeTrue();
  }));

  it('merges common and initial application bundles through the ngx-translate loader', async () => {
    const result = firstValueFrom(TestBed.inject(LanguageLoader).getTranslation('en-US'));
    http.expectOne(environment.baseUrl + 'language/bundles/common/en-US')
      .flush({ group:'common', culture:'en-US', revision:1, translations:{ CLOSE:'Close' } });
    http.expectOne(environment.baseUrl + 'language/bundles/auth/en-US')
      .flush({ group:'auth', culture:'en-US', revision:2, translations:{ LOGIN:'Sign in' } });
    const translations = await result as Record<string, string>;
    expect(translations['CLOSE']).toBe('Close');
    expect(translations['LOGIN']).toBe('Sign in');
  });

  it('keeps useful fallback messages when the language API is unavailable', async () => {
    const result = firstValueFrom(TestBed.inject(LanguageLoader).getTranslation('en-US'));
    for (const request of http.match(req=>req.url.includes('/language/bundles/'))) request.flush({}, { status:503, statusText:'Unavailable' });
    const translations = await result as Record<string, string>;
    expect(translations[textKey('Không thể kết nối đến máy chủ.')]).toBe('Cannot connect to the server.');
  });

  it('renders translated messages and arguments and updates after changing language', async () => {
    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('en-US', { [textKey('Đóng')]:'Close', LEVEL:'Reach level {{level}}.' });
    translate.setTranslation('vi-VN', { [textKey('Đóng')]:'Đóng', LEVEL:'Cần đạt cấp {{level}}.' });
    await firstValueFrom(translate.use('en-US'));
    const fixture = TestBed.createComponent(ProbeComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Close / Reach level 8.');
    await firstValueFrom(translate.use('vi-VN'));
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Đóng / Cần đạt cấp 8.');
  });

  it('sends the cookie preference only to this application gateway', () => {
    document.cookie = 'hrk_language=en-US; Path=/';
    const client = TestBed.inject(HttpClient);
    client.get(environment.baseUrl + 'dcs-game/check-in').subscribe();
    const own = http.expectOne(environment.baseUrl + 'dcs-game/check-in');
    expect(own.request.headers.get('Accept-Language')).toBe('en-US'); own.flush({});
    client.get('https://example.org/data').subscribe();
    const external = http.expectOne('https://example.org/data');
    expect(external.request.headers.has('Accept-Language')).toBeFalse(); external.flush({});
  });

  it('translates dynamic notifications while retaining names and amounts', async () => {
    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('en-US', { [textKey('Đã bán {{p0}} vật phẩm, nhận {{p1}} vàng.')]: 'Sold {{p0}} items for {{p1}} gold.' });
    await firstValueFrom(translate.use('en-US'));
    const toast = TestBed.inject(GameToastService);
    expect(toast.text`Đã bán ${3} vật phẩm, nhận ${1500} vàng.`).toBe('Sold 3 items for 1500 gold.');
    expect(new GameToastService().text`Đã bán ${3} vật phẩm, nhận ${1500} vàng.`).toBe('Đã bán 3 vật phẩm, nhận 1500 vàng.');
  });

  it('restores the cookie language at startup and persists a language change', async () => {
    document.cookie = 'hrk_language=en-US; Path=/';
    const language = TestBed.inject(LanguageService);
    const initialize = language.initialize();
    for (const request of http.match(req=>req.url.includes('/language/bundles/'))) {
      const parts=request.request.url.split('/');
      request.flush({ group:parts.at(-2), culture:'en-US', revision:1, translations:{} });
    }
    await initialize;
    expect(language.current()).toBe('en-US');
    const select = language.select('vi-VN');
    for (const request of http.match(req=>req.url.includes('/language/bundles/'))) {
      const parts=request.request.url.split('/');
      request.flush({ group:parts.at(-2), culture:'vi-VN', revision:2, translations:{} });
    }
    // Selecting loads the current route group after activating ngx-translate.
    await Promise.resolve(); await Promise.resolve();
    for (const request of http.match(req=>req.url.includes('/language/bundles/'))) {
      const parts=request.request.url.split('/');
      request.flush({ group:parts.at(-2), culture:'vi-VN', revision:2, translations:{} });
    }
    await select;
    expect(preferredLanguage(TestBed.inject(BrowserCookieService).get(LOCALIZATION_CONFIG.cookie.name))).toBe('vi-VN');
    expect(document.documentElement.lang).toBe('vi-VN');
  });

  it('recovers common and application dictionaries after the initial bundle requests failed', async () => {
    const language = TestBed.inject(LanguageService);
    const initialize = language.initialize();
    for (const request of http.match(req => req.url.includes('/language/bundles/')))
      request.flush({}, { status: 502, statusText: 'Bad Gateway' });
    await initialize;
    const select = language.select('vi-VN');
    await Promise.resolve(); await Promise.resolve();
    const requests = http.match(req => req.url.includes('/language/bundles/'));
    expect(requests.length).toBe(2);
    for (const request of requests) {
      const group = request.request.url.split('/').at(-2);
      request.flush({ group, culture: 'vi-VN', revision: 10,
        translations: group === 'common' ? { RECOVERED_COMMON: 'common restored' } : { RECOVERED_AUTH: 'auth restored' } });
    }
    await select;
    expect(TestBed.inject(TranslateService).instant('RECOVERED_COMMON')).toBe('common restored');
    expect(TestBed.inject(TranslateService).instant('RECOVERED_AUTH')).toBe('auth restored');
  });
});

describe('Localization startup with application interceptors', () => {
  it('loads public bundles through the shared API without an auth refresh or dependency cycle', async () => {
    document.cookie = 'hrk_language=en-US; Path=/';
    TestBed.configureTestingModule({ providers: [provideHttpClient(withInterceptorsFromDi()),
      provideHttpClientTesting(), provideRouter([]),
      provideTranslateService({ loader: provideTranslateLoader(LanguageLoader) }),
      { provide: HTTP_INTERCEPTORS, useClass: LanguageInterceptor, multi: true },
      { provide: HTTP_INTERCEPTORS, useClass: LoadingInterceptor, multi: true },
      { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
    ] });
    const http = TestBed.inject(HttpTestingController);
    try {
      const initialize = TestBed.inject(LanguageService).initialize();
      const requests = http.match(request => request.url.includes('/language/bundles/'));
      expect(requests.length).toBe(2);
      for (const request of requests) {
        expect(request.request.headers.get('Accept-Language')).toBe('en-US');
        expect(request.request.headers.has('Authorization')).toBeFalse();
        request.flush({ group: request.request.url.split('/').at(-2), culture: 'en-US', revision: 1, translations: {} });
      }
      await initialize;
      http.expectNone(request => request.url.includes('/refresh-token'));
      expect(TestBed.inject(LanguageService).current()).toBe('en-US');
      http.verify();
    } finally { document.cookie = 'hrk_language=; Path=/; Max-Age=0'; }
  });
});
