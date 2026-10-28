import { ChangeDetectorRef, DestroyRef, inject, Pipe, PipeTransform } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslateService } from '@ngx-translate/core';
import { merge } from 'rxjs';
import { textKey } from './text-key';

/** Allows existing display text and server-provided modal text to use the same catalog. */
@Pipe({ name: 'hrkTranslate', standalone: true, pure: false })
export class HrkTranslatePipe implements PipeTransform {
  private readonly translate = inject(TranslateService, { optional: true });
  constructor() {
    const changeDetector = inject(ChangeDetectorRef);
    if (this.translate) merge(this.translate.onLangChange, this.translate.onTranslationChange)
      .pipe(takeUntilDestroyed(inject(DestroyRef))).subscribe(() => changeDetector.markForCheck());
  }
  transform(value: any, parameters?: Record<string, string | number | null | undefined>, messageKey?: string | null): any {
    if (typeof value !== 'string' || !value) return value;
    const key = messageKey || textKey(value);
    // Angular renders null interpolation values as empty text, including date/number pipes.
    const values = parameters && Object.fromEntries(Object.entries(parameters).map(([name, argument]) => [name, argument ?? '']));
    const translated = this.translate?.instant(key, values);
    if (translated !== undefined && translated !== key) return translated;
    return values ? value.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, name) => Object.hasOwn(values, name) ? String(values[name]) : match) : value;
  }
}
