import { HrkModalConfig } from '../../../../../../libs/shared/ui/modal/modal-config';

// Local defaults remain available during loading, cache outages and missing/inactive DB presets.
export const GAME_MODAL_PRESETS: Record<string, Partial<HrkModalConfig>> = {
  LOGOUT_CONFIRM: { kind:'CONFIRMATION', title:'Đăng xuất khỏi trò chơi?', messageTemplate:'Bạn có chắc muốn kết thúc phiên đăng nhập hiện tại?', confirmText:'Đăng xuất', cancelText:'Ở lại', iconKey:'logout', size:'SM', tone:'WARNING' },
  BATTLE_SKIP_CONFIRM: { kind:'CONFIRMATION', title:'Bỏ qua trận đấu', messageTemplate:'Bạn có chắc muốn bỏ qua phần trình diễn và xem ngay kết quả trận đấu?', confirmText:'Bỏ qua', cancelText:'Tiếp tục xem', iconKey:'skip', size:'SM' },
  TOWER_START_NEW_RUN: { kind:'CONFIRMATION', title:'Bắt đầu lượt leo mới', messageTemplate:'Bạn có chắc muốn bắt đầu lượt leo mới với số mạng ban đầu?', confirmText:'Bắt đầu', size:'SM', tone:'WARNING', iconKey:'tower' },
  TOWER_START_QUICK_CLIMB: { kind:'CONFIRMATION', title:'Bắt đầu leo nhanh', messageTemplate:'Bắt đầu lượt leo nhanh {used}/{limit} từ Tầng 1?\nPhần thưởng các tầng thắng được cộng dồn; lượt leo dừng tại trận thua đầu tiên.', confirmText:'Bắt đầu', size:'SM', iconKey:'tower' },
  SUMMON_INFO: { title:'Thông tin chiêu mộ', size:'LG' },
  SUMMON_RESULT: { title:'Chiêu mộ thành công', size:'LG', tone:'SUCCESS', iconKey:'reward' },
  AVATAR_SELECTOR: { title:'Ảnh đại diện', size:'LG' },
  CAMPAIGN_STAGE_DETAIL: { title:'Thông tin khiêu chiến', size:'LG' },
  BATTLE_FORMATION_SETUP: { title:'Chuẩn bị xuất chiến', size:'LG' },
  TOWER_QUICK_CLIMB: { title:'Leo tháp nhanh', size:'LG', closeOnBackdrop:false },
  BATTLE_RESULT: { title:'Kết quả trận đấu', size:'LG', closeOnBackdrop:false, closeOnEscape:false },
  CAMPAIGN_CHEST_PREVIEW: { title:'Rương báu', size:'MD' },
  CAMPAIGN_CHEST_REWARD: { title:'Nhận thưởng rương báu thành công', size:'MD', tone:'SUCCESS' },
  HERO_SLOT_ACTION: { title:'Trang bị võ tướng', size:'MD' },
  HERO_UNEQUIP_ALL: { title:'Tháo toàn bộ trang bị', size:'MD', tone:'WARNING' },
  HERO_SWAP_EQUIPMENT: { title:'Hoán đổi trang bị', size:'LG' },
  HERO_MANAGEMENT: { title:'Võ tướng', size:'FULLSCREEN', closeOnBackdrop:false },
  INVENTORY: { title:'Hành trang', size:'FULLSCREEN', closeOnBackdrop:false },
  FORMATION_MANAGEMENT: { title:'Trận pháp', size:'FULLSCREEN', closeOnBackdrop:false },
  FORGE: { title:'Lò rèn', size:'FULLSCREEN', closeOnBackdrop:false },
  LIBRARY: { title:'Thư viện', size:'FULLSCREEN', closeOnBackdrop:false },
  SUMMON_REEL: { title:'Chiêu mộ võ tướng', size:'FULLSCREEN', closeOnBackdrop:false },
  FORGE_STONE_PICKER: { title:'Chọn đá cường hóa', size:'LG' },
  FORGE_CHARM_PICKER: { title:'Chọn bùa hộ mệnh / may mắn', size:'LG' },
  FORGE_DOWNGRADE: { title:'Hạ cấp trang bị', size:'MD', tone:'WARNING' },
  FORGE_RESULT: { title:'Kết quả cường hóa', size:'MD' }
};
