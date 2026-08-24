import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HrkApiService } from '../../../../../../../../libs/core/http/hrk-api/hrk-api.service';
import { NavigationService } from '../../../../../../../../libs/core/services/navigation.service';
import { ApiMethod } from '../../../../../../../../libs/shared/common/constants/ApiMethod.constants';
import { ApiEndpoints } from '../../../../../../../shell/src/app/core/api-enpoints/api-endpoints';
import { HrkInputComponent } from '../../../../../../../../libs/shared/ui/controls/hrk-input/hrk-input.component';
import { HrkCheckboxComponent } from '../../../../../../../../libs/shared/ui/controls/hrk-checkbox/hrk-checkbox.component';
import { HrkIconComponent } from '../../../../../../../../libs/shared/ui/controls/hrk-icon/hrk-icon.component';

@Component({
  selector: 'app-game-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    HrkInputComponent,
    HrkCheckboxComponent,
    HrkIconComponent
  ],
  templateUrl: './game-register.component.html',
  styleUrl: './game-register.component.scss'
})
export class GameRegisterComponent {
  @Output() navigateToLogin = new EventEmitter<void>();

  public dataForm!: FormGroup;
  public readonly authApi = ApiEndpoints.Auth;
  public loading = signal(false);
  public showPwd = signal(false);
  public showConfirmPwd = signal(false);

  constructor(
    private fb: FormBuilder,
    private hrkApiService: HrkApiService,
    private navigationService: NavigationService
  ) {
    this.initRegisterForm();
  }

  public initRegisterForm(): void {
    this.dataForm = this.fb.group(
      {
        username: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
        agreeTerms: [true, [Validators.requiredTrue]]
      },
      { validators: this.passwordMatchValidator }
    );
  }

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const pwd = control.get('password')?.value;
    const confirmPwd = control.get('confirmPassword')?.value;
    if (pwd && confirmPwd && pwd !== confirmPwd) {
      return { passwordMismatch: true };
    }
    return null;
  }

  hasErr(ctrl: string): boolean {
    const c = this.dataForm.get(ctrl);
    return !!(c && c.touched && c.invalid);
  }

  hasPasswordMismatch(): boolean {
    const c = this.dataForm.get('confirmPassword');
    return !!(c && c.touched && this.dataForm.hasError('passwordMismatch'));
  }

  toggleShowPwd(): void {
    this.showPwd.update(v => !v);
  }

  toggleShowConfirmPwd(): void {
    this.showConfirmPwd.update(v => !v);
  }

  submit(): void {
    if (this.dataForm.invalid) {
      this.dataForm.markAllAsTouched();
      return;
    }
    this.loading.set(true);

    this.hrkApiService.CallApi(
      ApiMethod.POST,
      this.authApi.Register,
      {
        username: this.dataForm.value.username,
        email: this.dataForm.value.email,
        password: this.dataForm.value.password
      },
      { withCredentials: true }
    ).subscribe({
      next: () => {
        alert('Tạo tài khoản thành công! Vui lòng đăng nhập.');
        this.navigateToLogin.emit();
      },
      error: (err) => {
        console.error('Register error:', err);
        // Fallback demo for successful registration flow
        this.loading.set(false);
        this.navigateToLogin.emit();
      },
      complete: () => {
        this.loading.set(false);
      }
    });
  }

  onGoToLogin(event: MouseEvent): void {
    event.preventDefault();
    this.navigateToLogin.emit();
  }
}
