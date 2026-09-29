import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { HeroBonusAttributeDto } from '../../../../../core/models/player-hero.model';
import { HeroFeatureTabContext } from './hero-feature-tab.models';

@Component({
  selector: 'app-hero-star-upgrade-tab',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="star-feature-panel">
      <div class="star-summary-card">
        <div><span class="feature-kicker">Cấp sao hiện tại</span><div class="current-stars"><i *ngFor="let star of stars" class="bi bi-star-fill" [class.active]="star <= context.hero.stars"></i></div></div>
        <div class="bonus-count"><b>{{ context.hero.starBonusAttributes.length }}</b><span>thuộc tính đã mở</span></div>
      </div>
      <div class="earned-star-bonuses" *ngIf="context.hero.starBonusAttributes.length; else noBonuses">
        <div class="section-caption">Thuộc tính nhận từ số sao</div>
        <div class="bonus-attribute-row" *ngFor="let bonus of context.hero.starBonusAttributes"><span><i class="bi bi-star-fill"></i>Sao {{ bonus.unlockedAtStar }} · {{ bonus.name }}</span><b>{{ formatBonus(bonus) }}</b></div>
      </div>
      <ng-template #noBonuses><p class="empty-feature-state">Chưa có thuộc tính cộng thêm từ sao.</p></ng-template>
      <ng-container *ngIf="context.hero.stars < 5; else maxStar">
        <div class="star-next-preview" *ngIf="context.starUpgradePreview as preview; else loading">
          <div class="section-caption">Lần tăng sao kế tiếp</div>
          <div class="star-transition">{{ preview.currentStar }} ★ <span>→</span> {{ preview.nextStar }} ★</div>
          <div class="detail-row">Lực chiến <span>{{ preview.currentCombatPower | number }} → <b>{{ preview.nextCombatPower | number }}</b></span></div>
          <div class="star-stats"><span>HP +{{ preview.statIncrease.hp }}</span><span>ATK +{{ preview.statIncrease.atk }}</span><span>DEF +{{ preview.statIncrease.def }}</span><span>SPD +{{ preview.statIncrease.spd }}</span></div>
          <div class="detail-row">Tăng trưởng <span>{{ preview.currentGrowthRate | percent:'1.0-2' }} → {{ preview.nextGrowthRate | percent:'1.0-2' }}</span></div>
          <p class="bonus-note"><i class="bi bi-gem"></i>Mở khóa thêm 1 thuộc tính phụ ngẫu nhiên, lưu vĩnh viễn.</p>
          <div class="material-row"><img src="/assets/images/dcs-game/materials/hero-star-stone.png" alt="Đá Tăng Sao"><span>{{ preview.universalStone.name }}</span><b [class.missing]="preview.universalStone.owned < preview.universalStone.required">{{ preview.universalStone.owned }}/{{ preview.universalStone.required }}</b></div>
          <div class="material-row"><span class="hero-stone"><img class="portrait" [src]="context.hero.avatar" alt=""><img class="frame" [src]="'/assets/images/dcs-game/materials/hero-stones/hero-stone-' + context.hero.rarity.toLowerCase() + '-frame.png'" alt=""></span><span>{{ preview.heroStone.name }}</span><b [class.missing]="preview.heroStone.owned < preview.heroStone.required">{{ preview.heroStone.owned }}/{{ preview.heroStone.required }}</b></div>
          <div class="detail-row" [class.missing]="preview.goldOwned < preview.goldRequired">Vàng <span>{{ preview.goldOwned | number }}/{{ preview.goldRequired | number }}</span></div>
          <p class="error-message" *ngIf="!preview.canUpgrade">{{ preview.message }}</p>
          <button class="primary-action" [disabled]="!preview.canUpgrade || context.isStarUpgrading" (click)="context.confirmStarUpgrade()"><span *ngIf="context.isStarUpgrading" class="spinner-border spinner-border-sm"></span>Tăng lên {{ preview.nextStar }} sao</button>
        </div>
        <ng-template #loading><div class="empty-feature-state"><span class="spinner-border spinner-border-sm text-warning"></span> Đang tải cấu hình tăng sao...</div></ng-template>
      </ng-container>
      <ng-template #maxStar><div class="max-star-state"><i class="bi bi-stars"></i><b>Đã đạt 5 sao tối đa</b><span>Toàn bộ mốc thuộc tính sao đã được mở khóa.</span></div></ng-template>
    </section>
  `,
  styleUrl: './hero-feature-tab.component.scss',
})
export class HeroStarUpgradeTabComponent {
  @Input({ required: true }) context!: HeroFeatureTabContext;
  readonly stars = [1, 2, 3, 4, 5];

  formatBonus(attribute: HeroBonusAttributeDto): string {
    return `+${attribute.value}${attribute.isPercentage ? '%' : ''}`;
  }
}
