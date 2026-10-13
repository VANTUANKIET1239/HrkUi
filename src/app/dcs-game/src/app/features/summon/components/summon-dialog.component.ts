import { Component, EventEmitter, Input, Output } from '@angular/core';
import { HrkModalComponent } from '../../../../../../../libs/shared/ui/modal/hrk-modal.component';

@Component({
  selector: 'app-summon-dialog', standalone: true,
  imports: [HrkModalComponent],
  template: `
    <hrk-modal [modalCode]="modalCode" [title]="title" [config]="{ size:'LG' }" (closed)="closed.emit()">
      <ng-content />
      <div hrkModalFooter><ng-content select="[dialog-footer]" /></div>
    </hrk-modal>`
})
export class SummonDialogComponent {
  @Input({ required: true }) title = '';
  @Output() closed = new EventEmitter<void>();
  @Input() modalCode = 'SUMMON_INFO';
}
