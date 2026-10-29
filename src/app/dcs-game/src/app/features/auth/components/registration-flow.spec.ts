import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { PlayerService } from '../../../core/services/player.service';
import { GameToastService } from '../../../core/services/game-toast.service';
import { HrkApiService } from '../../../../../../../libs/core/http/hrk-api/hrk-api.service';
import { NavigationService } from '../../../../../../../libs/core/services/navigation.service';
import { TokenManagerService } from '../../../../../../../libs/core/auth/services/token-manager';
import { PlayerSetupComponent } from './player-setup/player-setup.component';
import { GameRegisterComponent } from './game-register/game-register.component';

describe('Registration and player preparation', () => {
  let players: jasmine.SpyObj<PlayerService>;
  let api: jasmine.SpyObj<HrkApiService>;
  let navigate: jasmine.Spy;
  let fixture: ComponentFixture<PlayerSetupComponent> | undefined;
  const pending = { success: true, data: { status: 'Pending', playerId: null } } as any;
  const ready = { success: true, data: { status: 'Ready', playerId: 123 } } as any;

  beforeEach(() => {
    players = jasmine.createSpyObj('PlayerService', ['getInitialization']);
    players.getInitialization.and.returnValue(of(pending));
    api = jasmine.createSpyObj('HrkApiService', ['CallApi']);
    api.CallApi.and.returnValue(of({ success: true }));
    TestBed.configureTestingModule({
      imports: [PlayerSetupComponent, GameRegisterComponent],
      providers: [provideRouter([]), { provide: PlayerService, useValue: players },
        { provide: HrkApiService, useValue: api },
        { provide: NavigationService, useValue: {} },
        { provide: TokenManagerService, useValue: { clearTokens: jasmine.createSpy('clearTokens') } },
        { provide: GameToastService, useValue: { success: jasmine.createSpy('success') } }]
    });
    navigate = spyOn(TestBed.inject(Router), 'navigateByUrl').and.returnValue(Promise.resolve(true));
  });
  afterEach(() => fixture?.destroy());

  function start(): PlayerSetupComponent {
    fixture = TestBed.createComponent(PlayerSetupComponent);
    fixture.detectChanges();
    tick(0);
    return fixture.componentInstance;
  }

  it('sends FullName and the game application code with no role or username field', () => {
    const register = TestBed.createComponent(GameRegisterComponent);
    register.componentInstance.dataForm.setValue({ username: ' Player ', email: 'player@example.test',
      password: 'StrongPassword123!', confirmPassword: 'StrongPassword123!', agreeTerms: true });
    register.componentInstance.submit();
    expect(api.CallApi.calls.mostRecent().args[2]).toEqual({ fullName: 'Player', email: 'player@example.test',
      password: 'StrongPassword123!', appCode: 'dcs-game' } as any);
    register.destroy();
  });

  it('waits for Ready before navigating into the game', fakeAsync(() => {
    players.getInitialization.and.returnValues(of(pending), of(ready));
    const component = start();
    expect(component.waiting()).toBeTrue();
    expect(navigate).not.toHaveBeenCalled();
    tick(2000);
    expect(navigate).toHaveBeenCalledOnceWith('/dcs-game/home', { replaceUrl: true });
  }));

  it('keeps the selected application when registering outside GAME', () => {
    spyOn(TestBed.inject(ActivatedRoute).snapshot.queryParamMap, 'get').and.returnValue('hrm');
    const register = TestBed.createComponent(GameRegisterComponent);
    register.componentInstance.dataForm.setValue({ username: 'HRM User', email: 'hrm@example.test',
      password: 'StrongPassword123!', confirmPassword: 'StrongPassword123!', agreeTerms: true });
    register.componentInstance.submit();
    expect((api.CallApi.calls.mostRecent().args[2] as any).appCode).toBe('hrm');
    register.destroy();
  });

  it('stops polling after a bounded wait and allows the user to retry', fakeAsync(() => {
    const component = start();
    tick(30000);
    expect(players.getInitialization).toHaveBeenCalledTimes(16);
    expect(component.waiting()).toBeFalse();
    expect(navigate).not.toHaveBeenCalled();
    players.getInitialization.and.returnValue(of(ready));
    component.start();
    tick(0);
    expect(navigate).toHaveBeenCalled();
  }));

  it('shows the retry state after repeated network errors', fakeAsync(() => {
    players.getInitialization.and.returnValue(throwError(() => new Error('unavailable')));
    const component = start();
    tick(30000);
    expect(component.waiting()).toBeFalse();
    expect(navigate).not.toHaveBeenCalled();
  }));

  it('stops polling when the route is destroyed', fakeAsync(() => {
    start();
    fixture!.destroy();
    tick(6000);
    expect(players.getInitialization).toHaveBeenCalledTimes(1);
  }));

  it('does not navigate an unavailable player into gameplay', fakeAsync(() => {
    players.getInitialization.and.returnValue(of({ success: true, data: { status: 'Unavailable', playerId: 1 } } as any));
    const component = start();
    expect(component.waiting()).toBeFalse();
    tick(6000);
    expect(players.getInitialization).toHaveBeenCalledTimes(1);
    expect(navigate).not.toHaveBeenCalled();
  }));

  it('refuses an external return URL', fakeAsync(() => {
    spyOn(TestBed.inject(ActivatedRoute).snapshot.queryParamMap, 'get').and.returnValue('https://example.test');
    players.getInitialization.and.returnValue(of(ready));
    start();
    expect(navigate).toHaveBeenCalledOnceWith('/dcs-game/home', { replaceUrl: true });
  }));
});
