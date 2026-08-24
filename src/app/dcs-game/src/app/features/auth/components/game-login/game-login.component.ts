import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HrkApiService } from '../../../../../../../../libs/core/http/hrk-api/hrk-api.service';
import { NavigationService } from '../../../../../../../../libs/core/services/navigation.service';
import { ApiMethod } from '../../../../../../../../libs/shared/common/constants/ApiMethod.constants';
import { ApiEndpoints } from '../../../../../../../shell/src/app/core/api-enpoints/api-endpoints';
import { HrkInputComponent } from '../../../../../../../../libs/shared/ui/controls/hrk-input/hrk-input.component';
import { HrkCheckboxComponent } from '../../../../../../../../libs/shared/ui/controls/hrk-checkbox/hrk-checkbox.component';
import { HrkIconComponent } from '../../../../../../../../libs/shared/ui/controls/hrk-icon/hrk-icon.component';

import { TokenManagerService } from '../../../../../../../../libs/core/auth/services/token-manager';

@Component({
  selector: 'app-game-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    HrkInputComponent,
    HrkCheckboxComponent,
    HrkIconComponent
  ],
  templateUrl: './game-login.component.html',
  styleUrl: './game-login.component.scss'
})
export class GameLoginComponent {
  @Output() navigateToRegister = new EventEmitter<void>();

  public dataForm!: FormGroup;
  public readonly authApi = ApiEndpoints.Auth;
  public loading = signal(false);
  public showPwd = signal(false);

  roles = [
    { label: 'Chiến Binh (User)', value: 'user' },
    { label: 'Chủ Công (Admin)', value: 'admin' },
    { label: 'Tướng Quân (Manager)', value: 'manager' }
  ];
  selectedRole = 'user';

  constructor(
    private fb: FormBuilder,
    private hrkApiService: HrkApiService,
    private navigationService: NavigationService,
    private tokenManager: TokenManagerService
  ) {
    this.initLoginForm();
  }

  public initLoginForm(): void {
    this.dataForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      remember: [true]
    });
  }

  hasErr(ctrl: 'email' | 'password'): boolean {
    const c = this.dataForm.get(ctrl);
    return !!(c && c.touched && c.invalid);
  }

  toggleShowPwd(): void {
    this.showPwd.update(v => !v);
  }

  submit(): void {
    if (this.dataForm.invalid) {
      this.dataForm.markAllAsTouched();
      return;
    }
    this.loading.set(true);

    this.hrkApiService.CallApi(
      ApiMethod.POST,
      this.authApi.Login,
      {
        email: this.dataForm.value.email,
        password: this.dataForm.value.password,
        rememberMe: this.dataForm.value.remember,
        role: this.selectedRole
      },
      { withCredentials: true }
    ).subscribe({
      next: async (res: any) => {
        console.log(res);
        if (res.success) {
          this.tokenManager.clearTokens();
          this.navigationService.goTo('/dcs-game/home');
        }
      },
      error: (err) => {
        console.error('Login error:', err);
        this.loading.set(false);
      },
      complete: () => {
        this.loading.set(false);
      }
    });
  }

  sso(provider: 'google' | 'microsoft'): void {
    console.log('SSO login attempt with:', provider);
    this.loading.set(true);
    setTimeout(() => {
      this.tokenManager.setAccessToken('game-api', 'mock_sso_game_token');
      this.loading.set(false);
      this.navigationService.goTo('/dcs-game/home');
    }, 1000);
  }

  onGoToRegister(event: MouseEvent): void {
    event.preventDefault();
    this.navigateToRegister.emit();
  }
}
