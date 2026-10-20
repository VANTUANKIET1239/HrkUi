import { TestBed, fakeAsync, tick, discardPeriodicTasks } from '@angular/core/testing';
import { Subject, of } from 'rxjs';
import { CheckInPageComponent } from './check-in-page.component';
import { CheckInService } from '../../core/services/check-in.service';
import { CheckInCalendar, CheckInClaim } from '../../core/models/check-in.model';
import { BaseResponse } from '../../core/models/player.model';

describe('Monthly check-in', () => {
  let api: jasmine.SpyObj<CheckInService>;
  let component: CheckInPageComponent;
  const calendar = (): CheckInCalendar => ({
    calendarId: 1, name: 'Điểm danh tháng', monthKey: '2026-10', gameDate: '2026-10-21',
    serverTimeUtc: '2026-10-21T12:00:00Z', nextResetAtUtc: '2026-10-21T17:00:00Z',
    isOpen: true, canClaim: true, reason: null, claimedDays: 0,
    days: [{ dayOfMonth: 21, status: 'CLAIMABLE', rewards: [{ type: 'GOLD', name: 'Vàng', quantity: 1000 }], claimedAtUtc: null }]
  });
  const wrap = <T>(data: T) => ({ success: true, message: '', data } as BaseResponse<T>);
  beforeEach(() => {
    api = jasmine.createSpyObj<CheckInService>('CheckInService', ['getCalendar', 'claim']);
    api.getCalendar.and.returnValue(of(wrap(calendar())));
    TestBed.configureTestingModule({ providers: [{ provide: CheckInService, useValue: api }] });
    component = TestBed.runInInjectionContext(() => new CheckInPageComponent());
    component.calendar.set(calendar());
  });

  it('keeps the same request id after an uncertain failure and blocks duplicate in-flight clicks', () => {
    const first = new Subject<BaseResponse<CheckInClaim>>();
    const second = new Subject<BaseResponse<CheckInClaim>>();
    api.claim.and.returnValues(first, second);
    component.claim(); component.claim();
    expect(api.claim).toHaveBeenCalledTimes(1);
    const requestId = api.claim.calls.argsFor(0)[0];
    first.error(new Error('connection lost'));
    expect(component.claiming()).toBeFalse();
    component.claim();
    expect(api.claim.calls.argsFor(1)[0]).toBe(requestId);
  });

  it('shows the saved receipt and refreshes the calendar after successful/replayed claims', () => {
    const claim = new Subject<BaseResponse<CheckInClaim>>();
    api.claim.and.returnValue(claim);
    api.getCalendar.and.returnValue(of(wrap({ ...calendar(), canClaim: false, claimedDays: 1 })));
    component.claim();
    claim.next(wrap({ requestId: api.claim.calls.argsFor(0)[0], calendarId: 1, checkInDate: '2026-10-21',
      claimedAtUtc: '2026-10-21T12:00:00Z', configVersion: 1, alreadyClaimed: true,
      rewards: [{ type: 'GOLD', name: 'Vàng', quantity: 1000 }] }));
    claim.complete();
    expect(component.receipt()?.alreadyClaimed).toBeTrue();
    expect(component.calendar()?.canClaim).toBeFalse();
    expect(api.getCalendar).toHaveBeenCalledTimes(1);
    component.claim();
    expect(api.claim).toHaveBeenCalledTimes(1);
  });

  it('uses server reset time despite a different browser clock and reloads at the boundary', fakeAsync(() => {
    const data = { ...calendar(), serverTimeUtc: '2026-10-21T16:59:59Z' };
    api.getCalendar.and.returnValue(of(wrap(data)));
    component.ngOnInit();
    expect(component.secondsUntilReset()).toBe(1);
    tick(1000);
    expect(api.getCalendar).toHaveBeenCalledTimes(2);
    discardPeriodicTasks();
  }));

  it('aligns month dates to a Monday-first calendar and leaves missed days unavailable', () => {
    expect(component.leadingDays.length).toBe(3); // October 1st 2026 is Thursday.
    component.calendar.set({ ...calendar(), canClaim: false });
    component.claim();
    expect(api.claim).not.toHaveBeenCalled();
    expect(component.label({ dayOfMonth: 20, status: 'MISSED', rewards: [], claimedAtUtc: null })).toBe('Đã bỏ lỡ');
  });
});
