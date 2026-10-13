import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, EventEmitter, inject, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import { HRK_MODAL_CONFIG_SOURCE, HrkModalConfig } from './modal-config';
import { ModalStackService } from './modal-stack.service';
import { DOCUMENT } from '@angular/common';

let nextModalId = 0;

@Component({
  selector: 'hrk-modal', standalone: true, changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './hrk-modal.component.html', styleUrl: './hrk-modal.component.scss'
})
export class HrkModalComponent implements AfterViewInit, OnDestroy {
  @Input() modalCode = '';
  @Input() title = '';
  @Input() config: Partial<HrkModalConfig> = {};
  @Input() parameters: Record<string, string | number> = {};
  @Input() busy = false;
  @Input() dismissible = true;
  @Input() closeOnBackdrop = true;
  @Input() closeOnEscape = true;
  @Input() chrome = true;
  @Input() size?: HrkModalConfig['size'];
  @Output() closed = new EventEmitter<void>();
  @ViewChild('dialog', { static: true }) dialog!: ElementRef<HTMLDialogElement>;
  readonly titleId = `hrk-modal-title-${++nextModalId}`;
  private readonly source = inject(HRK_MODAL_CONFIG_SOURCE);
  private readonly stack = inject(ModalStackService);
  private readonly document = inject(DOCUMENT);
  private registered = false;
  private opener: HTMLElement | null = null;

  get resolved(): HrkModalConfig {
    return this.source.resolve(this.modalCode,
      { ...(this.title ? { title: this.title } : {}), ...this.config }, this.parameters);
  }

  ngAfterViewInit(): void {
    const dialog = this.dialog.nativeElement;
    this.opener = this.document.activeElement instanceof HTMLElement ? this.document.activeElement : null;
    dialog.showModal(); // Native modal layer supplies focus containment and inert background.
    this.stack.opened(dialog);
    this.registered = true;
    queueMicrotask(() => { if (this.registered) this.source.load?.(); });
  }

  requestClose(): void {
    if (!this.busy && this.dismissible && this.stack.isTop(this.dialog.nativeElement)) this.closed.emit();
  }

  onCancel(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    if (this.closeOnEscape && this.resolved.closeOnEscape) this.requestClose();
  }

  private backdropPressed = false;
  onPointerDown(event: PointerEvent): void {
    this.backdropPressed = this.outside(event);
  }
  onPointerUp(event: PointerEvent): void {
    if (this.backdropPressed && this.outside(event) && this.closeOnBackdrop && this.resolved.closeOnBackdrop) this.requestClose();
    this.backdropPressed = false;
  }
  private outside(event: PointerEvent): boolean {
    if (event.target !== this.dialog.nativeElement) return false;
    const rect = this.dialog.nativeElement.getBoundingClientRect();
    return event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
  }

  ngOnDestroy(): void {
    if (this.registered) {
      const wasTop = this.stack.isTop(this.dialog.nativeElement);
      this.dialog.nativeElement.close();
      this.stack.closed(this.dialog.nativeElement);
      this.registered = false;
      // Restore after Angular has removed the closed view, which may otherwise reset focus.
      if (wasTop) queueMicrotask(() => this.stack.restoreFocus(this.opener));
    }
  }
}
