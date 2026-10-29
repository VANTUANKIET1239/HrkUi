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
    label { display: grid; gap: 10px; margin: 0; color: var(--dcs-text-primary, #f0f4f7); font-size: 14px; font-weight: 700; }
    select { width: 100%; min-height: 42px; padding: 8px 12px; border: 1px solid var(--dcs-border-strong, rgba(167, 182, 195, 0.24)); border-radius: var(--dcs-radius-sm, 6px);
      background: var(--dcs-surface-raised, #222d38); color: var(--dcs-text-primary, #f0f4f7); font: inherit; cursor: pointer; color-scheme: dark; transition: border-color 140ms ease; }
    select:hover:not(:disabled) { border-color: var(--dcs-accent-border, rgba(188, 242, 123, 0.38)); }
    select:focus-visible { outline: 2px solid var(--dcs-accent, #bcf27b); outline-offset: 2px; }
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
