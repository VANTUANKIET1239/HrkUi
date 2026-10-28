import { HrkLanguage, LOCALIZATION_CONFIG } from './localization.config';

export function normalizeLanguage(value: string | null | undefined): HrkLanguage | null {
  const candidate = value?.toLowerCase();
  return LOCALIZATION_CONFIG.languages.find(language => language.culture.toLowerCase() === candidate ||
    language.culture.split('-')[0] === candidate)?.culture ?? null;
}

export function preferredLanguage(value: string | null | undefined): HrkLanguage {
  return normalizeLanguage(value) ?? LOCALIZATION_CONFIG.defaultCulture;
}
