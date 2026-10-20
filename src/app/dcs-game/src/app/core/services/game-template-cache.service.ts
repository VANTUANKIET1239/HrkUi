import { inject, Injectable } from '@angular/core';
import { Subject, tap } from 'rxjs';
import { HrkApiService } from '../../../../../../libs/core/http/hrk-api/hrk-api.service';
import { ApiEndpoints } from '../../../../../../libs/shared/common/constants/api-endpoints';
import { BaseResponse } from '../models/player.model';

export interface TemplateRefreshResult {
  revision: string;
  loadedAt: string;
  tableCount: number;
  rowCount: number;
}

@Injectable({ providedIn: 'root' })
export class GameTemplateCacheService {
  private readonly api = inject(HrkApiService);
  private readonly refreshed = new Subject<TemplateRefreshResult>();
  readonly refreshed$ = this.refreshed.asObservable();

  capabilities() {
    return this.api.CallApi<BaseResponse<{ canRefresh: boolean }>>('GET', ApiEndpoints.GameConfig.TemplateCapabilities,
      { withCredentials: true, loading: 'none' });
  }

  refresh() {
    return this.api.CallApi<BaseResponse<TemplateRefreshResult>>('POST', ApiEndpoints.GameConfig.RefreshTemplates, {},
      { withCredentials: true, loading: 'none' }).pipe(tap(response => {
        if (response.success && response.data) this.refreshed.next(response.data);
      }));
  }
}
