import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { SummonCount, SummonPool } from '../../../core/models/summon.model';

@Component({
  selector: 'app-summon-chest', standalone: true, imports: [DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="chest-panel" [class.premium]="pool.code === 'PREMIUM'" [class.active]="active">
      <div class="panel-top"><span class="eyebrow">{{ pool.code === 'PREMIUM' ? 'GIAO ƯỚC TINH TÚ' : 'LỜI HIỆU TRIỆU' }}</span>
        <button class="rates-link" type="button" (click)="viewPool.emit()" [disabled]="busy">Tướng & tỷ lệ <i class="bi bi-info-circle"></i></button></div>
      <h2>{{ pool.name }}</h2>
      <p class="description">{{ pool.code === 'PREMIUM' ? 'Đánh thức những chiến hữu phi thường.' : 'Mở rương báu. Tìm người đồng hành mới.' }}</p>
      <div class="chest-art" [class.charging]="active">
        <div class="magic-ring"></div><div class="chest-halo"></div>
        <img [src]="'/assets/images/dcs-game/summon/' + (pool.code === 'PREMIUM' ? 'premium' : 'normal') + '-chest.png'" [alt]="pool.name" />
      </div>
      <div class="open-actions">
        <button class="open-one" type="button" [disabled]="busy || balance < pool.singleCost" (click)="open.emit(1)">
          <span>Chiêu mộ ×1</span><small><i [class]="currencyIcon"></i> {{ pool.singleCost | number }} {{ currencyName }}</small>
        </button>
        <button class="open-ten" type="button" [disabled]="busy || balance < pool.tenCost" (click)="open.emit(10)">
          <span>Chiêu mộ ×10</span><small><i [class]="currencyIcon"></i> {{ pool.tenCost | number }} {{ currencyName }}</small>
        </button>
      </div>
      <p class="footnote">{{ balance < pool.singleCost ? 'Chưa đủ ' + currencyName + ' để chiêu mộ.' : 'Tướng trùng sẽ chuyển thành đá tướng tương ứng.' }}</p>
    </article>`,
  styleUrl: './summon-chest.component.scss'
})
export class SummonChestComponent {
  @Input({ required: true }) pool!: SummonPool;
  @Input() balance = 0;
  @Input() busy = false;
  @Input() active = false;
  @Output() open = new EventEmitter<SummonCount>();
  @Output() viewPool = new EventEmitter<void>();
  get currencyName(): string { return this.pool.currency === 'GOLD' ? 'Vàng' : 'Kim cương'; }
  get currencyIcon(): string { return this.pool.currency === 'GOLD' ? 'bi bi-coin' : 'bi bi-gem'; }
}
