import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HrkModalComponent } from './hrk-modal.component';
import { HrkConfirmationModalComponent } from './hrk-confirmation-modal.component';
import { HrkModalFloatingDirective } from './hrk-modal-floating.directive';

@Component({ standalone:true, imports:[HrkModalComponent, HrkModalFloatingDirective], template:`
  <div hrkModalFloating id="floating-host"><button>Persistent notification</button></div>
  <button id="opener" (click)="parent = true">Open</button>
  @if (parent) { <hrk-modal title="Parent" [busy]="busy" (closed)="parent = false"><input aria-label="Name" />
    @if (child) { <hrk-modal title="Child" (closed)="child = false"><button>Child action</button></hrk-modal> }
  </hrk-modal> }
` })
class ModalHost { parent=false; child=false; busy=false; }

describe('HrkModalComponent', () => {
  let fixture: ComponentFixture<ModalHost>;
  beforeEach(() => { TestBed.configureTestingModule({imports:[ModalHost]}); fixture = TestBed.createComponent(ModalHost); fixture.detectChanges(); });
  afterEach(() => fixture.destroy());

  function open(): HTMLDialogElement {
    const opener = fixture.nativeElement.querySelector('#opener') as HTMLButtonElement;
    opener.focus(); opener.click(); fixture.detectChanges();
    return fixture.nativeElement.querySelector('dialog');
  }
  it('uses the native modal layer, labels it, locks scroll and restores opener focus on close', async () => {
    const previousOverflow = document.body.style.overflow;
    const dialog = open();
    expect(dialog.open).toBeTrue();
    expect(dialog.matches(':modal')).toBeTrue();
    expect(dialog.getAttribute('aria-labelledby')).toBeTruthy();
    expect(document.body.style.overflow).toBe('hidden');
    dialog.dispatchEvent(new Event('cancel', {cancelable:true})); fixture.detectChanges();
    expect(fixture.componentInstance.parent).toBeFalse();
    expect(document.body.style.overflow).toBe(previousOverflow);
    await fixture.whenStable();
    expect(document.activeElement?.id).toBe('opener');
  });
  it('keeps the child on top when a parent and child are created together', () => {
    fixture.componentInstance.parent=true; fixture.componentInstance.child=true; fixture.detectChanges();
    const dialogs=fixture.nativeElement.querySelectorAll('dialog') as NodeListOf<HTMLDialogElement>;
    dialogs[0].dispatchEvent(new Event('cancel', {cancelable:true})); fixture.detectChanges();
    expect(fixture.componentInstance.parent).toBeTrue();
    dialogs[1].dispatchEvent(new Event('cancel', {cancelable:true})); fixture.detectChanges();
    expect(fixture.componentInstance.child).toBeFalse();
  });
  it('moves the same floating host between top dialogs and restores it after closing', async () => {
    const floating=fixture.nativeElement.querySelector('#floating-host');
    const parent=open(); await fixture.whenStable();
    expect(parent.contains(floating)).toBeTrue();
    fixture.componentInstance.child=true; fixture.detectChanges(); await fixture.whenStable();
    const child=fixture.nativeElement.querySelectorAll('dialog')[1] as HTMLDialogElement;
    expect(child.contains(floating)).toBeTrue();
    child.dispatchEvent(new Event('cancel', {cancelable:true})); fixture.detectChanges(); await fixture.whenStable();
    expect(parent.contains(floating)).toBeTrue();
    parent.dispatchEvent(new Event('cancel', {cancelable:true})); fixture.detectChanges(); await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('#floating-host')).toBe(floating);
    expect(floating.parentElement).toBe(fixture.nativeElement);
  });
  it('closes only the top modal and keeps scroll locked until the parent closes', () => {
    const parent = open();
    fixture.componentInstance.child=true; fixture.detectChanges();
    const dialogs = fixture.nativeElement.querySelectorAll('dialog') as NodeListOf<HTMLDialogElement>;
    expect(dialogs[0].getAttribute('aria-labelledby')).not.toBe(dialogs[1].getAttribute('aria-labelledby'));
    parent.dispatchEvent(new Event('cancel', {cancelable:true})); fixture.detectChanges();
    expect(fixture.componentInstance.parent).toBeTrue();
    dialogs[1].dispatchEvent(new Event('cancel', {cancelable:true})); fixture.detectChanges();
    expect(fixture.componentInstance.child).toBeFalse();
    expect(document.body.style.overflow).toBe('hidden');
  });
  it('blocks Escape and backdrop while busy, and does not propagate clicks to its parent', () => {
    const dialog = open();
    fixture.componentInstance.busy=true; fixture.detectChanges();
    dialog.dispatchEvent(new Event('cancel', {cancelable:true}));
    const rect=dialog.getBoundingClientRect();
    for (const type of ['pointerdown','pointerup']) dialog.dispatchEvent(new PointerEvent(type, {clientX:rect.left-10,clientY:rect.top-10}));
    fixture.detectChanges();
    expect(fixture.componentInstance.parent).toBeTrue();
    const click = jasmine.createSpy('outside click');
    fixture.nativeElement.addEventListener('click', click);
    dialog.click();
    expect(click).not.toHaveBeenCalled();
  });
});

describe('HrkConfirmationModalComponent', () => {
  it('renders text safely and disables both actions while busy', () => {
    TestBed.configureTestingModule({imports:[HrkConfirmationModalComponent]});
    const fixture = TestBed.createComponent(HrkConfirmationModalComponent);
    fixture.componentRef.setInput('config', { title:'Confirm', messageTemplate:'<img src=x onerror=alert(1)>', confirmText:'Proceed' });
    fixture.componentRef.setInput('busy', true); fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('img')).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('<img src=x onerror=alert(1)>');
    expect(fixture.nativeElement.querySelector('button.confirm').disabled).toBeTrue();
    expect(fixture.nativeElement.querySelector('button.cancel').disabled).toBeTrue();
    const confirmed=jasmine.createSpy('confirmed'); fixture.componentInstance.confirmed.subscribe(confirmed);
    fixture.componentInstance.confirm(); expect(confirmed).not.toHaveBeenCalled();
    fixture.destroy();
  });
});
