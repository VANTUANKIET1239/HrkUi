import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ItemImageComponent } from '../../../../shared/components/item-image/item-image.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventoryItemDto } from '../../../../core/models/inventory.model';
import {
  EnhanceEquipmentRequest,
  EnhanceEquipmentResult,
  EnhancementConfigResponse,
  EnhancementLevelConfig,
  EnhancementMaterialConfig,
  EquipmentEnhancementPreview,
  ForgeEquipmentItem, EquipmentDowngradePreview
} from '../../../../core/models/enhancement.model';
import {
  EnhancementTier,
  ENHANCEMENT_ANIMATION_CONFIGS,
  getEnhancementAnimationTier,
  isMaxLevelAttempt
} from '../../../../core/configs/enhancement-animation.config';
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
  imports: [ItemImageComponent, CommonModule, FormsModule],
  templateUrl: './forge.component.html',
  styleUrl: './forge.component.scss'
})
export class ForgeComponent implements OnInit {
  @Input() preselectedItemId?: number;
  @Input() currentGold?: number;
  @Output() close = new EventEmitter<void>();
  @Output() itemUpdated = new EventEmitter<ForgeEquipmentItem>();

  activeTab: 'enhance' | 'star' = 'enhance';

  // Global loading states
  isLoading = true;
  isForging = false;
  isLoadingPreview = false;

  // Modals & Pickers
  showStonePicker = false;
  pickingStoneSlotIndex = -1;
  showCharmPicker = false;
  showResultModal = false;
  showDowngradeModal = false;
  downgradeTarget = 0;
  downgradePreview: EquipmentDowngradePreview | null = null;
  isDowngrading = false;

  // Metadata Configurations
  levelConfigs: EnhancementLevelConfig[] = [];
  materialConfigs: EnhancementMaterialConfig[] = [];

  // Equipment Browser State
  forgeEquipments: ForgeEquipmentItem[] = [];
  filteredEquipments: ForgeEquipmentItem[] = [];
  selectedEquipment: ForgeEquipmentItem | null = null;
  focusedItem: ForgeEquipmentItem | null = null;
  previewDetails: EquipmentEnhancementPreview | null = null;

  // Filtering & Sorting State
  searchQuery = '';
  selectedCategory = 'ALL';
  selectedEligibility: 'ALL' | 'CAN_ENHANCE' | 'CANNOT_ENHANCE' = 'ALL';
  selectedSort = 'DEFAULT';

  // Category Options
  categories = [
    { code: 'ALL', name: 'Tất cả' },
    { code: 'WEAPON', name: 'Vũ khí' },
    { code: 'ARMOR', name: 'Giáp' },
    { code: 'HELMET', name: 'Mũ' },
    { code: 'BOOTS', name: 'Giày' },
    { code: 'RING', name: 'Nhẫn' },
    { code: 'ARTIFACT', name: 'Thần binh' }
  ];

  // Drag & Drop State
  isDragging = false;
  draggedItem: ForgeEquipmentItem | null = null;
  isDropZoneHovered = false;
  isDropZoneValid = false;

  // Player Resources
  playerGold = 1250000;
  playerStones: StoneInventorySlot[] = [];
  playerCharms: CharmInventorySlot[] = [];

  // Selected Materials for Attempt
  selectedStones: (StoneInventorySlot | null)[] = [null, null, null];
  selectedCharm: CharmInventorySlot | null = null;

  // Animation Engine State
  currentAnimationTier: EnhancementTier = 1;
  isMaxAttempt = false;
  animationPhase: 'idle' | 'energy' | 'strike1' | 'strike2' | 'burst' | 'suspense' | 'reveal' = 'idle';
  shakeActive = false;
  whiteFlashActive = false;
  animationResultType: 'success' | 'failure' | null = null;

  // Result & Error Reporting
  lastResult: EnhanceEquipmentResult | null = null;
  errorMessage = '';

  constructor(
    private enhancementService: EnhancementService,
    private inventoryService: InventoryService,
    private playerService: PlayerService
  ) { }

  ngOnInit(): void {
    if (this.currentGold !== undefined && this.currentGold > 0) {
      this.playerGold = this.currentGold;
    }
    this.loadInitialData();
  }

  loadInitialData(): void {
    this.isLoading = true;

    // 1. Load Player Wallet
    this.playerService.getWallet().subscribe({
      next: (res) => {
        if (res?.success && res.data && res.data.gold !== undefined) {
          this.playerGold = res.data.gold;
        } else if (this.currentGold !== undefined && this.currentGold > 0) {
          this.playerGold = this.currentGold;
        }
      },
      error: (err) => {
        console.warn('Could not load wallet in Forge, using cached/input gold:', err);
        if (this.currentGold !== undefined && this.currentGold > 0) {
          this.playerGold = this.currentGold;
        }
      }
    });

    // 2. Load Enhancement Configs
    this.enhancementService.getEnhancementConfigs().subscribe({
      next: (res) => {
        if (res?.success && res.data) {
          this.levelConfigs = res.data.levelConfigs || [];
          this.materialConfigs = res.data.materials || [];
        }
        this.loadMaterialsInventory();
        this.loadForgeEquipment();
      },
      error: (err) => {
        console.warn('Failed to load enhancement configs:', err);
        this.loadMaterialsInventory();
        this.loadForgeEquipment();
      }
    });
  }

  /**
   * Load stone & charm items from player inventory for the material picker slots
   */
  loadMaterialsInventory(): void {
    this.inventoryService.getInventory().subscribe({
      next: (res) => {
        if (res?.success && res.data) {
          const items = res.data;
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
        }
      },
      error: (err) => {
        console.error('Failed to load material items in Forge:', err);
      }
    });
  }

  /**
   * Load the equipment inventory browser list using the dedicated CQRS Query
   */
  loadForgeEquipment(autoSelectFirst = true): void {
    this.enhancementService.getForgeEquipment().subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res?.success && res.data) {
          this.forgeEquipments = res.data;
          this.applyFilters();

          // Preselect equipment if requested or retain current selection
          if (this.preselectedItemId) {
            const found = this.forgeEquipments.find((e) => e.inventoryItemId === this.preselectedItemId);
            if (found && found.canEnhance) {
              this.selectEquipment(found);
            } else if (found) {
              this.selectEquipment(found);
            }
          } else if (this.selectedEquipment) {
            // Refresh reference
            const found = this.forgeEquipments.find((e) => e.inventoryItemId === this.selectedEquipment!.inventoryItemId);
            if (found) {
              this.selectedEquipment = found;
              this.loadPreviewDetails(found.inventoryItemId);
            }
          } else if (autoSelectFirst) {
            // Find first enhanceable equipment or first item
            const firstValid = this.forgeEquipments.find((e) => e.canEnhance) || this.forgeEquipments[0];
            if (firstValid) {
              this.selectEquipment(firstValid);
            }
          }
        }
      },
      error: (err) => {
        console.error('Failed to load forge equipment list:', err);
        this.isLoading = false;
      }
    });
  }

  // --- Filtering & Sorting Pipeline (Client-Side) ---

  applyFilters(): void {
    let result = [...this.forgeEquipments];

    // 1. Search filter by Name or Code
    if (this.searchQuery && this.searchQuery.trim()) {
      const q = this.searchQuery.trim().toLowerCase();
      result = result.filter(
        (e) => e.name.toLowerCase().includes(q) || e.code.toLowerCase().includes(q)
      );
    }

    // 2. Category filter
    if (this.selectedCategory !== 'ALL') {
      result = result.filter(
        (e) => e.categoryCode.toUpperCase() === this.selectedCategory.toUpperCase()
      );
    }

    // 3. Eligibility filter
    if (this.selectedEligibility === 'CAN_ENHANCE') {
      result = result.filter((e) => e.canEnhance);
    } else if (this.selectedEligibility === 'CANNOT_ENHANCE') {
      result = result.filter((e) => !e.canEnhance);
    }

    // 4. Sorting
    switch (this.selectedSort) {
      case 'RARITY_DESC':
        result.sort((a, b) => b.rarityOrder - a.rarityOrder || b.enhancement - a.enhancement);
        break;
      case 'RARITY_ASC':
        result.sort((a, b) => a.rarityOrder - b.rarityOrder || a.enhancement - b.enhancement);
        break;
      case 'ENHANCEMENT_DESC':
        result.sort((a, b) => b.enhancement - a.enhancement || b.rarityOrder - a.rarityOrder);
        break;
      case 'ENHANCEMENT_ASC':
        result.sort((a, b) => a.enhancement - b.enhancement || b.rarityOrder - a.rarityOrder);
        break;
      case 'NAME_ASC':
        result.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
        break;
      case 'NAME_DESC':
        result.sort((a, b) => b.name.localeCompare(a.name, 'vi'));
        break;
      case 'DEFAULT':
      default:
        result.sort((a, b) => b.enhancement - a.enhancement || b.rarityOrder - a.rarityOrder);
        break;
    }

    this.filteredEquipments = result;
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  setCategoryFilter(categoryCode: string): void {
    this.selectedCategory = categoryCode;
    this.applyFilters();
  }

  setEligibilityFilter(eligibility: 'ALL' | 'CAN_ENHANCE' | 'CANNOT_ENHANCE'): void {
    this.selectedEligibility = eligibility;
    this.applyFilters();
  }

  setSortOption(sortKey: string): void {
    this.selectedSort = sortKey;
    this.applyFilters();
  }

  // --- Card Interaction & Selection ---

  onCardClick(item: ForgeEquipmentItem): void {
    this.focusedItem = item;
  }

  onEquipmentDoubleClick(item: ForgeEquipmentItem): void {
    if (this.isForging) return;

    if (!item.canEnhance) {
      this.errorMessage = item.enhancementBlockedMessage || 'Trang bị không đủ điều kiện cường hóa.';
      return;
    }
    this.selectEquipment(item);
  }

  // Drag & Drop Handlers
  onDragStart(event: DragEvent, item: ForgeEquipmentItem): void {
    if (this.isForging || !item.canEnhance) {
      event.preventDefault();
      return;
    }

    this.isDragging = true;
    this.draggedItem = item;
    if (event.dataTransfer) {
      event.dataTransfer.setData('text/plain', item.inventoryItemId.toString());
      event.dataTransfer.effectAllowed = 'copy';
    }
  }

  onDragEnd(event: DragEvent): void {
    this.isDragging = false;
    this.draggedItem = null;
    this.isDropZoneHovered = false;
  }

  onDropZoneDragOver(event: DragEvent): void {
    event.preventDefault();
    if (this.isForging) return;

    this.isDropZoneHovered = true;
    this.isDropZoneValid = !!this.draggedItem?.canEnhance;
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = this.isDropZoneValid ? 'copy' : 'none';
    }
  }

  onDropZoneDragLeave(event: DragEvent): void {
    this.isDropZoneHovered = false;
  }

  onDropZoneDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDropZoneHovered = false;

    if (this.isForging) return;

    if (this.draggedItem && this.draggedItem.canEnhance) {
      this.selectEquipment(this.draggedItem);
    }
    this.draggedItem = null;
    this.isDragging = false;
  }

  /**
   * Set target equipment, reset materials slots, and load preview stats
   */
  selectEquipment(item: ForgeEquipmentItem): void {
    if (this.isForging) return;

    this.selectedEquipment = item;
    this.focusedItem = item;
    this.errorMessage = '';

    // Requirement 9: Reset materials when changing target equipment
    this.selectedStones = [null, null, null];
    this.selectedCharm = null;

    // Load preview stats from backend
    this.loadPreviewDetails(item.inventoryItemId);
  }

  loadPreviewDetails(inventoryItemId: number): void {
    this.isLoadingPreview = true;
    this.enhancementService.getEnhancementPreview(inventoryItemId).subscribe({
      next: (res) => {
        this.isLoadingPreview = false;
        if (res?.success && res.data) {
          this.previewDetails = res.data;
        }
      },
      error: (err) => {
        console.warn('Failed to load enhancement preview:', err);
        this.isLoadingPreview = false;
      }
    });
  }

  // --- Derived Calculations for Rates & Cost ---

  get currentLevel(): number {
    return this.selectedEquipment?.enhancement ?? 0;
  }

  get targetLevel(): number {
    return Math.min(15, this.currentLevel + 1);
  }

  get isMaxLevel(): boolean {
    return this.currentLevel >= 15;
  }

  get currentConfig(): EnhancementLevelConfig | undefined {
    return this.levelConfigs.find((c) => Number(c.currentLevel) === Number(this.currentLevel));
  }

  get baseSuccessRate(): number {
    return this.previewDetails?.baseSuccessRate ?? this.currentConfig?.baseSuccessRate ?? 0;
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
    return this.previewDetails?.goldCost ?? this.currentConfig?.goldCost ?? 0;
  }

  get hasEnoughGold(): boolean {
    return this.playerGold >= this.goldCost;
  }

  get failureDropLevels(): number {
    return this.previewDetails?.failureDropLevels ?? this.currentConfig?.failureDropLevels ?? 0;
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

  get cannotEnhanceReason(): string {
    if (!this.selectedEquipment) return 'Vui lòng chọn trang bị';
    if (!this.selectedEquipment.canEnhance) {
      return this.selectedEquipment.enhancementBlockedMessage || 'Trang bị không đủ điều kiện cường hóa.';
    }
    if (this.isMaxLevel) return 'Đã đạt cấp tối đa (+15)';
    if (this.selectedEquipment.isLocked) return 'Trang bị đang bị KHÓA';
    if (!this.hasEnoughGold) return `Thiếu Vàng (Cần ${this.goldCost.toLocaleString('vi-VN')} Vàng)`;
    if (this.isForging) return 'Đang thực hiện rèn...';
    return '';
  }

  get canEnhance(): boolean {
    return (
      !!this.selectedEquipment &&
      this.selectedEquipment.canEnhance &&
      !this.isMaxLevel &&
      this.hasEnoughGold &&
      !this.isForging &&
      !this.selectedEquipment.isLocked
    );
  }

  // --- Stone & Charm Slots ---

  openStonePicker(slotIndex: number): void {
    if (this.isForging) return;
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
    if (this.isForging) return;
    this.selectedStones[slotIndex] = null;
  }

  openCharmPicker(): void {
    if (this.isForging) return;
    this.showCharmPicker = true;
  }

  selectCharm(charm: CharmInventorySlot): void {
    this.selectedCharm = charm;
    this.showCharmPicker = false;
  }

  removeCharm(event: Event): void {
    event.stopPropagation();
    if (this.isForging) return;
    this.selectedCharm = null;
  }

  // --- Tiered Enhancement Animation Execution Engine ---

  enhance(): void {
    if (!this.canEnhance || !this.selectedEquipment) {
      return;
    }

    this.isForging = true;
    this.errorMessage = '';
    this.animationResultType = null;

    // Determine Animation Tier strictly by targetLevel = currentLevel + 1
    const targetLvl = this.targetLevel;
    this.currentAnimationTier = getEnhancementAnimationTier(targetLvl);
    this.isMaxAttempt = isMaxLevelAttempt(targetLvl);

    const animConfig = ENHANCEMENT_ANIMATION_CONFIGS[this.currentAnimationTier];
    const startTime = Date.now();

    // Prepare Request
    const stoneIds = this.selectedStones.filter((s) => !!s).map((s) => s!.id);
    const charmId = this.selectedCharm?.id ?? null;
    const request: EnhanceEquipmentRequest = {
      requestId: crypto.randomUUID(),
      inventoryItemId: this.selectedEquipment.inventoryItemId,
      stoneInventoryItemIds: stoneIds,
      charmInventoryItemId: charmId
    };

    // Hold API response and status
    let apiResponse: EnhanceEquipmentResult | null = null;
    let apiError: string | null = null;
    let apiFinished = false;
    let animationRevealReached = false;

    // 1. Fire API request immediately in parallel (Backend never delays)
    this.enhancementService.enhanceEquipment(request).subscribe({
      next: (res) => {
        apiFinished = true;
        if (res?.success && res.data) {
          apiResponse = res.data;
        } else {
          apiError = res?.message || 'Có lỗi xảy ra trong quá trình cường hóa.';
        }
        checkAndReveal();
      },
      error: (err) => {
        apiFinished = true;
        apiError = err?.error?.message || err?.message || 'Lỗi kết nối máy chủ.';
        checkAndReveal();
      }
    });

    // 2. Drive Visual Animation Timeline
    this.animationPhase = 'energy';

    // Strike 1
    const strike1Time = animConfig.strikeTimingsMs[0] || 500;
    setTimeout(() => {
      if (!this.isForging) return;
      this.animationPhase = 'strike1';
      this.triggerShake();
    }, strike1Time);

    // Strike 2 (for Tier 2 and Tier 3)
    if (animConfig.strikeCount > 1) {
      const strike2Time = animConfig.strikeTimingsMs[1] || 1000;
      setTimeout(() => {
        if (!this.isForging) return;
        this.animationPhase = 'strike2';
        this.triggerShake();
      }, strike2Time);
    }

    // Suspense & White Flash (for Tier 3 / Max level attempt)
    if (animConfig.hasSuspensePause) {
      setTimeout(() => {
        if (!this.isForging) return;
        this.animationPhase = 'suspense';
        if (this.isMaxAttempt) {
          this.triggerWhiteFlash();
        }
      }, animConfig.revealPointMs - 400);
    }

    // Reach Animation Reveal Point
    setTimeout(() => {
      animationRevealReached = true;
      checkAndReveal();
    }, animConfig.revealPointMs);

    // Synchronize visual reveal point with backend API response
    const checkAndReveal = () => {
      if (animationRevealReached && apiFinished) {
        this.animationPhase = 'reveal';
        if (apiResponse) {
          this.handleEnhancementResult(apiResponse);
        } else {
          this.isForging = false;
          this.animationPhase = 'idle';
          this.errorMessage = apiError || 'Lỗi không xác định.';
        }
      }
    };
  }

  private triggerShake(): void {
    this.shakeActive = true;
    setTimeout(() => {
      this.shakeActive = false;
    }, 200);
  }

  private triggerWhiteFlash(): void {
    this.whiteFlashActive = true;
    setTimeout(() => {
      this.whiteFlashActive = false;
    }, 350);
  }

  private handleEnhancementResult(result: EnhanceEquipmentResult): void {
    this.lastResult = result;
    this.animationResultType = result.success ? 'success' : 'failure';

    // Update locally
    if (this.selectedEquipment) {
      this.selectedEquipment.enhancement = result.newEnhancement;
    }

    // Deduct Gold
    this.playerGold = Math.max(0, this.playerGold - result.consumed.gold);

    // Deduct Stones locally
    if (result.consumed.stones) {
      result.consumed.stones.forEach((cs) => {
        const stoneInPlayer = this.playerStones.find((s) => s.itemTemplateId === cs.itemTemplateId);
        if (stoneInPlayer) {
          stoneInPlayer.count = Math.max(0, stoneInPlayer.count - cs.quantity);
        }
      });
    }

    // Deduct Charm locally
    if (result.consumed.charm && this.selectedCharm) {
      const charmInPlayer = this.playerCharms.find(
        (c) => c.itemTemplateId === result.consumed.charm!.itemTemplateId
      );
      if (charmInPlayer) {
        charmInPlayer.count = Math.max(0, charmInPlayer.count - 1);
      }
    }

    // Reset slots if exhausted
    for (let i = 0; i < this.selectedStones.length; i++) {
      const s = this.selectedStones[i];
      if (s && s.count <= 0) {
        this.selectedStones[i] = null;
      }
    }
    if (this.selectedCharm && this.selectedCharm.count <= 0) {
      this.selectedCharm = null;
    }

    // Short reveal flash before opening the result modal
    setTimeout(() => {
      this.isForging = false;
      this.animationPhase = 'idle';
      this.showResultModal = true;

      // Reload forge equipment from server so newly reached +15 items turn disabled immediately
      this.loadForgeEquipment(false);

      if (this.selectedEquipment) {
        this.loadPreviewDetails(this.selectedEquipment.inventoryItemId);
        this.itemUpdated.emit(this.selectedEquipment);
      }
    }, 600);
  }

  closeResultModal(): void {
    this.showResultModal = false;
  }

  openDowngrade(): void { if(!this.selectedEquipment?.enhancement)return; this.downgradeTarget=this.selectedEquipment.enhancement-1; this.showDowngradeModal=true; this.loadDowngradePreview(); }
  loadDowngradePreview(): void { if(!this.selectedEquipment)return; this.downgradePreview=null; this.enhancementService.getDowngradePreview(this.selectedEquipment.inventoryItemId,this.downgradeTarget).subscribe({next:r=>this.downgradePreview=r?.success?r.data:null,error:e=>this.errorMessage=e?.error?.message||'Không tải được preview hạ cấp.'}); }
  confirmDowngrade(): void { const p=this.downgradePreview;if(!p?.canDowngrade||this.isDowngrading||!this.selectedEquipment)return;this.isDowngrading=true;this.enhancementService.downgradeEquipment({requestId:crypto.randomUUID(),inventoryItemId:this.selectedEquipment.inventoryItemId,targetEnhancement:this.downgradeTarget}).subscribe({next:r=>{this.isDowngrading=false;if(r?.success){this.showDowngradeModal=false;this.loadInitialData();}else this.errorMessage=r?.message||'Hạ cấp thất bại.';},error:e=>{this.isDowngrading=false;this.errorMessage=e?.error?.message||'Hạ cấp thất bại.';}});}

  // --- Stats Display Helpers ---

  getStatKeys(stats?: { [key: string]: number }): string[] {
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
    if (
      key.includes('RATE') ||
      key.includes('RESIST') ||
      key.includes('DAMAGE') ||
      key === 'ACCURACY' ||
      key === 'DODGE_RATE'
    ) {
      if (val <= 1.0) {
        return `+${(val * 100).toFixed(1)}%`;
      }
      return `+${val}%`;
    }
    return `+${val.toLocaleString('vi-VN')}`;
  }
}
