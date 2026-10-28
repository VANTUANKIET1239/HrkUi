import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { TranslateLoader, TranslationObject } from '@ngx-translate/core';
import { catchError, finalize, forkJoin, map, Observable, of, shareReplay, timeout } from 'rxjs';
import { HrkApiService } from '../http/hrk-api/hrk-api.service';
import { ApiEndpoints } from '../../shared/common/constants/api-endpoints';
import { normalizeLanguage } from './language-preference';
import { LOCALIZATION_CONFIG } from './localization.config';
import { textKey } from './text-key';

export interface LanguageBundle { group: string; culture: string; revision: number; translations: Record<string, string>; }
export function languageGroup(path: string): string {
  return path.startsWith('/dcs-game') ? 'game' : path.startsWith('/hrm') ? 'hrm' : 'auth';
}

const emergency = {
  'vi-VN': {
    'Language': 'Ngôn ngữ', 'Retry': 'Thử lại', 'Không thể kết nối đến máy chủ.': 'Không thể kết nối đến máy chủ.',
    'Đã xảy ra lỗi ứng dụng.': 'Đã xảy ra lỗi ứng dụng.', 'Yêu cầu không thể thực hiện.': 'Yêu cầu không thể thực hiện.'
  },
  'en-US': {
    'Language': 'Language', 'Retry': 'Retry', 'Không thể kết nối đến máy chủ.': 'Cannot connect to the server.',
    'Đã xảy ra lỗi ứng dụng.': 'An application error occurred.', 'Yêu cầu không thể thực hiện.': 'The request could not be completed.'
  }
};
export function emergencyTranslations(lang: string): TranslationObject {
  return Object.fromEntries(Object.entries(emergency[normalizeLanguage(lang) ?? LOCALIZATION_CONFIG.defaultCulture]).map(([source, value]) => [textKey(source), value]));
}

@Injectable({ providedIn: 'root' })
export class LanguageLoader extends TranslateLoader {
  private readonly api = inject(HrkApiService);
  private readonly document = inject(DOCUMENT);
  private readonly pending = new Map<string, Observable<LanguageBundle>>();
  private readonly successful = new Set<string>();
  hasLoaded(group: string, language: string): boolean { return this.successful.has(group + ':' + language); }

  loadGroup(group: string, lang: string): Observable<LanguageBundle> {
    lang = normalizeLanguage(lang) ?? LOCALIZATION_CONFIG.defaultCulture;
    const key = group + ':' + lang;
    const existing = this.pending.get(key);
    if (existing) return existing;
    const request = this.api.CallApi<LanguageBundle>('GET', ApiEndpoints.Localization.Bundle(group, lang), {
      loading: 'none'
    })
      .pipe(
        timeout(LOCALIZATION_CONFIG.bundleTimeoutMs),
        map(bundle => {
          if (bundle.group !== group || bundle.culture !== lang || bundle.revision < 1 || !bundle.translations ||
            Object.values(bundle.translations).some(value => typeof value !== 'string')) throw new Error('Invalid language bundle');
          this.successful.add(key);
          return bundle;
        }),
        finalize(() => this.pending.delete(key)),
        shareReplay({ bufferSize: 1, refCount: true })
      );
    this.pending.set(key, request);
    return request;
  }

  override getTranslation(lang: string): Observable<TranslationObject> {
    const group = languageGroup(this.document.location?.pathname ?? '/login');
    return forkJoin(['common', group]
      .map(name => this.loadGroup(name, lang)
        .pipe(
          map(bundle => bundle.translations),
          catchError(() => of({} as Record<string, string>))
        )))
      .pipe(
        map(bundles => Object.assign({}, emergencyTranslations(lang), ...bundles))
      );
  }
}
