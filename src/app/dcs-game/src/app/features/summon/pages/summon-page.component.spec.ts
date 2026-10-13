import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import { AppError } from '../../../../../../../libs/core/http/hrk-api/app-error';
import { BaseResponse } from '../../../core/models/player.model';
import { SummonConfiguration, SummonRequest, SummonResult } from '../../../core/models/summon.model';
import { SummonService } from '../../../core/services/summon.service';
import { GameToastService } from '../../../core/services/game-toast.service';
import { SummonPageComponent } from './summon-page.component';

const storageKey = 'hrk.summon.pending:987654321';
const ok = <T>(data: T): BaseResponse<T> => ({ data, success: true, statusCode: 200, message: '' });

describe('SummonPageComponent', () => {
  let fixture: ComponentFixture<SummonPageComponent>;
  let component: SummonPageComponent;
  let configuration: SummonConfiguration;
  let api: jasmine.SpyObj<SummonService>;
  let response: Subject<BaseResponse<SummonResult>>;

  function receipt(request: SummonRequest): SummonResult {
    return { ...request, currency: 'GOLD', cost: request.count * 10, wallet: { gold: 1000 - request.count * 10, diamonds: 100 },
      items: Array.from({ length: request.count }, (_, index) => ({ heroTemplateId: 1, name: 'Tướng', avatar: '/hero.png',
        rarityCode: 'RARE', rarityName: 'Hiếm', drawIndex: index, isNew: index === 0, stoneQuantity: index === 0 ? 0 : 20 })) };
  }
  function create(): void { fixture = TestBed.createComponent(SummonPageComponent); component = fixture.componentInstance; fixture.detectChanges(); }

  beforeEach(() => {
    sessionStorage.removeItem(storageKey);
    configuration = { playerId: 987654321, wallet: { gold: 1000, diamonds: 100 }, pools: [
      { code: 'NORMAL', name: 'Thường', currency: 'GOLD', singleCost: 10, tenCost: 100, heroes: [] }
    ] };
    response = new Subject();
    api = jasmine.createSpyObj<SummonService>('SummonService', ['configuration', 'summon', 'result']);
    api.configuration.and.returnValue(of(ok(configuration)));
    api.summon.and.returnValue(response.asObservable());
    TestBed.configureTestingModule({ imports: [SummonPageComponent], providers: [{ provide: SummonService, useValue: api }] });
    TestBed.overrideComponent(SummonPageComponent, { set: { template: '', imports: [] } });
  });
  afterEach(() => { fixture?.destroy(); sessionStorage.removeItem(storageKey); });

  it('saves the request before calling the server, then shows a reel for one draw', () => {
    create();
    component.open(configuration.pools[0], 1);
    const request = api.summon.calls.mostRecent().args[0];
    expect(JSON.parse(sessionStorage.getItem(storageKey)!)).toEqual(request);
    expect(component.phase()).toBe('requesting');
    response.next(ok(receipt(request)));
    expect(component.phase()).toBe('reel');
    expect(component.configuration()?.wallet.gold).toBe(990);
    component.onReelComplete();
    expect(component.phase()).toBe('result');
    expect(sessionStorage.getItem(storageKey)).not.toBeNull();
    component.closeResult();
    expect(sessionStorage.getItem(storageKey)).toBeNull();
    expect(component.phase()).toBe('idle');
  });

  it('shows ten results directly without the reel', () => {
    create(); component.open(configuration.pools[0], 10);
    response.next(ok(receipt(api.summon.calls.mostRecent().args[0])));
    expect(component.phase()).toBe('result');
    expect(component.result()?.items.length).toBe(10);
  });

  it('blocks another draw while a request or result is active', () => {
    create(); component.open(configuration.pools[0], 1); component.open(configuration.pools[0], 10);
    expect(api.summon).toHaveBeenCalledTimes(1);
    response.next(ok(receipt(api.summon.calls.mostRecent().args[0])));
    component.open(configuration.pools[0], 1);
    expect(api.summon).toHaveBeenCalledTimes(1);
  });

  it('does not send a request when the displayed balance is insufficient', () => {
    configuration.wallet.gold = 0;
    create(); component.open(configuration.pools[0], 1);
    expect(api.summon).not.toHaveBeenCalled();
    expect(sessionStorage.getItem(storageKey)).toBeNull();
  });

  it('keeps an uncertain network request and recovers the same committed receipt', () => {
    create(); component.open(configuration.pools[0], 1);
    const request = api.summon.calls.mostRecent().args[0];
    response.error(new AppError(0, 'NETWORK_ERROR', 'Mất kết nối', 'network'));
    expect(component.phase()).toBe('uncertain');
    component.open(configuration.pools[0], 1);
    expect(api.summon).toHaveBeenCalledTimes(1);
    api.result.and.returnValue(of(ok(receipt(request))));
    component.recover();
    expect(api.result).toHaveBeenCalledOnceWith(request.requestId);
    expect(component.phase()).toBe('reel');
    expect(api.summon).toHaveBeenCalledTimes(1);
  });

  it('retries a missing receipt using its original request ID', () => {
    const saved: SummonRequest = { requestId: crypto.randomUUID(), poolCode: 'NORMAL', count: 10 };
    sessionStorage.setItem(storageKey, JSON.stringify(saved));
    api.result.and.returnValue(throwError(() => new AppError(404, 'SUMMON_RESULT_NOT_FOUND', 'Chưa có', 'business')));
    create();
    expect(api.summon).toHaveBeenCalledOnceWith(saved);
    response.next(ok(receipt(saved)));
    expect(component.phase()).toBe('result');
  });

  it('restores an unacknowledged result after reload without issuing another draw', () => {
    const saved: SummonRequest = { requestId: crypto.randomUUID(), poolCode: 'NORMAL', count: 1 };
    sessionStorage.setItem(storageKey, JSON.stringify(saved));
    api.result.and.returnValue(of(ok(receipt(saved))));
    create();
    expect(component.phase()).toBe('reel');
    expect(api.summon).not.toHaveBeenCalled();
  });

  it('clears a rejected business request and shows its message as a warning', () => {
    const events: unknown[] = [];
    TestBed.inject(GameToastService).events$.subscribe(event => events.push(event));
    create(); component.open(configuration.pools[0], 1);
    response.error(new AppError(409, 'INSUFFICIENT_GOLD', 'Không đủ Vàng.', 'business'));
    expect(component.phase()).toBe('idle');
    expect(sessionStorage.getItem(storageKey)).toBeNull();
    expect(events).toContain(jasmine.objectContaining({ action: 'show', toast: jasmine.objectContaining({ type: 'warning', message: 'Không đủ Vàng.' }) }));
  });

  it('keeps the request after a system failure because the commit may have succeeded', () => {
    create(); component.open(configuration.pools[0], 1);
    response.error(new AppError(500, 'INTERNAL_SERVER_ERROR', 'Internal details', 'system'));
    expect(component.phase()).toBe('uncertain');
    expect(sessionStorage.getItem(storageKey)).not.toBeNull();
  });

  it('does not expose a receipt that does not match the pending request', () => {
    create(); component.open(configuration.pools[0], 1);
    const wrong = receipt({ requestId: crypto.randomUUID(), poolCode: 'NORMAL', count: 1 });
    response.next(ok(wrong));
    expect(component.phase()).toBe('uncertain');
    expect(component.result()).toBeNull();
  });

  it('creates a new request only when the player explicitly repeats a completed draw', () => {
    create(); component.open(configuration.pools[0], 10);
    const first = api.summon.calls.mostRecent().args[0];
    response.next(ok(receipt(first)));
    component.repeat();
    expect(api.summon).toHaveBeenCalledTimes(2);
    expect(api.summon.calls.mostRecent().args[0].requestId).not.toBe(first.requestId);
  });

  it('ignores malformed or another player\'s stored requests', () => {
    sessionStorage.setItem(storageKey, '{bad-json');
    create();
    expect(component.phase()).toBe('idle');
    expect(api.result).not.toHaveBeenCalled();
  });
});
