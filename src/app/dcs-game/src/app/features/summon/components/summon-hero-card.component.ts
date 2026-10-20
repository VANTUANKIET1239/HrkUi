import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { HrkImageDirective } from '../../../../../../../libs/shared/ui/controls/hrk-image/hrk-image.directive';
import { SummonHero } from '../../../core/models/summon.model';

@Component({
  selector: 'app-summon-hero-card', standalone: true, imports: [HrkImageDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <figure class="hero-card" [style.--rarity]="hero.rarityColorHex || '#b6a77f'">
      <div class="portrait">
        <img [src]="hero.avatar" imageKind="hero" [alt]="hero.name" draggable="false" />
        @if (isNew) { <span class="new-tag">MỚI</span> }
        <span class="rarity">{{ hero.rarityName }}</span>
      </div>
      <figcaption>{{ hero.name }}</figcaption>
      @if (stoneQuantity > 0) { <span class="stones" [title]="stoneName || 'Đá tướng'">Trùng · +{{ stoneQuantity }} đá tướng</span> }
    </figure>`,
  styles: [`
    :host { display:block; min-width:0; }
    .hero-card { margin:0; overflow:hidden; border:1px solid color-mix(in srgb,var(--rarity),transparent 25%); border-radius:7px;
      background:linear-gradient(145deg,#24202d,#11121d); box-shadow:inset 0 0 18px color-mix(in srgb,var(--rarity),transparent 90%); height:100%;
      border-bottom: 4px solid var(--rarity); }
    .portrait { position:relative; aspect-ratio:1 / 1.08; overflow:hidden; background:radial-gradient(ellipse at bottom,color-mix(in srgb,var(--rarity),transparent 65%),transparent); }
    img { width:100%; height:100%; object-fit:cover; object-position:top center; }
    .rarity { position:absolute; bottom:0; left:0; right:0; padding:14px 5px 5px; background:linear-gradient(transparent,#0b0b14ed); color:var(--rarity); font-size:10px; text-align:center; }
    figcaption { padding:9px 5px; color:#f6ecda; font-size:12px; font-weight:600; line-height:1.4; text-align:center; overflow-wrap:anywhere; }
    .new-tag { position:absolute; top:6px; left:6px; background:#d9b968; color:#20180c; font-size:9px; font-weight:800; padding:3px 5px; border-radius:2px; }
    .stones { display:block; padding:0 5px 9px; text-align:center; color:#b8cdf5; font-size:10px; }
  `]
})
export class SummonHeroCardComponent {
  @Input({ required: true }) hero!: SummonHero;
  @Input() isNew = false;
  @Input() stoneQuantity = 0;
  @Input() stoneName?: string | null;
}
