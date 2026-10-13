import { DOCUMENT } from '@angular/common';
import { AfterViewInit, Directive, effect, ElementRef, inject, Injector, OnDestroy } from '@angular/core';
import { ModalStackService } from './modal-stack.service';

/** Moves an existing floating host into the active native dialog without recreating its Angular view/state. */
@Directive({ selector:'[hrkModalFloating]', standalone:true })
export class HrkModalFloatingDirective implements AfterViewInit, OnDestroy {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly document = inject(DOCUMENT);
  private readonly stack = inject(ModalStackService);
  private readonly injector = inject(Injector);
  private anchor?: Comment;

  ngAfterViewInit(): void {
    this.anchor = this.document.createComment('hrk-modal-floating-home');
    this.element.parentNode?.insertBefore(this.anchor, this.element);
    effect(() => {
      const dialog = this.stack.activeDialog();
      if (dialog) dialog.appendChild(this.element);
      else this.restore();
    }, {injector:this.injector});
  }

  private restore(): void {
    if (this.anchor?.parentNode) this.anchor.parentNode.insertBefore(this.element, this.anchor.nextSibling);
  }

  ngOnDestroy(): void {
    this.restore();
    this.anchor?.remove();
  }
}
