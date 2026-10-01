import { Component, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { HERO_STAR_COLORS } from '../../../../core/configs/hero-star-colors';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BattleCharacterComponent } from '../../../battle/components/battle-character/battle-character.component';
import { Hero } from '../../../../core/models/hero.model';
import { PlayerHeroDto } from '../../../../core/models/player-hero.model';
import {
  FormationDetailDto,
  PlayerFormationSummaryDto,
  SlotHeroPositionDto
} from '../../../../core/models/formation.model';
import { FormationService } from '../../../../core/services/formation.service';
import { PlayerHeroService } from '../../../../core/services/player-hero.service';
import { PlayerService } from '../../../../core/services/player.service';

@Component({
  selector: 'app-formation-management',
  standalone: true,
  imports: [CommonModule, FormsModule, BattleCharacterComponent],
  templateUrl: './formation-management.component.html',
  styleUrl: './formation-management.component.scss'
})
export class FormationManagementComponent implements OnInit {
  readonly starColors = HERO_STAR_COLORS;
  @Output() close = new EventEmitter<void>();

  // Currencies / Resources
  gold = 0;
  stones = 0;

  // Formation Lists & States
  formations: PlayerFormationSummaryDto[] = [];
  activeFormationCode = 'LUC_DO';
  currentFormationCode = 'LUC_DO';
  formationDetail: FormationDetailDto | null = null;

  // 5 Tactical Slots (0: Slot 1, 1: Slot 2, 2: Slot 3, 3: Slot 4, 4: Slot 5)
  // Frontline: Slots 1, 3, 5 (indices 0, 2, 4)
  // Backline: Slots 2, 4 (indices 1, 3)
  slots: (PlayerHeroDto | null)[] = [null, null, null, null, null];

  // Owned Heroes Pool
  heroes: PlayerHeroDto[] = [];

  // Drag and Drop State
  draggedHero: PlayerHeroDto | null = null;
  dragSource: 'pool' | 'grid' | null = null;
  draggedSlotIndex: number | null = null;

  // Click-to-place State
  selectedPoolHero: PlayerHeroDto | null = null;

  // Loading flags
  isLoading = false;
  isSaving = false;
  isUpgrading = false;
  isSelecting = false;

  // Toast Notification System
  toastMessage = '';
  toastType: 'success' | 'warning' | 'info' = 'info';
  showToast = false;
  private toastTimer: any = null;

  constructor(
    private readonly formationService: FormationService,
    private readonly playerHeroService: PlayerHeroService,
    private readonly playerService: PlayerService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData(): void {
    this.isLoading = true;

    // Load wallet
    this.playerService.getWallet().subscribe({
      next: (res) => {
        if (res.data) {
          this.gold = res.data.gold ?? 0;
        }
      },
      error: (err) => console.warn('Failed to load wallet:', err)
    });

    // Load heroes list
    this.playerHeroService.list().subscribe({
      next: (res) => {
        this.heroes = res.data ?? [];
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Failed to load heroes:', err);
        this.showCustomToast('Không thể tải danh sách tướng!', 'warning');
      }
    });

    // Load formations list
    this.formationService.getFormations().subscribe({
      next: (res) => {
        this.formations = res.data ?? [];
        const selected = this.formations.find((f) => f.isSelected);
        if (selected) {
          this.activeFormationCode = selected.code;
          this.currentFormationCode = selected.code;
        } else if (this.formations.length > 0) {
          this.activeFormationCode = this.formations[0].code;
          this.currentFormationCode = this.formations[0].code;
        }
        this.loadFormationDetail(this.currentFormationCode);
      },
      error: (err) => {
        console.error('Failed to load formations:', err);
        this.isLoading = false;
        this.showCustomToast('Không thể tải danh sách trận hình!', 'warning');
        this.cdr.markForCheck();
      }
    });
  }

  loadFormationDetail(code: string): void {
    this.isLoading = true;
    this.currentFormationCode = code;

    this.formationService.getFormationDetail(code).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.data) {
          this.formationDetail = res.data;
          this.applySlotsFromDetail(res.data);
          if (res.data.upgradeCost) {
            this.gold = res.data.upgradeCost.playerGold;
            this.stones = res.data.upgradeCost.playerStones;
          }
        }
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.isLoading = false;
        console.error(`Failed to load formation ${code}:`, err);
        this.showCustomToast(`Không thể tải chi tiết trận hình ${code}!`, 'warning');
        this.cdr.markForCheck();
      }
    });
  }

  applySlotsFromDetail(detail: FormationDetailDto): void {
    this.slots = [null, null, null, null, null];
    if (detail.slots) {
      for (const slotDto of detail.slots) {
        if (slotDto.slot >= 1 && slotDto.slot <= 5) {
          this.slots[slotDto.slot - 1] = slotDto.hero ?? null;
        }
      }
    }
  }

  switchFormation(code: string): void {
    if (this.currentFormationCode === code || this.isLoading) return;
    this.selectedPoolHero = null;
    this.loadFormationDetail(code);
  }

  // Check if a hero from pool is placed in any slot of the current formation
  isHeroPlaced(hero: PlayerHeroDto): boolean {
    return this.slots.some((s) => s?.id === hero.id);
  }

  getHeroPlacedSlot(hero: PlayerHeroDto): number | null {
    const idx = this.slots.findIndex((s) => s?.id === hero.id);
    return idx !== -1 ? idx + 1 : null;
  }

  // Drag-and-drop Handlers
  onDragStart(event: DragEvent, hero: PlayerHeroDto, source: 'pool' | 'grid', slotIndex?: number): void {
    this.draggedHero = hero;
    this.dragSource = source;
    this.draggedSlotIndex = slotIndex !== undefined ? slotIndex : null;
    if (event.dataTransfer) {
      event.dataTransfer.setData('text/plain', String(hero.id));
      event.dataTransfer.effectAllowed = 'move';
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  onDrop(event: DragEvent, targetSlotIndex: number): void {
    event.preventDefault();
    if (!this.draggedHero) return;

    const heroToPlace = this.draggedHero;
    const source = this.dragSource;
    const sourceIndex = this.draggedSlotIndex;

    this.draggedHero = null;
    this.dragSource = null;
    this.draggedSlotIndex = null;

    if (source === 'pool') {
      // If hero already in another slot, clear old slot
      const existingIdx = this.slots.findIndex((s) => s?.id === heroToPlace.id);
      if (existingIdx !== -1 && existingIdx !== targetSlotIndex) {
        this.slots[existingIdx] = null;
      }
      this.slots[targetSlotIndex] = heroToPlace;
      this.savePositions();
    } else if (source === 'grid' && sourceIndex !== null && sourceIndex !== targetSlotIndex) {
      // Swap slots
      const temp = this.slots[targetSlotIndex];
      this.slots[targetSlotIndex] = this.slots[sourceIndex];
      this.slots[sourceIndex] = temp;
      this.savePositions();
    }
  }

  // Click-to-place Handlers
  selectPoolHeroClick(hero: PlayerHeroDto): void {
    if (this.selectedPoolHero?.id === hero.id) {
      this.selectedPoolHero = null;
    } else {
      this.selectedPoolHero = hero;
      this.showCustomToast(`Đã chọn [${hero.name}]. Nhấp vào một ô để xếp trận!`, 'info');
    }
  }

  selectSlotClick(slotIndex: number): void {
    if (this.selectedPoolHero) {
      const heroToPlace = this.selectedPoolHero;
      const existingIdx = this.slots.findIndex((s) => s?.id === heroToPlace.id);
      if (existingIdx !== -1 && existingIdx !== slotIndex) {
        this.slots[existingIdx] = null;
      }
      this.slots[slotIndex] = heroToPlace;
      this.selectedPoolHero = null;
      this.savePositions();
    }
  }

  removeHeroFromSlot(slotIndex: number): void {
    if (this.slots[slotIndex]) {
      this.slots[slotIndex] = null;
      this.savePositions();
    }
  }

  clearFormation(): void {
    this.slots = [null, null, null, null, null];
    this.savePositions('Đã làm trống trận hình!');
  }

  autoArrange(): void {
    if (!this.heroes || this.heroes.length === 0) {
      this.showCustomToast('Không có võ tướng để tự động xếp!', 'warning');
      return;
    }

    // Sort heroes by power descending
    const sorted = [...this.heroes].sort((a, b) => (b.power ?? 0) - (a.power ?? 0));
    this.slots = [null, null, null, null, null];
    for (let i = 0; i < Math.min(sorted.length, 5); i++) {
      this.slots[i] = sorted[i];
    }
    this.savePositions('Đã tự động xếp 5 tướng mạnh nhất!');
  }

  savePositions(customMessage?: string): void {
    if (this.isSaving) return;
    this.isSaving = true;

    const positions: SlotHeroPositionDto[] = [1, 2, 3, 4, 5].map((slotNum) => ({
      slot: slotNum,
      heroId: this.slots[slotNum - 1]?.id ?? null
    }));

    this.formationService.updatePositions(this.currentFormationCode, positions).subscribe({
      next: (res) => {
        this.isSaving = false;
        if (res.data) {
          this.formationDetail = res.data;
          this.applySlotsFromDetail(res.data);
          this.updateSummaryData(res.data);
        }
        this.showCustomToast(customMessage || 'Đã cập nhật trận hình thành công!', 'success');
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.isSaving = false;
        console.error('Failed to update positions:', err);
        this.showCustomToast('Cập nhật trận hình thất bại!', 'warning');
        // Reload detail to restore server truth
        this.loadFormationDetail(this.currentFormationCode);
      }
    });
  }

  selectFormationForBattle(): void {
    if (this.isSelecting || this.activeFormationCode === this.currentFormationCode) return;
    this.isSelecting = true;

    this.formationService.selectFormation(this.currentFormationCode).subscribe({
      next: (res) => {
        this.isSelecting = false;
        this.activeFormationCode = this.currentFormationCode;
        if (res.data) {
          this.formationDetail = res.data;
          this.updateSummaryData(res.data);
        }
        // Update isSelected flag in formations list
        this.formations.forEach((f) => {
          f.isSelected = f.code === this.currentFormationCode;
        });
        this.showCustomToast(`Đã chọn [${this.formationDetail?.name}] làm trận hình xuất chiến!`, 'success');
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.isSelecting = false;
        console.error('Failed to select formation:', err);
        this.showCustomToast('Không thể kích hoạt trận hình!', 'warning');
        this.cdr.markForCheck();
      }
    });
  }

  upgradeFormation(): void {
    if (this.isUpgrading) return;
    if (!this.formationDetail?.upgradeCost?.canUpgrade) {
      this.showCustomToast(
        this.formationDetail?.upgradeCost?.cannotUpgradeReason || 'Không đủ điều kiện nâng cấp!',
        'warning'
      );
      return;
    }

    this.isUpgrading = true;
    this.formationService.upgradeFormation(this.currentFormationCode).subscribe({
      next: (res) => {
        this.isUpgrading = false;
        if (res.data && this.formationDetail) {
          this.formationDetail.level = res.data.newLevel;
          this.formationDetail.currentBonus = res.data.newBonus;
          this.formationDetail.baseHeroPower = res.data.baseHeroPower;
          this.formationDetail.formationBonusPower = res.data.formationBonusPower;
          this.formationDetail.totalPower = res.data.totalPower;
          this.formationDetail.upgradeCost = res.data.nextUpgradeCost;

          this.gold = res.data.newWalletGold;
          this.stones = res.data.newStoneQuantity;

          // Update summary in list
          const summary = this.formations.find((f) => f.code === this.currentFormationCode);
          if (summary) {
            summary.level = res.data.newLevel;
            summary.currentBonus = res.data.newBonus;
            summary.baseHeroPower = res.data.baseHeroPower;
            summary.formationBonusPower = res.data.formationBonusPower;
            summary.totalPower = res.data.totalPower;
          }
        }
        this.showCustomToast(`Nâng cấp trận pháp lên Cấp ${res.data?.newLevel} thành công!`, 'success');
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.isUpgrading = false;
        console.error('Failed to upgrade formation:', err);
        const errMsg = err?.error?.message || err?.message || 'Nâng cấp trận pháp thất bại!';
        this.showCustomToast(errMsg, 'warning');
        this.cdr.markForCheck();
      }
    });
  }

  private updateSummaryData(detail: FormationDetailDto): void {
    const summary = this.formations.find((f) => f.code === detail.code);
    if (summary) {
      summary.totalPower = detail.totalPower;
      summary.baseHeroPower = detail.baseHeroPower;
      summary.formationBonusPower = detail.formationBonusPower;
      summary.heroCount = detail.slots.filter((s) => s.hero != null).length;
      summary.level = detail.level;
      summary.currentBonus = detail.currentBonus;
    }
  }

  mapToHero(rpgHero: PlayerHeroDto | null, slotIndex: number): Hero | null {
    if (!rpgHero) return null;
    return {
      id: rpgHero.id,
      name: rpgHero.name,
      avatar: rpgHero.avatar || '/assets/images/dcs-game/kiet.png',
      hp: rpgHero.stats?.hp || 1000,
      maxHp: rpgHero.stats?.hp || 1000,
      mana: 50,
      maxMana: 100,
      attack: rpgHero.stats?.atk || Math.floor(rpgHero.power / 10),
      defense: rpgHero.stats?.def || 50,
      speed: rpgHero.stats?.spd || 100,
      magicDamage: rpgHero.stats?.magicDamage || 0,
      magicResistance: rpgHero.stats?.magicResistance || 0,
      position: slotIndex + 1,
      team: 'left',
      statusEffects: [],
      stars: rpgHero.stars || 1,
      auraTier: rpgHero.auraTier,
      starAura: rpgHero.starAura,
      heroTemplateId: rpgHero.heroTemplateId
    };
  }

  getFrontlineCount(): number {
    return [this.slots[0], this.slots[2], this.slots[4]].filter((h) => h != null).length;
  }

  getBacklineCount(): number {
    return [this.slots[1], this.slots[3]].filter((h) => h != null).length;
  }

  getDeployedHeroCount(): number {
    return this.slots.filter((h) => h != null).length;
  }

  getAverageLevel(): number {
    const placed = this.slots.filter((h) => h != null) as PlayerHeroDto[];
    if (placed.length === 0) return 0;
    const sum = placed.reduce((acc, curr) => acc + (curr.level || 1), 0);
    return Math.round(sum / placed.length);
  }

  showCustomToast(msg: string, type: 'success' | 'warning' | 'info'): void {
    this.toastMessage = msg;
    this.toastType = type;
    this.showToast = true;
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }
    this.toastTimer = setTimeout(() => {
      this.showToast = false;
      this.cdr.markForCheck();
    }, 3000);
    this.cdr.markForCheck();
  }

  formatNumber(val: number | undefined | null): string {
    if (val === undefined || val === null) return '0';
    return Number(val).toLocaleString('vi-VN');
  }
}
