import { Hero } from '../../../../../core/models/hero.model';

export type BasicEffectCode =
  | 'kiet'
  | 'nam-deadline'
  | 'chuan-men'
  | 'coder-banh'
  | 'tester-dep'
  | 'tuong-long'
  | 'pm-hoi-ha'
  | 'qa-ky-tinh'
  | 'kiet-noel'
  | 'hoang-nguyen'
  | 'generic';

const TEMPLATE_ID_MAP: Record<number, BasicEffectCode> = {
  1: 'kiet',
  2: 'nam-deadline',
  3: 'chuan-men',
  4: 'coder-banh',
  5: 'tester-dep',
  6: 'tuong-long',
  7: 'pm-hoi-ha',
  8: 'qa-ky-tinh',
  9: 'kiet-noel',
  10: 'hoang-nguyen',
};

const CODE_MAP: Record<string, BasicEffectCode> = {
  'kiet': 'kiet',
  'nam-deadline': 'nam-deadline',
  'nam_deadline': 'nam-deadline',
  'chuan-men': 'chuan-men',
  'chuan_men': 'chuan-men',
  'ricardo': 'chuan-men',
  'ricardo-milos': 'chuan-men',
  'ricardo_milos': 'chuan-men',
  'coder-banh': 'coder-banh',
  'coder_banh': 'coder-banh',
  'vantrong-hs': 'coder-banh',
  'vantrong_hs': 'coder-banh',
  'tester-dep': 'tester-dep',
  'tester_dep': 'tester-dep',
  'nghiaphuc': 'tester-dep',
  'nghiaphuc-bongtoi': 'tester-dep',
  'nghiaphuc_bongtoi': 'tester-dep',
  'tuong-long': 'tuong-long',
  'tuong_long': 'tuong-long',
  'tuonglong-quandoi': 'tuong-long',
  'tuonglong_quandoi': 'tuong-long',
  'pm-hoi-ha': 'pm-hoi-ha',
  'pm_hoi_ha': 'pm-hoi-ha',
  'quangvinh': 'pm-hoi-ha',
  'quangvinh-barber': 'pm-hoi-ha',
  'quangvinh_barber': 'pm-hoi-ha',
  'qa-ky-tinh': 'qa-ky-tinh',
  'qa_ky_tinh': 'qa-ky-tinh',
  'vantrong-cobac': 'qa-ky-tinh',
  'vantrong_cobac': 'qa-ky-tinh',
  'kiet-noel': 'kiet-noel',
  'kiet_noel': 'kiet-noel',
  'truongkiet-noel': 'kiet-noel',
  'truongkiet_noel': 'kiet-noel',
  'hoang-nguyen': 'hoang-nguyen',
  'hoang_nguyen': 'hoang-nguyen',
  'hoangnguyen-gymer': 'hoang-nguyen',
  'hoangnguyen_gymer': 'hoang-nguyen',
};

const AVATAR_FILENAME_MAP: Record<string, BasicEffectCode> = {
  'kiet.png': 'kiet',
  'trg-kiet-covid.png': 'nam-deadline',
  'ricardo-milos.png': 'chuan-men',
  'vantrong-hs.png': 'coder-banh',
  'nghiaphuc-bongtoi.png': 'tester-dep',
  'tuonglong-quandoi.png': 'tuong-long',
  'quangvinh-barber.png': 'pm-hoi-ha',
  'vantrong-cobac.png': 'qa-ky-tinh',
  'truongkiet-noel.png': 'kiet-noel',
  'hoangnguyen-gymer.png': 'hoang-nguyen',
};

const NAME_FALLBACK_MAP: Record<string, BasicEffectCode> = {
  'k cởi trần': 'kiet',
  'nam deadline': 'nam-deadline',
  'chuẩn men': 'chuan-men',
  'coder bảnh': 'coder-banh',
  'tester đẹp': 'tester-dep',
  'tướng long quân đội': 'tuong-long',
  'pm hối hả': 'pm-hoi-ha',
  'qa kỹ tính': 'qa-ky-tinh',
  'kiet noel': 'kiet-noel',
  'hoàng nguyên': 'hoang-nguyen',
};

/**
 * Resolves a hero's presentation identity to a BasicEffectCode using strict priority:
 * 1. Specific skill override (BASIC_RANDOM_HEAL -> kiet-noel)
 * 2. heroTemplateId
 * 3. heroCode
 * 4. Avatar filename
 * 5. Hero display name
 * 6. Generic fallback
 */
export function resolveBasicEffectCode(
  hero?: Hero | null,
  activeSkillId?: string | null
): BasicEffectCode {
  if (activeSkillId === 'BASIC_RANDOM_HEAL') {
    return 'kiet-noel';
  }

  if (!hero) {
    return 'generic';
  }

  // 1. Template ID
  if (hero.heroTemplateId !== undefined && hero.heroTemplateId !== null) {
    const code = TEMPLATE_ID_MAP[hero.heroTemplateId];
    if (code) return code;
  }

  // 2. Hero code
  if (hero.heroCode) {
    const normalizedCode = hero.heroCode.trim().toLowerCase();
    const code = CODE_MAP[normalizedCode];
    if (code) return code;
  }

  // 3. Avatar filename fallback
  if (hero.avatar) {
    const filename = hero.avatar.split('/').pop()?.split('\\').pop()?.toLowerCase() || '';
    const code = AVATAR_FILENAME_MAP[filename];
    if (code) return code;
  }

  // 4. Hero display name fallback
  if (hero.name) {
    const normalizedName = hero.name.trim().toLowerCase();
    const code = NAME_FALLBACK_MAP[normalizedName];
    if (code) return code;
  }

  return 'generic';
}
