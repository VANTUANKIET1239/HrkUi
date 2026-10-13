import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { GameToastService } from '../../../core/services/game-toast.service';
import { GameToastComponent } from './game-toast.component';

describe('GameToastComponent', () => {
  let fixture: ComponentFixture<GameToastComponent>;
  let service: GameToastService;
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [GameToastComponent] });
    fixture = TestBed.createComponent(GameToastComponent);
    service = TestBed.inject(GameToastService);
    fixture.detectChanges();
  });

  it('expires each notification independently', fakeAsync(() => {
    service.info('Một', { durationMs: 1000 });
    tick(500);
    const second = service.success('Hai', { durationMs: 2000 });
    tick(500);
    expect(fixture.componentInstance.toasts().map(toast => toast.id)).toEqual([second]);
    tick(1500);
    expect(fixture.componentInstance.toasts()).toEqual([]);
    fixture.destroy();
  }));

  it('keeps only the newest three notifications and removes old timers', fakeAsync(() => {
    ['Một', 'Hai', 'Ba', 'Bốn'].forEach(message => service.info(message));
    expect(fixture.componentInstance.toasts().map(toast => toast.message)).toEqual(['Hai', 'Ba', 'Bốn']);
    fixture.destroy();
    tick(10000);
    expect(fixture.componentInstance.toasts()).toEqual([]);
  }));

  it('refreshes a duplicate notification without adding another card', fakeAsync(() => {
    const id = service.success('Đã lưu', { durationMs: 1000 });
    tick(800);
    expect(service.success('Đã lưu', { durationMs: 1000 })).toBe(id);
    tick(300);
    expect(fixture.componentInstance.toasts().length).toBe(1);
    tick(700);
    expect(fixture.componentInstance.toasts()).toEqual([]);
    fixture.destroy();
  }));

  it('pauses until both mouse hover and keyboard focus have left', fakeAsync(() => {
    const id = service.warning('Lưu ý', { durationMs: 2000 });
    tick(500);
    const component = fixture.componentInstance;
    component.pause(id, 'hover');
    component.pause(id, 'focus');
    tick(5000);
    component.resume(id, 'hover');
    tick(5000);
    expect(component.toasts().length).toBe(1);
    component.resume(id, 'focus');
    tick(1499);
    expect(component.toasts().length).toBe(1);
    tick(1);
    expect(component.toasts()).toEqual([]);
    fixture.destroy();
  }));

  it('keeps a duplicate paused and restarts its full duration on resume', fakeAsync(() => {
    const id = service.info('Đang xử lý', { durationMs: 1000 });
    fixture.componentInstance.pause(id, 'hover');
    tick(500);
    service.info('Đang xử lý', { durationMs: 1000 });
    tick(5000);
    expect(fixture.componentInstance.toasts().length).toBe(1);
    fixture.componentInstance.resume(id, 'hover');
    tick(1000);
    expect(fixture.componentInstance.toasts()).toEqual([]);
    fixture.destroy();
  }));

  it('lets a player close a persistent notification without removing another', fakeAsync(() => {
    service.info('Giữ lại', { durationMs: 0 });
    service.info('Thông báo khác', { durationMs: 0 });
    tick(60000);
    fixture.detectChanges();
    (fixture.nativeElement.querySelector('button') as HTMLButtonElement).click();
    expect(fixture.componentInstance.toasts().map(toast => toast.message)).toEqual(['Thông báo khác']);
    service.clear();
    expect(fixture.componentInstance.toasts()).toEqual([]);
    fixture.destroy();
  }));

  it('cleans up on navigation and does not replay an old notification in the next host', fakeAsync(() => {
    service.error('Cũ');
    fixture.destroy();
    service.success('Không có host');
    const next = TestBed.createComponent(GameToastComponent);
    next.detectChanges();
    expect(next.componentInstance.toasts()).toEqual([]);
    service.info('Mới');
    expect(next.componentInstance.toasts().length).toBe(1);
    next.destroy();
    tick(10000);
    expect(next.componentInstance.toasts()).toEqual([]);
  }));

  it('renders safe text, accessible roles and a labelled dismiss button', () => {
    service.warning('<img src=x onerror=alert(1)>', { durationMs: 0 });
    service.error('Không thể kết nối', { durationMs: 0 });
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('img')).toBeNull();
    expect(element.querySelector('[role="status"]')?.textContent).toContain('<img src=x onerror=alert(1)>');
    expect(element.querySelector('[role="alert"]')?.textContent).toContain('Không thể kết nối');
    expect(element.querySelector('button')?.getAttribute('aria-label')).toBe('Đóng thông báo');
    fixture.destroy();
  });
});
