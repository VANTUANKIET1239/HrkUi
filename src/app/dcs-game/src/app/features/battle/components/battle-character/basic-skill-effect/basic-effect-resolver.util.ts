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
  | 'hai-last-smile'
  | 'trong-chua-no'
  | 'quang-vinh-thcs'
  | 'nguyen-xam-lon'
  | 'tien-dung-xuan'
  | 'van-trong-dien-vang'
  | 'tuong-long-cap-3'
  | 'kiet-bac-si'
  | 'truong-kiet-chu-mo'
  | 'tien-dung-tong-dai'
  | 'quoc-nhan-gia-dien'
  | 'cau-vang-mat-lanh'
  | 'siba-thien-than'
  | 'kiet-mai-xeo'
  | 'truong-kiet-tot-nghiep-cap-3'
  | 'quoc-nhan-tot-nghiep-cap-3'
  | 'long-le-con-meo'
  | 'quoc-nhan-chay-ngay-di'
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
  11: 'hai-last-smile',
  31: 'siba-thien-than',
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
  'hai-last-smile': 'hai-last-smile',
  'hai_last_smile': 'hai-last-smile',
  'hai': 'hai-last-smile',
  'trong-chua-no': 'trong-chua-no',
  'trong_chua_no': 'trong-chua-no',
  'quang-vinh-thcs': 'quang-vinh-thcs',
  'quang_vinh_thcs': 'quang-vinh-thcs',
  'nguyen-xam-lon': 'nguyen-xam-lon',
  'nguyen_xam_lon': 'nguyen-xam-lon',
  'tien-dung-xuan': 'tien-dung-xuan',
  'tien_dung_xuan': 'tien-dung-xuan',
  'van-trong-dien-vang': 'van-trong-dien-vang',
  'van_trong_dien_vang': 'van-trong-dien-vang',
  'tuong-long-cap-3': 'tuong-long-cap-3',
  'tuong_long_cap_3': 'tuong-long-cap-3',
  'kiet-bac-si': 'kiet-bac-si',
  'kiet_bac_si': 'kiet-bac-si',
  'truong-kiet-chu-mo': 'truong-kiet-chu-mo',
  'truong_kiet_chu_mo': 'truong-kiet-chu-mo',
  'tien-dung-tong-dai': 'tien-dung-tong-dai',
  'tien_dung_tong_dai': 'tien-dung-tong-dai',
  'quoc-nhan-gia-dien': 'quoc-nhan-gia-dien',
  'quoc_nhan_gia_dien': 'quoc-nhan-gia-dien',
  'cau-vang-mat-lanh': 'cau-vang-mat-lanh',
  'cau_vang_mat_lanh': 'cau-vang-mat-lanh',
  'siba-thien-than': 'siba-thien-than',
  'siba_thien_than': 'siba-thien-than',
  'siba': 'siba-thien-than',
  'kiet-mai-xeo': 'kiet-mai-xeo',
  'kiet_mai_xeo': 'kiet-mai-xeo',
  'truong-kiet-tot-nghiep-cap-3': 'truong-kiet-tot-nghiep-cap-3',
  'truong_kiet_tot_nghiep_cap_3': 'truong-kiet-tot-nghiep-cap-3',
  'quoc-nhan-tot-nghiep-cap-3': 'quoc-nhan-tot-nghiep-cap-3',
  'quoc_nhan_tot_nghiep_cap_3': 'quoc-nhan-tot-nghiep-cap-3',
  'long-le-con-meo': 'long-le-con-meo',
  'long_le_con_meo': 'long-le-con-meo',
  'quoc-nhan-chay-ngay-di': 'quoc-nhan-chay-ngay-di',
  'quoc_nhan_chay_ngay_di': 'quoc-nhan-chay-ngay-di',
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
  'nhan-cuoi-xam-lon.jpg': 'hai-last-smile',
  'nhan-cuoi-xam-lon.png': 'hai-last-smile',
  'tao-la-nhat-transparent.png': 'hai-last-smile',
  'tao-la-nhat.png': 'hai-last-smile',
  'tao-la-nhat.jpg': 'hai-last-smile',
  'trong-chua-no.png': 'trong-chua-no',
  'trong-chua-no-rare.png': 'trong-chua-no',
  'quang-vinh-thcs.png': 'quang-vinh-thcs',
  'quang-vinh-thcs-rare.png': 'quang-vinh-thcs',
  'nguyen-xam-lon.png': 'nguyen-xam-lon',
  'nguyen-xam-lon-rare.png': 'nguyen-xam-lon',
  'tien-dung-xuan.png': 'tien-dung-xuan',
  'tien-dung-xuan-rare.png': 'tien-dung-xuan',
  'van-trong-dien-vang.png': 'van-trong-dien-vang',
  'van-trong-dien-vang-rare.png': 'van-trong-dien-vang',
  'tuong-long-cap-3.png': 'tuong-long-cap-3',
  'tuong-long-cap-3-rare.png': 'tuong-long-cap-3',
  'kiet-bac-si.png': 'kiet-bac-si',
  'kiet-bac-si-epic.png': 'kiet-bac-si',
  'truong-kiet-chu-mo.png': 'truong-kiet-chu-mo',
  'truong-kiet-chu-mo-epic.png': 'truong-kiet-chu-mo',
  'tien-dung-call-video.png': 'tien-dung-tong-dai',
  'tien-dung-tong-dai.png': 'tien-dung-tong-dai',
  'tien-dung-tong-dai-epic.png': 'tien-dung-tong-dai',
  'quoc-nhan-fake.png': 'quoc-nhan-gia-dien',
  'quoc-nhan-gia-dien.png': 'quoc-nhan-gia-dien',
  'quoc-nhan-gia-dien-epic.png': 'quoc-nhan-gia-dien',
  'meme-cho-hai-huoc.jpg': 'cau-vang-mat-lanh',
  'meme-cho-hai-huoc.png': 'cau-vang-mat-lanh',
  'cau-vang-mat-lanh.png': 'cau-vang-mat-lanh',
  'cau-vang-mat-lanh-epic.png': 'cau-vang-mat-lanh',
  'siba-thien-than.png': 'siba-thien-than',
  'siba-thien-than-mythic.png': 'siba-thien-than',
  'kiet-mai-xeo.jpg': 'kiet-mai-xeo',
  'kiet-mai-xeo.png': 'kiet-mai-xeo',
  'kiet-mai-xeo-legendary.png': 'kiet-mai-xeo',
  'truong-kiet-tot-nghiep-cap-3.png': 'truong-kiet-tot-nghiep-cap-3',
  'truong-kiet-tot-nghiep-cap-3-legendary.png': 'truong-kiet-tot-nghiep-cap-3',
  'quoc-nhan-tot-nghiep-cap-3.png': 'quoc-nhan-tot-nghiep-cap-3',
  'quoc-nhan-tot-nghiep-cap-3-legendary.png': 'quoc-nhan-tot-nghiep-cap-3',
  'long-le-con-meo.jpg': 'long-le-con-meo',
  'long-le-con-meo.png': 'long-le-con-meo',
  'long-le-con-meo-legendary.png': 'long-le-con-meo',
  'quoc-nhan-chay-ngay-di.png': 'quoc-nhan-chay-ngay-di',
  'quoc-nhan-chay-ngay-di-legendary.png': 'quoc-nhan-chay-ngay-di',
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
  'hoang nguyên': 'hoang-nguyen',
  'tao là nhất': 'hai-last-smile',
  'hải "nụ cười cuối"': 'hai-last-smile',
  'hải nụ cười cuối': 'hai-last-smile',
  'trọng chưa nổ': 'trong-chua-no',
  'quang vinh thcs': 'quang-vinh-thcs',
  'nguyên xàm lớn': 'nguyen-xam-lon',
  'tiến dũng xuân': 'tien-dung-xuan',
  'văn trọng điện vàng': 'van-trong-dien-vang',
  'tướng long cấp 3': 'tuong-long-cap-3',
  'kiệt bác sĩ': 'kiet-bac-si',
  'kiet bac si': 'kiet-bac-si',
  'trường kiệt chu mỏ': 'truong-kiet-chu-mo',
  'truong kiet chu mo': 'truong-kiet-chu-mo',
  'tiến dũng tổng đài': 'tien-dung-tong-dai',
  'tien dung tong dai': 'tien-dung-tong-dai',
  'quốc nhân giả diện': 'quoc-nhan-gia-dien',
  'quoc nhan gia dien': 'quoc-nhan-gia-dien',
  'cậu vàng mặt lạnh': 'cau-vang-mat-lanh',
  'cau vang mat lanh': 'cau-vang-mat-lanh',
  'siba thiên thần': 'siba-thien-than',
  'siba thien than': 'siba-thien-than',
  'kiệt mái xéo': 'kiet-mai-xeo',
  'kiet mai xeo': 'kiet-mai-xeo',
  'trường kiệt tốt nghiệp cấp 3': 'truong-kiet-tot-nghiep-cap-3',
  'truong kiet tot nghiep cap 3': 'truong-kiet-tot-nghiep-cap-3',
  'quốc nhân tốt nghiệp cấp 3': 'quoc-nhan-tot-nghiep-cap-3',
  'quoc nhan tot nghiep cap 3': 'quoc-nhan-tot-nghiep-cap-3',
  'long lê con mèo': 'long-le-con-meo',
  'long le con meo': 'long-le-con-meo',
  'quốc nhân chạy ngay đi': 'quoc-nhan-chay-ngay-di',
  'quoc nhan chay ngay di': 'quoc-nhan-chay-ngay-di',
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
  if (activeSkillId === 'HAI_BUG_SLASH') {
    return 'hai-last-smile';
  }
  if (activeSkillId === 'CHUAN_MEN_BASIC') {
    return 'chuan-men';
  }
  if (activeSkillId === 'TRONG_CHUA_NO_BASIC') {
    return 'trong-chua-no';
  }
  if (activeSkillId === 'QUANG_VINH_THCS_BASIC') {
    return 'quang-vinh-thcs';
  }
  if (activeSkillId === 'NGUYEN_XAM_LON_BASIC') {
    return 'nguyen-xam-lon';
  }
  if (activeSkillId === 'TIEN_DUNG_XUAN_BASIC') {
    return 'tien-dung-xuan';
  }
  if (activeSkillId === 'VAN_TRONG_DIEN_VANG_BASIC') {
    return 'van-trong-dien-vang';
  }
  if (activeSkillId === 'TUONG_LONG_CAP_3_BASIC') {
    return 'tuong-long-cap-3';
  }
  if (activeSkillId === 'KIET_BAC_SI_BASIC') {
    return 'kiet-bac-si';
  }
  if (activeSkillId === 'TRUONG_KIET_CHU_MO_BASIC') {
    return 'truong-kiet-chu-mo';
  }
  if (activeSkillId === 'TIEN_DUNG_TONG_DAI_BASIC') {
    return 'tien-dung-tong-dai';
  }
  if (activeSkillId === 'QUOC_NHAN_GIA_DIEN_BASIC') {
    return 'quoc-nhan-gia-dien';
  }
  if (activeSkillId === 'CAU_VANG_MAT_LANH_BASIC') {
    return 'cau-vang-mat-lanh';
  }
  if (activeSkillId === 'SIBA_ANGEL_GENTLE_WING') {
    return 'siba-thien-than';
  }
  if (activeSkillId === 'KIET_MAI_XEO_BASIC') {
    return 'kiet-mai-xeo';
  }
  if (activeSkillId === 'TRUONG_KIET_GRADUATION_BASIC') {
    return 'truong-kiet-tot-nghiep-cap-3';
  }
  if (activeSkillId === 'QUOC_NHAN_GRADUATION_BASIC') {
    return 'quoc-nhan-tot-nghiep-cap-3';
  }
  if (activeSkillId === 'LONG_LE_CAT_SCRATCH_BASIC') {
    return 'long-le-con-meo';
  }
  if (activeSkillId === 'QUOC_NHAN_RUN_NOW_BASIC') {
    return 'quoc-nhan-chay-ngay-di';
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
