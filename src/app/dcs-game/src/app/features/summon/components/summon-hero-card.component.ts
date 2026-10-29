import { HrkTranslatePipe } from '@hrk/localization/hrk-translate.pipe';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { HrkImageDirective } from '../../../../../../../libs/shared/ui/controls/hrk-image/hrk-image.directive';
import { SummonHero } from '../../../core/models/summon.model';

@Component({
  selector: 'app-summon-hero-card', standalone: true, imports: [HrkTranslatePipe, HrkImageDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <figure class="hero-card" [style.--rarity]="hero.rarityColorHex || '#94a3b8'">
      <div class="portrait">
        <img [src]="hero.avatar" imageKind="hero" [alt]="(hero.name) | hrkTranslate" draggable="false" />
        @if (isNew) { <span class="new-tag">{{ 'MỚI' | hrkTranslate }}</span> }
        <span class="rarity">{{ (hero.rarityName) | hrkTranslate }}</span>
      </div>
      <figcaption>{{ hero.name }}</figcaption>
      @if (stoneQuantity > 0) { <span class="stones" [title]="(stoneName || 'Đá tướng') | hrkTranslate">{{ 'Trùng · +{{p0}} đá tướng' | hrkTranslate:{p0: (stoneQuantity)} }}</span> }
    </figure>`,
  styles: [`
    :host { display:block; min-width:0; }
    .hero-card { margin:0; overflow:hidden; border:1px solid color-mix(in srgb,var(--rarity),transparent 35%); border-radius:var(--dcs-radius-md, 10px);
      background:linear-gradient(180deg, var(--dcs-surface-raised, #222d38), var(--dcs-surface, #19212a)); height:100%;
      border-bottom: 3px solid var(--rarity); font-family:var(--dcs-font-sans, 'Be Vietnam Pro', sans-serif); }
    .portrait { position:relative; aspect-ratio:1 / 1.08; overflow:hidden; background:radial-gradient(ellipse at bottom,color-mix(in srgb,var(--rarity),transparent 72%),transparent); }
    img { width:100%; height:100%; object-fit:cover; object-position:top center; }
    .rarity { position:absolute; bottom:0; left:0; right:0; padding:14px 5px 5px; background:linear-gradient(transparent, rgba(16, 21, 27, 0.94)); color:var(--rarity); font-size:10px; font-weight:800; text-align:center; }
    figcaption { padding:8px 6px; color:var(--dcs-text-primary, #f0f4f7); font-size:12px; font-weight:700; line-height:1.35; text-align:center; overflow-wrap:anywhere; }
    .new-tag { position:absolute; top:6px; left:6px; background:var(--dcs-accent, #bcf27b); color:var(--dcs-accent-contrast, #0b1305); font-size:9px; font-weight:800; padding:3px 6px; border-radius:4px; }
    .stones { display:block; padding:0 5px 8px; text-align:center; color:var(--dcs-secondary, #38bdf8); font-size:10px; font-weight:600; }
  `]
})
export class SummonHeroCardComponent {
  @Input({ required: true }) hero!: SummonHero;
  @Input() isNew = false;
  @Input() stoneQuantity = 0;
  @Input() stoneName?: string | null;
}
