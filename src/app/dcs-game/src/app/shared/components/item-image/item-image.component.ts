import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges } from '@angular/core';

/** Shared item artwork for inventory, material pickers and selected forge slots. */
@Component({
  selector: 'app-item-image',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="artwork" [class.hero-stone]="!!item.heroStonePortrait" role="img" [attr.aria-label]="item.name">
      <img *ngIf="item.heroStonePortrait && !portraitFailed" class="portrait"
        [src]="item.heroStonePortrait" alt="" (error)="portraitFailed = true">
      <img *ngIf="source && !imageFailed; else fallback" [src]="source" alt="" (error)="imageFailed = true">
      <ng-template #fallback><i [class]="'bi ' + (item.icon || 'bi-gem')"></i></ng-template>
    </span>
  `,
  styles: [`
    :host { display: inline-block; width: 100%; height: 100%; }
    .artwork { display: inline-flex; position: relative; width: 100%; height: 100%; align-items: center; justify-content: center; }
    img { position: relative; width: 100%; height: 100%; object-fit: contain; }
    .hero-stone .portrait { position: absolute; width: 64%; height: 64%; top: 21%; left: 18%; object-fit: cover; object-position: top; border-radius: 50%; background: radial-gradient(circle, #583759, #171026); }
    i { font-size: 2rem; color: #eac264; }
  `],
})
export class ItemImageComponent implements OnChanges {
  @Input({ required: true }) item!: {
    name: string; imagePath?: string; itemCode?: string; icon?: string;
    heroStonePortrait?: string; rarityCode?: string;
  };
  imageFailed = false;
  portraitFailed = false;

  ngOnChanges(): void {
    this.imageFailed = false;
    this.portraitFailed = false;
  }

  get source(): string | undefined {
    const base = '/assets/images/dcs-game/materials/';
    if (this.item.heroStonePortrait) {
      const rarity = this.item.rarityCode?.toLowerCase() ?? 'rare';
      const supported = ['rare', 'epic', 'legendary', 'mythic'].includes(rarity) ? rarity : 'rare';
      return `${base}hero-stones/hero-stone-${supported}-frame.png`;
    }
    if (this.item.imagePath?.trim()) return this.item.imagePath;
    const code = this.item.itemCode?.toUpperCase() ?? '';
    const stoneTier = /^ENHANCEMENT_STONE_(I|II|III|IV|V)$/.exec(code)?.[1];
    if (stoneTier) return `${base}enhancement-stone-${stoneTier.toLowerCase()}.png`;
    const charms: Record<string, string> = {
      ENHANCEMENT_LUCKY_CHARM: 'lucky-charm.svg',
      ENHANCEMENT_GREATER_LUCKY_CHARM: 'greater-lucky-charm.svg',
      ENHANCEMENT_PROTECTION_CHARM: 'protection-charm.svg',
      HERO_STAR_STONE: 'hero-star-stone.png',
    };
    return charms[code] ? base + charms[code] : undefined;
  }
}
