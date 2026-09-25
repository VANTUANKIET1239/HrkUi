import { HeroStarAuraConfig, StarAuraVisualKey } from './hero-star-aura.models';

const TEMPLATE_TO_KEY: Record<number, StarAuraVisualKey> = {
  1: 'kiet-red-lightning',
  2: 'nam-deadline-sterile-pulse',
  3: 'chuan-men-crimson-rhythm',
  4: 'coder-banh-digital-knowledge',
  5: 'tester-dep-obsidian-nebula',
  6: 'tuong-long-scorched-command',
  7: 'pm-hoi-ha-spectral-grooming',
  8: 'qa-ky-tinh-vicious-debt',
  9: 'kiet-noel-dark-blizzard',
  10: 'hoang-nguyen-heavy-iron',
  11: 'hai-last-smile-aura'
};

const VALID_KEYS = new Set<string>([
  'kiet-red-lightning',
  'nam-deadline-sterile-pulse',
  'chuan-men-crimson-rhythm',
  'coder-banh-digital-knowledge',
  'tester-dep-obsidian-nebula',
  'tuong-long-scorched-command',
  'pm-hoi-ha-spectral-grooming',
  'qa-ky-tinh-vicious-debt',
  'kiet-noel-dark-blizzard',
  'hoang-nguyen-heavy-iron',
  'hai-last-smile-aura'
]);

export function resolveAuraVisualKey(
  auraConfig?: HeroStarAuraConfig | null,
  heroTemplateId?: number | null,
  avatar?: string | null
): StarAuraVisualKey | null {
  // 1. Direct VisualKey from auraConfig if valid
  if (auraConfig?.visualKey && VALID_KEYS.has(auraConfig.visualKey)) {
    return auraConfig.visualKey as StarAuraVisualKey;
  }

  // 2. Stable HeroTemplateId mapping
  if (heroTemplateId != null && TEMPLATE_TO_KEY[heroTemplateId]) {
    return TEMPLATE_TO_KEY[heroTemplateId];
  }

  // 3. Fallback based on avatar filename (for mock/legacy)
  if (avatar) {
    const filename = avatar.split('/').pop()?.toLowerCase() || '';
    if (filename.includes('kiet.png') || filename.includes('kiet-cơitran')) {
      return 'kiet-red-lightning';
    }
    if (filename.includes('covid') || filename.includes('trg-kiet-covid')) {
      return 'nam-deadline-sterile-pulse';
    }
    if (filename.includes('ricardo') || filename.includes('chuan-men')) {
      return 'chuan-men-crimson-rhythm';
    }
    if (filename.includes('vantrong-hs') || filename.includes('coder')) {
      return 'coder-banh-digital-knowledge';
    }
    if (filename.includes('nghiaphuc-bongtoi') || filename.includes('tester')) {
      return 'tester-dep-obsidian-nebula';
    }
    if (filename.includes('tuonglong') || filename.includes('quandoi')) {
      return 'tuong-long-scorched-command';
    }
    if (filename.includes('barber') || filename.includes('quangvinh')) {
      return 'pm-hoi-ha-spectral-grooming';
    }
    if (filename.includes('cobac') || filename.includes('qa')) {
      return 'qa-ky-tinh-vicious-debt';
    }
    if (filename.includes('noel') || filename.includes('truongkiet-noel')) {
      return 'kiet-noel-dark-blizzard';
    }
    if (filename.includes('gymer') || filename.includes('hoangnguyen')) {
      return 'hoang-nguyen-heavy-iron';
    }
    if (filename.includes('nhan-cuoi') || filename.includes('hai')) {
      return 'hai-last-smile-aura';
    }
  }

  return null;
}
