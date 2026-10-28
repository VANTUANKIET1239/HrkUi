import { ChangeDetectionStrategy, Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { HrkModalComponent } from './hrk-modal.component';
import { HrkTranslatePipe } from '@hrk/localization/hrk-translate.pipe';
import { HRK_MODAL_CONFIG_SOURCE, HrkModalConfig, MODAL_ICONS } from './modal-config';

@Component({
  selector: 'hrk-confirmation-modal', standalone: true, imports: [HrkModalComponent, HrkTranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (open) {
      <hrk-modal [modalCode]="modalCode" [config]="fallback" [parameters]="parameters" [busy]="busy" (closed)="cancel()">
        <div class="confirmation-icon"><i class="bi" [class]="icon"></i></div>
        <p class="confirmation-message">{{ resolved.messageTemplate | hrkTranslate:parameters }}</p>
        <ng-content />
        <div hrkModalFooter class="confirmation-actions">
          <button type="button" class="cancel" autofocus [disabled]="busy" (click)="cancel()">{{ resolved.cancelText | hrkTranslate }}</button>
          <button type="button" class="confirm" [disabled]="busy" (click)="confirm()">
            @if (busy) { <span class="spinner-border spinner-border-sm" aria-hidden="true"></span> }
            {{ resolved.confirmText | hrkTranslate }}
          </button>
        </div>
      </hrk-modal>
    }
  `,
  styles: [`
    .confirmation-icon { text-align:center; color:#edcd86; font-size:42px; margin-bottom:16px; }
    .confirmation-message { text-align:center; white-space:pre-line; line-height:1.7; margin:0 0 10px; }
    .confirmation-actions { display:flex; justify-content:center; gap:12px; flex-wrap:wrap; }
    button { padding:11px 22px; border:1px solid #9e8455; border-radius:6px; color:#f4e5c4; background:#252332; cursor:pointer; }
    .confirm { background:linear-gradient(135deg,#edcd86,#b98c40); color:#281d10; font-weight:700; }
    button:disabled { opacity:.5; cursor:wait; } button:focus-visible { outline:2px solid #f4d785; outline-offset:3px; }
  `]
})
export class HrkConfirmationModalComponent {
  @Input() open = true;
  @Input() modalCode = '';
  @Input() config: Partial<HrkModalConfig> = {};
  @Input() parameters: Record<string, string | number> = {};
  @Input() busy = false;
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();
  private readonly source = inject(HRK_MODAL_CONFIG_SOURCE);
  private submitting = false;
  get fallback(): Partial<HrkModalConfig> { return { kind:'CONFIRMATION', size:'SM', ...this.config }; }
  get resolved(): HrkModalConfig { return this.source.resolve(this.modalCode, this.fallback, this.parameters); }
  get icon(): string { return MODAL_ICONS[this.resolved.iconKey] || MODAL_ICONS['info']; }
  confirm(): void {
    if (this.busy || this.submitting) return;
    this.submitting = true;
    this.confirmed.emit();
    queueMicrotask(() => this.submitting = false);
  }
  cancel(): void { if (!this.busy) this.cancelled.emit(); }
}
