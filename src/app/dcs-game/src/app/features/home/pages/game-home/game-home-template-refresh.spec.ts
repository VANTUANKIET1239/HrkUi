import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { GameHomeComponent } from './game-home.component';
import { GameTemplateCacheService } from '../../../../core/services/game-template-cache.service';
import { GameModalConfigService } from '../../../../core/services/game-modal-config.service';
import { GameToastService } from '../../../../core/services/game-toast.service';
import { HrkConfirmationService } from '../../../../../../../../libs/shared/ui/modal/hrk-confirmation.service';

describe('Home template refresh', () => {
  let component: GameHomeComponent;
  let refresh: Subject<any>;
  let api: jasmine.SpyObj<GameTemplateCacheService>;
  let confirmation: jasmine.SpyObj<HrkConfirmationService>;
  let toast: jasmine.SpyObj<GameToastService>;
  let modals: jasmine.SpyObj<GameModalConfigService>;
  let reloadFeatures: jasmine.Spy;
  let reloadPower: jasmine.Spy;

  beforeEach(() => {
    refresh = new Subject();
    api = jasmine.createSpyObj('templateCache', ['refresh', 'capabilities']); api.refresh.and.returnValue(refresh);
    confirmation = jasmine.createSpyObj('confirmation', ['confirm']); confirmation.confirm.and.resolveTo(true);
    toast = jasmine.createSpyObj('toast', ['success', 'fromError', 'text']);
    toast.text.and.callFake(new GameToastService().text);
    modals = jasmine.createSpyObj('modals', ['load']);
    TestBed.configureTestingModule({ providers: [
      { provide: GameTemplateCacheService, useValue: api }, { provide: HrkConfirmationService, useValue: confirmation },
      { provide: GameToastService, useValue: toast }, { provide: GameModalConfigService, useValue: modals }
    ] });
    component = TestBed.runInInjectionContext(() => new GameHomeComponent(
      null!, null!, null!, null!, null!, null!, null!, null!, null!));
    reloadFeatures = spyOn<any>(component, 'loadFeatureConfigs');
    reloadPower = spyOn(component, 'refreshPower');
    component.canRefreshTemplates = true;
  });

  it('confirms once, prevents duplicate requests and reloads visible data only after success', async () => {
    const pending = component.refreshTemplates();
    await component.refreshTemplates();
    await pending;
    expect(confirmation.confirm).toHaveBeenCalledTimes(1);
    expect(api.refresh).toHaveBeenCalledTimes(1);
    expect(component.isRefreshingTemplates).toBeTrue();
    expect(reloadFeatures).not.toHaveBeenCalled();
    refresh.next({ success: true, data: { tableCount: 41, rowCount: 123, revision: 'new' } }); refresh.complete();
    expect(component.isRefreshingTemplates).toBeFalse();
    expect(reloadFeatures).toHaveBeenCalledTimes(1);
    expect(reloadPower).toHaveBeenCalledTimes(1);
    expect(modals.load).toHaveBeenCalledWith(true);
    expect(toast.success).toHaveBeenCalledTimes(1);
  });

  it('does not post after cancellation or without capability', async () => {
    confirmation.confirm.and.resolveTo(false);
    await component.refreshTemplates();
    component.canRefreshTemplates = false;
    await component.refreshTemplates();
    expect(api.refresh).not.toHaveBeenCalled();
    expect(component.isRefreshingTemplates).toBeFalse();
  });

  it('releases the button and shows the shared error toast on failure', async () => {
    await component.refreshTemplates();
    const error = new Error('Redis unavailable'); refresh.error(error);
    expect(component.isRefreshingTemplates).toBeFalse();
    expect(toast.fromError).toHaveBeenCalledWith(error, jasmine.any(String));
    expect(toast.success).not.toHaveBeenCalled();
    expect(reloadFeatures).not.toHaveBeenCalled();
  });
});
