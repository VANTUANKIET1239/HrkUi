import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventoryItemDto } from '../../../../core/models/inventory.model';
import {
  EnhanceEquipmentRequest,
  EnhanceEquipmentResult,
  EnhancementConfigResponse,
  EnhancementLevelConfig,
  EnhancementMaterialConfig
} from '../../../../core/models/enhancement.model';
import { EnhancementService } from '../../../../core/services/enhancement.service';
import { InventoryService } from '../../../../core/services/inventory.service';
import { PlayerService } from '../../../../core/services/player.service';

export interface StoneInventorySlot extends InventoryItemDto {
  bonus: number;
}

export interface CharmInventorySlot extends InventoryItemDto {
  bonus: number;
  preventsDrop: boolean;
}

@Component({
  selector: 'app-forge',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './forge.component.html',
  styleUrl: './forge.component.scss'
})
export class ForgeComponent implements OnInit {
  @Input() preselectedItemId?: number;
  @Output() close = new EventEmitter<void>();
  @Output() itemUpdated = new EventEmitter<InventoryItemDto>();

  activeTab: 'enhance' | 'star' = 'enhance';

  isLoading = true;
  isForging = false;
  showEquipmentSelector = false;
  showStonePicker = false;
  pickingStoneSlotIndex = -1;
  showCharmPicker = false;
  showResultModal = false;

  levelConfigs: EnhancementLevelConfig[] = [];
  materialConfigs: EnhancementMaterialConfig[] = [];

  allEquipments: InventoryItemDto[] = [];
  selectedEquipment: InventoryItemDto | null = null;

  playerGold = 0;
  playerStones: StoneInventorySlot[] = [];
  playerCharms: CharmInventorySlot[] = [];

  selectedStones: (StoneInventorySlot | null)[] = [null, null, null];
  selectedCharm: CharmInventorySlot | null = null;

  lastResult: EnhanceEquipmentResult | null = null;
  errorMessage = '';

  constructor(
    private enhancementService: EnhancementService,
    private inventoryService: InventoryService,
    private playerService: PlayerService
  ) {}

  ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData(): void {
    this.isLoading = true;

    // 1. Load Player Wallet
    this.playerService.getWallet().subscribe({
      next: (res) => {
        if (res?.success && res.data) {
          this.playerGold = res.data.gold ?? 0;
        }
      },
      error: (err) => console.warn('Could not load wallet in Forge:', err)
    });

    // 2. Load Enhancement Configs & Materials Metadata
    this.enhancementService.getEnhancementConfigs().subscribe({
      next: (res) => {
        if (res?.success && res.data) {
          this.levelConfigs = res.data.levelConfigs || [];
          this.materialConfigs = res.data.materials || [];
          this.loadInventoryData();
        } else {
          this.isLoading = false;
        }
      },
      error: (err) => {
        console.error('Failed to load enhancement configs:', err);
        this.isLoading = false;
      }
    });
  }

  loadInventoryData(): void {
    this.inventoryService.getInventory().subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res?.success && res.data) {
          const items = res.data;

          // Filter equipments (WEAPON, ARMOR, HELMET, BOOTS, RING, ARTIFACT)
          this.allEquipments = items.filter((i) => i.isEquipment);

          // Map stones
          const stoneMap = new Map<number, EnhancementMaterialConfig>();
          const charmMap = new Map<number, EnhancementMaterialConfig>();

          this.materialConfigs.forEach((m) => {
            if (m.materialType === 'STONE') {
              stoneMap.set(m.itemTemplateId, m);
            } else if (m.materialType === 'CHARM') {
              charmMap.set(m.itemTemplateId, m);
            }
          });

          this.playerStones = items
            .filter((i) => stoneMap.has(i.itemTemplateId) && i.count > 0)
            .map((i) => {
              const cfg = stoneMap.get(i.itemTemplateId)!;
              return { ...i, bonus: cfg.successRateBonus };
            })
            .sort((a, b) => b.bonus - a.bonus);

          this.playerCharms = items
            .filter((i) => charmMap.has(i.itemTemplateId) && i.count > 0)
            .map((i) => {
              const cfg = charmMap.get(i.itemTemplateId)!;
              return {
                ...i,
                bonus: cfg.successRateBonus,
                preventsDrop: cfg.preventLevelDrop
              };
            });

          // Preselect equipment if requested
          if (this.preselectedItemId) {
            const found = this.allEquipments.find((e) => e.id === this.preselectedItemId);
            if (found) {
              this.selectEquipment(found);
            }
          } else if (this.allEquipments.length > 0) {
            // Default to first equipment or leave empty
            this.selectEquipment(this.allEquipments[0]);
          }
        }
      },
      error: (err) => {
        console.error('Failed to load inventory in Forge:', err);
        this.isLoading = false;
      }
    });
  }

  selectEquipment(item: InventoryItemDto): void {
    this.selectedEquipment = item;
    this.showEquipmentSelector = false;
    this.errorMessage = '';
  }

  // --- Calculations ---

  get currentLevel(): number {
    return this.selectedEquipment?.enhancement ?? 0;
  }

  get isMaxLevel(): boolean {
    return this.currentLevel >= 15;
  }

  get currentConfig(): EnhancementLevelConfig | undefined {
    return this.levelConfigs.find((c) => c.currentLevel === this.currentLevel);
  }

  get baseSuccessRate(): number {
    return this.currentConfig?.baseSuccessRate ?? 0;
  }

  get totalStoneBonus(): number {
    return this.selectedStones.reduce((sum, stone) => sum + (stone ? stone.bonus : 0), 0);
  }

  get charmBonus(): number {
    return this.selectedCharm?.bonus ?? 0;
  }

  get finalSuccessRate(): number {
    return Math.min(1.0, this.baseSuccessRate + this.totalStoneBonus + this.charmBonus);
  }

  get goldCost(): number {
    return this.currentConfig?.goldCost ?? 0;
  }

  get hasEnoughGold(): boolean {
    return this.playerGold >= this.goldCost;
  }

  get failureDropLevels(): number {
    return this.currentConfig?.failureDropLevels ?? 0;
  }

  get isProtectionCharmActive(): boolean {
    return !!this.selectedCharm?.preventsDrop;
  }

  get failureConsequenceText(): string {
    if (this.isProtectionCharmActive) {
      return 'Không giảm cấp (Bảo vệ bởi Bùa Hộ Mệnh)';
    }
    if (this.failureDropLevels === 0) {
      return `Giữ nguyên cấp (+${this.currentLevel} → +${this.currentLevel})`;
    }
    const dropTo = Math.max(0, this.currentLevel - this.failureDropLevels);
    return `Tụt ${this.failureDropLevels} cấp (+${this.currentLevel} → +${dropTo})`;
  }

  get canEnhance(): boolean {
    return (
      !!this.selectedEquipment &&
      !this.isMaxLevel &&
      this.hasEnoughGold &&
      !this.isForging &&
      !this.selectedEquipment.isLocked
    );
  }

  // --- Stone / Charm Slot Management ---

  openStonePicker(slotIndex: number): void {
    this.pickingStoneSlotIndex = slotIndex;
    this.showStonePicker = true;
  }

  getAvailableStoneCount(stoneItem: StoneInventorySlot): number {
    const selectedCount = this.selectedStones.filter((s) => s?.id === stoneItem.id).length;
    return Math.max(0, stoneItem.count - selectedCount);
  }

  selectStone(stone: StoneInventorySlot): void {
    if (this.pickingStoneSlotIndex >= 0 && this.pickingStoneSlotIndex < 3) {
      this.selectedStones[this.pickingStoneSlotIndex] = stone;
    }
    this.showStonePicker = false;
    this.pickingStoneSlotIndex = -1;
  }

  removeStone(slotIndex: number, event: Event): void {
    event.stopPropagation();
    this.selectedStones[slotIndex] = null;
  }

  openCharmPicker(): void {
    this.showCharmPicker = true;
  }

  selectCharm(charm: CharmInventorySlot): void {
    this.selectedCharm = charm;
    this.showCharmPicker = false;
  }

  removeCharm(event: Event): void {
    event.stopPropagation();
    this.selectedCharm = null;
  }

  // --- Perform Enhancement ---

  enhance(): void {
    if (!this.canEnhance || !this.selectedEquipment) {
      return;
    }

    this.isForging = true;
    this.errorMessage = '';
    const startTimestamp = Date.now();

    const stoneIds = this.selectedStones.filter((s) => !!s).map((s) => s!.id);
    const charmId = this.selectedCharm?.id ?? null;

    const request: EnhanceEquipmentRequest = {
      requestId: crypto.randomUUID(),
      inventoryItemId: this.selectedEquipment.id,
      stoneInventoryItemIds: stoneIds,
      charmInventoryItemId: charmId
    };

    this.enhancementService.enhanceEquipment(request).subscribe({
      next: (res) => {
        const elapsed = Date.now() - startTimestamp;
        const remainingDelay = Math.max(0, 1500 - elapsed);

        setTimeout(() => {
          this.isForging = false;
          if (res?.success && res.data) {
            this.handleEnhancementSuccess(res.data);
          } else {
            this.errorMessage = res?.message || 'Có lỗi xảy ra trong quá trình cường hóa.';
          }
        }, remainingDelay);
      },
      error: (err) => {
        const elapsed = Date.now() - startTimestamp;
        const remainingDelay = Math.max(0, 1500 - elapsed);

        setTimeout(() => {
          this.isForging = false;
          this.errorMessage = err?.error?.message || err?.message || 'Lỗi kết nối máy chủ.';
        }, remainingDelay);
      }
    });
  }

  private handleEnhancementSuccess(result: EnhanceEquipmentResult): void {
    this.lastResult = result;
    this.showResultModal = true;

    if (this.selectedEquipment) {
      this.selectedEquipment.enhancement = result.newEnhancement;
      if (result.currentStats) {
        this.selectedEquipment.stats = { ...this.selectedEquipment.stats, ...result.currentStats };
      }
      this.itemUpdated.emit(this.selectedEquipment);
    }

    // Deduct Gold
    this.playerGold = Math.max(0, this.playerGold - result.consumed.gold);

    // Deduct Stones
    if (result.consumed.stones) {
      result.consumed.stones.forEach((cs) => {
        const stoneInPlayer = this.playerStones.find((s) => s.itemTemplateId === cs.itemTemplateId);
        if (stoneInPlayer) {
          stoneInPlayer.count = Math.max(0, stoneInPlayer.count - cs.quantity);
        }
      });
    }

    // Deduct Charm
    if (result.consumed.charm && this.selectedCharm) {
      const charmInPlayer = this.playerCharms.find((c) => c.itemTemplateId === result.consumed.charm!.itemTemplateId);
      if (charmInPlayer) {
        charmInPlayer.count = Math.max(0, charmInPlayer.count - 1);
      }
    }

    // Revalidate and reset used slots if quantity exhausted
    for (let i = 0; i < this.selectedStones.length; i++) {
      const s = this.selectedStones[i];
      if (s && s.count <= 0) {
        this.selectedStones[i] = null;
      }
    }
    if (this.selectedCharm && this.selectedCharm.count <= 0) {
      this.selectedCharm = null;
    }
  }

  closeResultModal(): void {
    this.showResultModal = false;
  }

  // --- Helpers for Stats Display ---

  getStatKeys(stats: any): string[] {
    if (!stats) return [];
    return Object.keys(stats).filter((k) => typeof stats[k] === 'number');
  }

  getStatDisplayName(key: string): string {
    const map: { [k: string]: string } = {
      HP: 'Sinh Mệnh (HP)',
      PHYSICAL_ATK: 'Công Vật Lý (ATK)',
      MAGIC_ATK: 'Công Phép (MATK)',
      ARMOR: 'Giáp Thủ (DEF)',
      SPEED: 'Tốc Độ (SPD)',
      CRIT_RATE: 'Chí Mạng (CRIT)',
      CRIT_DAMAGE: 'Sát Thương Bạo',
      ACCURACY: 'Chính Xác',
      DODGE_RATE: 'Né Tránh',
      MAGIC_RESIST: 'Kháng Phép',
      ARMOR_PEN: 'Xuyên Giáp',
      MAGIC_PEN: 'Xuyên Phép',
      CRIT_RESIST: 'Kháng Bạo'
    };
    return map[key] || key;
  }

  formatStatValue(key: string, val: number): string {
    if (key.includes('RATE') || key.includes('RESIST') || key.includes('DAMAGE') || key === 'ACCURACY' || key === 'DODGE_RATE') {
      if (val <= 1.0) {
        return `+${(val * 100).toFixed(1)}%`;
      }
      return `+${val}%`;
    }
    return `+${val.toLocaleString('vi-VN')}`;
  }

  calculateExpectedStat(key: string, currentVal: number): string {
    const isPercent = key.includes('RATE') || key.includes('RESIST') || key.includes('DAMAGE') || key === 'ACCURACY';
    if (isPercent) {
      const nextVal = currentVal * 1.02;
      return this.formatStatValue(key, Math.round(nextVal * 1000) / 1000);
    } else {
      const nextVal = Math.round(currentVal * 1.08);
      return `+${nextVal.toLocaleString('vi-VN')}`;
    }
  }
}
