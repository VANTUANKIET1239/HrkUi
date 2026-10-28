import { Component, inject } from '@angular/core';
import { LanguageService } from './language.service';
import { HrkTranslatePipe } from './hrk-translate.pipe';
import { LOCALIZATION_CONFIG } from './localization.config';
import { normalizeLanguage } from './language-preference';

@Component({
  selector: 'hrk-language-selector', standalone: true, imports: [HrkTranslatePipe],
  template: `<label>{{ 'Language' | hrkTranslate }}
    <select [disabled]="language.busy()" (change)="select($event)">
      @for (option of languages; track option.culture) {
        <option [value]="option.culture" [selected]="language.current() === option.culture">{{ option.label }}</option>
      }
    </select></label>`,
  styles: [`
    :host { display: block; }
    label { display: grid; gap: 12px; margin: 0; color: #f3e5c9; font-size: 15px; font-weight: 600; }
    select { width: 100%; min-height: 46px; padding: 10px 12px; border: 1px solid #a1844d88; border-radius: 8px;
      background: #121723; color: #fff4db; font: inherit; cursor: pointer; color-scheme: dark; }
    select:focus-visible { outline: 2px solid #f4d785; outline-offset: 3px; }
    select:disabled { opacity: .6; cursor: wait; }
  `]
})
export class LanguageSelectorComponent {
  readonly language = inject(LanguageService);
  readonly languages = LOCALIZATION_CONFIG.languages;
  select(event: Event): void {
    const value = normalizeLanguage((event.target as HTMLSelectElement).value);
    if (value) void this.language.select(value);
  }
}
