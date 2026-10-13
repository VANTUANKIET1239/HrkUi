import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, Subject } from 'rxjs';
import { BaseResponse } from '../../../core/models/player.model';
import { SummonConfiguration, SummonResult } from '../../../core/models/summon.model';
import { SummonService } from '../../../core/services/summon.service';
import { SummonPageComponent } from './summon-page.component';

describe('Summon page integration', () => {
  let fixture: ComponentFixture<SummonPageComponent>;
  let api: jasmine.SpyObj<SummonService>;
  let response: Subject<BaseResponse<SummonResult>>;
  const playerId = 987654322;
  const ok = <T>(data: T): BaseResponse<T> => ({ data, success: true, statusCode: 200, message: '' });
  beforeEach(() => {
    sessionStorage.removeItem(`hrk.summon.pending:${playerId}`);
    const hero = { heroTemplateId: 1, name: 'Tướng trong rương', avatar: '/assets/images/dcs-game/summon/normal-chest.png', rarityCode: 'RARE', rarityName: 'Hiếm', probabilityPercent: 100 };
    const configuration: SummonConfiguration = { playerId, wallet: { gold: 100000, diamonds: 2000 }, pools: [
      { code: 'NORMAL', name: 'Chiêu mộ thường', currency: 'GOLD', singleCost: 10000, tenCost: 100000, heroes: [hero] },
      { code: 'PREMIUM', name: 'Chiêu mộ cao cấp', currency: 'DIAMOND', singleCost: 200, tenCost: 2000, heroes: [hero] }
    ] };
    response = new Subject();
    api = jasmine.createSpyObj('SummonService', ['configuration', 'summon', 'result']);
    api.configuration.and.returnValue(of(ok(configuration)));
    api.summon.and.returnValue(response.asObservable());
    TestBed.configureTestingModule({ imports: [SummonPageComponent], providers: [provideRouter([]), { provide: SummonService, useValue: api }] });
    fixture = TestBed.createComponent(SummonPageComponent);
    fixture.detectChanges();
  });
  afterEach(() => { fixture.destroy(); sessionStorage.removeItem(`hrk.summon.pending:${playerId}`); });

  function deliver(): void {
    const request = api.summon.calls.mostRecent().args[0];
    response.next(ok({ ...request, currency: 'GOLD', cost: request.count * 10000, wallet: { gold: 0, diamonds: 2000 },
      items: Array.from({ length: request.count }, (_, index) => ({ heroTemplateId: 2, name: 'Tướng thực nhận', avatar: '/assets/images/dcs-game/summon/premium-chest.png',
        rarityCode: 'LEGENDARY', rarityName: 'Huyền thoại', drawIndex: index, isNew: index === 0, stoneQuantity: index === 0 ? 0 : 50 })) }));
    fixture.detectChanges();
  }

  it('renders both chest assets and opens a ten-card popup from the actual button', () => {
    const page: HTMLElement = fixture.nativeElement;
    expect(page.querySelectorAll('app-summon-chest').length).toBe(2);
    expect(page.querySelectorAll('.chest-art img')[0].getAttribute('src')).toContain('/summon/normal-chest.png');
    expect(page.querySelectorAll('.chest-art img')[1].getAttribute('src')).toContain('/summon/premium-chest.png');
    (page.querySelector('.open-ten') as HTMLButtonElement).click();
    deliver();
    expect(page.querySelector('app-summon-reel')).toBeNull();
    expect(page.querySelectorAll('app-summon-result-modal app-summon-hero-card').length).toBe(10);
    expect(page.querySelector('main')?.hasAttribute('inert')).toBeTrue();
  });

  it('opens a single reel and reveals the received hero when skipped', () => {
    const page: HTMLElement = fixture.nativeElement;
    (page.querySelector('.open-one') as HTMLButtonElement).click();
    deliver();
    expect(page.querySelector('app-summon-reel')).not.toBeNull();
    (page.querySelector('app-summon-reel button') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(page.querySelector('app-summon-reel')).toBeNull();
    expect(page.querySelector('app-summon-result-modal')?.textContent).toContain('Tướng thực nhận');
    expect(page.querySelectorAll('app-summon-result-modal app-summon-hero-card').length).toBe(1);
  });
});
