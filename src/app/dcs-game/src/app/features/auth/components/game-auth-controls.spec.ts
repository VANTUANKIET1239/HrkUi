import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NEVER } from 'rxjs';
import { HrkApiService } from '../../../../../../../libs/core/http/hrk-api/hrk-api.service';
import { NavigationService } from '../../../../../../../libs/core/services/navigation.service';
import { TokenManagerService } from '../../../../../../../libs/core/auth/services/token-manager';
import { LoadingService } from '../../../../../../../libs/core/loading/loading.service';
import { HrkInputComponent } from '../../../../../../../libs/shared/ui/controls/hrk-input/hrk-input.component';
import { GameToastService } from '../../../core/services/game-toast.service';
import { GameLoginComponent } from './game-login/game-login.component';
import { GameRegisterComponent } from './game-register/game-register.component';

describe('Game auth controls', () => {
  let fixtures: ComponentFixture<unknown>[];
  let api: jasmine.SpyObj<HrkApiService>;

  beforeEach(() => {
    fixtures = [];
    api = jasmine.createSpyObj('HrkApiService', ['CallApi']);
    api.CallApi.and.returnValue(NEVER);
    TestBed.configureTestingModule({
      imports: [GameLoginComponent, GameRegisterComponent, HrkInputComponent],
      providers: [provideRouter([]), { provide: HrkApiService, useValue: api },
        ...[NavigationService, TokenManagerService, LoadingService, GameToastService]
          .map(provide => ({ provide, useValue: {} }))]
    });
  });

  afterEach(() => fixtures.forEach(fixture => fixture.destroy()));

  function login(): ComponentFixture<GameLoginComponent> {
    const fixture = TestBed.createComponent(GameLoginComponent);
    fixtures.push(fixture);
    fixture.detectChanges();
    return fixture;
  }

  for (const width of [248, 416]) {
    it(`keeps the password toggle inside its input and auth actions aligned in ${width}px`, () => {
      const fixture = login();
      const host: HTMLElement = fixture.nativeElement;
      host.style.width = `${width}px`;
      const form = host.querySelector('form')!.getBoundingClientRect();
      const input = host.querySelector('hrk-input[formControlName="password"] input')!;
      const inputBounds = input.getBoundingClientRect();
      const toggle = host.querySelector('.btn-pwd-toggle')!.getBoundingClientRect();
      expect(toggle.left).toBeGreaterThanOrEqual(inputBounds.left);
      expect(toggle.right).toBeLessThanOrEqual(inputBounds.right);
      expect(toggle.top).toBeGreaterThanOrEqual(inputBounds.top);
      expect(toggle.bottom).toBeLessThanOrEqual(inputBounds.bottom);
      const submit = host.querySelector('button[type="submit"]')!.getBoundingClientRect();
      expect(Math.abs(submit.width - form.width)).toBeLessThan(1);
      expect(submit.height).toBeGreaterThanOrEqual(44);
      const social = Array.from(host.querySelectorAll('.game-btn-sso'), button => button.getBoundingClientRect());
      expect(Math.abs(social[0].width - social[1].width)).toBeLessThan(1);
      expect(Math.abs(social[0].top - social[1].top)).toBeLessThan(1);
      expect(social[1].left - social[0].right).toBeGreaterThanOrEqual(10);
      expect(social[0].height).toBeGreaterThanOrEqual(44);
      for (const selector of ['.form-actions-row', '.sso-group', '.switch-prompt']) {
        const bounds = host.querySelector(selector)!.getBoundingClientRect();
        expect(bounds.left).withContext(selector).toBeGreaterThanOrEqual(form.left);
        expect(bounds.right).withContext(selector).toBeLessThanOrEqual(form.right + 1);
      }
      expect(getComputedStyle(input).backgroundColor).not.toBe('rgb(255, 255, 255)');
    });
  }

  it('toggles password visibility and remembering from their actual controls without submitting', () => {
    const fixture = login();
    const host: HTMLElement = fixture.nativeElement;
    const password = host.querySelector('hrk-input[formControlName="password"] input') as HTMLInputElement;
    const toggle = host.querySelector('.btn-pwd-toggle') as HTMLButtonElement;
    expect(password.type).toBe('password');
    toggle.click(); fixture.detectChanges();
    expect(password.type).toBe('text');
    expect(toggle.getAttribute('aria-pressed')).toBe('true');
    expect(fixture.componentInstance.dataForm.value.remember).toBeTrue();
    (host.querySelector('.remember-text') as HTMLElement).click(); fixture.detectChanges();
    expect(fixture.componentInstance.dataForm.value.remember).toBeFalse();
    expect(api.CallApi).not.toHaveBeenCalled();
    fixture.componentInstance.loading.set(true); fixture.detectChanges();
    expect((host.querySelector('button[type="submit"]') as HTMLButtonElement).disabled).toBeTrue();
  });

  it('shows invalid field feedback without posting an invalid login', () => {
    const fixture = login();
    fixture.componentInstance.submit(); fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement;
    expect(host.querySelectorAll('.form-group .error-msg').length).toBe(2);
    expect(host.querySelector('hrk-input[formControlName="password"] input')!.getAttribute('aria-invalid')).toBe('true');
    expect(api.CallApi).not.toHaveBeenCalled();
  });

  it('keeps registration toggles and terms functional with the same control styling', () => {
    const fixture = TestBed.createComponent(GameRegisterComponent);
    fixtures.push(fixture); fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement;
    const toggles = host.querySelectorAll<HTMLButtonElement>('.btn-pwd-toggle');
    toggles.forEach(toggle => toggle.click()); fixture.detectChanges();
    expect(host.querySelector('hrk-input[formControlName="password"] input')!.getAttribute('type')).toBe('text');
    expect(host.querySelector('hrk-input[formControlName="confirmPassword"] input')!.getAttribute('type')).toBe('text');
    (host.querySelector('.remember-text a') as HTMLAnchorElement).click(); fixture.detectChanges();
    expect(fixture.componentInstance.dataForm.value.agreeTerms).toBeTrue();
    (host.querySelector('.remember-text') as HTMLElement).click(); fixture.detectChanges();
    expect(fixture.componentInstance.dataForm.value.agreeTerms).toBeFalse();
    fixture.componentInstance.submit(); fixture.detectChanges();
    expect(api.CallApi).not.toHaveBeenCalled();
    expect(host.querySelector('button[type="submit"]')!.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
  });

  it('preserves the default shared input appearance outside game forms', () => {
    login();
    const register = TestBed.createComponent(GameRegisterComponent);
    fixtures.push(register); register.detectChanges();
    const input = TestBed.createComponent(HrkInputComponent);
    fixtures.push(input); input.nativeElement.classList.add('form-group'); input.detectChanges();
    expect(getComputedStyle(input.nativeElement.querySelector('input')).backgroundColor).toBe('rgb(255, 255, 255)');
  });
});
