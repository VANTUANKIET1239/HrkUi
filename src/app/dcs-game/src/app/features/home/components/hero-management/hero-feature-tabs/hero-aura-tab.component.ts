import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { HeroFeatureTabContext } from './hero-feature-tab.models';

@Component({
  selector: 'app-hero-aura-tab',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="aura-panel">
      <div class="panel-title">Hệ Thống Thức Tỉnh Hào Quang</div>
      <p class="panel-description">Chọn cấp hào quang để xem hiệu ứng đang áp dụng cho võ tướng.</p>
      <div class="aura-grid">
        <button *ngFor="let aura of auras" class="aura-card" [class.active]="context.hero.auraTier === aura.tier" (click)="context.setAuraTier(aura.tier)">
          <span class="aura-tier" [style.background]="aura.color">Tier {{ aura.tier }}</span><span>{{ aura.name }}</span><i class="aura-dot" [style.background]="aura.color" [style.box-shadow]="'0 0 8px ' + aura.color"></i>
        </button>
      </div>
      <div class="aura-description"><i class="bi bi-info-circle"></i><div><b>{{ activeAura.name }}</b><span>{{ activeAura.description }}</span></div></div>
    </section>
  `,
  styleUrl: './hero-feature-tab.component.scss',
})
export class HeroAuraTabComponent {
  @Input({ required: true }) context!: HeroFeatureTabContext;
  readonly auras = [
    { tier: 1 as const, name: 'Blue Aura', color: '#3b82f6', description: 'Hào Quang Xanh Băng: tăng nhẹ tốc độ đánh và tạo thần sắc tươi mát.' },
    { tier: 2 as const, name: 'Purple Aura', color: '#9333ea', description: 'Hào Quang Tím Hắc Ám: tăng sát thương kỹ năng cơ bản.' },
    { tier: 3 as const, name: 'Golden Aura', color: '#fbbf24', description: 'Hoàng Kim Thần Điện: tăng tỷ lệ bạo kích và sát thương chí mạng.' },
    { tier: 4 as const, name: 'Red Lightning', color: '#ef4444', description: 'Lôi Quang Xích Thần: tăng hút máu và sát thương bạo kích.' },
  ];

  get activeAura() {
    return this.auras.find((aura) => aura.tier === this.context.hero.auraTier) ?? this.auras[0];
  }
}
