export const LOCALIZATION_CONFIG = {
  defaultCulture: 'vi-VN',
  languages: [
    { culture: 'vi-VN', label: 'Tiếng Việt' },
    { culture: 'en-US', label: 'English' }
  ],
  cookie: { name: 'hrk_language', maxAgeSeconds: 31_536_000 },
  bundleTimeoutMs: 4_000
} as const;

export type HrkLanguage = typeof LOCALIZATION_CONFIG.languages[number]['culture'];
