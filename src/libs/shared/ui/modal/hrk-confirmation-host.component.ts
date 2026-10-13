import { ChangeDetectionStrategy, Component, inject, OnDestroy } from '@angular/core';
import { HrkConfirmationModalComponent } from './hrk-confirmation-modal.component';
import { HrkConfirmationService } from './hrk-confirmation.service';

@Component({
  selector: 'hrk-confirmation-host', standalone: true, imports:[HrkConfirmationModalComponent],
  changeDetection:ChangeDetectionStrategy.OnPush,
  template:`@if (confirmation.active(); as request) {
    <hrk-confirmation-modal [modalCode]="request.code" [config]="request.config" [parameters]="request.parameters"
      (confirmed)="confirmation.settle(true)" (cancelled)="confirmation.settle(false)" />
  }`
})
export class HrkConfirmationHostComponent implements OnDestroy {
  readonly confirmation = inject(HrkConfirmationService);
  ngOnDestroy(): void { this.confirmation.cancelAll(); }
}
