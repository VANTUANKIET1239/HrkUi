import { DOCUMENT } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BrowserCookieService } from './browser-cookie.service';

describe('BrowserCookieService', () => {
  afterEach(() => { document.cookie = 'hrk_cookie_test=; Path=/; Max-Age=0'; });

  it('round-trips text, reserved characters and empty values through actual browser cookies', () => {
    const cookies = TestBed.inject(BrowserCookieService);
    expect(cookies.get('hrk_cookie_test')).toBeNull();
    cookies.set('hrk_cookie_test', 'Tiếng Việt; a=b / 100%');
    expect(cookies.get('hrk_cookie_test')).toBe('Tiếng Việt; a=b / 100%');
    cookies.set('hrk_cookie_test', '');
    expect(cookies.get('hrk_cookie_test')).toBe('');
    cookies.remove('hrk_cookie_test');
    expect(cookies.get('hrk_cookie_test')).toBeNull();
  });

  it('sets HTTPS defaults and deletes with the same path and domain', () => {
    const fakeDocument = { cookie: '', location: { protocol: 'https:' } };
    TestBed.configureTestingModule({ providers: [{ provide: DOCUMENT, useValue: fakeDocument }] });
    const cookies = TestBed.inject(BrowserCookieService);
    cookies.set('preference', 'en-US', { path: '/game', domain: 'example.test', maxAgeSeconds: 3600 });
    expect(fakeDocument.cookie).toBe('preference=en-US; Path=/game; SameSite=Lax; Domain=example.test; Max-Age=3600; Secure');
    cookies.remove('preference', { path: '/game', domain: 'example.test' });
    expect(fakeDocument.cookie).toBe('preference=; Path=/game; SameSite=Lax; Domain=example.test; Max-Age=0; Secure');
  });

  it('matches exact names and treats malformed encodings as missing', () => {
    const fakeDocument = { cookie: 'pref_extra=vi; pref=en%2DUS; broken=%ZZ', location: { protocol: 'http:' } };
    TestBed.configureTestingModule({ providers: [{ provide: DOCUMENT, useValue: fakeDocument }] });
    const cookies = TestBed.inject(BrowserCookieService);
    expect(cookies.get('pref')).toBe('en-US');
    expect(cookies.get('broken')).toBeNull();
    expect(cookies.get('pre')).toBeNull();
    cookies.set('pref', 'vi-VN', { sameSite: 'Strict' });
    expect(fakeDocument.cookie).toBe('pref=vi-VN; Path=/; SameSite=Strict');
  });

  it('does not access browser cookies during server rendering', () => {
    const fakeDocument = { get cookie(): string { throw new Error('Cookies unavailable.'); } };
    TestBed.configureTestingModule({ providers: [{ provide: DOCUMENT, useValue: fakeDocument },
      { provide: PLATFORM_ID, useValue: 'server' }] });
    const cookies = TestBed.inject(BrowserCookieService);
    expect(cookies.get('pref')).toBeNull();
    expect(() => cookies.set('pref', 'en-US')).not.toThrow();
    expect(() => cookies.remove('pref')).not.toThrow();
  });
});
