import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';

export interface BrowserCookieOptions {
  path?: string;
  domain?: string;
  maxAgeSeconds?: number;
  sameSite?: 'Lax' | 'Strict' | 'None';
  secure?: boolean;
}

@Injectable({ providedIn: 'root' })
export class BrowserCookieService {
  private readonly document = inject(DOCUMENT);
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));

  get(name: string): string | null {
    if (!this.browser) return null;
    const prefix = encodeURIComponent(name) + '=';
    const pair = this.document.cookie.split(';').map(part => part.trim()).find(part => part.startsWith(prefix));
    if (!pair) return null;
    try { return decodeURIComponent(pair.slice(prefix.length)); }
    catch { return null; }
  }

  set(name: string, value: string, options: BrowserCookieOptions = {}): void {
    if (!this.browser) return;
    if (!name) throw new TypeError('Cookie name is required.');
    const path = options.path ?? '/';
    if (!path.startsWith('/') || /[;\r\n]/.test(path) || (options.domain && /[;\s]/.test(options.domain)))
      throw new TypeError('Invalid cookie path or domain.');
    const parts = [encodeURIComponent(name) + '=' + encodeURIComponent(value), 'Path=' + path,
      'SameSite=' + (options.sameSite ?? 'Lax')];
    if (options.domain) parts.push('Domain=' + options.domain);
    if (options.maxAgeSeconds !== undefined) {
      if (!Number.isFinite(options.maxAgeSeconds)) throw new RangeError('Cookie max age must be finite.');
      parts.push('Max-Age=' + Math.trunc(options.maxAgeSeconds));
    }
    if (options.secure ?? this.document.location.protocol === 'https:') parts.push('Secure');
    this.document.cookie = parts.join('; ');
  }

  remove(name: string, options: Omit<BrowserCookieOptions, 'maxAgeSeconds'> = {}): void {
    this.set(name, '', { ...options, maxAgeSeconds: 0 });
  }
}
