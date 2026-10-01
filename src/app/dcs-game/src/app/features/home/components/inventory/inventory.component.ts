import { ItemImageComponent } from '../../../../shared/components/item-image/item-image.component';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize, forkJoin } from 'rxjs';
import { InventoryItemDto, ItemCategoryDto, ItemRarityDto } from '../../../../core/models/inventory.model';
import { InventoryService } from '../../../../core/services/inventory.service';
import { PlayerService } from '../../../../core/services/player.service';
import { EquipmentTooltipService } from '../../../../shared/components/equipment-tooltip/equipment-tooltip.service';
import { ForgeComponent } from '../forge/forge.component';
import { EquipmentRollDetailsComponent } from '../../../../shared/components/equipment-roll-details/equipment-roll-details.component';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [ItemImageComponent, CommonModule, FormsModule, ForgeComponent, EquipmentRollDetailsComponent],
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.scss'
})
export class InventoryComponent implements OnInit {
  @Output() close = new EventEmitter<void>();

  items: InventoryItemDto[] = [];
  categories: ItemCategoryDto[] = [];
  rarities: ItemRarityDto[] = [];
  selectedItem: InventoryItemDto | null = null;
  selectedCategory = 'all';
  searchQuery = '';
  filterRarity = 'All';
  filterEquipped = 'All';
  filterLevel = 'All';

  gold = 0;
  diamonds = 0;
  upgradeMaterialsCount = 0;
  maxCapacity = 0;

  isLoading = false;
  isWalletLoading = false;
  isExpandingCapacity = false;
  isBatchSelling = false;
  isSellingSingleItem = false;
  lockingItemId: number | null = null;
  isForgeOpen = false;
  selectedEquipmentForForge: number | undefined;

  toastMessage = '';
  toastType: 'success' | 'warning' | 'info' = 'info';
  showToast = false;
  private toastTimer?: ReturnType<typeof setTimeout>;

  constructor(
    private readonly playerService: PlayerService,
    private readonly inventoryService: InventoryService,
    private readonly tooltipService: EquipmentTooltipService
  ) {}

  ngOnInit(): void { this.refreshData(); }

  refreshData(): void {
    this.loadWalletData();
    this.loadInventoryData();
  }

  loadWalletData(): void {
    this.isWalletLoading = true;
    this.playerService.getWallet().pipe(finalize(() => this.isWalletLoading = false)).subscribe({
      next: response => {
        if (!response?.success || !response.data) {
          this.triggerToast(response?.message || 'Không thể tải thông tin ví.', 'warning');
          return;
        }
        this.gold = response.data.gold ?? 0;
        this.diamonds = response.data.diamonds ?? 0;
        this.upgradeMaterialsCount = response.data.upgradeMaterials ?? 0;
        this.maxCapacity = response.data.maxCapacity ?? 0;
      },
      error: () => this.triggerToast('Không thể tải thông tin ví từ máy chủ.', 'warning')
    });
  }

  loadInventoryData(showSuccess = false): void {
    this.isLoading = true;
    forkJoin({
      inventory: this.inventoryService.getInventory(),
      categories: this.inventoryService.getItemCategories(),
      rarities: this.inventoryService.getRarities()
    }).pipe(finalize(() => this.isLoading = false)).subscribe({
      next: ({ inventory, categories, rarities }) => {
        if (!inventory?.success || !categories?.success || !rarities?.success) {
          this.triggerToast('Không thể đồng bộ đầy đủ dữ liệu hành trang.', 'warning');
          return;
        }
        this.items = inventory.data ?? [];
        this.categories = (categories.data ?? []).sort((a, b) => a.displayOrder - b.displayOrder);
        this.rarities = (rarities.data ?? []).sort((a, b) => b.displayOrder - a.displayOrder);
        this.ensureValidSelection();
        if (showSuccess) this.triggerToast(`Đã đồng bộ ${this.items.length} vật phẩm.`, 'success');
      },
      error: () => this.triggerToast('Không thể tải hành trang từ máy chủ.', 'warning')
    });
  }

  get filteredItems(): InventoryItemDto[] {
    const query = this.searchQuery.trim().toLocaleLowerCase('vi');
    return this.items.filter(item => {
      const categoryMatch = this.selectedCategory === 'all' || item.categoryCode === this.selectedCategory;
      const textMatch = !query || item.name.toLocaleLowerCase('vi').includes(query)
        || (item.description ?? '').toLocaleLowerCase('vi').includes(query);
      const rarityMatch = this.filterRarity === 'All' || item.rarityCode === this.filterRarity;
      const equippedMatch = this.filterEquipped === 'All'
        || (this.filterEquipped === 'Equipped' ? item.isEquipped : !item.isEquipped);
      return categoryMatch && textMatch && rarityMatch && equippedMatch && this.matchesLevelFilter(item.levelReq);
    });
  }

  getCategoryItemCount(categoryCode: string): number {
    return this.items.filter(item => categoryCode === 'all' || item.categoryCode === categoryCode)
      .reduce((total, item) => total + item.count, 0);
  }

  selectCategory(categoryCode: string): void {
    this.selectedCategory = categoryCode;
    this.selectedItem = this.filteredItems[0] ?? null;
  }

  selectItem(item: InventoryItemDto): void { this.selectedItem = item; }
  isEquipment(item: InventoryItemDto | null): boolean { return item?.isEquipment === true; }

  rarityStyle(item: InventoryItemDto): Record<string, string> {
    return { '--rarity-color': item.rarityColorHex || '#9e9e9e' };
  }

  getAttributeValue(item: InventoryItemDto, attributeCode: string, fallback: number): number {
    const stats = typeof item.stats === 'string' ? this.parseStats(item.stats) : (item.stats ?? {});
    const value = Number(stats[attributeCode]);
    return Number.isFinite(value) ? value : fallback;
  }

  formatAttributeValue(value: number, isPercentage: boolean): string {
    const normalized = isPercentage && Math.abs(value) <= 1 ? value * 100 : value;
    return `+${normalized.toLocaleString('vi-VN', { maximumFractionDigits: 2 })}${isPercentage ? '%' : ''}`;
  }

  sortItems(criteria: 'rarity' | 'type'): void {
    if (criteria === 'rarity') this.items.sort((a, b) => b.rarityDisplayOrder - a.rarityDisplayOrder);
    else this.items.sort((a, b) => a.categoryDisplayOrder - b.categoryDisplayOrder);
    this.ensureValidSelection();
  }

  enhanceEquipment(item: InventoryItemDto): void {
    this.selectedEquipmentForForge = item.id;
    this.isForgeOpen = true;
  }

  onForgeClosed(): void {
    this.isForgeOpen = false;
    this.selectedEquipmentForForge = undefined;
    this.refreshData();
  }

  onForgeItemUpdated(_item?: any): void { this.loadInventoryData(); }

  toggleLockItem(item: InventoryItemDto): void {
    if (this.lockingItemId !== null) return;
    const targetState = !item.isLocked;
    this.lockingItemId = item.id;
    this.inventoryService.toggleLock(item.id, targetState).pipe(finalize(() => this.lockingItemId = null)).subscribe({
      next: response => {
        if (!response?.success) {
          this.triggerToast(response?.message || 'Không thể cập nhật trạng thái khóa.', 'warning');
          return;
        }
        item.isLocked = targetState;
        this.triggerToast(targetState ? 'Đã khóa vật phẩm.' : 'Đã mở khóa vật phẩm.', 'info');
      },
      error: () => this.triggerToast('Không thể cập nhật trạng thái khóa trên máy chủ.', 'warning')
    });
  }

  sellItem(item: InventoryItemDto): void {
    if (this.isSellingSingleItem || item.isLocked || item.isEquipped) return;
    this.isSellingSingleItem = true;
    this.inventoryService.sellItems([{ inventoryItemId: item.id, count: 1 }]).pipe(
      finalize(() => this.isSellingSingleItem = false)
    ).subscribe({
      next: response => {
        if (!response?.success || !response.data) {
          this.triggerToast(response?.message || 'Không thể bán vật phẩm.', 'warning');
          return;
        }
        this.gold = response.data.currentGold;
        this.applySoldCount(item, 1);
        this.triggerToast(`Đã bán “${item.name}”, nhận ${response.data.earnedGold} vàng.`, 'success');
      },
      error: () => this.triggerToast('Không thể bán vật phẩm trên máy chủ.', 'warning')
    });
  }

  batchSellItems(): void {
    if (this.isBatchSelling || !this.rarities.length) return;
    const lowestRarityOrder = Math.min(...this.rarities.map(rarity => rarity.displayOrder));
    const candidates = this.items.filter(item =>
      item.rarityDisplayOrder === lowestRarityOrder && !item.isLocked && !item.isEquipped);
    if (!candidates.length) {
      this.triggerToast('Không có vật phẩm phẩm chất thấp nhất có thể bán.', 'warning');
      return;
    }
    this.isBatchSelling = true;
    this.inventoryService.sellItems(candidates.map(item => ({ inventoryItemId: item.id, count: item.count }))).pipe(
      finalize(() => this.isBatchSelling = false)
    ).subscribe({
      next: response => {
        if (!response?.success || !response.data) {
          this.triggerToast(response?.message || 'Không thể bán nhanh vật phẩm.', 'warning');
          return;
        }
        this.gold = response.data.currentGold;
        const ids = new Set(candidates.map(item => item.id));
        this.items = this.items.filter(item => !ids.has(item.id));
        this.ensureValidSelection();
        this.triggerToast(`Đã bán ${response.data.soldItemsCount} vật phẩm, nhận ${response.data.earnedGold} vàng.`, 'success');
      },
      error: () => this.triggerToast('Không thể bán nhanh vật phẩm trên máy chủ.', 'warning')
    });
  }

  expandCapacityAction(slots = 10): void {
    if (this.isExpandingCapacity) return;
    this.isExpandingCapacity = true;
    this.inventoryService.expandCapacity(slots).pipe(finalize(() => this.isExpandingCapacity = false)).subscribe({
      next: response => {
        if (!response?.success || !response.data) {
          this.triggerToast(response?.message || 'Không thể mở rộng hành trang.', 'warning');
          return;
        }
        this.diamonds = response.data.diamonds;
        this.maxCapacity = response.data.maxCapacity;
        this.triggerToast(`Đã mở rộng thêm ${slots} ô hành trang.`, 'success');
      },
      error: () => this.triggerToast('Không thể mở rộng hành trang trên máy chủ.', 'warning')
    });
  }

  trackByItemId(_index: number, item: InventoryItemDto): number {
    return item.id;
  }

  onItemHover(event: MouseEvent, item: InventoryItemDto): void {
    if (item.isEquipment) this.tooltipService.show(event, item);
  }

  onItemLeave(): void { this.tooltipService.hide(); }

  triggerToast(message: string, type: 'success' | 'warning' | 'info' = 'success'): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    this.toastTimer = setTimeout(() => this.showToast = false, 2500);
  }

  private matchesLevelFilter(level: number): boolean {
    if (this.filterLevel === '1-10') return level >= 1 && level <= 10;
    if (this.filterLevel === '11-30') return level >= 11 && level <= 30;
    if (this.filterLevel === '31+') return level >= 31;
    return true;
  }

  private parseStats(value: string): Record<string, number> {
    try { return JSON.parse(value); } catch { return {}; }
  }

  private applySoldCount(item: InventoryItemDto, count: number): void {
    item.count -= count;
    if (item.count <= 0) {
      this.items = this.items.filter(candidate => candidate.id !== item.id);
      this.ensureValidSelection();
    }
  }

  private ensureValidSelection(): void {
    if (!this.selectedItem || !this.items.some(item => item.id === this.selectedItem?.id)) {
      this.selectedItem = this.filteredItems[0] ?? null;
    }
  }
}
