import { HrkTranslatePipe } from '@hrk/localization/hrk-translate.pipe';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { HrkModalComponent } from '../../../../../../../libs/shared/ui/modal/hrk-modal.component';

@Component({
  selector: 'app-summon-dialog', standalone: true,
  imports: [HrkTranslatePipe, HrkModalComponent],
  template: `
    <hrk-modal [modalCode]="modalCode" [title]="(title) | hrkTranslate" [config]="{ size:'LG' }" (closed)="closed.emit()">
      <ng-content />
      <div hrkModalFooter><ng-content select="[dialog-footer]" /></div>
    </hrk-modal>`
})
export class SummonDialogComponent {
  @Input({ required: true }) title = '';
  @Output() closed = new EventEmitter<void>();
  @Input() modalCode = 'SUMMON_INFO';
}
