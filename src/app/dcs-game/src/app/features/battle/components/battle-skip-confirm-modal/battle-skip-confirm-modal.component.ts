import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-battle-skip-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './battle-skip-confirm-modal.component.html',
  styleUrl: './battle-skip-confirm-modal.component.scss'
})
export class BattleSkipConfirmModalComponent {
  @Input() isOpen = false;

  @Output() onConfirm = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();

  isConfirming = false;

  @HostListener('document:keydown.escape')
  handleEscape(): void {
    if (this.isOpen && !this.isConfirming) {
      this.cancel();
    }
  }

  confirm(): void {
    if (this.isConfirming) return;
    this.isConfirming = true;
    this.onConfirm.emit();
    setTimeout(() => {
      this.isConfirming = false;
    }, 500);
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
