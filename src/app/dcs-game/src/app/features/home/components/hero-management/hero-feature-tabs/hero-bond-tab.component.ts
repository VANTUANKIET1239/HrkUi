import { Component, Input } from '@angular/core';
import { HeroFeatureTabContext } from './hero-feature-tab.models';

@Component({
  selector: 'app-hero-bond-tab',
  standalone: true,
  template: `
    <section class="bond-panel">
      <div class="panel-title">Kích Duyên Định Mệnh</div>
      <div class="bond-card active"><b>Sát Thủ Trị Deadline</b><span>Đang kích hoạt · +10% Công</span></div>
      <div class="bond-card"><b>Thần Binh Vô Cực</b><span>Chưa đủ tướng · +15% HP</span></div>
      <p class="panel-description">Duyên của {{ context.hero.name }} sẽ được mở rộng từ cấu hình trong các bản cập nhật sau.</p>
    </section>
  `,
  styleUrl: './hero-feature-tab.component.scss',
})
export class HeroBondTabComponent {
  @Input({ required: true }) context!: HeroFeatureTabContext;
}
