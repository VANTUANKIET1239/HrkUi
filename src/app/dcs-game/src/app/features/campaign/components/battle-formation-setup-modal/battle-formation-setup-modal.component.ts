import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ChangeDetectorRef,
  HostListener,
  OnDestroy,
  DestroyRef,
  inject
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, tap, map, catchError } from 'rxjs/operators';
import { DungeonStage, BattleFormationDraft, BattleFormationPosition, FormationPreviewResponse } from '../../../../core/models/dungeon.model';
import { FormationDetailDto, PlayerFormationSummaryDto } from '../../../../core/models/formation.model';
import { PlayerHeroDto } from '../../../../core/models/player-hero.model';
import { FormationService } from '../../../../core/services/formation.service';
import { PlayerHeroService } from '../../../../core/services/player-hero.service';
import { DungeonApiService } from '../../../../core/services/dungeon-api.service';
import { InventoryService } from '../../../../core/services/inventory.service';

@Component({
  selector: 'app-battle-formation-setup-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './battle-formation-setup-modal.component.html',
  styleUrl: './battle-formation-setup-modal.component.scss'
})
export class BattleFormationSetupModalComponent implements OnInit, OnDestroy {
  @Input({ required: true }) stage!: DungeonStage;
  @Input() staminaCurrent = 0;
  @Input() isStarting = false;

  @Output() close = new EventEmitter<void>();
  @Output() startBattle = new EventEmitter<BattleFormationDraft>();

  private readonly formationService = inject(FormationService);
  private readonly playerHeroService = inject(PlayerHeroService);
  private readonly dungeonApi = inject(DungeonApiService);
  private readonly inventoryService = inject(InventoryService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  // Data states
  formations: PlayerFormationSummaryDto[] = [];
  selectedFormationCode = 'LUC_DO';
  formationDetail: FormationDetailDto | null = null;
  heroes: PlayerHeroDto[] = [];

  // Tactical Slots: indices 0..4 map to slots 1..5
  slots: (PlayerHeroDto | null)[] = [null, null, null, null, null];

  // Selection & drag states
  selectedPoolHero: PlayerHeroDto | null = null;
  selectedSlotIndex: number | null = null;
  draggedHero: PlayerHeroDto | null = null;
  dragSource: 'pool' | 'grid' | null = null;
  draggedSlotIndex: number | null = null;

  // Server-side preview & power states
  previewData: FormationPreviewResponse | null = null;
  isPreviewLoading = false;
  validationErrors: string[] = [];
  isBagFull = false;

  // Toast / notification
  toastMessage = '';
  toastType: 'success' | 'warning' | 'info' = 'info';
  showToast = false;
  private toastTimer: any = null;

  // Saving default formation state
  isSavingDefault = false;

  // Search filter
  searchHeroQuery = '';

  private readonly previewSubject = new Subject<BattleFormationDraft>();
  private previewVersion = 0;

  ngOnInit(): void {
    this.setupPreviewDebounce();
    this.loadData();
    this.checkInventoryCapacity();
  }

  ngOnDestroy(): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
  }

  private normalizeDraftKey(draft: BattleFormationDraft): string {
    const posKey = (draft.positions || [])
      .map(p => `${p.slot}:${p.heroId ?? 0}`)
      .sort()
      .join('|');
    return `${draft.formationCode}#${posKey}`;
  }

  private setupPreviewDebounce(): void {
    this.previewSubject
      .pipe(
        debounceTime(150),
        distinctUntilChanged((prev, curr) => this.normalizeDraftKey(prev) === this.normalizeDraftKey(curr)),
        tap(() => {
          this.previewVersion++;
          this.isPreviewLoading = true;
          this.cdr.markForCheck();
        }),
        switchMap((draft) => {
          const currentVersion = this.previewVersion;
          return this.dungeonApi.previewFormation(this.stage.id, draft).pipe(
            map(res => ({ res, version: currentVersion })),
            catchError(err => {
              console.error('Failed to preview formation:', err);
              return of({ res: null, version: currentVersion });
            })
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(({ res, version }) => {
        if (version === this.previewVersion) {
          this.isPreviewLoading = false;
          if (res?.data) {
            this.previewData = res.data;
            this.validationErrors = res.data.validationErrors ?? [];
          }
          this.cdr.markForCheck();
        }
      });
  }

  private loadData(): void {
    this.isPreviewLoading = true;

    // Load available player heroes
    this.playerHeroService.list().subscribe({
      next: (res) => {
        this.heroes = res.data ?? [];
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Failed to load heroes:', err)
    });

    // Load formation templates and select current default
    this.formationService.getFormations().subscribe({
      next: (res) => {
        this.formations = res.data ?? [];
        const activeTmpl = this.formations.find(f => f.isSelected) ?? this.formations[0];
        if (activeTmpl) {
          this.selectedFormationCode = activeTmpl.code;
          this.loadFormationDetail(activeTmpl.code);
        }
      },
      error: (err) => {
        console.error('Failed to load formations:', err);
        this.isPreviewLoading = false;
      }
    });
  }

  private checkInventoryCapacity(): void {
    this.inventoryService.getInventory().subscribe({
      next: (res) => {
        if (res.data) {
          const used = res.data.length ?? 0;
          this.isBagFull = used >= 100;
          this.cdr.markForCheck();
        }
      },
      error: () => {}
    });
  }

  loadFormationDetail(code: string): void {
    this.isPreviewLoading = true;
    this.formationService.getFormationDetail(code).subscribe({
      next: (res) => {
        if (res.data) {
          this.formationDetail = res.data;
          this.selectedFormationCode = res.data.code;

          // Populate tactical slots
          this.slots = [null, null, null, null, null];
          if (res.data.slots) {
            for (const s of res.data.slots) {
              if (s.slot >= 1 && s.slot <= 5 && s.hero) {
                this.slots[s.slot - 1] = s.hero;
              }
            }
          }
          this.triggerPreview();
        }
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Failed to load formation detail:', err);
        this.isPreviewLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  onSelectFormation(code: string): void {
    if (this.selectedFormationCode === code || this.isStarting) return;
    this.selectedFormationCode = code;
    this.loadFormationDetail(code);
  }

  get currentDraft(): BattleFormationDraft {
    const positions: BattleFormationPosition[] = [];
    for (let i = 0; i < 5; i++) {
      positions.push({
        slot: i + 1,
        heroId: this.slots[i]?.id ?? null
      });
    }
    return {
      formationCode: this.selectedFormationCode,
      positions
    };
  }

  private triggerPreview(): void {
    this.previewSubject.next(this.currentDraft);
  }

  // --- Hero Placement & Interaction Logic ---

  isHeroInFormation(heroId: number): boolean {
    return this.slots.some(h => h?.id === heroId);
  }

  getSlotOfHero(heroId: number): number | null {
    const idx = this.slots.findIndex(h => h?.id === heroId);
    return idx >= 0 ? idx + 1 : null;
  }

  get deployedCount(): number {
    return this.slots.filter(h => h !== null).length;
  }

  get totalPlayerPower(): number {
    if (this.previewData?.totalPower) {
      return this.previewData.totalPower;
    }
    return this.slots.reduce((sum, h) => sum + (h?.power ?? 0), 0);
  }

  get powerDifference(): number {
    return this.totalPlayerPower - (this.stage.recommendedPower || 0);
  }

  get powerStatus(): { label: string; class: string; icon: string } {
    const ratio = this.totalPlayerPower / Math.max(1, this.stage.recommendedPower || 1);
    if (ratio >= 1.15) {
      return { label: 'Ưu Thế Áp Đảo', class: 'status-advantage', icon: '⚡' };
    }
    if (ratio >= 0.9) {
      return { label: 'Cân Bằng Thử Thách', class: 'status-balanced', icon: '⚖️' };
    }
    return { label: 'Nguy Hiểm - Lực Chiến Thấp', class: 'status-danger', icon: '⚠️' };
  }

  get filteredHeroes(): PlayerHeroDto[] {
    if (!this.searchHeroQuery.trim()) {
      return this.heroes;
    }
    const q = this.searchHeroQuery.toLowerCase();
    return this.heroes.filter(h =>
      h.name.toLowerCase().includes(q) ||
      h.className.toLowerCase().includes(q) ||
      h.factionName.toLowerCase().includes(q)
    );
  }

  // Click on a hero in the bottom pool
  onPoolHeroClick(hero: PlayerHeroDto): void {
    if (this.isStarting) return;

    // If this hero is already in formation, clicking it focuses on its slot or deselects
    const existingSlot = this.slots.findIndex(h => h?.id === hero.id);
    if (existingSlot >= 0) {
      this.selectedSlotIndex = existingSlot;
      this.selectedPoolHero = null;
      return;
    }

    if (this.selectedSlotIndex !== null) {
      // Place into the selected slot
      this.slots[this.selectedSlotIndex] = hero;
      this.selectedSlotIndex = null;
      this.selectedPoolHero = null;
      this.triggerPreview();
      return;
    }

    // Toggle pool selection
    if (this.selectedPoolHero?.id === hero.id) {
      this.selectedPoolHero = null;
    } else {
      this.selectedPoolHero = hero;
      // Auto-assign to first empty slot if any
      const emptyIdx = this.slots.findIndex(h => h === null);
      if (emptyIdx >= 0) {
        this.slots[emptyIdx] = hero;
        this.selectedPoolHero = null;
        this.triggerPreview();
      }
    }
  }

  // Click on a tactical slot
  onSlotClick(slotIndex: number): void {
    if (this.isStarting) return;

    if (this.selectedPoolHero) {
      // Place selected hero from pool into this slot
      this.slots[slotIndex] = this.selectedPoolHero;
      this.selectedPoolHero = null;
      this.selectedSlotIndex = null;
      this.triggerPreview();
      return;
    }

    if (this.selectedSlotIndex !== null) {
      if (this.selectedSlotIndex === slotIndex) {
        // Deselect
        this.selectedSlotIndex = null;
      } else {
        // Swap or move between the two slots
        const temp = this.slots[slotIndex];
        this.slots[slotIndex] = this.slots[this.selectedSlotIndex];
        this.slots[this.selectedSlotIndex] = temp;
        this.selectedSlotIndex = null;
        this.triggerPreview();
      }
      return;
    }

    // Select this slot if it has a hero
    if (this.slots[slotIndex] !== null) {
      this.selectedSlotIndex = slotIndex;
    }
  }

  removeHeroFromSlot(slotIndex: number, event?: MouseEvent): void {
    if (event) event.stopPropagation();
    if (this.isStarting) return;
    this.slots[slotIndex] = null;
    if (this.selectedSlotIndex === slotIndex) {
      this.selectedSlotIndex = null;
    }
    this.triggerPreview();
  }

  // --- Drag and Drop Handlers ---

  onDragStartFromPool(event: DragEvent, hero: PlayerHeroDto): void {
    if (this.isStarting) return;
    this.draggedHero = hero;
    this.dragSource = 'pool';
    this.draggedSlotIndex = null;
    event.dataTransfer?.setData('text/plain', String(hero.id));
  }

  onDragStartFromGrid(event: DragEvent, slotIndex: number): void {
    if (this.isStarting || !this.slots[slotIndex]) return;
    this.draggedHero = this.slots[slotIndex];
    this.dragSource = 'grid';
    this.draggedSlotIndex = slotIndex;
    event.dataTransfer?.setData('text/plain', String(this.slots[slotIndex]!.id));
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onDropOnSlot(event: DragEvent, targetSlotIndex: number): void {
    event.preventDefault();
    if (!this.draggedHero || this.isStarting) return;

    if (this.dragSource === 'pool') {
      // Disallow duplicate: if already in another slot, clear old slot
      const existingIdx = this.slots.findIndex(h => h?.id === this.draggedHero!.id);
      if (existingIdx >= 0) {
        this.slots[existingIdx] = null;
      }
      this.slots[targetSlotIndex] = this.draggedHero;
    } else if (this.dragSource === 'grid' && this.draggedSlotIndex !== null) {
      if (this.draggedSlotIndex !== targetSlotIndex) {
        const temp = this.slots[targetSlotIndex];
        this.slots[targetSlotIndex] = this.slots[this.draggedSlotIndex];
        this.slots[this.draggedSlotIndex] = temp;
      }
    }

    this.draggedHero = null;
    this.dragSource = null;
    this.draggedSlotIndex = null;
    this.triggerPreview();
  }

  // --- Actions ---

  onSaveAsDefault(): void {
    if (this.isSavingDefault || this.isStarting) return;
    this.isSavingDefault = true;

    const positions = this.currentDraft.positions.map(p => ({
      slot: p.slot,
      heroId: p.heroId
    }));

    // Update positions and select formation in backend
    this.formationService.updatePositions(this.selectedFormationCode, positions).subscribe({
      next: () => {
        this.formationService.selectFormation(this.selectedFormationCode).subscribe({
          next: () => {
            this.isSavingDefault = false;
            this.showCustomToast('Đã lưu làm đội hình mặc định!', 'success');
            this.cdr.markForCheck();
          },
          error: (err) => {
            this.isSavingDefault = false;
            this.showCustomToast('Không thể chọn làm đội hình mặc định.', 'warning');
            this.cdr.markForCheck();
          }
        });
      },
      error: (err) => {
        this.isSavingDefault = false;
        this.showCustomToast('Lưu đội hình thất bại.', 'warning');
        this.cdr.markForCheck();
      }
    });
  }

  onStartBattle(): void {
    if (this.isStarting || this.isSavingDefault) return;

    if (this.isPreviewLoading) {
      this.showCustomToast('Đang tính lực chiến đội hình, vui lòng đợi trong giây lát...', 'info');
      return;
    }

    if (this.deployedCount === 0) {
      this.showCustomToast('Vui lòng chọn ít nhất 1 võ tướng xuất chiến!', 'warning');
      return;
    }

    if (this.staminaCurrent < this.stage.staminaCost) {
      this.showCustomToast(`Không đủ thể lực! Cần ${this.stage.staminaCost}, hiện có ${this.staminaCurrent}.`, 'warning');
      return;
    }

    if (this.isBagFull) {
      this.showCustomToast('Hành trang đã đầy. Vui lòng dọn bớt trước khi vào phó bản!', 'warning');
      return;
    }

    if (this.previewData && !this.previewData.isValid) {
      this.showCustomToast(this.previewData.validationErrors?.[0] || 'Đội hình không hợp lệ.', 'warning');
      return;
    }

    // Step 2 & 3: Save formation positions and set as default before starting dungeon
    this.isSavingDefault = true;
    const positions = this.currentDraft.positions.map(p => ({
      slot: p.slot,
      heroId: p.heroId
    }));

    this.formationService.updatePositions(this.selectedFormationCode, positions)
      .pipe(
        switchMap(() => this.formationService.selectFormation(this.selectedFormationCode)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          this.isSavingDefault = false;
          // Step 4: After save success, emit start battle
          this.startBattle.emit(this.currentDraft);
        },
        error: (err) => {
          this.isSavingDefault = false;
          console.error('Failed to save default formation before battle:', err);
          this.showCustomToast('Lưu đội hình mặc định thất bại. Không thể bắt đầu phó bản!', 'warning');
          this.cdr.markForCheck();
        }
      });
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop') && !this.isStarting) {
      this.close.emit();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (!this.isStarting) {
      this.close.emit();
    }
  }

  private showCustomToast(msg: string, type: 'success' | 'warning' | 'info' = 'info'): void {
    this.toastMessage = msg;
    this.toastType = type;
    this.showToast = true;
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.showToast = false;
      this.cdr.markForCheck();
    }, 3000);
    this.cdr.markForCheck();
  }
}
