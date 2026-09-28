import { AuraResourceKey } from './aura-resource.models';

const HERO_CODE_TO_AURA_KEY: Record<string, AuraResourceKey> = {
  THANH_THAI_AURA: 'thanh-thai-aura',
  'thanh-thai-aura': 'thanh-thai-aura',
  SIBA_THIEN_THAN: 'siba-angel-blessing',
  'siba-thien-than': 'siba-angel-blessing'
};

export function resolveAuraResourceKey(heroCode?: string | null, avatar?: string | null): AuraResourceKey | null {
  if (heroCode) {
    const key = HERO_CODE_TO_AURA_KEY[heroCode] || HERO_CODE_TO_AURA_KEY[heroCode.toUpperCase()];
    if (key) return key;
  }

  if (avatar) {
    const lower = avatar.toLowerCase();
    if (lower.includes('thanh-thai-aura') || lower.includes('thanh-thai')) {
      return 'thanh-thai-aura';
    }
    if (lower.includes('siba-thien-than') || lower.includes('siba')) {
      return 'siba-angel-blessing';
    }
  }

  return null;
}
