import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface ItemStats {
  atk?: number;
  def?: number;
  hp?: number;
  crit?: number;
  spd?: number;
  lifesteal?: number;
  healAmount?: number;
  buffEffect?: string;
  duration?: number;
  usageDesc?: string;
  specialEffect?: string;
}

export interface InventoryItem {
  id: number;
  name: string;
  icon: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';
  category: 'weapons' | 'armor' | 'helmets' | 'boots' | 'rings' | 'artifacts' | 'consumables' | 'materials' | 'skill_books' | 'hero_fragments' | 'quests';
  count: number;
  levelReq: number;
  desc: string;
  stats: ItemStats;
  locked: boolean;
  equipped: boolean;
  enhancement: number; // for equipment
}

interface CategoryConfig {
  key: string;
  name: string;
  icon: string;
}

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.scss'
})
export class InventoryComponent implements OnInit {
  @Output() close = new EventEmitter<void>();

  // Currency & Capacity
  gold = 1250000;
  diamonds = 99730;
  upgradeMaterialsCount = 450;
  maxCapacity = 200;

  // Selected state
  selectedCategory = 'all';
  selectedItem: InventoryItem | null = null;

  // Filtering criteria
  searchQuery = '';
  filterRarity = 'All';
  filterEquipped = 'All';
  filterLevel = 'All';

  // Toast status
  toastMessage = '';
  toastType: 'success' | 'warning' | 'info' = 'info';
  showToast = false;

  // Categories configurations
  categories: CategoryConfig[] = [
    { key: 'all', name: 'Tất cả', icon: 'bi-grid-fill' },
    { key: 'weapons', name: 'Vũ khí', icon: 'bi-sword' },
    { key: 'armor', name: 'Giáp vai/ngực', icon: 'bi-suit-armor' },
    { key: 'helmets', name: 'Mũ khải giáp', icon: 'bi-shield-shaded' },
    { key: 'boots', name: 'Giày chiến hài', icon: 'bi-archive-fill' },
    { key: 'rings', name: 'Nhẫn khảm ngọc', icon: 'bi-gem' },
    { key: 'artifacts', name: 'Thần binh pháp bảo', icon: 'bi-trophy-fill' },
    { key: 'consumables', name: 'Vật phẩm tiêu thụ', icon: 'bi-droplet-fill' },
    { key: 'materials', name: 'Nguyên liệu tăng bậc', icon: 'bi-lightning-charge-fill' },
    { key: 'skill_books', name: 'Sách võ công', icon: 'bi-book-half' },
    { key: 'hero_fragments', name: 'Mảnh võ tướng', icon: 'bi-people-fill' },
    { key: 'quests', name: 'Vật phẩm nhiệm vụ', icon: 'bi-key-fill' }
  ];

  // List of mock items
  items: InventoryItem[] = [
    // Weapons
    {
      id: 101,
      name: 'Vô Song Cực Kiếm (Berserker Greatsword)',
      icon: 'bi-sword',
      rarity: 'Legendary',
      category: 'weapons',
      count: 1,
      levelReq: 35,
      desc: 'Thanh đại kiếm tỏa ra sát khí cuồn cuộn từ chiến trường cổ xưa. Rìu chém sắt bén, chấn động trời đất.',
      stats: { atk: 450, crit: 15, lifesteal: 8, specialEffect: 'Khi HP dưới 30%, tăng 20% sát thương bạo kích và nhận Cuồng Nộ.' },
      locked: false,
      equipped: true,
      enhancement: 10
    },
    {
      id: 102,
      name: 'Ám Ảnh Đoản Đao (Shadow Dagger)',
      icon: 'bi-sword',
      rarity: 'Epic',
      category: 'weapons',
      count: 1,
      levelReq: 25,
      desc: 'Chủy thủ được rèn trong bóng đêm huyền bí, chuyên dùng cho các cuộc ám sát chớp nhoáng.',
      stats: { atk: 210, spd: 12, crit: 8 },
      locked: false,
      equipped: false,
      enhancement: 5
    },
    {
      id: 103,
      name: 'Hỏa Long Thương (Dragon Spear)',
      icon: 'bi-sword',
      rarity: 'Mythic',
      category: 'weapons',
      count: 1,
      levelReq: 50,
      desc: 'Ngọn giáo rực cháy mang linh hồn của thần thú Hỏa Long. Đâm một kích phá vỡ vạn trượng giáp.',
      stats: { atk: 980, crit: 25, spd: 15, specialEffect: 'Mỗi đòn đánh thường có 35% tỷ lệ thiêu đốt mục tiêu gây sát thương theo %HP tối đa.' },
      locked: true,
      equipped: false,
      enhancement: 15
    },
    {
      id: 104,
      name: 'Kiếm Rỉ Sét (Rusty Sword)',
      icon: 'bi-sword',
      rarity: 'Common',
      category: 'weapons',
      count: 1,
      levelReq: 1,
      desc: 'Một thanh kiếm sắt bình thường đã bị rỉ sét do để lâu trong rương gỗ.',
      stats: { atk: 15 },
      locked: false,
      equipped: false,
      enhancement: 0
    },

    // Armor
    {
      id: 201,
      name: 'Huyền Thiết Đại Giáp (Iron Chestplate)',
      icon: 'bi-suit-armor',
      rarity: 'Rare',
      category: 'armor',
      count: 1,
      levelReq: 15,
      desc: 'Chiếc giáp ngực bằng sắt đen đúc nguyên khối nặng nề nhưng vô cùng kiên cố.',
      stats: { def: 85, hp: 450 },
      locked: false,
      equipped: false,
      enhancement: 0
    },
    {
      id: 202,
      name: 'Thần Bào Cửu Thiên (Celestial Robes)',
      icon: 'bi-suit-armor',
      rarity: 'Legendary',
      category: 'armor',
      count: 1,
      levelReq: 40,
      desc: 'Áo bào dệt từ tơ tằm thần cấp vạn năm, nhẹ tựa lông hồng nhưng chặn được đòn phép tối cao.',
      stats: { def: 180, hp: 2200, spd: 10, specialEffect: 'Tăng 15% Kháng hiệu ứng bất lợi.' },
      locked: false,
      equipped: true,
      enhancement: 12
    },
    {
      id: 203,
      name: 'Xích Long Lân Giáp (Dragonscale Armor)',
      icon: 'bi-suit-armor',
      rarity: 'Mythic',
      category: 'armor',
      count: 1,
      levelReq: 50,
      desc: 'Tấm giáp rèn từ vảy ngược của Xích Long, có thể hấp thụ và phản lại sát thương cận chiến.',
      stats: { def: 380, hp: 4500, lifesteal: 5, specialEffect: 'Phản lại 10% sát thương nhận vào thành sát thương vật lý lên kẻ địch xung quanh.' },
      locked: true,
      equipped: false,
      enhancement: 0
    },

    // Helmets
    {
      id: 301,
      name: 'Phù Văn Khải Giáp Mũ (Rune Helmet)',
      icon: 'bi-shield-shaded',
      rarity: 'Epic',
      category: 'helmets',
      count: 1,
      levelReq: 30,
      desc: 'Chiếc mũ giáp chạm khắc cổ tự Phù Văn giúp bảo vệ thần thức người đeo khỏi u hồn.',
      stats: { def: 75, hp: 800, crit: 5 },
      locked: false,
      equipped: false,
      enhancement: 8
    },
    {
      id: 302,
      name: 'Mũ Phượng Hoàng Kim (Phoenix Crown)',
      icon: 'bi-shield-shaded',
      rarity: 'Legendary',
      category: 'helmets',
      count: 1,
      levelReq: 45,
      desc: 'Vương miện lộng lẫy mang hào quang bất tử của Phượng Hoàng, tăng khả năng hồi phục sinh mệnh.',
      stats: { def: 140, hp: 1800, specialEffect: 'Hồi phục 3% HP tối đa mỗi lượt hành động.' },
      locked: false,
      equipped: true,
      enhancement: 10
    },

    // Boots
    {
      id: 401,
      name: 'Hùng Binh Chiến Hài (War Boots)',
      icon: 'bi-archive-fill',
      rarity: 'Rare',
      category: 'boots',
      count: 1,
      levelReq: 20,
      desc: 'Ủng da chiến đấu đính thép gai, tăng độ linh hoạt trên chiến trường.',
      stats: { def: 35, spd: 15 },
      locked: false,
      equipped: true,
      enhancement: 6
    },
    {
      id: 402,
      name: 'Tật Phong Hài (Wind Treads)',
      icon: 'bi-archive-fill',
      rarity: 'Epic',
      category: 'boots',
      count: 1,
      levelReq: 30,
      desc: 'Giày chiến được yểm phong ma pháp giúp gia tốc di chuyển thần tốc như gió lốc.',
      stats: { def: 60, spd: 35 },
      locked: false,
      equipped: false,
      enhancement: 0
    },

    // Rings
    {
      id: 501,
      name: 'Nhẫn Phỉ Thúy (Jade Ring)',
      icon: 'bi-gem',
      rarity: 'Rare',
      category: 'rings',
      count: 1,
      levelReq: 10,
      desc: 'Chiếc nhẫn ngọc bích ôn nhu tinh khiết, giúp an định chân khí khí lực dồi dào.',
      stats: { hp: 300, spd: 5 },
      locked: false,
      equipped: true,
      enhancement: 4
    },
    {
      id: 502,
      name: 'Long Nhãn Thần Nhẫn (Dragon Eye Ring)',
      icon: 'bi-gem',
      rarity: 'Legendary',
      category: 'rings',
      count: 1,
      levelReq: 45,
      desc: 'Khảm nạm tròng mắt rực lửa của Rồng Vàng, nhìn thấu điểm yếu chí mạng của đối phương.',
      stats: { atk: 120, crit: 18, specialEffect: 'Tất cả đòn chí mạng tăng thêm 15% sát thương.' },
      locked: false,
      equipped: false,
      enhancement: 0
    },

    // Artifacts
    {
      id: 601,
      name: 'Ngọc Tỷ Truyền Quốc (Imperial Artifact)',
      icon: 'bi-trophy-fill',
      rarity: 'Legendary',
      category: 'artifacts',
      count: 1,
      levelReq: 40,
      desc: 'Thần khí đại diện cho vương quyền và thiên mệnh. Hào quang chí tôn hộ thể vạn tà bất xâm.',
      stats: { hp: 5000, def: 200, specialEffect: 'Bảo hộ chủ nhân: Khi nhận sát thương chí tử, miễn tử 1 lần và nhận Lá chắn bằng 25% HP.' },
      locked: true,
      equipped: true,
      enhancement: 2
    },
    {
      id: 602,
      name: 'Thất Tinh Pháp Kính (Eight-Trigrams Mirror)',
      icon: 'bi-trophy-fill',
      rarity: 'Epic',
      category: 'artifacts',
      count: 1,
      levelReq: 30,
      desc: 'Bảo kính bát quái dùng để trấn yểm yêu ma, khuếch đại uy lực phép thuật của quân sĩ.',
      stats: { atk: 150, def: 50 },
      locked: false,
      equipped: false,
      enhancement: 0
    },

    // Consumables
    {
      id: 701,
      name: 'Cửu Chuyển Hoàn Dương Đan (HP Potion)',
      icon: 'bi-droplet-fill',
      rarity: 'Common',
      category: 'consumables',
      count: 45,
      levelReq: 1,
      desc: 'Bình dược hoàn sinh phổ biến giúp phục hồi sinh lực ngay lập tức khi mệt mỏi.',
      stats: { healAmount: 1500 },
      locked: false,
      equipped: false,
      enhancement: 0
    },
    {
      id: 702,
      name: 'Thần Năng Thánh Thủy (Energy Potion)',
      icon: 'bi-droplet-fill',
      rarity: 'Rare',
      category: 'consumables',
      count: 12,
      levelReq: 10,
      desc: 'Dược dịch tinh cất từ suối nguồn tiên cảnh giúp giải phóng giới hạn thể lực tạm thời.',
      stats: { buffEffect: 'Tăng 20% Công và 30 Tốc độ', duration: 3 },
      locked: false,
      equipped: false,
      enhancement: 0
    },
    {
      id: 703,
      name: 'Đại Thiên Kinh Thư (EXP Scroll)',
      icon: 'bi-droplet-fill',
      rarity: 'Epic',
      category: 'consumables',
      count: 8,
      levelReq: 5,
      desc: 'Cuộn bí kíp cổ xưa chứa đựng trí tuệ tu hành, giúp võ tướng thăng cấp nhanh chóng.',
      stats: { buffEffect: 'Tăng 5,000 EXP võ tướng trực tiếp' },
      locked: false,
      equipped: false,
      enhancement: 0
    },

    // Materials
    {
      id: 801,
      name: 'Thiên Mệnh Đột Phá Thạch (Ascension Stone)',
      icon: 'bi-lightning-charge-fill',
      rarity: 'Epic',
      category: 'materials',
      count: 120,
      levelReq: 1,
      desc: 'Hòn đá ẩn chứa linh khí dùng để khai mở giới hạn cảnh giới võ tướng hoặc trang bị.',
      stats: { usageDesc: 'Dùng làm nguyên liệu đột phá võ tướng vượt cấp.' },
      locked: false,
      equipped: false,
      enhancement: 0
    },
    {
      id: 802,
      name: 'U Minh Thần Tinh (Enhancement Crystal)',
      icon: 'bi-lightning-charge-fill',
      rarity: 'Legendary',
      category: 'materials',
      count: 15,
      levelReq: 1,
      desc: 'Tinh thạch hiếm có chắt lọc từ hầm ngục u tối, dùng để rèn thần binh phẩm chất cao.',
      stats: { usageDesc: 'Nguyên liệu rèn đúc tăng cấp sao trang bị thần cấp.' },
      locked: false,
      equipped: false,
      enhancement: 0
    },

    // Skill Books
    {
      id: 901,
      name: 'Vô Song Thương Pháp (Peerless Spear Playbook)',
      icon: 'bi-book-half',
      rarity: 'Legendary',
      category: 'skill_books',
      count: 1,
      levelReq: 30,
      desc: 'Bí lục ghi chép thương pháp bá đạo oanh tạc thiên hạ, tăng vĩnh viễn cấp kỹ năng chiến sĩ.',
      stats: { usageDesc: 'Mở khóa hoặc nâng tối đa 1 cấp kỹ năng Võ Tướng sử dụng thương.' },
      locked: false,
      equipped: false,
      enhancement: 0
    },

    // Hero Fragments
    {
      id: 1001,
      name: 'Mảnh Hồn Tào Tháo (Cao Cao Fragment)',
      icon: 'bi-people-fill',
      rarity: 'Legendary',
      category: 'hero_fragments',
      count: 8,
      levelReq: 1,
      desc: 'Hồn thạch chứa chân khí Ngụy Vương Tào Tháo. Thu thập đủ mảnh có thể triệu hoán thần tướng.',
      stats: { usageDesc: 'Đạt 10 Mảnh để triệu hồi danh tướng Tào Tháo (Phe Ngụy).' },
      locked: false,
      equipped: false,
      enhancement: 0
    },
    {
      id: 1002,
      name: 'Mảnh Hồn Quan Vũ (Guan Yu Fragment)',
      icon: 'bi-people-fill',
      rarity: 'Legendary',
      category: 'hero_fragments',
      count: 12,
      levelReq: 1,
      desc: 'Mảnh võ tướng Quan Vũ uy chấn thiên hạ, tỏa ánh hào quang trung nghĩa.',
      stats: { usageDesc: 'Đạt 10 Mảnh để triệu hồi võ thánh Quan Vũ (Phe Thục).' },
      locked: false,
      equipped: false,
      enhancement: 0
    },

    // Quest Items
    {
      id: 1101,
      name: 'Ngọc Tỷ Bản Sao (Imperial Seal Replica)',
      icon: 'bi-key-fill',
      rarity: 'Epic',
      category: 'quests',
      count: 1,
      levelReq: 1,
      desc: 'Bản mô phỏng chi tiết ngọc tỷ triều đình, dùng để giao nộp cho sứ giả thông quan ải 7.',
      stats: { usageDesc: 'Dùng để mở khóa nhiệm vụ Chương 7: Lạc Dương Hỗn Chiến.' },
      locked: true,
      equipped: false,
      enhancement: 0
    }
  ];

  ngOnInit(): void {
    // Select first item by default
    if (this.items.length > 0) {
      this.selectedItem = this.items[0];
    }
  }

  // Toast Trigger Helper
  triggerToast(message: string, type: 'success' | 'warning' | 'info' = 'success'): void {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    setTimeout(() => {
      this.showToast = false;
    }, 2500);
  }

  // Check category counts
  getCategoryItemCount(categoryKey: string): number {
    if (categoryKey === 'all') {
      return this.items.reduce((acc, item) => acc + item.count, 0);
    }
    return this.items
      .filter(item => item.category === categoryKey)
      .reduce((acc, item) => acc + item.count, 0);
  }

  // Switch category
  selectCategory(categoryKey: string): void {
    this.selectedCategory = categoryKey;
    
    // Automatically select the first item in the filtered category, if available
    const filtered = this.filteredItems;
    if (filtered.length > 0) {
      this.selectedItem = filtered[0];
    } else {
      this.selectedItem = null;
    }
  }

  // Check if item is equipment
  isEquipment(item: InventoryItem | null): boolean {
    if (!item) return false;
    const eqCats = ['weapons', 'armor', 'helmets', 'boots', 'rings', 'artifacts'];
    return eqCats.includes(item.category);
  }

  // Get localized rarity name
  getRarityName(rarity: string): string {
    const names: Record<string, string> = {
      Common: 'Thường (Gray)',
      Rare: 'Hiếm (Blue)',
      Epic: 'Sử Thi (Purple)',
      Legendary: 'Truyền Thuyết (Gold)',
      Mythic: 'Thần Thoại (Red)'
    };
    return names[rarity] || rarity;
  }

  // Get localized type name
  getTypeName(category: string): string {
    const names: Record<string, string> = {
      weapons: 'Vũ khí',
      armor: 'Khải Giáp Ngực',
      helmets: 'Khải Giáp Đầu',
      boots: 'Chiến Hài',
      rings: 'Nhẫn Bổ Trợ',
      artifacts: 'Thần Binh Pháp Bảo',
      consumables: 'Tiêu Thụ',
      materials: 'Nguyên Liệu',
      skill_books: 'Bí Tịch Chiêu Thức',
      hero_fragments: 'Mảnh Võ Tướng',
      quests: 'Nhiệm Vụ'
    };
    return names[category] || category;
  }

  // Filter items
  get filteredItems(): InventoryItem[] {
    return this.items.filter(item => {
      // Category filter
      const matchesCategory = this.selectedCategory === 'all' || item.category === this.selectedCategory;
      
      // Search query filter
      const matchesSearch = item.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                            item.desc.toLowerCase().includes(this.searchQuery.toLowerCase());
      
      // Rarity filter
      const matchesRarity = this.filterRarity === 'All' || item.rarity === this.filterRarity;

      // Equipped state filter
      let matchesEquipped = true;
      if (this.filterEquipped === 'Equipped') {
        matchesEquipped = item.equipped === true;
      } else if (this.filterEquipped === 'Unequipped') {
        matchesEquipped = item.equipped !== true;
      }

      // Level range filter
      let matchesLevel = true;
      if (this.filterLevel === '1-10') {
        matchesLevel = item.levelReq >= 1 && item.levelReq <= 10;
      } else if (this.filterLevel === '11-30') {
        matchesLevel = item.levelReq >= 11 && item.levelReq <= 30;
      } else if (this.filterLevel === '31+') {
        matchesLevel = item.levelReq >= 31;
      }

      return matchesCategory && matchesSearch && matchesRarity && matchesEquipped && matchesLevel;
    });
  }

  // Select item handler
  selectItem(item: InventoryItem): void {
    this.selectedItem = item;
  }

  // Equip or Unequip Item
  equipOrUnequip(item: InventoryItem): void {
    if (item.equipped) {
      item.equipped = false;
      this.triggerToast(`Đã tháo trang bị "${item.name}" khỏi danh tướng!`, 'info');
    } else {
      // Unequip items of same category to simulate replacement
      this.items.forEach(i => {
        if (i.category === item.category && i.equipped && i.id !== item.id) {
          i.equipped = false;
        }
      });
      item.equipped = true;
      this.triggerToast(`Đã mặc "${item.name}" thành công cho danh tướng K Cởi Trần!`, 'success');
    }
  }

  // Enhance equipment (+ level)
  enhanceEquipment(item: InventoryItem): void {
    const costGold = (item.enhancement + 1) * 3000;
    const costMaterials = (item.enhancement + 1) * 2;

    if (this.gold < costGold) {
      this.triggerToast('Không đủ Vàng để cường hóa!', 'warning');
      return;
    }
    if (this.upgradeMaterialsCount < costMaterials) {
      this.triggerToast('Không đủ Đá thần binh để cường hóa!', 'warning');
      return;
    }

    this.gold -= costGold;
    this.upgradeMaterialsCount -= costMaterials;
    item.enhancement += 1;

    // Boost stats
    if (item.stats.atk) item.stats.atk = Math.round(item.stats.atk * 1.1) + 15;
    if (item.stats.def) item.stats.def = Math.round(item.stats.def * 1.08) + 8;
    if (item.stats.hp) item.stats.hp = Math.round(item.stats.hp * 1.1) + 80;

    this.triggerToast(`Cường hóa thành công "${item.name}" lên +${item.enhancement}!`, 'success');
  }

  // Upgrade equipment stars/rarity
  upgradeEquipment(item: InventoryItem): void {
    const upgradeCost = 25000;
    if (this.gold < upgradeCost) {
      this.triggerToast('Không đủ Vàng để tăng sao trang bị!', 'warning');
      return;
    }

    this.gold -= upgradeCost;
    
    // Simulate star growth
    this.triggerToast(`Tăng sao rèn đúc trang bị "${item.name}" thành công! Chỉ số phụ +15%.`, 'success');
    if (item.stats.atk) item.stats.atk = Math.round(item.stats.atk * 1.15);
    if (item.stats.def) item.stats.def = Math.round(item.stats.def * 1.15);
    if (item.stats.hp) item.stats.hp = Math.round(item.stats.hp * 1.15);
  }

  // Lock/Unlock toggle
  toggleLockItem(item: InventoryItem): void {
    item.locked = !item.locked;
    const text = item.locked ? 'Đã khóa vật phẩm! Tránh việc bán nhầm.' : 'Đã mở khóa vật phẩm.';
    this.triggerToast(text, 'info');
  }

  // Sell individual item
  sellItem(item: InventoryItem): void {
    if (item.locked) {
      this.triggerToast('Vật phẩm đang bị KHÓA! Hãy mở khóa để bán.', 'warning');
      return;
    }
    if (item.equipped) {
      this.triggerToast('Không thể bán trang bị ĐANG MẶC!', 'warning');
      return;
    }

    let sellPrice = 1000;
    if (item.rarity === 'Rare') sellPrice = 3000;
    if (item.rarity === 'Epic') sellPrice = 8000;
    if (item.rarity === 'Legendary') sellPrice = 20000;
    if (item.rarity === 'Mythic') sellPrice = 50000;

    if (item.count > 1) {
      item.count -= 1;
      this.gold += sellPrice;
      this.triggerToast(`Đã bán 1x "${item.name}", nhận được +${sellPrice} Vàng!`, 'success');
    } else {
      const idx = this.items.findIndex(i => i.id === item.id);
      if (idx !== -1) {
        this.items.splice(idx, 1);
        this.gold += sellPrice;
        this.selectedItem = null;
        this.triggerToast(`Đã bán sạch "${item.name}", nhận được +${sellPrice} Vàng!`, 'success');
      }
    }
  }

  // Use individual item (consumables / materials)
  useItem(item: InventoryItem): void {
    if (item.count <= 0) return;

    if (item.category === 'consumables') {
      item.count -= 1;
      if (item.stats.healAmount) {
        this.triggerToast(`Đã dùng "${item.name}", hồi phục +${item.stats.healAmount} HP cho toàn quân!`, 'success');
      } else if (item.stats.buffEffect) {
        this.triggerToast(`Kích hoạt dược dịch: ${item.stats.buffEffect}!`, 'success');
      }

      // Remove from list if count reaches 0
      if (item.count === 0) {
        const idx = this.items.findIndex(i => i.id === item.id);
        if (idx !== -1) {
          this.items.splice(idx, 1);
          this.selectedItem = null;
        }
      }
    } else if (item.category === 'materials' && item.id === 801) {
      // Use ascension stone (Ascend first hero)
      item.count -= 5;
      this.triggerToast('Đã tiêu hao 5 Đá Đột Phá giúp Danh Tướng bộc phát võ học!', 'success');
      if (item.count <= 0) {
        const idx = this.items.findIndex(i => i.id === item.id);
        if (idx !== -1) {
          this.items.splice(idx, 1);
          this.selectedItem = null;
        }
      }
    } else {
      this.triggerToast(`Đã sử dụng nguyên liệu "${item.name}"!`, 'success');
    }
  }

  // Combine items
  combineItem(item: InventoryItem): void {
    if (item.count < 5) {
      this.triggerToast('Cần tối thiểu 5 đá nguyên liệu cùng phẩm chất để tiến hành ghép tinh luyện!', 'warning');
      return;
    }

    item.count -= 5;
    this.upgradeMaterialsCount += 25;
    this.triggerToast(`Dung hợp thành công 5x "${item.name}" thành 25 viên Đá Thần Binh cường lực!`, 'success');
  }

  // Summon hero from fragments
  summonHeroFromFragments(item: InventoryItem): void {
    if (item.count < 10) {
      this.triggerToast('Không đủ mảnh tinh tú để hiệu triệu! Cần 10 Mảnh.', 'warning');
      return;
    }

    item.count -= 10;
    
    let heroName = 'Quan Vũ (Phe Thục)';
    if (item.id === 1001) heroName = 'Tào Tháo (Phe Ngụy)';

    this.triggerToast(`HIỆU TRIỆU THÀNH CÔNG: Chào mừng danh tướng đại bảnh ${heroName} gia nhập đại doanh!`, 'success');

    if (item.count === 0) {
      const idx = this.items.findIndex(i => i.id === item.id);
      if (idx !== -1) {
        this.items.splice(idx, 1);
        this.selectedItem = null;
      }
    }
  }

  // Sorting
  sortItems(criteria: 'rarity' | 'power' | 'type'): void {
    if (criteria === 'rarity') {
      const rarityWeight = { Mythic: 5, Legendary: 4, Epic: 3, Rare: 2, Common: 1 };
      this.items.sort((a, b) => rarityWeight[b.rarity] - rarityWeight[a.rarity]);
      this.triggerToast('Đã sắp xếp hành trang theo phẩm chất giảm dần.', 'info');
    } else if (criteria === 'power') {
      this.items.sort((a, b) => {
        const powerA = (a.stats.atk || 0) + (a.stats.def || 0) + ((a.stats.hp || 0) / 10) + (a.enhancement * 15);
        const powerB = (b.stats.atk || 0) + (b.stats.def || 0) + ((b.stats.hp || 0) / 10) + (b.enhancement * 15);
        return powerB - powerA;
      });
      this.triggerToast('Đã sắp xếp hành trang theo sức mạnh chiến lực trang bị.', 'info');
    } else if (criteria === 'type') {
      const catWeight: Record<string, number> = {
        weapons: 1, armor: 2, helmets: 3, boots: 4, rings: 5, artifacts: 6,
        consumables: 7, materials: 8, skill_books: 9, hero_fragments: 10, quests: 11
      };
      this.items.sort((a, b) => (catWeight[a.category] || 99) - (catWeight[b.category] || 99));
      this.triggerToast('Đã gom cụm hành trang theo chủng loại vật phẩm.', 'info');
    }

    if (this.items.length > 0) {
      this.selectedItem = this.items[0];
    }
  }

  // Auto Equip best items
  autoEquipBestItems(): void {
    // Equips highest stat items in each gear slot
    const slots: ('weapons' | 'armor' | 'helmets' | 'boots' | 'rings' | 'artifacts')[] = [
      'weapons', 'armor', 'helmets', 'boots', 'rings', 'artifacts'
    ];

    slots.forEach(slot => {
      // Unequip all in this slot
      this.items.forEach(i => {
        if (i.category === slot) i.equipped = false;
      });

      // Find item with highest stats (simulated by rarity weight & enhancement)
      const slotItems = this.items.filter(i => i.category === slot);
      if (slotItems.length > 0) {
        const rarityWeight = { Mythic: 5, Legendary: 4, Epic: 3, Rare: 2, Common: 1 };
        slotItems.sort((a, b) => {
          const scoreA = rarityWeight[a.rarity] * 100 + a.enhancement * 10;
          const scoreB = rarityWeight[b.rarity] * 100 + b.enhancement * 10;
          return scoreB - scoreA;
        });

        // Equip the best one
        slotItems[0].equipped = true;
      }
    });

    this.triggerToast('Đã tự động lọc và trang bị bộ vật phẩm tối tân nhất cho đội hình!', 'success');
  }

  // Batch Sell Common items
  batchSellItems(): void {
    const commons = this.items.filter(i => i.rarity === 'Common' && !i.locked && !i.equipped);
    if (commons.length === 0) {
      this.triggerToast('Không có vật phẩm phẩm chất Thường (Xám) rảnh rỗi nào để bán nhanh!', 'warning');
      return;
    }

    let earnedGold = 0;
    // Remove commons and calculate gold
    commons.forEach(item => {
      earnedGold += 1000 * item.count;
      const idx = this.items.findIndex(i => i.id === item.id);
      if (idx !== -1) {
        this.items.splice(idx, 1);
      }
    });

    this.gold += earnedGold;
    this.selectedItem = null;
    this.triggerToast(`Đã bán nhanh ${commons.length} loại vật phẩm Thường, thu hồi +${earnedGold} Vàng!`, 'success');
  }

  // Batch use consumables (quick heal potions)
  batchUseConsumables(): void {
    const hpPotions = this.items.find(i => i.id === 701);
    if (!hpPotions || hpPotions.count === 0) {
      this.triggerToast('Không còn Bình Thuốc HP trong túi hành trang!', 'warning');
      return;
    }

    const useCount = Math.min(hpPotions.count, 5);
    hpPotions.count -= useCount;
    this.triggerToast(`Sử dụng nhanh ${useCount}x Bình HP dược dịch giúp phục hồi khí lực lập tức!`, 'success');

    if (hpPotions.count === 0) {
      const idx = this.items.findIndex(i => i.id === hpPotions.id);
      if (idx !== -1) {
        this.items.splice(idx, 1);
        this.selectedItem = null;
      }
    }
  }

  // Drag and drop events
  onItemDragStart(event: DragEvent, item: InventoryItem): void {
    if (event.dataTransfer) {
      event.dataTransfer.setData('text/plain', JSON.stringify(item));
      event.dataTransfer.effectAllowed = 'move';
    }
  }

  onItemDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onItemDrop(event: DragEvent): void {
    event.preventDefault();
    this.triggerToast('Mặc trang bị thành công bằng thao tác kéo thả thả nhanh!', 'success');
  }
}
