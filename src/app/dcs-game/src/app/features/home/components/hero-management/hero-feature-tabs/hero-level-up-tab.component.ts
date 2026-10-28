import { HrkTranslatePipe } from '@hrk/localization/hrk-translate.pipe';
import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { HeroFeatureTabContext } from './hero-feature-tab.models';

@Component({
  selector: 'app-hero-level-up-tab',
  standalone: true,
  imports: [HrkTranslatePipe, CommonModule],
  template: `
    <section class="actions-group">
      <div class="panel-header-sub">{{ 'Tính Năng Tăng Trưởng' | hrkTranslate }}</div>
      <div *ngIf="context.upgradePreview as preview" class="preview-card">
        <div class="preview-heading"><span>{{ 'Cấp {{p0}} → {{p1}}' | hrkTranslate:{p0: (preview.currentLevel), p1: (preview.nextLevel)} }}</span><span>{{ 'Tối đa {{p0}}' | hrkTranslate:{p0: (preview.maxLevel)} }}</span></div>
        <div class="resource-row gold"><span>{{ 'Vàng' | hrkTranslate }}</span><span>{{ preview.goldCost | number }}</span></div>
        <div class="resource-row info"><span>{{ 'Đá nâng cấp' | hrkTranslate }}</span><span>{{ preview.materialCost }}</span></div>
        <div class="stat-increase">HP +{{ preview.statIncrease.hp }} · ATK +{{ preview.statIncrease.atk }} · DEF +{{ preview.statIncrease.def }} · SPD +{{ preview.statIncrease.spd }}</div>
      </div>
      <div class="action-grid">
        <button class="feature-action" (click)="context.upgradeHero(1)" [disabled]="context.isUpgradingHero || !context.upgradePreview || context.upgradePreview.currentLevel >= context.upgradePreview.maxLevel"><i class="bi bi-chevron-double-up text-success"></i>{{ 'Nâng Cấp' | hrkTranslate }}</button>
        <button class="feature-action" (click)="context.upgradeHero(5)" [disabled]="context.isUpgradingHero || !context.upgradePreview || context.upgradePreview.currentLevel >= context.upgradePreview.maxLevel"><i class="bi bi-lightning-fill text-warning"></i>{{ 'Đột Phá Nhanh' | hrkTranslate }}</button>
      </div>
    </section>
  `,
  styleUrl: './hero-feature-tab.component.scss',
})
export class HeroLevelUpTabComponent {
  @Input({ required: true }) context!: HeroFeatureTabContext;
}
