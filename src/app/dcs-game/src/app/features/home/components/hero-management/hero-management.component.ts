import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Hero } from '../../../../core/models/hero.model';
import { BattleCharacterComponent } from '../../../battle/components/battle-character/battle-character.component';

interface Skill {
  name: string;
  icon: string;
  description: string;
  cooldown: string;
  damageType: 'Vật Lý' | 'Phép Thuật' | 'Hỗ Trợ' | 'Kích Hoạt';
  effectType: 'Burn' | 'Stun' | 'Poison' | 'Freeze' | 'Shield' | 'Heal' | 'AOE' | 'Single Target';
}

interface Gear {
  slot: 'Vũ Khí' | 'Mũ' | 'Giáp' | 'Giày' | 'Nhẫn' | 'Thần Binh';
  name: string;
  icon: string;
  rarity: 'Legendary' | 'Epic' | 'Rare' | 'Common';
  enhancement: number;
}

interface HeroStats {
  hp: number;
  atk: number;
  def: number;
  spd: number;
  crit: number; // in %
  critDmg: number; // in %
  lifesteal: number; // in %
  accuracy: number; // in %
  resistance: number; // in %
}

interface RPGHero {
  id: number;
  name: string;
  avatar: string;
  rarity: 'Legendary' | 'Epic' | 'Rare';
  level: number;
  stars: number;
  faction: 'Thục' | 'Ngụy' | 'Ngô' | 'Quần';
  class: 'Đỡ Đòn' | 'Chiến Sĩ' | 'Sát Thủ' | 'Pháp Sư' | 'Hỗ Trợ';
  power: number;
  exp: number;
  maxExp: number;
  stats: HeroStats;
  skills: Skill[];
  equipment: Gear[];
  locked: boolean;
  favorite: boolean;
  auraTier: 1 | 2 | 3 | 4;
}

@Component({
  selector: 'app-hero-management',
  standalone: true,
  imports: [CommonModule, FormsModule, BattleCharacterComponent],
  templateUrl: './hero-management.component.html',
  styleUrl: './hero-management.component.scss'
})
export class HeroManagementComponent implements OnInit {
  @Output() close = new EventEmitter<void>();

  // Resources
  gold = 590000;
  gems = 997300;
  fragments = 120;
  materials = 4500;

  // Feedback notifications
  toastMessage = '';
  toastType: 'success' | 'warning' | 'info' = 'info';
  showToast = false;

  // List of heroes
  heroes: RPGHero[] = [
    {
      id: 1,
      name: 'K Cởi Trần',
      avatar: '/assets/images/dcs-game/kiet.png',
      rarity: 'Legendary',
      level: 35,
      stars: 5,
      faction: 'Thục',
      class: 'Chiến Sĩ',
      power: 12800,
      exp: 450,
      maxExp: 1000,
      locked: false,
      favorite: true,
      auraTier: 4,
      stats: { hp: 12500, atk: 1850, def: 820, spd: 120, crit: 25, critDmg: 180, lifesteal: 15, accuracy: 95, resistance: 40 },
      skills: [
        { name: 'Đấm Thường', icon: 'bi-hand-index-thumb-fill', description: 'Gây 100% công vật lý lên mục tiêu đơn thể.', cooldown: '0s', damageType: 'Vật Lý', effectType: 'Single Target' },
        { name: 'Gồng Cơ Bắp', icon: 'bi-shield-shaded', description: 'Tăng 30% giáp và miễn nhiễm khống chế trong 2 lượt.', cooldown: '8s', damageType: 'Hỗ Trợ', effectType: 'Shield' },
        { name: 'Cuồng Nộ', icon: 'bi-fire', description: 'Đòn đánh tiếp theo gây thêm sát thương thiêu đốt liên tục.', cooldown: '6s', damageType: 'Vật Lý', effectType: 'Burn' },
        { name: 'Nộ Long Sáu Múi', icon: 'bi-lightning-fill', description: 'Giáng sấm sét chấn động cực mạnh lên toàn bộ kẻ địch, có cơ hội làm choáng.', cooldown: '15s', damageType: 'Vật Lý', effectType: 'AOE' },
        { name: 'Hào Quang Độc Tôn', icon: 'bi-gem', description: 'Mỗi đồng đội ngã xuống tăng 10% Công và Tốc độ cho bản thân.', cooldown: 'Bị động', damageType: 'Hỗ Trợ', effectType: 'Heal' }
      ],
      equipment: [
        { slot: 'Vũ Khí', name: 'Long Đao Vô Song', icon: 'bi-sword', rarity: 'Legendary', enhancement: 15 },
        { slot: 'Mũ', name: 'Nón Chiến Thần', icon: 'bi-shield-fill', rarity: 'Legendary', enhancement: 12 },
        { slot: 'Giáp', name: 'Giáp Lân Tinh', icon: 'bi-suit-armor', rarity: 'Epic', enhancement: 10 },
        { slot: 'Giày', name: 'Khinh Vân Hài', icon: 'bi-archive', rarity: 'Epic', enhancement: 8 },
        { slot: 'Nhẫn', name: 'Nhẫn Càn Khôn', icon: 'bi-gem', rarity: 'Rare', enhancement: 5 },
        { slot: 'Thần Binh', name: 'Ngọc Tỷ Truyền Quốc', icon: 'bi-trophy-fill', rarity: 'Legendary', enhancement: 4 }
      ]
    },
    {
      id: 2,
      name: 'Nam Deadline',
      avatar: '/assets/images/dcs-game/trg-kiet-covid.png',
      rarity: 'Epic',
      level: 28,
      stars: 4,
      faction: 'Ngụy',
      class: 'Sát Thủ',
      power: 9400,
      exp: 120,
      maxExp: 800,
      locked: false,
      favorite: false,
      auraTier: 3,
      stats: { hp: 8200, atk: 1540, def: 580, spd: 135, crit: 35, critDmg: 210, lifesteal: 5, accuracy: 110, resistance: 25 },
      skills: [
        { name: 'Rạch Áp Lực', icon: 'bi-slash-square-fill', description: 'Chém nhanh xuyên giáp mục tiêu có HP thấp nhất.', cooldown: '0s', damageType: 'Vật Lý', effectType: 'Single Target' },
        { name: 'Tiêm Vắc-xin', icon: 'bi-capsule', description: 'Bơm độc dược làm suy yếu phòng ngự kẻ địch, giảm 20% thủ.', cooldown: '10s', damageType: 'Phép Thuật', effectType: 'Poison' },
        { name: 'Tránh Dịch', icon: 'bi-wind', description: 'Tăng mạnh né tránh và tốc độ di chuyển trong 3 lượt.', cooldown: '12s', damageType: 'Hỗ Trợ', effectType: 'Shield' },
        { name: 'Áp Lực Giờ Chót', icon: 'bi-alarm-fill', description: 'Tạo sát thương chí mạng cực lớn lên mục tiêu đơn, hồi chiêu lập tức nếu tiêu diệt.', cooldown: '18s', damageType: 'Vật Lý', effectType: 'Single Target' },
        { name: 'OT Khẩn Cấp', icon: 'bi-activity', description: 'Tăng 15% Tỷ lệ Bạo Kích khi lượng máu dưới 50%.', cooldown: 'Bị động', damageType: 'Hỗ Trợ', effectType: 'Burn' }
      ],
      equipment: [
        { slot: 'Vũ Khí', name: 'Song Chủy Ám Dạ', icon: 'bi-sword', rarity: 'Epic', enhancement: 12 },
        { slot: 'Mũ', name: 'Mặt Nạ Quỷ', icon: 'bi-shield-fill', rarity: 'Epic', enhancement: 10 },
        { slot: 'Giáp', name: 'Khinh Y Dạ Hành', icon: 'bi-suit-armor', rarity: 'Rare', enhancement: 6 },
        { slot: 'Giày', name: 'Tật Phong Trảm Giày', icon: 'bi-archive', rarity: 'Epic', enhancement: 9 },
        { slot: 'Nhẫn', name: 'Nhẫn U Hồn', icon: 'bi-gem', rarity: 'Rare', enhancement: 4 },
        { slot: 'Thần Binh', name: 'Kính Viễn Vọng Cổ', icon: 'bi-trophy-fill', rarity: 'Rare', enhancement: 2 }
      ]
    },
    {
      id: 3,
      name: 'Long Bug Hunter',
      avatar: '/assets/images/dcs-game/tuonglong-quandoi.png',
      rarity: 'Legendary',
      level: 30,
      stars: 5,
      faction: 'Ngô',
      class: 'Đỡ Đòn',
      power: 11000,
      exp: 720,
      maxExp: 900,
      locked: true,
      favorite: true,
      auraTier: 2,
      stats: { hp: 16800, atk: 1120, def: 1150, spd: 98, crit: 10, critDmg: 150, lifesteal: 0, accuracy: 85, resistance: 65 },
      skills: [
        { name: 'Khiêu Khích', icon: 'bi-megaphone-fill', description: 'Buộc tất cả mục tiêu tấn công bản thân, giảm 20% sát thương nhận vào.', cooldown: '0s', damageType: 'Hỗ Trợ', effectType: 'Stun' },
        { name: 'Quét Bug', icon: 'bi-bug-fill', description: 'Đập mạnh lá chắn gây sát thương theo %HP tối đa lên hàng trước.', cooldown: '9s', damageType: 'Vật Lý', effectType: 'AOE' },
        { name: 'Khiên Hàng Rào', icon: 'bi-layers-half', description: 'Tạo lớp giáp hấp thụ sát thương bằng 15% HP tối đa cho toàn đội.', cooldown: '14s', damageType: 'Hỗ Trợ', effectType: 'Shield' },
        { name: 'Oanh Tạc Toàn Diện', icon: 'bi-broadcast', description: 'Triệu hồi pháo kích làm choáng hàng sau kẻ địch trong 1 lượt.', cooldown: '20s', damageType: 'Phép Thuật', effectType: 'Freeze' },
        { name: 'Mã Nguồn Cứng', icon: 'bi-shield-check', description: 'Mỗi khi bị đánh trúng, phản lại 5% sát thương nhận vào.', cooldown: 'Bị động', damageType: 'Hỗ Trợ', effectType: 'Shield' }
      ],
      equipment: [
        { slot: 'Vũ Khí', name: 'Thần Binh Trấn Quốc', icon: 'bi-sword', rarity: 'Epic', enhancement: 10 },
        { slot: 'Mũ', name: 'Khải Giáp Trấn Thiên', icon: 'bi-shield-fill', rarity: 'Legendary', enhancement: 14 },
        { slot: 'Giáp', name: 'Huyền Thiết Đại Giáp', icon: 'bi-suit-armor', rarity: 'Legendary', enhancement: 15 },
        { slot: 'Giày', name: 'Trọng Thiết Thần Hài', icon: 'bi-archive', rarity: 'Epic', enhancement: 10 },
        { slot: 'Nhẫn', name: 'Nhẫn Bàn Thạch', icon: 'bi-gem', rarity: 'Epic', enhancement: 8 },
        { slot: 'Thần Binh', name: 'Bản Đồ Chiến Lược', icon: 'bi-trophy-fill', rarity: 'Epic', enhancement: 5 }
      ]
    },
    {
      id: 4,
      name: 'Chuẩn Men',
      avatar: '/assets/images/dcs-game/ricardo-milos.png',
      rarity: 'Epic',
      level: 25,
      stars: 4,
      faction: 'Quần',
      class: 'Hỗ Trợ',
      power: 8700,
      exp: 300,
      maxExp: 750,
      locked: false,
      favorite: false,
      auraTier: 1,
      stats: { hp: 10500, atk: 980, def: 720, spd: 110, crit: 15, critDmg: 160, lifesteal: 20, accuracy: 90, resistance: 50 },
      skills: [
        { name: 'Hồi Xuân Điệu', icon: 'bi-music-note-beamed', description: 'Nhảy điệu quyến rũ giúp hồi phục HP cho đồng minh yếu nhất.', cooldown: '0s', damageType: 'Hỗ Trợ', effectType: 'Heal' },
        { name: 'Cổ Vũ', icon: 'bi-heart-fill', description: 'Tăng 20% Công và 10% Tốc độ cho toàn đội trong 2 lượt.', cooldown: '11s', damageType: 'Hỗ Trợ', effectType: 'Shield' },
        { name: 'Mê Hoặc', icon: 'bi-magic', description: 'Khiến một kẻ địch ngẫu nhiên rơi vào trạng thái bối rối, tự đánh đồng đội.', cooldown: '13s', damageType: 'Phép Thuật', effectType: 'Stun' },
        { name: 'Vũ Điệu Hủy Diệt', icon: 'bi-activity', description: 'Gây sát thương toàn thể và tăng 15% hút máu cho toàn đội trong 3 lượt.', cooldown: '16s', damageType: 'Phép Thuật', effectType: 'AOE' },
        { name: 'Hút Máu Tự Nhiên', icon: 'bi-droplet-fill', description: 'Đòn đánh thường chuyển hóa 20% sát thương gây ra thành trị liệu.', cooldown: 'Bị động', damageType: 'Hỗ Trợ', effectType: 'Heal' }
      ],
      equipment: [
        { slot: 'Vũ Khí', name: 'Đàn Cổ Nhạc', icon: 'bi-sword', rarity: 'Rare', enhancement: 8 },
        { slot: 'Mũ', name: 'Khăn Vải Hào Kiệt', icon: 'bi-shield-fill', rarity: 'Epic', enhancement: 8 },
        { slot: 'Giáp', name: 'Hồng Lân Bào', icon: 'bi-suit-armor', rarity: 'Epic', enhancement: 10 },
        { slot: 'Giày', name: 'Phong Hài', icon: 'bi-archive', rarity: 'Rare', enhancement: 6 },
        { slot: 'Nhẫn', name: 'Nhẫn Phỉ Thúy', icon: 'bi-gem', rarity: 'Epic', enhancement: 7 },
        { slot: 'Thần Binh', name: 'Sáo Ngọc', icon: 'bi-trophy-fill', rarity: 'Rare', enhancement: 4 }
      ]
    },
    {
      id: 5,
      name: 'Coder Bảnh',
      avatar: '/assets/images/dcs-game/vantrong-hs.png',
      rarity: 'Legendary',
      level: 32,
      stars: 5,
      faction: 'Thục',
      class: 'Pháp Sư',
      power: 11500,
      exp: 600,
      maxExp: 950,
      locked: false,
      favorite: false,
      auraTier: 3,
      stats: { hp: 7900, atk: 2150, def: 510, spd: 128, crit: 30, critDmg: 220, lifesteal: 8, accuracy: 120, resistance: 30 },
      skills: [
        { name: 'Code Phép', icon: 'bi-keyboard-fill', description: 'Tấn công phép thuật cơ bản lên mục tiêu đơn.', cooldown: '0s', damageType: 'Phép Thuật', effectType: 'Single Target' },
        { name: 'Đóng Băng Server', icon: 'bi-snow', description: 'Đóng băng 2 mục tiêu ngẫu nhiên, khiến chúng không thể hành động.', cooldown: '12s', damageType: 'Phép Thuật', effectType: 'Freeze' },
        { name: 'Tường Lửa', icon: 'bi-shield-slash-fill', description: 'Tạo lớp giáp chặn 40% sát thương phép thuật.', cooldown: '10s', damageType: 'Hỗ Trợ', effectType: 'Shield' },
        { name: 'Lên Production', icon: 'bi-cloud-arrow-up-fill', description: 'Giải phóng nguồn năng lượng code khổng lồ, oanh tạc toàn bộ kẻ địch.', cooldown: '16s', damageType: 'Phép Thuật', effectType: 'AOE' },
        { name: 'Ngoại Lệ Lỗi', icon: 'bi-exclamation-triangle-fill', description: 'Mỗi lần tung chiêu giảm kháng phép của địch đi 5% (cộng dồn 3 lần).', cooldown: 'Bị động', damageType: 'Phép Thuật', effectType: 'Poison' }
      ],
      equipment: [
        { slot: 'Vũ Khí', name: 'Trượng Ngũ Hành', icon: 'bi-sword', rarity: 'Legendary', enhancement: 14 },
        { slot: 'Mũ', name: 'Mũ Pháp Sư Thâm Uyên', icon: 'bi-shield-fill', rarity: 'Epic', enhancement: 11 },
        { slot: 'Giáp', name: 'Pháp Y Vạn Sao', icon: 'bi-suit-armor', rarity: 'Epic', enhancement: 10 },
        { slot: 'Giày', name: 'Hài Vân Mây', icon: 'bi-archive', rarity: 'Epic', enhancement: 9 },
        { slot: 'Nhẫn', name: 'Ấn Chú Pháp Sư', icon: 'bi-gem', rarity: 'Legendary', enhancement: 12 },
        { slot: 'Thần Binh', name: 'Sách Phép Cổ', icon: 'bi-trophy-fill', rarity: 'Epic', enhancement: 6 }
      ]
    }
  ];

  selectedHero: RPGHero = this.heroes[0];

  // Filtering & Sorting State
  searchQuery = '';
  selectedClass: 'All' | 'Đỡ Đòn' | 'Chiến Sĩ' | 'Sát Thủ' | 'Pháp Sư' | 'Hỗ Trợ' = 'All';
  selectedFaction: 'All' | 'Thục' | 'Ngụy' | 'Ngô' | 'Quần' = 'All';
  sortBy: 'power' | 'level' | 'rarity' = 'power';

  // Selected Skill Detail inside Center Panel
  selectedSkillIndex = 0;

  // Tabs for Extra Game Features
  activeTab: 'BattleHistory' | 'HeroStory' | 'FriendshipBonus' | 'FactionBuff' | 'HeroBond' | 'SkillCombo' | 'EvolutionTree' | 'Costume' | 'PassiveAura' = 'PassiveAura';

  // Modal states
  showEquipmentModal = false;
  selectedGearToModify: Gear | null = null;

  // Equipment Inventory list
  inventoryItems: Gear[] = [
    { slot: 'Vũ Khí', name: 'Đồ Long Đao', icon: 'bi-sword', rarity: 'Legendary', enhancement: 0 },
    { slot: 'Vũ Khí', name: 'Phương Thiên Họa Kích', icon: 'bi-sword', rarity: 'Epic', enhancement: 3 },
    { slot: 'Mũ', name: 'Mũ Bạch Kim', icon: 'bi-shield-fill', rarity: 'Rare', enhancement: 0 },
    { slot: 'Giáp', name: 'Giáp Xích Long', icon: 'bi-suit-armor', rarity: 'Legendary', enhancement: 0 },
    { slot: 'Giày', name: 'Tật Phong Giày', icon: 'bi-archive', rarity: 'Epic', enhancement: 2 },
    { slot: 'Nhẫn', name: 'Nhẫn Thần Ma', icon: 'bi-gem', rarity: 'Legendary', enhancement: 0 },
    { slot: 'Thần Binh', name: 'Thất Tinh Đao', icon: 'bi-trophy-fill', rarity: 'Epic', enhancement: 0 },
    { slot: 'Vũ Khí', name: 'Côn Nhị Khúc K', icon: 'bi-sword', rarity: 'Legendary', enhancement: 5 },
    { slot: 'Mũ', name: 'Mũ Hoàng Kim', icon: 'bi-shield-fill', rarity: 'Legendary', enhancement: 0 },
    { slot: 'Giáp', name: 'Giáp Da Hổ', icon: 'bi-suit-armor', rarity: 'Rare', enhancement: 0 },
    { slot: 'Giày', name: 'Hài Hoa Cúc', icon: 'bi-archive', rarity: 'Rare', enhancement: 0 },
    { slot: 'Nhẫn', name: 'Nhẫn Ngũ Sắc', icon: 'bi-gem', rarity: 'Epic', enhancement: 1 },
    { slot: 'Thần Binh', name: 'Trấn Hồn Khâu', icon: 'bi-trophy-fill', rarity: 'Legendary', enhancement: 0 }
  ];

  inventoryFilter = 'All';

  // Drag and drop states
  draggedGear: Gear | null = null;
  draggedGearIndex: number | null = null;

  get filteredInventoryItems(): Gear[] {
    if (this.inventoryFilter === 'All') {
      return this.inventoryItems;
    }
    return this.inventoryItems.filter(item => item.slot === this.inventoryFilter);
  }

  mapToHero(rpgHero: RPGHero): Hero {
    const statusEffects: string[] = [];
    if (rpgHero.auraTier === 4) {
      statusEffects.push('Sixpack Glow', 'Red Lightning');
    } else if (rpgHero.auraTier === 3) {
      statusEffects.push('Chiêu Tài', 'Angry Aura');
    } else if (rpgHero.auraTier === 2) {
      statusEffects.push('Dark Shield');
    } else if (rpgHero.auraTier === 1) {
      statusEffects.push('Veil of the Obsidian Nebulae');
    }

    return {
      id: rpgHero.id,
      name: rpgHero.name,
      avatar: rpgHero.avatar,
      hp: rpgHero.stats.hp,
      maxHp: rpgHero.stats.hp,
      mana: 100,
      maxMana: 100,
      attack: rpgHero.stats.atk,
      defense: rpgHero.stats.def,
      speed: rpgHero.stats.spd,
      position: 1,
      team: 'left',
      statusEffects: statusEffects,
      level: rpgHero.level
    };
  }

  ngOnInit(): void {
    if (this.heroes.length > 0) {
      this.selectedHero = this.heroes[0];
    }
  }

  // Toast System
  triggerToast(message: string, type: 'success' | 'warning' | 'info' = 'success'): void {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    setTimeout(() => {
      this.showToast = false;
    }, 2500);
  }

  // Filtered Heroes
  get filteredHeroes(): RPGHero[] {
    return this.heroes
      .filter(hero => {
        const matchesSearch = hero.name.toLowerCase().includes(this.searchQuery.toLowerCase());
        const matchesClass = this.selectedClass === 'All' || hero.class === this.selectedClass;
        const matchesFaction = this.selectedFaction === 'All' || hero.faction === this.selectedFaction;
        return matchesSearch && matchesClass && matchesFaction;
      })
      .sort((a, b) => {
        if (this.sortBy === 'power') {
          return b.power - a.power;
        } else if (this.sortBy === 'level') {
          return b.level - a.level;
        } else if (this.sortBy === 'rarity') {
          const rarityWeight = { Legendary: 3, Epic: 2, Rare: 1 };
          return rarityWeight[b.rarity] - rarityWeight[a.rarity];
        }
        return 0;
      });
  }

  // Actions
  selectHero(hero: RPGHero): void {
    this.selectedHero = hero;
    this.selectedSkillIndex = 0; // reset active skill to basic
  }

  toggleLock(): void {
    this.selectedHero.locked = !this.selectedHero.locked;
    const action = this.selectedHero.locked ? 'Khóa' : 'Mở khóa';
    this.triggerToast(`${action} võ tướng ${this.selectedHero.name} thành công!`, 'info');
  }

  toggleFavorite(): void {
    this.selectedHero.favorite = !this.selectedHero.favorite;
    const status = this.selectedHero.favorite ? 'Đã thêm vào yêu thích' : 'Đã bỏ yêu thích';
    this.triggerToast(`${status} võ tướng ${this.selectedHero.name}!`, 'info');
  }

  // Levels Up the Selected Hero
  levelUp(): void {
    const cost = this.selectedHero.level * 1200;
    if (this.gold < cost) {
      this.triggerToast('Không đủ Vàng để nâng cấp!', 'warning');
      return;
    }

    if (this.materials < 15) {
      this.triggerToast('Không đủ Nguyên liệu nâng cấp!', 'warning');
      return;
    }

    this.gold -= cost;
    this.materials -= 15;
    this.selectedHero.level += 1;
    this.selectedHero.power += Math.floor(Math.random() * 200) + 150;
    
    // Increment Stats
    this.selectedHero.stats.hp += Math.floor(Math.random() * 150) + 100;
    this.selectedHero.stats.atk += Math.floor(Math.random() * 25) + 15;
    this.selectedHero.stats.def += Math.floor(Math.random() * 15) + 8;
    this.selectedHero.stats.spd += Math.floor(Math.random() * 2) + 1;

    // EXP Bar adjustment
    this.selectedHero.exp = 0;
    this.selectedHero.maxExp = this.selectedHero.level * 100 + 400;

    this.triggerToast(`Nâng cấp ${this.selectedHero.name} lên cấp ${this.selectedHero.level}! Power +${Math.floor(this.selectedHero.power * 0.02)}`, 'success');
  }

  // Automates full upgrade by consuming materials/gold
  autoUpgrade(): void {
    let upgradeCount = 0;
    let totalPowerGained = 0;
    
    while (this.gold >= this.selectedHero.level * 1200 && this.materials >= 15 && upgradeCount < 5) {
      const cost = this.selectedHero.level * 1200;
      this.gold -= cost;
      this.materials -= 15;
      
      const prevPower = this.selectedHero.power;
      this.selectedHero.level += 1;
      this.selectedHero.power += Math.floor(Math.random() * 200) + 150;
      totalPowerGained += (this.selectedHero.power - prevPower);

      this.selectedHero.stats.hp += 120;
      this.selectedHero.stats.atk += 20;
      this.selectedHero.stats.def += 10;
      this.selectedHero.stats.spd += 1;
      
      this.selectedHero.exp = 0;
      this.selectedHero.maxExp = this.selectedHero.level * 100 + 400;
      
      upgradeCount++;
    }

    if (upgradeCount === 0) {
      this.triggerToast('Không đủ Vàng hoặc Nguyên liệu nâng cấp!', 'warning');
    } else {
      this.triggerToast(`Đột phá nhanh ${upgradeCount} cấp! Cấp hiện tại: ${this.selectedHero.level}. Lực chiến +${totalPowerGained}!`, 'success');
    }
  }

  // Equip Best logic: upgrades all gear items to Legendary rarity and adds levels
  equipBest(): void {
    if (this.gold < 50000) {
      this.triggerToast('Không đủ Vàng để Cường hóa và Trang bị Tối tân (Cần 50,000 Vàng)!', 'warning');
      return;
    }

    this.gold -= 50000;
    this.selectedHero.equipment.forEach(gear => {
      gear.rarity = 'Legendary';
      gear.enhancement = 15;
    });

    // Substantial power boost
    const basePower = this.selectedHero.power;
    this.selectedHero.power = Math.floor(this.selectedHero.power * 1.15);
    const powerGained = this.selectedHero.power - basePower;

    // Boost stats
    this.selectedHero.stats.hp = Math.floor(this.selectedHero.stats.hp * 1.08);
    this.selectedHero.stats.atk = Math.floor(this.selectedHero.stats.atk * 1.1);
    this.selectedHero.stats.def = Math.floor(this.selectedHero.stats.def * 1.1);

    this.triggerToast(`Đã tự động mặc bộ trang bị Thần Thoại +15! Lực chiến +${powerGained}!`, 'success');
  }

  // Trigger equipment overlay modification
  openGearModification(gear: Gear): void {
    this.selectedGearToModify = gear;
    this.showEquipmentModal = true;
  }

  enhanceGear(): void {
    if (!this.selectedGearToModify) return;

    if (this.selectedGearToModify.enhancement >= 20) {
      this.triggerToast('Trang bị đã đạt cấp Cường hóa tối đa (+20)!', 'warning');
      return;
    }

    const cost = (this.selectedGearToModify.enhancement + 1) * 1500;
    if (this.gold < cost) {
      this.triggerToast('Không đủ Vàng để Cường hóa!', 'warning');
      return;
    }

    this.gold -= cost;
    this.selectedGearToModify.enhancement += 1;
    this.selectedHero.power += 75;
    this.selectedHero.stats.atk += 8;
    this.selectedHero.stats.def += 4;

    this.triggerToast(`Cường hóa thành công ${this.selectedGearToModify.name} lên +${this.selectedGearToModify.enhancement}!`, 'success');
  }

  changeRarityGear(): void {
    if (!this.selectedGearToModify) return;

    if (this.selectedGearToModify.rarity === 'Legendary') {
      this.triggerToast('Trang bị đã đạt phẩm chất Thần Thoại!', 'info');
      return;
    }

    if (this.gems < 500) {
      this.triggerToast('Không đủ Kim Cương để tẩy luyện phẩm chất!', 'warning');
      return;
    }

    this.gems -= 500;
    const rarities: ('Legendary' | 'Epic' | 'Rare')[] = ['Legendary', 'Epic', 'Rare'];
    const currentIdx = rarities.indexOf(this.selectedGearToModify.rarity as any);
    
    if (currentIdx > 0) {
      this.selectedGearToModify.rarity = rarities[currentIdx - 1];
    } else {
      this.selectedGearToModify.rarity = 'Legendary';
    }

    this.selectedHero.power += 250;
    this.triggerToast(`Tẩy phẩm chất thành công! Phẩm mới: ${this.selectedGearToModify.rarity}`, 'success');
  }

  removeEquipment(): void {
    this.selectedHero.equipment.forEach(gear => {
      gear.enhancement = 0;
      gear.rarity = 'Common';
    });
    this.selectedHero.power = Math.floor(this.selectedHero.power * 0.85);
    this.triggerToast('Đã tháo toàn bộ trang bị!', 'info');
  }

  // Aura Evolution Selection
  setAuraTier(tier: 1 | 2 | 3 | 4): void {
    this.selectedHero.auraTier = tier;
    let tierName = '';
    if (tier === 1) tierName = 'Hào Quang Xanh Băng';
    if (tier === 2) tierName = 'Hào Quang Tím U Hồn';
    if (tier === 3) tierName = 'Hào Quang Kim Hoàng Kim';
    if (tier === 4) tierName = 'Lôi Quang Xích Thần (Sét Đỏ)';

    this.triggerToast(`Đã thức tỉnh Aura cấp ${tier}: ${tierName}!`, 'success');
  }

  // Inventory Drag and Drop & Equip Actions
  onInventoryDragStart(event: DragEvent, gear: Gear, index: number): void {
    this.draggedGear = gear;
    this.draggedGearIndex = index;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', JSON.stringify({ gear, index }));
    }
  }

  onEquipmentDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onEquipmentDrop(event: DragEvent, slotIndex: number): void {
    event.preventDefault();
    if (!this.draggedGear) return;

    const slots: ('Vũ Khí' | 'Mũ' | 'Giáp' | 'Giày' | 'Nhẫn' | 'Thần Binh')[] = [
      'Vũ Khí', 'Mũ', 'Giáp', 'Giày', 'Nhẫn', 'Thần Binh'
    ];
    const targetSlot = slots[slotIndex];

    if (this.draggedGear.slot !== targetSlot) {
      this.triggerToast(`Trang bị không phù hợp! Ô này cần: ${targetSlot}`, 'warning');
      this.draggedGear = null;
      this.draggedGearIndex = null;
      return;
    }

    const currentEquipped = this.selectedHero.equipment[slotIndex];
    this.selectedHero.equipment[slotIndex] = this.draggedGear;

    if (this.draggedGearIndex !== null) {
      if (currentEquipped && currentEquipped.rarity !== 'Common') {
        this.inventoryItems[this.draggedGearIndex] = currentEquipped;
      } else {
        this.inventoryItems.splice(this.draggedGearIndex, 1);
      }
    }

    this.selectedHero.power += 150 + (this.draggedGear.enhancement * 20);
    this.triggerToast(`Mặc thành công ${this.draggedGear.name} cho ${this.selectedHero.name}!`, 'success');

    this.draggedGear = null;
    this.draggedGearIndex = null;
  }

  equipGearFromInventory(gear: Gear, index: number): void {
    const slots: ('Vũ Khí' | 'Mũ' | 'Giáp' | 'Giày' | 'Nhẫn' | 'Thần Binh')[] = [
      'Vũ Khí', 'Mũ', 'Giáp', 'Giày', 'Nhẫn', 'Thần Binh'
    ];
    const slotIndex = slots.indexOf(gear.slot);
    if (slotIndex === -1) return;

    const currentEquipped = this.selectedHero.equipment[slotIndex];
    this.selectedHero.equipment[slotIndex] = gear;

    if (currentEquipped && currentEquipped.rarity !== 'Common') {
      this.inventoryItems[index] = currentEquipped;
    } else {
      this.inventoryItems.splice(index, 1);
    }

    this.selectedHero.power += 150 + (gear.enhancement * 20);
    this.triggerToast(`Mặc thành công ${gear.name} cho ${this.selectedHero.name}!`, 'success');
  }

  // Placeholder actions
  onActionClick(actionName: string): void {
    if (actionName === 'Reset Hero') {
      if (confirm(`Bạn có chắc chắn muốn trùng sinh ${this.selectedHero.name}? Toàn bộ Vàng và Nguyên liệu nâng cấp sẽ được hoàn trả.`)) {
        this.gold += (this.selectedHero.level - 1) * 800;
        this.materials += (this.selectedHero.level - 1) * 10;
        this.selectedHero.level = 1;
        this.selectedHero.power = 3000;
        this.selectedHero.stats = { hp: 3000, atk: 500, def: 200, spd: 90, crit: 5, critDmg: 150, lifesteal: 0, accuracy: 80, resistance: 10 };
        this.triggerToast(`Trùng sinh võ tướng ${this.selectedHero.name} thành công!`, 'success');
      }
      return;
    }

    this.triggerToast(`Tính năng "${actionName}" sẽ sớm ra mắt ở phiên bản tiếp theo!`, 'info');
  }
}
