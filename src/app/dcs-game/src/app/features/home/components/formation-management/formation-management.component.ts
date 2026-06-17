import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Hero } from '../../../../core/models/hero.model';
import { BattleCharacterComponent } from '../../../battle/components/battle-character/battle-character.component';

interface RPGHero {
  id: number;
  name: string;
  avatar: string;
  level: number;
  stars: number;
  class: 'Đỡ Đòn' | 'Chiến Sĩ' | 'Sát Thủ' | 'Pháp Sư' | 'Hỗ Trợ';
  faction: 'Thục' | 'Ngụy' | 'Ngô' | 'Quần';
  power: number;
  auraColor: string;
  avatarColor: string;
}

@Component({
  selector: 'app-formation-management',
  standalone: true,
  imports: [CommonModule, FormsModule, BattleCharacterComponent],
  templateUrl: './formation-management.component.html',
  styleUrl: './formation-management.component.scss'
})
export class FormationManagementComponent implements OnInit {
  @Output() close = new EventEmitter<void>();

  // Resources
  gold = 650000;
  scrolls = 85;

  // Active Toast notifications
  toastMessage = '';
  toastType: 'success' | 'warning' | 'info' = 'info';
  showToast = false;

  // Formation Metadata
  formationName = 'Binh Pháp Lục Đồ (Standard Lineup)';
  formationType = 'Trận Hình Lục Ô (6-Slot Grid)';
  formationLevel = 1;

  // Visual Statistics
  totalPower = 0;
  averageLevel = 0;
  frontlineCount = 0;
  backlineCount = 0;

  // Team bonuses
  atkBonus = 0;
  defBonus = 0;
  hpBonus = 0;
  spdBonus = 0;

  // Available Heroes List (using real mock avatar paths)
  heroes: RPGHero[] = [
    { id: 101, name: 'K Cởi Trần', avatar: '/assets/images/dcs-game/kiet.png', level: 35, stars: 5, class: 'Chiến Sĩ', faction: 'Thục', power: 12800, auraColor: '#ef4444', avatarColor: '#bf9c62' },
    { id: 102, name: 'Nam Deadline', avatar: '/assets/images/dcs-game/trg-kiet-covid.png', level: 28, stars: 4, class: 'Sát Thủ', faction: 'Ngụy', power: 9400, auraColor: '#c084fc', avatarColor: '#3b82f6' },
    { id: 103, name: 'Long Bug Hunter', avatar: '/assets/images/dcs-game/tuonglong-quandoi.png', level: 30, stars: 5, class: 'Đỡ Đòn', faction: 'Ngô', power: 11000, auraColor: '#3b82f6', avatarColor: '#10b981' },
    { id: 104, name: 'Huy Debugger', avatar: '/assets/images/dcs-game/vantrong-hs.png', level: 25, stars: 4, class: 'Pháp Sư', faction: 'Thục', power: 8900, auraColor: '#60a5fa', avatarColor: '#eab308' },
    { id: 105, name: 'Phúc DevOps', avatar: '/assets/images/dcs-game/ricardo-milos.png', level: 32, stars: 5, class: 'Hỗ Trợ', faction: 'Quần', power: 12100, auraColor: '#10b981', avatarColor: '#6b7280' }
  ];

  // 6 Formation slots (Prefilled 5 slots, Slot 6 is empty)
  slots: (RPGHero | null)[] = [null, null, null, null, null, null];

  // Drag-and-drop state variables
  draggedHero: RPGHero | null = null;
  dragSource: 'pool' | 'grid' | null = null;
  draggedSlotIndex: number | null = null;

  // Click-to-place fallback state
  selectedPoolHero: RPGHero | null = null;

  // Live synergies list
  synergies = [
    { name: 'Hộ Vệ Tiền Tuyến (Tank DEF)', desc: 'Đặt Đỡ Đòn ở Hàng Trước: Tăng 10% Phòng Thủ (DEF).', active: false },
    { name: 'Thiên Thu Hậu Phương (Mage DMG)', desc: 'Đặt Pháp Sư ở Hàng Sau: Tăng 10% Sát thương kỹ năng.', active: false },
    { name: 'Sát Thủ Tập Kích (Assassin CRIT)', desc: 'Đặt Sát Thủ ở Hàng Sau: Tăng 15% Chí Mạng (CRIT).', active: false }
  ];

  mapToHero(rpgHero: RPGHero | null, slotIndex: number): Hero | null {
    if (!rpgHero) return null;
    return {
      id: rpgHero.id,
      name: rpgHero.name,
      avatar: rpgHero.avatar,
      hp: 1000,
      maxHp: 1000,
      mana: 50,
      maxMana: 100,
      attack: rpgHero.power / 100,
      defense: 50,
      speed: 100,
      position: slotIndex + 1,
      team: 'left',
      statusEffects: rpgHero.id === 101 ? ['Sixpack Glow', 'Red Lightning'] : 
                     rpgHero.id === 102 ? ['Overtime'] : 
                     rpgHero.id === 103 ? ['Shield'] : []
    };
  }

  ngOnInit(): void {
    // Fill slots immediately on load:
    this.slots[0] = this.heroes[0]; // K Cởi Trần in Slot 1
    this.slots[1] = this.heroes[1]; // Nam Deadline in Slot 2
    this.slots[2] = this.heroes[2]; // Long Bug Hunter in Slot 3
    this.slots[3] = this.heroes[3]; // Huy Debugger in Slot 4
    this.slots[4] = this.heroes[4]; // Phúc DevOps in Slot 5
    this.slots[5] = null;            // Slot 6 is Empty

    this.recalculateStats();
  }

  // Recalculates stats based on heroes currently in frontline/backline slots
  recalculateStats(): void {
    let powerSum = 0;
    let levelSum = 0;
    let placedCount = 0;
    let front = 0;
    let back = 0;

    let atk = 0;
    let def = 0;
    let hp = 0;
    let spd = 0;

    this.slots.forEach((hero, idx) => {
      if (hero) {
        powerSum += hero.power;
        levelSum += hero.level;
        placedCount++;

        // Frontline (indices 0, 1, 2)
        if (idx < 3) {
          front++;
        } else {
          // Backline (indices 3, 4, 5)
          back++;
        }

        // Core class stat contributions
        if (hero.class === 'Đỡ Đòn') {
          def += 4;
          hp += 3;
        } else if (hero.class === 'Chiến Sĩ') {
          atk += 3;
          hp += 2;
        } else if (hero.class === 'Sát Thủ') {
          atk += 5;
          spd += 1;
        } else if (hero.class === 'Pháp Sư') {
          atk += 4;
          spd += 2;
        } else if (hero.class === 'Hỗ Trợ') {
          hp += 3;
          def += 3;
        }
      }
    });

    // Apply upgrade level multiplier
    const multiplier = 1 + (this.formationLevel - 1) * 0.1;
    this.atkBonus = Math.round(atk * multiplier);
    this.defBonus = Math.round(def * multiplier);
    this.hpBonus = Math.round(hp * multiplier);
    this.spdBonus = Math.round(spd * multiplier);

    this.totalPower = powerSum;
    this.averageLevel = placedCount > 0 ? Math.round(levelSum / placedCount) : 0;
    this.frontlineCount = front;
    this.backlineCount = back;

    this.updateSynergies();
  }

  // Toast notifier
  triggerToast(message: string, type: 'success' | 'warning' | 'info' = 'success'): void {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    setTimeout(() => {
      this.showToast = false;
    }, 2500);
  }

  // HTML5 Drag handlers
  onDragStart(event: DragEvent, hero: RPGHero, source: 'pool' | 'grid', slotIdx?: number): void {
    this.draggedHero = hero;
    this.dragSource = source;
    if (source === 'grid' && slotIdx !== undefined) {
      this.draggedSlotIndex = slotIdx;
    }
    
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', hero.id.toString());
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onDrop(event: DragEvent, slotIndex: number): void {
    event.preventDefault();
    if (!this.draggedHero) return;

    const targetHero = this.slots[slotIndex];

    if (this.dragSource === 'pool') {
      // Placing from pool to slot
      const alreadyPlacedIndex = this.slots.findIndex(h => h?.id === this.draggedHero?.id);
      if (alreadyPlacedIndex !== -1) {
        this.slots[alreadyPlacedIndex] = null;
      }
      this.slots[slotIndex] = this.draggedHero;
      this.triggerToast(`Triển khai ${this.draggedHero.name} vào Vị trí ${slotIndex + 1}!`, 'success');
    } else if (this.dragSource === 'grid' && this.draggedSlotIndex !== null) {
      // Swapping slots in the grid
      this.slots[this.draggedSlotIndex] = targetHero;
      this.slots[slotIndex] = this.draggedHero;
      this.triggerToast('Hoán đổi vị trí đội hình thành công!', 'success');
    }

    // Reset variables
    this.draggedHero = null;
    this.dragSource = null;
    this.draggedSlotIndex = null;
    this.selectedPoolHero = null;

    this.recalculateStats();
  }

  // Click Fallback selectors
  selectPoolHeroClick(hero: RPGHero): void {
    const alreadyIdx = this.slots.findIndex(h => h?.id === hero.id);
    if (alreadyIdx !== -1) {
      this.slots[alreadyIdx] = null;
      this.recalculateStats();
      this.triggerToast(`Đã rút ${hero.name} khỏi trận hình.`, 'info');
      return;
    }

    this.selectedPoolHero = hero;
    this.triggerToast(`Đã chọn ${hero.name}. Hãy click chọn một ô trống trên bảng trận hình.`, 'info');
  }

  selectSlotClick(slotIndex: number): void {
    if (this.selectedPoolHero) {
      const prevIdx = this.slots.findIndex(h => h?.id === this.selectedPoolHero?.id);
      if (prevIdx !== -1) this.slots[prevIdx] = null;

      this.slots[slotIndex] = this.selectedPoolHero;
      this.selectedPoolHero = null;
      this.recalculateStats();
      this.triggerToast('Bố trí võ tướng thành công!', 'success');
    } else if (this.slots[slotIndex]) {
      const removedHero = this.slots[slotIndex];
      this.slots[slotIndex] = null;
      this.recalculateStats();
      if (removedHero) {
        this.triggerToast(`Đã rút ${removedHero.name} khỏi trận hình.`, 'info');
      }
    }
  }

  removeHeroFromSlot(slotIndex: number): void {
    const removedHero = this.slots[slotIndex];
    this.slots[slotIndex] = null;
    this.recalculateStats();
    if (removedHero) {
      this.triggerToast(`Đã rút ${removedHero.name} khỏi trận hình!`, 'info');
    }
  }

  isHeroPlaced(hero: RPGHero): boolean {
    return this.slots.some(h => h?.id === hero.id);
  }

  // Auto Arrange: smart tactical placement
  autoArrange(): void {
    this.clearFormation();
    // Sort pool by power
    const sorted = [...this.heroes].sort((a, b) => b.power - a.power);
    
    // Distribute: Tanks and Warriors in frontline slots (indices 0, 1, 2)
    // Mages, supports, assassins in backline slots (indices 3, 4, 5)
    let frontIdx = 0;
    let backIdx = 3;

    sorted.forEach(hero => {
      if ((hero.class === 'Đỡ Đòn' || hero.class === 'Chiến Sĩ') && frontIdx < 3) {
        this.slots[frontIdx++] = hero;
      } else if (backIdx < 6) {
        this.slots[backIdx++] = hero;
      } else if (frontIdx < 3) {
        // Fallback to front
        this.slots[frontIdx++] = hero;
      }
    });

    this.recalculateStats();
    this.triggerToast('Tự động bày trận chiến đấu hoàn tất!', 'success');
  }

  clearFormation(): void {
    this.slots = [null, null, null, null, null, null];
    this.recalculateStats();
    this.triggerToast('Đã dọn dẹp trống trận hình!', 'info');
  }

  saveFormation(): void {
    this.triggerToast('Lưu trận hình chiến thuật thành công!', 'success');
  }

  // Upgrade Level system
  upgradeFormation(): void {
    if (this.formationLevel >= 5) {
      this.triggerToast('Trận hình đã đạt cấp độ tối đa (Level 5)!', 'warning');
      return;
    }

    const scrollsCost = this.formationLevel * 15;
    const goldCost = this.formationLevel * 20000;

    if (this.gold < goldCost) {
      this.triggerToast('Không đủ Vàng để nâng cấp trận pháp!', 'warning');
      return;
    }

    if (this.scrolls < scrollsCost) {
      this.triggerToast('Không đủ Kinh Thư để nâng cấp trận pháp!', 'warning');
      return;
    }

    this.gold -= goldCost;
    this.scrolls -= scrollsCost;
    this.formationLevel += 1;

    this.recalculateStats();
    this.triggerToast(`Nâng cấp trận hình lên Cấp ${this.formationLevel}! Mức gia tốc thuộc tính +10%`, 'success');
  }

  // Position buffs synergy check
  updateSynergies(): void {
    // 1. Tank in Frontline (indices 0, 1, 2)
    let tankFront = false;
    for (let i = 0; i < 3; i++) {
      if (this.slots[i]?.class === 'Đỡ Đòn') {
        tankFront = true;
        break;
      }
    }
    this.synergies[0].active = tankFront;

    // 2. Mage in Backline (indices 3, 4, 5)
    let mageBack = false;
    for (let i = 3; i < 6; i++) {
      if (this.slots[i]?.class === 'Pháp Sư') {
        mageBack = true;
        break;
      }
    }
    this.synergies[1].active = mageBack;

    // 3. Assassin in Backline (indices 3, 4, 5)
    let assassinBack = false;
    for (let i = 3; i < 6; i++) {
      if (this.slots[i]?.class === 'Sát Thủ') {
        assassinBack = true;
        break;
      }
    }
    this.synergies[2].active = assassinBack;
  }

  onActionClick(actionName: string): void {
    this.triggerToast(`Tính năng "${actionName}" sẽ sớm ra mắt ở phiên bản tiếp theo!`, 'info');
  }
}
