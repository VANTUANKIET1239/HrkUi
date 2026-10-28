import { HrkTranslatePipe } from '@hrk/localization/hrk-translate.pipe';
import { Component, Input } from '@angular/core';
import { HeroFeatureTabContext } from './hero-feature-tab.models';

@Component({
  imports: [HrkTranslatePipe],
  selector: 'app-hero-bond-tab',
  standalone: true,
  template: `
    <section class="bond-panel">
      <div class="panel-title">{{ 'Kích Duyên Định Mệnh' | hrkTranslate }}</div>
      <div class="bond-card active"><b>{{ 'Sát Thủ Trị Deadline' | hrkTranslate }}</b><span>{{ 'Đang kích hoạt · +10% Công' | hrkTranslate }}</span></div>
      <div class="bond-card"><b>{{ 'Thần Binh Vô Cực' | hrkTranslate }}</b><span>{{ 'Chưa đủ tướng · +15% HP' | hrkTranslate }}</span></div>
      <p class="panel-description">{{ 'Duyên của {{p0}} sẽ được mở rộng từ cấu hình trong các bản cập nhật sau.' | hrkTranslate:{p0: (context.hero.name)} }}</p>
    </section>
  `,
  styleUrl: './hero-feature-tab.component.scss',
})
export class HeroBondTabComponent {
  @Input({ required: true }) context!: HeroFeatureTabContext;
}
