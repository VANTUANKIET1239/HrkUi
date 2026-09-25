import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { CatalogGroup, CatalogHero, CatalogItem } from '../../../../core/models/catalog.model';
import { CatalogService } from '../../../../core/services/catalog.service';

type LibraryTab = 'heroes' | 'items';

@Component({
  selector: 'app-library',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './library.component.html',
  styleUrl: './library.component.scss'
})
export class LibraryComponent implements OnInit {
  @Output() close = new EventEmitter<void>();

  activeTab: LibraryTab = 'heroes';
  searchTerm = '';
  loading = true;
  error = '';
  heroes: CatalogHero[] = [];
  items: CatalogItem[] = [];
  selected: CatalogHero | CatalogItem | null = null;

  private readonly rarityOrder: Record<string, number> = {
    mythic: 0, legendary: 1, epic: 2, rare: 3, uncommon: 4, common: 5
  };
  private readonly rarityColors: Record<string, string> = {
    mythic: '#f97316', legendary: '#facc15', epic: '#c084fc', rare: '#60a5fa',
    uncommon: '#4ade80', common: '#cbd5e1'
  };

  constructor(private readonly catalogService: CatalogService) {}

  ngOnInit(): void {
    forkJoin({ heroes: this.catalogService.getHeroes(), items: this.catalogService.getItems() }).subscribe({
      next: result => {
        this.heroes = result.heroes?.data ?? [];
        this.items = result.items?.data ?? [];
        this.loading = false;
      },
      error: () => {
        this.error = 'Không thể tải dữ liệu thư viện. Vui lòng thử lại sau.';
        this.loading = false;
      }
    });
  }

  get heroGroups(): CatalogGroup<CatalogHero>[] {
    return this.groupByRarity(this.heroes.filter(x => this.matches(`${x.name} ${x.factionName} ${x.className}`)));
  }

  get itemGroups(): CatalogGroup<CatalogItem>[] {
    return this.groupByRarity(this.items.filter(x => this.matches(`${x.name} ${x.categoryName}`)));
  }

  get currentGroups(): CatalogGroup<CatalogHero | CatalogItem>[] {
    return this.activeTab === 'heroes'
      ? (this.heroGroups as unknown as CatalogGroup<CatalogHero | CatalogItem>[])
      : (this.itemGroups as unknown as CatalogGroup<CatalogHero | CatalogItem>[]);
  }

  getEntryImage(entry: CatalogHero | CatalogItem): string {
    if (this.isHero(entry)) {
      return entry.avatar;
    }
    return entry.imagePath || entry.icon || '/assets/images/dcs-game/items/formation_stone.png';
  }

  getEntrySubtitle(entry: CatalogHero | CatalogItem): string {
    if (this.isHero(entry)) {
      return `${entry.className} · ${entry.factionName}`;
    }
    return entry.categoryName;
  }

  asItem(entry: CatalogHero | CatalogItem): CatalogItem {
    return entry as CatalogItem;
  }

  selectTab(tab: LibraryTab): void {
    this.activeTab = tab;
    this.selected = null;
  }

  selectEntry(entry: CatalogHero | CatalogItem): void {
    this.selected = entry;
  }

  isHero(entry: CatalogHero | CatalogItem): entry is CatalogHero {
    return 'factionName' in entry;
  }

  rarityColor(code?: string, customColor?: string): string {
    return customColor || this.rarityColors[(code || 'common').toLowerCase()] || '#cbd5e1';
  }

  trackGroup(_: number, group: CatalogGroup<unknown>): string { return group.code; }
  trackEntry(_: number, entry: CatalogHero | CatalogItem): number { return entry.id; }

  private matches(value: string): boolean {
    return !this.searchTerm.trim() || value.toLocaleLowerCase('vi').includes(this.searchTerm.trim().toLocaleLowerCase('vi'));
  }

  private groupByRarity<T extends { rarityCode: string; rarityName: string; rarityColorHex?: string }>(entries: T[]): CatalogGroup<T>[] {
    const groups = new Map<string, CatalogGroup<T>>();
    for (const entry of entries) {
      const code = (entry.rarityCode || 'common').toLowerCase();
      const group = groups.get(code) ?? {
        code,
        name: entry.rarityName || entry.rarityCode || 'Thường',
        color: this.rarityColor(code, entry.rarityColorHex),
        items: []
      };
      group.items.push(entry);
      groups.set(code, group);
    }
    return [...groups.values()].sort((a, b) =>
      (this.rarityOrder[a.code] ?? 99) - (this.rarityOrder[b.code] ?? 99));
  }
}
