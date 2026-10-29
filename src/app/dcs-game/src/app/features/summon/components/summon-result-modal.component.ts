import { HrkTranslatePipe } from '@hrk/localization/hrk-translate.pipe';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { SummonResult } from '../../../core/models/summon.model';
import { SummonDialogComponent } from './summon-dialog.component';
import { SummonHeroCardComponent } from './summon-hero-card.component';

@Component({
  selector: 'app-summon-result-modal', standalone: true,
  imports: [HrkTranslatePipe, DecimalPipe, SummonDialogComponent, SummonHeroCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-summon-dialog modalCode="SUMMON_RESULT" [title]="'Chiêu mộ thành công' | hrkTranslate" (closed)="closed.emit()">
      <p class="result-summary">{{ '{{p0}} lượt chiêu mộ · {{p1}} tướng mới' | hrkTranslate:{p0: (result.items.length), p1: (newCount)} }}
        <span>{{ 'Đã dùng {{p0}} {{p1}}' | hrkTranslate:{p0: (result.cost | number), p1: ((result.currency === 'GOLD' ? 'Vàng' : 'Kim cương') | hrkTranslate)} }}</span></p>
      <div class="result-grid" [class.single]="result.count === 1">
        @for (reward of result.items; track reward.drawIndex) {
          <app-summon-hero-card [hero]="reward" [isNew]="reward.isNew" [stoneQuantity]="reward.stoneQuantity" [stoneName]="reward.stoneName" />
        }
      </div>
      <div dialog-footer class="result-actions"><button type="button" (click)="closed.emit()">{{ 'Đóng' | hrkTranslate }}</button>
        <button class="again" type="button" [disabled]="!canRepeat" (click)="repeat.emit()">{{ 'Chiêu mộ tiếp ×{{p0}}' | hrkTranslate:{p0: (result.count)} }}</button></div>
    </app-summon-dialog>`,
  styles: [`
    .result-summary { text-align:center; color:var(--dcs-accent, #bcf27b); font-size:14px; font-weight:700; margin:0 0 20px; span { display:block; color:var(--dcs-text-secondary, #a7b6c3); font-size:12px; font-weight:500; margin-top:6px; } }
    .result-grid { display:grid; grid-template-columns:repeat(5,minmax(0,1fr)); gap:12px; }
    .result-grid.single { grid-template-columns:minmax(0,220px); justify-content:center; }
    .result-actions { display:flex; justify-content:center; gap:12px; flex-wrap:wrap; width:100%; }
    button { padding:10px 22px; border:1px solid var(--dcs-border-strong, rgba(167, 182, 195, 0.24)); border-radius:var(--dcs-radius-sm, 6px); background:var(--dcs-surface-raised, #222d38); color:var(--dcs-text-primary, #f0f4f7); cursor:pointer; font-size:13px; font-weight:700; transition:all 140ms ease; }
    button.again { background:var(--dcs-accent, #bcf27b); border-color:var(--dcs-accent-hover, #ccf796); color:var(--dcs-accent-contrast, #0b1305); font-weight:800; }
    button:disabled { opacity:.45; cursor:not-allowed; }
    button:focus-visible { outline:2px solid var(--dcs-accent, #bcf27b); outline-offset:2px; }
    @media(max-width:600px) { .result-grid { grid-template-columns:repeat(2,minmax(0,1fr)); gap:10px; } }
  `]
})
export class SummonResultModalComponent {
  @Input({ required: true }) result!: SummonResult;
  @Input() canRepeat = false;
  @Output() closed = new EventEmitter<void>();
  @Output() repeat = new EventEmitter<void>();
  get newCount(): number { return this.result.items.filter(item => item.isNew).length; }
}
