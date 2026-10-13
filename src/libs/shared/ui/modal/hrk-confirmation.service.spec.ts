import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { NavigationStart, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { HrkConfirmationService } from './hrk-confirmation.service';

describe('HrkConfirmationService', () => {
  let events:Subject<unknown>;
  let service:HrkConfirmationService;
  beforeEach(() => {
    events=new Subject();
    TestBed.configureTestingModule({providers:[{provide:Router,useValue:{events}}]});
    service=TestBed.inject(HrkConfirmationService);
  });
  it('reuses a pending question, queues other questions and resolves each once', fakeAsync(() => {
    const first=service.confirm('FIRST');
    expect(service.confirm('FIRST')).toBe(first);
    let result:boolean|undefined;
    first.then(value=>result=value);
    const second=service.confirm('SECOND');
    service.settle(true); tick();
    expect(result).toBeTrue(); expect(service.active()?.code).toBe('SECOND');
    second.then(value=>result=value); service.settle(false); tick();
    expect(result).toBeFalse(); expect(service.active()).toBeNull();
  }));
  it('cancels current and queued questions during navigation', fakeAsync(() => {
    const results:boolean[]=[];
    service.confirm('FIRST').then(value=>results.push(value));
    service.confirm('SECOND').then(value=>results.push(value));
    events.next(new NavigationStart(1,'/other')); tick();
    expect(results).toEqual([false,false]); expect(service.active()).toBeNull();
  }));
});
