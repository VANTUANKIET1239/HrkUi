import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HrkApiService } from '../../../../../../libs/core/http/hrk-api/hrk-api.service';
import { ApiMethod } from '../../../../../../libs/shared/common/constants/ApiMethod.constants';
import { ApiEndpoints } from '../../../../../../libs/shared/common/constants/api-endpoints';
import { LoadingMode, withLoading } from '../../../../../../libs/core/loading/loading.tokens';
import { BaseResponse } from '../models/player.model';
import { GameFeatureConfig } from '../models/game-feature-config.model';

@Injectable({ providedIn: 'root' })
export class GameFeatureConfigService {
  constructor(private readonly api: HrkApiService) {}

  getFeatures(loadingMode: LoadingMode = 'none'): Observable<BaseResponse<GameFeatureConfig[]>> {
    return this.api.CallApi<BaseResponse<GameFeatureConfig[]>>(ApiMethod.GET, ApiEndpoints.GameConfig.Features, {
      withCredentials: true, loading: loadingMode, context: withLoading(loadingMode)
    });
  }
}
