import { DOCUMENT } from '@angular/common';
import { inject, Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ModalStackService {
  private readonly document = inject(DOCUMENT);
  private readonly stack: HTMLDialogElement[] = [];
  private previousOverflow = '';
  private readonly topDialog = signal<HTMLDialogElement | null>(null);
  readonly activeDialog = this.topDialog.asReadonly();

  opened(dialog: HTMLDialogElement): void {
    if (this.stack.length === 0) {
      this.previousOverflow = this.document.body.style.overflow;
      this.document.body.style.overflow = 'hidden';
    }
    const descendants = this.stack.filter(open => dialog.contains(open));
    const index = descendants.length ? this.stack.indexOf(descendants[0]) : this.stack.length;
    this.stack.splice(index, 0, dialog);
    // Angular initializes child views first. If parent/child open together, keep the child on top.
    for (const child of descendants) { child.close(); child.showModal(); }
    this.topDialog.set(this.stack.at(-1) ?? null);
  }

  isTop(dialog: HTMLDialogElement): boolean { return this.stack.at(-1) === dialog; }

  closed(dialog: HTMLDialogElement): void {
    const index = this.stack.indexOf(dialog);
    if (index !== -1) this.stack.splice(index, 1);
    this.topDialog.set(this.stack.at(-1) ?? null);
    if (this.stack.length === 0) this.document.body.style.overflow = this.previousOverflow;
  }

  restoreFocus(opener: HTMLElement | null): void {
    const top = this.stack.at(-1);
    if (opener?.isConnected && (!top || top.contains(opener))) opener.focus();
  }
}
