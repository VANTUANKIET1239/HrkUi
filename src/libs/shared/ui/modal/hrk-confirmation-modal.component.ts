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
    .confirmation-icon { text-align:center; color:var(--dcs-accent, #bcf27b); font-size:40px; margin-bottom:14px; }
    .confirmation-message { text-align:center; white-space:pre-line; line-height:1.6; margin:0 0 10px; color:var(--dcs-text-primary, #f0f4f7); font-size:0.95rem; }
    .confirmation-actions { display:flex; justify-content:center; gap:12px; flex-wrap:wrap; width:100%; }
    button { padding:10px 20px; border:1px solid var(--dcs-border-strong, rgba(167, 182, 195, 0.24)); border-radius:var(--dcs-radius-sm, 6px); color:var(--dcs-text-primary, #f0f4f7); background:var(--dcs-surface-raised, #222d38); font-weight:700; font-size:0.875rem; cursor:pointer; transition:all 140ms ease; }
    button:hover:not(:disabled) { background:var(--dcs-surface-hover, #283542); border-color:var(--dcs-text-secondary, #a7b6c3); }
    .confirm { background:var(--dcs-accent, #bcf27b); color:var(--dcs-accent-contrast, #0b1305); border-color:var(--dcs-accent-hover, #ccf796); font-weight:800; }
    .confirm:hover:not(:disabled) { background:var(--dcs-accent-hover, #ccf796); border-color:var(--dcs-accent-hover, #ccf796); }
    button:disabled { opacity:.5; cursor:wait; }
    button:focus-visible { outline:2px solid var(--dcs-accent, #bcf27b); outline-offset:2px; }
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
