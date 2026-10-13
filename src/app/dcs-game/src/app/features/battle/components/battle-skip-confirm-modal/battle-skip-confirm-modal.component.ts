import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HrkConfirmationModalComponent } from '../../../../../../../../libs/shared/ui/modal/hrk-confirmation-modal.component';

@Component({
  selector: 'app-battle-skip-confirm-modal',
  standalone: true,
  imports: [CommonModule, HrkConfirmationModalComponent],
  templateUrl: './battle-skip-confirm-modal.component.html',
  styleUrl: './battle-skip-confirm-modal.component.scss'
})
export class BattleSkipConfirmModalComponent {
  @Input() isOpen = false;

  @Output() onConfirm = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();

  @Input() isConfirming = false;

  handleEscape(): void {
    if (this.isOpen && !this.isConfirming) {
      this.cancel();
    }
  }

  confirm(): void {
    if (this.isConfirming) return;
    this.onConfirm.emit();
  }

  cancel(): void {
    if (this.isConfirming) return;
    this.onCancel.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.cancel();
    }
  }
}
