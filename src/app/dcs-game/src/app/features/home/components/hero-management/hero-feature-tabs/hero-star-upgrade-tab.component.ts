import { HERO_STAR_COLORS } from '../../../../../core/configs/hero-star-colors';
import { ItemImageComponent } from '../../../../../shared/components/item-image/item-image.component';
import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { HeroBonusAttributeDto } from '../../../../../core/models/player-hero.model';
import { HeroFeatureTabContext } from './hero-feature-tab.models';

@Component({
  selector: 'app-hero-star-upgrade-tab',
  standalone: true,
  imports: [CommonModule, ItemImageComponent],
  template: `
    <section class="star-feature-panel">
      <div class="star-summary-card">
        <div><span class="feature-kicker">Cấp sao hiện tại</span><div class="current-stars"><i *ngFor="let star of stars" class="bi bi-star-fill" [class.active]="star <= context.hero.stars" [style.color]="star <= context.hero.stars ? starColors[context.hero.stars] : null"></i></div></div>
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
          <div class="star-transition"><b [style.color]="starColors[preview.currentStar]">{{ preview.currentStar }} ★</b><span>→</span><b [style.color]="starColors[preview.nextStar]">{{ preview.nextStar }} ★</b></div>
          <div class="detail-row">Lực chiến <span>{{ preview.currentCombatPower | number }} → <b>{{ preview.nextCombatPower | number }}</b></span></div>
          <div class="star-stats"><span>HP +{{ preview.statIncrease.hp }}</span><span>ATK +{{ preview.statIncrease.atk }}</span><span>DEF +{{ preview.statIncrease.def }}</span><span>SPD +{{ preview.statIncrease.spd }}</span></div>
          <div class="detail-row">Tăng trưởng <span>{{ preview.currentGrowthRate | percent:'1.0-2' }} → {{ preview.nextGrowthRate | percent:'1.0-2' }}</span></div>
          <p class="bonus-note" *ngIf="preview.willUnlockBonusAttribute"><i class="bi bi-gem"></i>Mở khóa thuộc tính phụ ngẫu nhiên theo cấu hình, lưu vĩnh viễn.</p>
          <p class="bonus-note">Chọn một loại đá để tiêu hao (không cần cả hai):</p>
          <label class="material-row"><input type="radio" name="star-material" [checked]="materialType === 'UNIVERSAL'" (change)="selectedMaterial = 'UNIVERSAL'" [disabled]="context.isStarUpgrading"><img src="/assets/images/dcs-game/materials/hero-star-stone.png" alt="Đá Tăng Sao"><span>{{ preview.universalStone.name }}</span><b [class.missing]="preview.universalStone.owned < preview.universalStone.required">{{ preview.universalStone.owned }}/{{ preview.universalStone.required }}</b></label>
          <label class="material-row"><input type="radio" name="star-material" [checked]="materialType === 'HERO'" (change)="selectedMaterial = 'HERO'" [disabled]="context.isStarUpgrading"><app-item-image style="width: 44px; height: 44px; flex-shrink: 0" [item]="{ name: preview.heroStone.name, heroStonePortrait: context.hero.avatar, rarityCode: context.hero.rarityCode || context.hero.rarity }"></app-item-image><span>{{ preview.heroStone.name }}</span><b [class.missing]="preview.heroStone.owned < preview.heroStone.required">{{ preview.heroStone.owned }}/{{ preview.heroStone.required }}</b></label>
          <div class="detail-row" [class.missing]="preview.goldOwned < preview.goldRequired">Vàng <span>{{ preview.goldOwned | number }}/{{ preview.goldRequired | number }}</span></div>
          <p class="error-message" *ngIf="!preview.canUpgrade">{{ preview.message }}</p>
          <button class="primary-action" [disabled]="!canUseSelectedMaterial || context.isStarUpgrading" (click)="context.confirmStarUpgrade(materialType)"><span *ngIf="context.isStarUpgrading" class="spinner-border spinner-border-sm"></span>Tăng lên {{ preview.nextStar }} sao</button>
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
  readonly starColors = HERO_STAR_COLORS;
  selectedMaterial: 'HERO' | 'UNIVERSAL' | null = null;

  get materialType(): 'HERO' | 'UNIVERSAL' {
    if (this.selectedMaterial) return this.selectedMaterial;
    const stone = this.context.starUpgradePreview?.heroStone;
    return stone && stone.required > 0 && stone.owned >= stone.required ? 'HERO' : 'UNIVERSAL';
  }

  get canUseSelectedMaterial(): boolean {
    const preview = this.context.starUpgradePreview;
    if (!preview || !preview.canUpgrade) return false;
    const stone = this.materialType === 'HERO' ? preview.heroStone : preview.universalStone;
    return stone.required > 0 && stone.owned >= stone.required;
  }

  formatBonus(attribute: HeroBonusAttributeDto): string {
    return `+${attribute.value}${attribute.isPercentage ? '%' : ''}`;
  }
}
