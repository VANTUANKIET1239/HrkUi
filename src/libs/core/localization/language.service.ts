import { DOCUMENT } from '@angular/common';
import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { LanguageLoader, languageGroup } from './language-loader';
import { preferredLanguage } from './language-preference';
import { HrkLanguage, LOCALIZATION_CONFIG } from './localization.config';
import { BrowserCookieService } from '../storage/browser-cookie.service';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly document = inject(DOCUMENT);
  private readonly translate = inject(TranslateService);
  private readonly loader = inject(LanguageLoader);
  private readonly router = inject(Router);
  private readonly cookies = inject(BrowserCookieService);
  readonly current = signal<HrkLanguage>(preferredLanguage(this.cookies.get(LOCALIZATION_CONFIG.cookie.name)));
  readonly busy = signal(false);
  private generation = 0;
  private readonly loaded = new Set<string>();

  constructor() {
    this.router.events.pipe(takeUntilDestroyed(inject(DestroyRef))).subscribe(event => {
      if (event instanceof NavigationEnd) void this.loadPage(languageGroup(event.urlAfterRedirects));
    });
  }

  async initialize(): Promise<void> {
    await firstValueFrom(this.translate.use(this.current()));
    this.rememberInitialBundles(this.current());
    this.document.documentElement.lang = this.current();
  }

  async select(language: HrkLanguage): Promise<void> {
    const generation = ++this.generation;
    this.busy.set(true);
    try {
      await firstValueFrom(this.translate.use(language));
      if (generation !== this.generation) return;
      this.rememberInitialBundles(language);
      this.current.set(language);
      this.document.documentElement.lang = language;
      this.cookies.set(LOCALIZATION_CONFIG.cookie.name, language, { maxAgeSeconds: LOCALIZATION_CONFIG.cookie.maxAgeSeconds });
      await this.loadPage(languageGroup(this.router.url));
    } finally { if (generation === this.generation) this.busy.set(false); }
  }

  private rememberInitialBundles(language: HrkLanguage): void {
    for (const group of ['common', languageGroup(this.document.location?.pathname ?? '/login')])
      if (this.loader.hasLoaded(group, language)) this.loaded.add(group + ':' + language);
  }

  private async loadPage(group: string): Promise<void> {
    // ngx-translate keeps the emergency dictionary after an API failure. Retry any
    // missing common/application bundle when selecting a language or navigating.
    await Promise.all([...new Set(['common', group])].map(name => this.loadGroup(name)));
  }

  private async loadGroup(group: string): Promise<void> {
    const language = this.current();
    const key = group + ':' + language;
    if (this.loaded.has(key)) return;
    try {
      const bundle = await firstValueFrom(this.loader.loadGroup(group, language));
      this.translate.setTranslation(language, bundle.translations, true);
      this.loaded.add(key);
    } catch { /* Keep existing translations and retry on the next navigation. */ }
  }
}
