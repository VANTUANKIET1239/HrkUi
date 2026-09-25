import { HttpBackend, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment as env } from '../../../../../environments/dev/environment';
import { BaseResponse } from '../../../shared/models/auth.models';
import { AppAuthConfig, replaceAppAuthConfigs } from '../config/app-auth.config';

@Injectable({ providedIn: 'root' })
export class AppAuthConfigService {
  private readonly http: HttpClient;

  constructor(httpBackend: HttpBackend) {
    // Configuration must load before auth interceptors need the registry.
    this.http = new HttpClient(httpBackend);
  }

  async load(): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.http.get<BaseResponse<AppAuthConfig[]>>(
          `${env.baseUrl}auth/applications`,
          { withCredentials: true }
        )
      );
      if (response.success && Array.isArray(response.data)) {
        replaceAppAuthConfigs(response.data);
      }
    } catch {
      // Keep the local bootstrap fallback so the login page remains reachable
      // while Auth Service or the configuration table is unavailable.
    }
  }
}
