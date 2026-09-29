import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { HeroFeatureTabContext } from './hero-feature-tab.models';

@Component({
  selector: 'app-hero-level-up-tab',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="actions-group">
      <div class="panel-header-sub">Tính Năng Tăng Trưởng</div>
      <div *ngIf="context.upgradePreview as preview" class="preview-card">
        <div class="preview-heading"><span>Cấp {{ preview.currentLevel }} → {{ preview.nextLevel }}</span><span>Tối đa {{ preview.maxLevel }}</span></div>
        <div class="resource-row gold"><span>Vàng</span><span>{{ preview.goldCost | number }}</span></div>
        <div class="resource-row info"><span>Đá nâng cấp</span><span>{{ preview.materialCost }}</span></div>
        <div class="stat-increase">HP +{{ preview.statIncrease.hp }} · ATK +{{ preview.statIncrease.atk }} · DEF +{{ preview.statIncrease.def }} · SPD +{{ preview.statIncrease.spd }}</div>
      </div>
      <div class="action-grid">
        <button class="feature-action" (click)="context.upgradeHero(1)" [disabled]="context.isUpgradingHero || !context.upgradePreview || context.upgradePreview.currentLevel >= context.upgradePreview.maxLevel"><i class="bi bi-chevron-double-up text-success"></i>Nâng Cấp</button>
        <button class="feature-action" (click)="context.upgradeHero(5)" [disabled]="context.isUpgradingHero || !context.upgradePreview || context.upgradePreview.currentLevel >= context.upgradePreview.maxLevel"><i class="bi bi-lightning-fill text-warning"></i>Đột Phá Nhanh</button>
      </div>
    </section>
  `,
  styleUrl: './hero-feature-tab.component.scss',
})
export class HeroLevelUpTabComponent {
  @Input({ required: true }) context!: HeroFeatureTabContext;
}
