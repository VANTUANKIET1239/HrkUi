import { NavigationService } from './../../../../../../../../libs/core/services/navigation.service';
import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HrkApiService } from '../../../../../../../../libs/core/http/hrk-api/hrk-api.service';
import { ApiMethod } from '../../../../../../../../libs/shared/common/constants/ApiMethod.constants';
import { ApiEndpoints } from '../../../../core/api-enpoints/api-endpoints';


@Component({
  standalone: false,
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

public dataForm!: FormGroup;

public readonly authApi = ApiEndpoints.Auth;

constructor(private fb: FormBuilder, private HrkApiService: HrkApiService, private navigationService: NavigationService) {
    this.initLoginForm();
}

  year = new Date().getFullYear();
  loading = signal(false);
  showPwd = signal(false);




  public initLoginForm(){
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

  toggleShowPwd() { this.showPwd.update(v => !v); }

  submit() {
    if (this.dataForm.invalid) {
      this.dataForm.markAllAsTouched();
      return;
    }
    this.loading.set(true);

    this.HrkApiService.CallApi(ApiMethod.POST, this.authApi.Login,{
      email: this.dataForm.value.email,
      password: this.dataForm.value.password,
      rememberMe: this.dataForm.value.remember
    },
    {
        withCredentials: true
      }).subscribe({
        next: (res) => {
          this.navigationService.goTo('/hrm/home/main');
        },
        error: (err) => {
          console.error('API error:', err);
          this.loading.set(false);
        },
        complete: () => {
          this.loading.set(false);
        }
      });
  }

  testfunction(){
    console.log('Test function called');


  }

  sso(provider: 'google' | 'microsoft') {
    // Hook up to your real SSO endpoints
    console.log('SSO with', provider);

    this.HrkApiService.CallApi(ApiMethod.GET, 'Test',{
      withCredentials: true
    }).subscribe({
      next: (res) => {
        console.log('API response:', res);
      },
      error: (err) => {
        console.error('API error:', err);
      }
    });


  }
}
