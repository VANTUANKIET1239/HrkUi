import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { catchError } from 'rxjs/operators';
import { of, finalize } from 'rxjs';
import { Hero } from '../../../../core/models/hero.model';
import { BattleCharacterComponent } from '../../../battle/components/battle-character/battle-character.component';
import { PlayerHeroService } from '../../../../core/services/player-hero.service';
import {
  PlayerHeroDetailDto,
  PlayerHeroDto,
  HeroEquipmentSlot,
  EquipmentSlot,
  HeroStatBreakdownDto,
  HeroSkillDto,
  HeroUpgradePreviewDto
} from '../../../../core/models/player-hero.model';
import { InventoryService } from '../../../../core/services/inventory.service';
import { PlayerService } from '../../../../core/services/player.service';
import { InventoryItemDto, HeroEquipmentDto } from '../../../../core/models/inventory.model';
import { EquipmentTooltipService } from '../../../../shared/components/equipment-tooltip/equipment-tooltip.service';

export interface HeroStats {
  hp: number;
  atk: number;
  def: number;
  spd: number;
  crit: number; // in %
  critDmg: number; // in %
  lifesteal: number; // in %
  accuracy: number; // in %
  resistance: number; // in %
  magicDamage: number;
  magicResistance: number;
}

export interface RPGHero {
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
  statBreakdowns: HeroStatBreakdownDto[];
  skills: HeroSkillDto[];
  locked: boolean;
  favorite: boolean;
  auraTier: 1 | 2 | 3 | 4;
}

export interface StatCardDisplay {
  code: string;
  label: string;
  valDisplay: string;
  icon: string;
  colorClass: string;
  breakdown?: HeroStatBreakdownDto;
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
  private toastTimer: any = null;

  // List of heroes
  heroes: RPGHero[] = [];
  selectedHero: RPGHero = {
    id: 1,
    name: 'Võ Tướng',
    avatar: '/assets/images/dcs-game/kiet.png',
    rarity: 'Legendary',
    level: 1,
    stars: 1,
    faction: 'Thục',
    class: 'Chiến Sĩ',
    power: 1000,
    exp: 0,
    maxExp: 500,
    locked: false,
    favorite: false,
    auraTier: 1,
    stats: { hp: 1000, atk: 150, def: 80, spd: 100, crit: 5, critDmg: 150, lifesteal: 0, accuracy: 80, resistance: 10, magicDamage: 0, magicResistance: 0 },
    statBreakdowns: [],
    skills: []
  };

  // 6 Fixed Radial Equipment Slots
  equipmentSlots: HeroEquipmentSlot[] = this.createDefaultEquipmentSlots();

  // Filtering & Sorting State
  searchQuery = '';
  selectedClass: 'All' | 'Đỡ Đòn' | 'Chiến Sĩ' | 'Sát Thủ' | 'Pháp Sư' | 'Hỗ Trợ' = 'All';
  selectedFaction: 'All' | 'Thục' | 'Ngụy' | 'Ngô' | 'Quần' = 'All';
  sortBy: 'power' | 'level' | 'rarity' = 'power';

  // Tabs for Extra Game Features
  activeTab: 'BattleHistory' | 'HeroStory' | 'FactionBuff' | 'HeroBond' | 'PassiveAura' = 'PassiveAura';

  // Real Equipment Inventory
  inventoryEquipments: InventoryItemDto[] = [];
  selectedInventoryTab = 'all';
  isLoadingInventory = false;
  equippingItemId: number | null = null;
  unequippingSlotKey: string | null = null;
  isLoadingHeroDetail = false;
  isProcessingEquipment = false;
  isUpgradingHero = false;
  upgradePreview: HeroUpgradePreviewDto | null = null;

  // Equipment Action Modal (Unequip dialog)
  showSlotActionModal = false;
  selectedSlotForAction: HeroEquipmentSlot | null = null;

  // Active Tooltip for mobile tap / accessibility focus
  activeTooltipCode: string | null = null;

  readonly inventoryTabs = [
    { label: 'Tất cả', code: 'all' },
    { label: 'Vũ Khí', code: 'WEAPON' },
    { label: 'Mũ', code: 'HELMET' },
    { label: 'Giáp', code: 'ARMOR' },
    { label: 'Giày', code: 'BOOTS' },
    { label: 'Nhẫn', code: 'RING' },
    { label: 'Thần Binh', code: 'ARTIFACT' }
  ];

  // Drag and drop states
  draggedItem: InventoryItemDto | null = null;
  draggedItemIndex: number | null = null;

  get filteredInventoryEquipments(): InventoryItemDto[] {
    if (!this.inventoryEquipments) return [];
    if (this.selectedInventoryTab === 'all' || this.selectedInventoryTab === 'All') {
      return this.inventoryEquipments;
    }
    const tabCode = this.selectedInventoryTab.toUpperCase();
    return this.inventoryEquipments.filter(item =>
      item.categoryCode && item.categoryCode.toUpperCase() === tabCode
    );
  }

  // 9 Stat Cards computed list with custom colors & icons
  get statCardList(): StatCardDisplay[] {
    const s = this.selectedHero?.stats;
    const bds = this.selectedHero?.statBreakdowns || [];
    const getBd = (code: string) => bds.find(b => b.statCode === code);

    return [
      {
        code: 'HP',
        label: 'Máu (HP)',
        valDisplay: s?.hp ? s.hp.toLocaleString('vi-VN') : '0',
        icon: 'bi-heart-fill',
        colorClass: 'stat-hp',
        breakdown: getBd('HP')
      },
      {
        code: 'ATK',
        label: 'Công (ATK)',
        valDisplay: s?.atk ? s.atk.toLocaleString('vi-VN') : '0',
        icon: 'bi-fire',
        colorClass: 'stat-atk',
        breakdown: getBd('ATK')
      },
      {
        code: 'DEF',
        label: 'Thủ (DEF)',
        valDisplay: s?.def ? s.def.toLocaleString('vi-VN') : '0',
        icon: 'bi-shield-shaded',
        colorClass: 'stat-def',
        breakdown: getBd('DEF')
      },
      {
        code: 'SPD',
        label: 'Tốc độ (SPD)',
        valDisplay: s?.spd ? s.spd.toLocaleString('vi-VN') : '0',
        icon: 'bi-lightning-charge-fill',
        colorClass: 'stat-spd',
        breakdown: getBd('SPD')
      },
      {
        code: 'CRIT_RATE',
        label: 'Bạo kích',
        valDisplay: `${s?.crit ?? 0}%`,
        icon: 'bi-crosshair2',
        colorClass: 'stat-crit',
        breakdown: getBd('CRIT_RATE')
      },
      {
        code: 'CRIT_DAMAGE',
        label: 'Sát thương bạo',
        valDisplay: `${s?.critDmg ?? 0}%`,
        icon: 'bi-bullseye',
        colorClass: 'stat-crit-dmg',
        breakdown: getBd('CRIT_DAMAGE')
      },
      {
        code: 'LIFESTEAL',
        label: 'Hút máu',
        valDisplay: `${s?.lifesteal ?? 0}%`,
        icon: 'bi-droplet-fill',
        colorClass: 'stat-lifesteal',
        breakdown: getBd('LIFESTEAL')
      },
      {
        code: 'ACCURACY',
        label: 'Chính xác',
        valDisplay: `${s?.accuracy ?? 0}%`,
        icon: 'bi-cursor-fill',
        colorClass: 'stat-accuracy',
        breakdown: getBd('ACCURACY')
      },
      {
        code: 'RESISTANCE',
        label: 'Kháng hiệu ứng',
        valDisplay: `${s?.resistance ?? 0}%`,
        icon: 'bi-shield-check',
        colorClass: 'stat-resistance',
        breakdown: getBd('RESISTANCE')
      },
      {
        code: 'MAGIC_DAMAGE',
        label: 'Sát thương phép',
        valDisplay: s?.magicDamage ? s.magicDamage.toLocaleString('vi-VN') : '0',
        icon: 'bi-magic',
        colorClass: 'stat-magic-damage',
        breakdown: getBd('MAGIC_DAMAGE')
      },
      {
        code: 'MAGIC_RESISTANCE',
        label: 'Kháng phép',
        valDisplay: s?.magicResistance ? s.magicResistance.toLocaleString('vi-VN') : '0',
        icon: 'bi-shield-plus',
        colorClass: 'stat-magic-res',
        breakdown: getBd('MAGIC_RESISTANCE')
      }
    ];
  }

  selectedSkillForDetail: HeroSkillDto | null = null;

  get mainSkill(): HeroSkillDto | null {
    if (this.selectedHero?.skills && this.selectedHero.skills.length > 0) {
      return this.selectedHero.skills[0];
    }
    return null;
  }

  toggleSkillDetail(skill: HeroSkillDto): void {
    if (this.selectedSkillForDetail?.id === skill.id) {
      this.selectedSkillForDetail = null;
    } else {
      this.selectedSkillForDetail = skill;
    }
  }

  getSkillTypeBadge(skill: HeroSkillDto): { label: string; badgeClass: string } {
    const type = (skill.skillTypeCode || '').toUpperCase();
    if (type === 'ENERGY' || (!type && (skill.energyCost ?? skill.cost ?? 0) > 0)) {
      return { label: 'Kỹ Năng Nộ', badgeClass: 'badge-energy' };
    }
    if (type === 'PASSIVE' || skill.cooldown === 'Bị động') {
      return { label: 'Bị Động', badgeClass: 'badge-passive' };
    }
    const isBasicHeal = skill.effects?.some(effect =>
      (effect.effectTypeCode || '').toUpperCase() === 'HEAL'
    );
    return isBasicHeal
      ? { label: 'Hồi Máu Cơ Bản', badgeClass: 'badge-normal' }
      : { label: 'Đánh Thường', badgeClass: 'badge-normal' };
  }

  getSkillTriggerLabel(skill: HeroSkillDto): string {
    const trigger = (skill.triggerCode || '').toUpperCase();
    switch (trigger) {
      case 'MANUAL_ENERGY_FULL':
        return '100 Năng Lượng';
      case 'ON_ATTACK':
        return 'Mỗi lượt hành động';
      case 'PASSIVE_ALWAYS':
        return 'Bị động vĩnh viễn';
      case 'ON_TURN_START':
        return 'Đầu mỗi lượt';
      case 'ON_TAKE_DAMAGE':
        return 'Khi nhận sát thương';
      case 'ON_KILL':
        return 'Khi hạ gục địch';
      default:
        return trigger || 'Kích hoạt';
    }
  }

  getSkillCostDisplay(skill: HeroSkillDto): string {
    const cost = skill.energyCost !== undefined ? skill.energyCost : (skill.cost || 0);
    if (cost > 0) {
      return `${cost} Năng Lượng`;
    }
    return 'Không tốn N.Lượng';
  }

  getSkillDamageSchoolBadge(skill: HeroSkillDto): { label: string; badgeClass: string } | null {
    let school = '';
    if (skill.effects && skill.effects.length > 0) {
      const dmgEffect = skill.effects.find(e => e.damageSchoolCode);
      if (dmgEffect?.damageSchoolCode) school = dmgEffect.damageSchoolCode;
    }
    if (!school && skill.damageTypeCode) school = skill.damageTypeCode;
    school = (school || '').toUpperCase();
    if (school.includes('MAGIC') || school.includes('PHÉP') || school.includes('PHEP')) {
      return { label: 'Phép Thuật', badgeClass: 'badge-magic' };
    }
    if (school.includes('PHYSICAL') || school.includes('VẬT') || school.includes('VAT')) {
      return { label: 'Vật Lý', badgeClass: 'badge-physical' };
    }
    if (school.includes('TRUE') || school.includes('CHUẨN') || school.includes('CHUAN')) {
      return { label: 'Sát Thương Chuẩn', badgeClass: 'badge-true' };
    }
    return null;
  }

  formatEffectSummary(effect: any): string {
    const parts: string[] = [];
    if (effect.scalings && effect.scalings.length > 0) {
      const scalingStr = effect.scalings.map((s: any) => {
        const pct = Math.round(Number(s.coefficient) * 100);
        const statName = s.attributeTypeName || s.attributeTypeCode;
        const flat = Number(s.flatValue) > 0 ? ` + ${s.flatValue}` : '';
        return `${pct}% ${statName}${flat}`;
      }).join(' + ');
      parts.push(scalingStr);
    } else if (effect.baseValue && Number(effect.baseValue) > 0) {
      parts.push(`${effect.baseValue}`);
    }

    if (effect.statModifiers && effect.statModifiers.length > 0) {
      const modsStr = effect.statModifiers.map((m: any) => {
        const sign = Number(m.value) > 0 ? '+' : '';
        return `${sign}${m.value}% ${m.attributeTypeName || m.attributeTypeCode}`;
      }).join(', ');
      parts.push(modsStr);
    }

    if (effect.durationTurns && effect.durationTurns > 0) {
      parts.push(`trong ${effect.durationTurns} lượt`);
    }

    return parts.join(' ');
  }

  private createDefaultEquipmentSlots(): HeroEquipmentSlot[] {
    return [
      { slot: 'Weapon', displayName: 'Vũ Khí', icon: 'bi-sword', item: null },
      { slot: 'Armor', displayName: 'Giáp', icon: 'bi-suit-armor', item: null },
      { slot: 'Helmet', displayName: 'Mũ', icon: 'bi-shield-fill', item: null },
      { slot: 'Boots', displayName: 'Giày', icon: 'bi-archive', item: null },
      { slot: 'Ring', displayName: 'Nhẫn', icon: 'bi-gem', item: null },
      { slot: 'Artifact', displayName: 'Thần Binh', icon: 'bi-trophy-fill', item: null }
    ];
  }

  constructor(
    private readonly playerHeroService: PlayerHeroService,
    private readonly inventoryService: InventoryService,
    private readonly playerService: PlayerService,
    private readonly tooltipService: EquipmentTooltipService
  ) {}

  ngOnInit(): void {
    this.loadWallet();
    this.loadInventoryEquipments();
    this.loadHeroesList();
  }

  private loadWallet(): void {
    this.playerService.getWallet().subscribe({
      next: response => {
        if (!response?.success || !response.data) return;
        this.gold = response.data.gold;
        this.gems = response.data.diamonds;
        this.materials = response.data.upgradeMaterials;
      },
      error: error => console.warn('Không thể tải ví người chơi.', error)
    });
  }

  loadHeroesList(): void {
    this.playerHeroService.list().subscribe({
      next: response => {
        if (!response?.success || !response.data?.length) {
          return;
        }
        this.heroes = response.data.map(hero => this.mapApiHero(hero));
        if (this.heroes.length > 0) {
          this.selectHero(this.heroes[0]);
        }
      },
      error: error => {
        console.warn('Không thể tải Võ tướng từ API.', error);
        this.triggerToast('Không thể kết nối máy chủ để tải danh sách võ tướng.', 'warning');
      }
    });
  }

  loadInventoryEquipments(): void {
    this.isLoadingInventory = true;
    this.inventoryService.getEquipment('all', false).subscribe({
      next: res => {
        this.isLoadingInventory = false;
        if (res?.success && res.data) {
          this.inventoryEquipments = res.data;
        } else {
          this.inventoryEquipments = [];
        }
      },
      error: err => {
        this.isLoadingInventory = false;
        console.warn('Không thể tải hành trang trang bị từ API.', err);
        this.inventoryEquipments = [];
      }
    });
  }

  private mapApiHero(hero: PlayerHeroDto | PlayerHeroDetailDto): RPGHero {
    const detail = hero as PlayerHeroDetailDto;
    return {
      id: hero.id,
      name: hero.name,
      avatar: hero.avatar || '/assets/images/dcs-game/kiet.png',
      rarity: this.toRarity(hero.rarityId, hero.rarityCode, hero.rarityName),
      level: hero.level,
      stars: hero.stars,
      faction: this.toFaction(hero.factionName),
      class: this.toClass(hero.className),
      power: hero.power,
      exp: hero.exp,
      maxExp: hero.maxExp,
      stats: hero.stats ? {
        hp: hero.stats.hp ?? 0,
        atk: hero.stats.atk ?? 0,
        def: hero.stats.def ?? 0,
        spd: hero.stats.spd ?? 0,
        crit: hero.stats.crit ?? 0,
        critDmg: hero.stats.critDmg ?? 0,
        lifesteal: hero.stats.lifesteal ?? 0,
        accuracy: hero.stats.accuracy ?? 0,
        resistance: hero.stats.resistance ?? 0,
        magicDamage: hero.stats.magicDamage ?? 0,
        magicResistance: hero.stats.magicResistance ?? 0
      } : {
        hp: 0, atk: 0, def: 0, spd: 0, crit: 0, critDmg: 0, lifesteal: 0, accuracy: 0, resistance: 0, magicDamage: 0, magicResistance: 0
      },
      statBreakdowns: detail.statBreakdowns || [],
      skills: (hero.skills || []).map(s => ({
        id: s.id,
        name: s.name,
        imagePath: s.imagePath,
        icon: s.icon || 'bi-lightning-charge-fill',
        description: s.description || 'Chưa có mô tả kỹ năng.',
        skillTypeCode: s.skillTypeCode || (s.cooldown === 'Bị động' ? 'PASSIVE' : ((s.cost ?? 0) > 0 ? 'ENERGY' : 'NORMAL')),
        triggerCode: s.triggerCode || (s.cooldown === 'Bị động' ? 'PASSIVE_ALWAYS' : ((s.cost ?? 0) > 0 ? 'MANUAL_ENERGY_FULL' : 'ON_ATTACK')),
        energyCost: s.energyCost !== undefined ? s.energyCost : (s.cost || 0),
        displayOrder: s.displayOrder || 1,
        effects: s.effects || [],
        cost: s.cost,
        costTypeCode: s.costTypeCode,
        costTypeName: s.costTypeName,
        categoryCode: s.categoryCode,
        categoryName: s.categoryName,
        damageTypeCode: s.damageTypeCode,
        damageTypeName: s.damageTypeName,
        effectTypeCode: s.effectTypeCode,
        effectTypeName: s.effectTypeName,
        isDebuff: s.isDebuff,
        targetType: s.targetType || 'Đơn thể',
        cooldown: s.cooldown || '0s'
      })),
      locked: hero.isLocked,
      favorite: hero.isFavorite,
      auraTier: (Math.min(4, Math.max(1, hero.auraTier || 1))) as 1 | 2 | 3 | 4
    };
  }

  mapToHero(hero: RPGHero): Hero {
    return {
      id: hero.id,
      name: hero.name,
      avatar: hero.avatar,
      hp: hero.stats.hp,
      maxHp: hero.stats.hp,
      mana: 100,
      maxMana: 100,
      attack: Math.round(hero.power / 100),
      defense: hero.stats.def,
      speed: hero.stats.spd,
      magicDamage: hero.stats.magicDamage,
      magicResistance: hero.stats.magicResistance,
      position: 1,
      team: 'left',
      statusEffects: [],
      stars: hero.stars || 1,
      auraTier: hero.auraTier
    };
  }

  getItemStatEntries(stats: any): { key: string; label: string; value: string }[] {
    if (!stats) return [];
    const entries: { key: string; label: string; value: string }[] = [];
    const seen = new Set<string>();

    const mapping: { [canonical: string]: { label: string; isPercent: boolean; keys: string[] } } = {
      MAGIC_DAMAGE: { label: 'Sát thương phép', isPercent: false, keys: ['MAGIC_DAMAGE', 'magicDamage', 'MAGIC_ATK', 'MATK', 'magic_atk'] },
      MAGIC_RESISTANCE: { label: 'Kháng phép', isPercent: false, keys: ['MAGIC_RESISTANCE', 'magicResistance', 'MAGIC_RESIST', 'MRES', 'magic_resist'] },
      HP: { label: 'Máu (HP)', isPercent: false, keys: ['HP', 'hp', 'HEALTH', 'health'] },
      ATK: { label: 'Công (ATK)', isPercent: false, keys: ['ATK', 'atk', 'PHYSICAL_ATK', 'physical_atk'] },
      DEF: { label: 'Thủ (DEF)', isPercent: false, keys: ['DEF', 'def', 'ARMOR', 'armor'] },
      SPD: { label: 'Tốc độ (SPD)', isPercent: false, keys: ['SPD', 'spd', 'SPEED', 'speed'] },
      CRIT_RATE: { label: 'Bạo kích', isPercent: true, keys: ['CRIT_RATE', 'crit', 'CRIT', 'crit_rate'] },
      CRIT_DAMAGE: { label: 'Sát thương bạo', isPercent: true, keys: ['CRIT_DAMAGE', 'critDmg', 'crit_damage'] },
      LIFESTEAL: { label: 'Hút máu', isPercent: true, keys: ['LIFESTEAL', 'lifesteal'] },
      ACCURACY: { label: 'Chính xác', isPercent: true, keys: ['ACCURACY', 'accuracy'] },
      RESISTANCE: { label: 'Kháng hiệu ứng', isPercent: true, keys: ['RESISTANCE', 'resistance', 'CRIT_RESIST', 'EFFECT_RESIST'] }
    };

    for (const [canon, conf] of Object.entries(mapping)) {
      for (const k of conf.keys) {
        if (stats[k] !== undefined && stats[k] !== null && stats[k] !== '') {
          const num = Number(stats[k]);
          if (!isNaN(num) && num > 0 && !seen.has(canon)) {
            seen.add(canon);
            entries.push({
              key: canon,
              label: conf.label,
              value: conf.isPercent ? (num <= 1.0 ? `+${(num * 100).toFixed(1).replace(/\\.0$/, '')}%` : `+${num}%`) : `+${num}`
            });
            break;
          }
        }
      }
    }

    for (const [k, v] of Object.entries(stats)) {
      const isMapped = Object.values(mapping).some(conf => conf.keys.some(ck => ck.toLowerCase() === k.toLowerCase()));
      if (!isMapped && v !== undefined && v !== null && v !== '') {
        const num = Number(v);
        if (!isNaN(num) && num > 0) {
          entries.push({
            key: k,
            label: k,
            value: `+${num}`
          });
        }
      }
    }

    return entries;
  }

  private toRarity(rarityId: number, rarityCode?: string, rarityName?: string): RPGHero['rarity'] {
    // HRK_Rarities currently uses 2 = Rare, 3 = Epic, 4 = Legendary.
    // Code/name fallback keeps the UI correct if seed IDs differ by environment.
    if (rarityId === 2) return 'Rare';
    if (rarityId === 3) return 'Epic';
    if (rarityId === 4) return 'Legendary';

    const value = `${rarityCode ?? ''} ${rarityName ?? ''}`.toUpperCase();
    if (value.includes('RARE') || value.includes('HIẾM') || value.includes('HIEM')) return 'Rare';
    if (value.includes('EPIC') || value.includes('SỬ THI') || value.includes('SU THI')) return 'Epic';
    return 'Legendary';
  }

  private toFaction(value: string): RPGHero['faction'] {
    return ['Thục', 'Ngụy', 'Ngô', 'Quần'].includes(value) ? (value as RPGHero['faction']) : 'Quần';
  }

  private toClass(value: string): RPGHero['class'] {
    return ['Đỡ Đòn', 'Chiến Sĩ', 'Sát Thủ', 'Pháp Sư', 'Hỗ Trợ'].includes(value)
      ? (value as RPGHero['class'])
      : 'Chiến Sĩ';
  }

  // Toast System
  triggerToast(message: string, type: 'success' | 'warning' | 'info' = 'success'): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    this.toastTimer = setTimeout(() => {
      this.showToast = false;
    }, 2800);
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

  // Hero Selection & Detail Fetching
  selectHero(hero: RPGHero): void {
    this.selectedHero = hero;
    this.isLoadingHeroDetail = true;

    this.playerHeroService.detail(hero.id).pipe(
      catchError(err => {
        console.warn(`Không thể tải chi tiết võ tướng ${hero.id}.`, err);
        return of(null);
      })
    ).subscribe({
      next: res => {
        this.isLoadingHeroDetail = false;
        if (res?.success && res.data) {
          const mappedHero = this.mapApiHero(res.data);
          const index = this.heroes.findIndex(item => item.id === mappedHero.id);
          if (index >= 0) this.heroes[index] = mappedHero;
          this.selectedHero = mappedHero;
          this.applyEquipmentData(res.data.equipment);
          this.loadUpgradePreview(mappedHero.id);
        } else {
          this.applyEquipmentData(null);
        }
      },
      error: () => {
        this.isLoadingHeroDetail = false;
        this.applyEquipmentData(null);
        this.triggerToast('Không thể tải chi tiết võ tướng.', 'warning');
      }
    });
  }

  private loadUpgradePreview(heroId: number): void {
    this.playerHeroService.getUpgradePreview(heroId).subscribe({
      next: response => this.upgradePreview = response?.success && response.data ? response.data : null,
      error: () => this.upgradePreview = null
    });
  }

  upgradeHero(levels: number): void {
    if (this.isUpgradingHero || !this.selectedHero) return;
    this.isUpgradingHero = true;
    this.playerHeroService.upgrade(this.selectedHero.id, levels).subscribe({
      next: response => {
        this.isUpgradingHero = false;
        if (!response?.success || !response.data) {
          this.triggerToast(response?.message || 'Nâng cấp thất bại.', 'warning');
          return;
        }
        const updated = this.mapApiHero(response.data);
        const index = this.heroes.findIndex(x => x.id === updated.id);
        if (index >= 0) this.heroes[index] = updated;
        this.selectedHero = updated;
        this.applyEquipmentData(response.data.equipment);
        this.loadWallet();
        this.loadUpgradePreview(updated.id);
        this.triggerToast(`Nâng ${levels} cấp cho ${updated.name} thành công.`, 'success');
      },
      error: error => {
        this.isUpgradingHero = false;
        this.triggerToast(error?.error?.message || 'Không thể nâng cấp võ tướng.', 'warning');
      }
    });
  }

  private applyEquipmentData(equipment: HeroEquipmentDto | null | undefined): void {
    const slots = this.createDefaultEquipmentSlots();
    if (equipment) {
      slots[0].item = equipment.weapon ?? null;
      slots[1].item = equipment.armor ?? null;
      slots[2].item = equipment.helmet ?? null;
      slots[3].item = equipment.boots ?? null;
      slots[4].item = equipment.ring ?? null;
      slots[5].item = equipment.artifact ?? null;
    }
    this.equipmentSlots = slots;
  }

  onAvatarError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = '/assets/images/dcs-game/kiet.png';
    }
  }

  // Equip Gear from Inventory (Real API Transaction)
  equipGearFromInventory(item: InventoryItemDto): void {
    if (this.isProcessingEquipment || this.equippingItemId !== null) return;
    if (!this.selectedHero) return;

    this.isProcessingEquipment = true;
    this.equippingItemId = item.id;

    this.playerHeroService.equip(this.selectedHero.id, item.id).pipe(
      finalize(() => {
        this.isProcessingEquipment = false;
        this.equippingItemId = null;
      })
    ).subscribe({
      next: res => {
        if (res?.success && res.data) {
          const mappedHero = this.mapApiHero(res.data);
          const index = this.heroes.findIndex(h => h.id === mappedHero.id);
          if (index >= 0) this.heroes[index] = mappedHero;
          this.selectedHero = mappedHero;
          this.applyEquipmentData(res.data.equipment);

          // Update inventory unequipped list
          this.loadInventoryEquipments();
          this.triggerToast(`Mặc thành công ${item.name} cho ${this.selectedHero.name}!`, 'success');
        } else {
          this.triggerToast(res?.message || 'Không thể mặc trang bị.', 'warning');
        }
      },
      error: err => {
        this.triggerToast(err?.message || 'Lỗi khi mặc trang bị.', 'warning');
      }
    });
  }

  // Slot Click: If has item, open action dialog to unequip
  onSlotClick(slot: HeroEquipmentSlot): void {
    if (!slot.item) {
      this.triggerToast(`Ô ${slot.displayName}: Chưa trang bị.`, 'info');
      return;
    }
    this.selectedSlotForAction = slot;
    this.showSlotActionModal = true;
  }

  closeSlotActionModal(): void {
    this.showSlotActionModal = false;
    this.selectedSlotForAction = null;
  }

  // Unequip Gear from Slot (Real API Transaction)
  unequipCurrentSlot(): void {
    if (this.isProcessingEquipment || !this.selectedSlotForAction || !this.selectedSlotForAction.item) return;

    const slotCodeMapping: Record<EquipmentSlot, string> = {
      'Weapon': 'WEAPON',
      'Armor': 'ARMOR',
      'Helmet': 'HELMET',
      'Boots': 'BOOTS',
      'Ring': 'RING',
      'Artifact': 'ARTIFACT'
    };

    const slotCode = slotCodeMapping[this.selectedSlotForAction.slot];
    const itemName = this.selectedSlotForAction.item.name;
    this.isProcessingEquipment = true;
    this.unequippingSlotKey = slotCode;

    this.playerHeroService.unequip(this.selectedHero.id, slotCode).pipe(
      finalize(() => {
        this.isProcessingEquipment = false;
        this.unequippingSlotKey = null;
      })
    ).subscribe({
      next: res => {
        this.showSlotActionModal = false;
        this.selectedSlotForAction = null;

        if (res?.success && res.data) {
          const mappedHero = this.mapApiHero(res.data);
          const index = this.heroes.findIndex(h => h.id === mappedHero.id);
          if (index >= 0) this.heroes[index] = mappedHero;
          this.selectedHero = mappedHero;
          this.applyEquipmentData(res.data.equipment);

          this.loadInventoryEquipments();
          this.triggerToast(`Đã tháo ${itemName} khỏi ${this.selectedHero.name}!`, 'info');
        } else {
          this.triggerToast(res?.message || 'Không thể tháo trang bị.', 'warning');
        }
      },
      error: err => {
        this.triggerToast(err?.message || 'Lỗi khi tháo trang bị.', 'warning');
      }
    });
  }

  getEquippedItemForCategory(categoryCode: string): InventoryItemDto | null {
    if (!this.equipmentSlots) return null;
    const cat = (categoryCode || '').toLowerCase();
    const map: Record<string, EquipmentSlot> = {
      weapon: 'Weapon', weapons: 'Weapon',
      armor: 'Armor',
      helmet: 'Helmet', helmets: 'Helmet',
      boots: 'Boots', boot: 'Boots',
      ring: 'Ring', rings: 'Ring',
      artifact: 'Artifact', artifacts: 'Artifact'
    };
    const slotType = map[cat];
    if (!slotType) return null;
    const found = this.equipmentSlots.find(s => s.slot === slotType);
    return found?.item || null;
  }

  onSlotMouseEnter(event: MouseEvent, slot: HeroEquipmentSlot): void {
    if (slot.item) {
      this.tooltipService.show(event, slot.item);
    }
  }

  onSlotMouseLeave(): void {
    this.tooltipService.hide();
  }

  onInventoryEquipMouseEnter(event: MouseEvent, item: InventoryItemDto): void {
    const currentlyEquipped = this.getEquippedItemForCategory(item.categoryCode);
    this.tooltipService.show(event, item, currentlyEquipped);
  }

  // Tooltip Interaction for Mobile Click/Tap & Accessibility
  toggleStatTooltip(code: string): void {
    if (this.activeTooltipCode === code) {
      this.activeTooltipCode = null;
    } else {
      this.activeTooltipCode = code;
    }
  }

  closeTooltip(): void {
    this.activeTooltipCode = null;
  }

  // Lock and Favorite Flags
  toggleLock(): void {
    const next = !this.selectedHero.locked;
    this.playerHeroService.updateFlags(this.selectedHero.id, { isLocked: next }).subscribe({
      next: response => {
        if (!response?.success || !response.data) return;
        this.selectedHero.locked = response.data.isLocked;
        this.triggerToast(
          `${this.selectedHero.locked ? 'Khóa' : 'Mở khóa'} võ tướng ${this.selectedHero.name} thành công!`,
          'info'
        );
      },
      error: () => this.triggerToast('Không thể cập nhật trạng thái khóa.', 'warning')
    });
  }

  toggleFavorite(): void {
    const next = !this.selectedHero.favorite;
    this.playerHeroService.updateFlags(this.selectedHero.id, { isFavorite: next }).subscribe({
      next: response => {
        if (!response?.success || !response.data) return;
        this.selectedHero.favorite = response.data.isFavorite;
        this.triggerToast(
          `${this.selectedHero.favorite ? 'Đã thêm vào yêu thích' : 'Đã bỏ yêu thích'} võ tướng ${this.selectedHero.name}!`,
          'info'
        );
      },
      error: () => this.triggerToast('Không thể cập nhật trạng thái yêu thích.', 'warning')
    });
  }

  // Growth Operations
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

    this.selectedHero.stats.hp += Math.floor(Math.random() * 150) + 100;
    this.selectedHero.stats.atk += Math.floor(Math.random() * 25) + 15;
    this.selectedHero.stats.def += Math.floor(Math.random() * 15) + 8;
    this.selectedHero.stats.spd += Math.floor(Math.random() * 2) + 1;

    this.selectedHero.exp = 0;
    this.selectedHero.maxExp = this.selectedHero.level * 100 + 400;

    this.triggerToast(
      `Nâng cấp ${this.selectedHero.name} lên cấp ${this.selectedHero.level}!`,
      'success'
    );
  }

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
      totalPowerGained += this.selectedHero.power - prevPower;

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
      this.triggerToast(
        `Đột phá nhanh ${upgradeCount} cấp! Cấp hiện tại: ${this.selectedHero.level}. Lực chiến +${totalPowerGained}!`,
        'success'
      );
    }
  }

  setAuraTier(tier: 1 | 2 | 3 | 4): void {
    this.selectedHero.auraTier = tier;
    let tierName = '';
    if (tier === 1) tierName = 'Hào Quang Xanh Băng';
    if (tier === 2) tierName = 'Hào Quang Tím U Hồn';
    if (tier === 3) tierName = 'Hào Quang Kim Hoàng Kim';
    if (tier === 4) tierName = 'Lôi Quang Xích Thần (Sét Đỏ)';

    this.triggerToast(`Đã thức tỉnh Aura cấp ${tier}: ${tierName}!`, 'success');
  }

  // Drag and Drop
  onInventoryDragStart(event: DragEvent, item: InventoryItemDto, index: number): void {
    this.draggedItem = item;
    this.draggedItemIndex = index;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', JSON.stringify({ item, index }));
    }
  }

  onEquipmentDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onEquipmentDrop(event: DragEvent, slotIndex: number): void {
    event.preventDefault();
    if (!this.draggedItem) return;

    const targetSlot = this.equipmentSlots[slotIndex];
    const categoryMapping: Record<EquipmentSlot, string> = {
      'Weapon': 'WEAPON',
      'Armor': 'ARMOR',
      'Helmet': 'HELMET',
      'Boots': 'BOOTS',
      'Ring': 'RING',
      'Artifact': 'ARTIFACT'
    };

    const expectedCode = categoryMapping[targetSlot.slot];
    if ((this.draggedItem.categoryCode || '').toUpperCase() !== expectedCode) {
      this.triggerToast(`Trang bị không phù hợp! Ô này cần: ${targetSlot.displayName}`, 'warning');
      this.draggedItem = null;
      this.draggedItemIndex = null;
      return;
    }

    this.equipGearFromInventory(this.draggedItem);
    this.draggedItem = null;
    this.draggedItemIndex = null;
  }
}
