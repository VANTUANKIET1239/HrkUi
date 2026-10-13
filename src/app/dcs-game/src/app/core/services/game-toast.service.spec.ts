import { HttpErrorResponse } from '@angular/common/http';
import { fakeAsync, tick } from '@angular/core/testing';
import { AppError } from '../../../../../../libs/core/http/hrk-api/app-error';
import { GameToastEvent } from '../models/game-toast.model';
import { GameToastService } from './game-toast.service';

describe('GameToastService', () => {
  let service: GameToastService;
  let events: GameToastEvent[];
  beforeEach(() => {
    service = new GameToastService();
    events = [];
    service.events$.subscribe(event => events.push(event));
  });

  it('publishes structured notifications with a default duration and optional title', () => {
    const id = service.success('Đã nhận thưởng', { title: 'Phần thưởng' });
    expect(events).toEqual([{ action: 'show', toast: {
      id, type: 'success', message: 'Đã nhận thưởng', title: 'Phần thưởng', durationMs: 3000
    } }]);
  });

  it('deduplicates bursts and allows a fresh notification after the window', fakeAsync(() => {
    const first = service.warning('Túi đầy');
    tick(1000);
    expect(service.warning('Túi đầy')).toBe(first);
    tick(2000);
    expect(service.warning('Túi đầy')).not.toBe(first);
  }));

  it('allows a caller to update a notification by key and keep it until dismissed', () => {
    const id = service.info('Đang xử lý', { dedupeKey: 'job', durationMs: 0 });
    expect(service.success('Đã xong', { dedupeKey: 'job' })).toBe(id);
    expect(events[0].action === 'show' && events[0].toast.durationMs).toBe(0);
    service.dismiss(id);
    expect(events[2]).toEqual({ action: 'dismiss', id });
    expect(service.info('Đang xử lý', { dedupeKey: 'job' })).not.toBe(id);
  });

  it('clears deduplication and does not replay notifications to a new host', () => {
    const id = service.info('Thông báo');
    const late: GameToastEvent[] = [];
    const subscription = service.events$.subscribe(event => late.push(event));
    expect(late).toEqual([]);
    service.clear();
    expect(events[1]).toEqual({ action: 'clear' });
    expect(service.info('Thông báo')).not.toBe(id);
    subscription.unsubscribe();
  });

  it('shows the business message as a warning without logging to the console', () => {
    const log = spyOn(console, 'error');
    const warn = spyOn(console, 'warn');
    service.fromError(new AppError(409, 'INSUFFICIENT_GOLD', 'Không đủ vàng.', 'business'));
    const event = events[0];
    expect(event.action === 'show' && event.toast.type).toBe('warning');
    expect(event.action === 'show' && event.toast.message).toBe('Không đủ vàng.');
    expect(log).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
  });

  it('uses a safe operation message for system failures', () => {
    service.fromError(new HttpErrorResponse({ status: 500, error: { message: 'SQL exception details' } }), 'Không thể nhận thưởng.');
    const event = events[0];
    expect(event.action === 'show' && event.toast.type).toBe('error');
    expect(event.action === 'show' && event.toast.message).toBe('Không thể nhận thưởng.');
  });

  it('normalizes network failures and unknown client errors', () => {
    service.fromError(new HttpErrorResponse({ status: 0 }));
    service.fromError(new Error('private details'), 'Không thể lưu đội hình.');
    expect(events.map(event => event.action === 'show' && event.toast.message)).toEqual([
      'Không thể kết nối đến máy chủ.', 'Không thể lưu đội hình.'
    ]);
  });

  it('leaves expired session notifications to the existing auth dialog', () => {
    expect(service.fromError(new AppError(401, 'UNAUTHORIZED', 'Phiên hết hạn', 'auth'))).toBeNull();
    expect(events).toEqual([]);
    service.fromError(new AppError(403, 'FORBIDDEN', 'Không được phép', 'auth'));
    expect(events.length).toBe(1);
  });
});
