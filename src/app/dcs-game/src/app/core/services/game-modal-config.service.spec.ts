import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { HrkApiService } from '../../../../../../libs/core/http/hrk-api/hrk-api.service';
import { GameModalConfigService } from './game-modal-config.service';

describe('GameModalConfigService', () => {
  let api:jasmine.SpyObj<HrkApiService>;
  let service:GameModalConfigService;
  let response:Subject<any>;
  beforeEach(() => {
    response=new Subject(); api=jasmine.createSpyObj('api',['CallApi']); api.CallApi.and.returnValue(response);
    TestBed.configureTestingModule({providers:[{provide:HrkApiService,useValue:api}]});
    service=TestBed.inject(GameModalConfigService);
  });
  it('has a usable local confirmation before loading and after an API failure', () => {
    expect(service.resolve('LOGOUT_CONFIRM',{}).confirmText).toBe('Đăng xuất');
    service.load(); response.error(new Error('offline'));
    expect(service.resolve('LOGOUT_CONFIRM',{}).kind).toBe('CONFIRMATION');
    expect(service.resolve('LOGOUT_CONFIRM',{}).messageTemplate).toBeTruthy();
    service.load(); expect(api.CallApi).toHaveBeenCalledTimes(1);
  });
  it('deduplicates loads and interpolates named values without executing HTML', () => {
    service.load(); service.load();
    expect(api.CallApi).toHaveBeenCalledTimes(1);
    response.next({success:true,data:[{code:'TOWER_START_QUICK_CLIMB',kind:'CONFIRMATION',title:'Lượt {used}/{limit}',messageTemplate:'{name}',confirmText:'Đi',size:'SM',revision:4}]}); response.complete();
    const config=service.resolve('TOWER_START_QUICK_CLIMB',{}, {used:2,limit:3,name:'<script>bad()</script>'});
    expect(config.title).toBe('Lượt 2/3'); expect(config.messageTemplate).toBe('<script>bad()</script>');
    expect(config.revision).toBe(4);
    expect(config.confirmText).toBe('Đi'); service.load(); expect(api.CallApi).toHaveBeenCalledTimes(1);
  });
  it('ignores invalid values and cannot change the confirmation kind or disable required questions', () => {
    service.load(); response.next({success:true,data:[{code:'LOGOUT_CONFIRM',kind:'CONTENT',title:'Wrong kind'},
      {code:'BATTLE_SKIP_CONFIRM',kind:'CONFIRMATION',size:'arbitrary-css',tone:'evil',iconKey:'onclick',confirmText:''}]}); response.complete();
    expect(service.resolve('LOGOUT_CONFIRM',{}).title).toBe('Đăng xuất khỏi trò chơi?');
    const config=service.resolve('BATTLE_SKIP_CONFIRM',{});
    expect(config.size).toBe('SM'); expect(config.tone).toBe('DEFAULT'); expect(config.iconKey).toBe('skip');
    expect(config.confirmText).toBe('Bỏ qua');
    expect(service.resolve('MISSING',{kind:'CONFIRMATION',messageTemplate:'Still ask'}).messageTemplate).toBe('Still ask');
  });
  it('falls back when templates reference unavailable values and clears old overrides on refresh', () => {
    service.load(); response.next({success:true,data:[{code:'LOGOUT_CONFIRM',kind:'CONFIRMATION',messageTemplate:'Unknown {missing}'}]}); response.complete();
    expect(service.resolve('LOGOUT_CONFIRM',{}).messageTemplate).toBe('Bạn có chắc muốn kết thúc phiên đăng nhập hiện tại?');
    response=new Subject(); api.CallApi.and.returnValue(response); service.load(true);
    response.next({success:true,data:[]}); response.complete();
    expect(service.resolve('LOGOUT_CONFIRM',{}).title).toBe('Đăng xuất khỏi trò chơi?');
  });
});
