import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HrkApiService } from '../../../../../../../../libs/core/http/hrk-api/hrk-api.service';

@Component({
  standalone: false,
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {

public dataForm!: FormGroup;

constructor(private fb: FormBuilder, private HrkApiService: HrkApiService) {
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
    // Simulate API call
    setTimeout(() => {
      this.loading.set(false);
      // TODO: replace with real auth flow
      console.log('Login payload', this.dataForm.value);
    }, 1200);
  }

  testfunction(){
    console.log('Test function called');


  }

  sso(provider: 'google' | 'microsoft') {
    // Hook up to your real SSO endpoints
    console.log('SSO with', provider);

    this.HrkApiService.CallApi('GET', 'Test',{
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
