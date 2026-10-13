import { inject, Injectable } from '@angular/core';
import { timeout } from 'rxjs';
import { HrkApiService } from '../../../../../../libs/core/http/hrk-api/hrk-api.service';
import { ApiMethod } from '../../../../../../libs/shared/common/constants/ApiMethod.constants';
import { ApiEndpoints } from '../../../../../../libs/shared/common/constants/api-endpoints';
import { BaseResponse } from '../models/player.model';
import { SummonConfiguration, SummonRequest, SummonResult } from '../models/summon.model';

@Injectable({ providedIn: 'root' })
export class SummonService {
  private readonly api = inject(HrkApiService);
  configuration() {
    return this.api.CallApi<BaseResponse<SummonConfiguration>>(ApiMethod.GET, ApiEndpoints.Summon.Configuration, { withCredentials: true }).pipe(timeout(30000));
  }
  summon(request: SummonRequest) {
    return this.api.CallApi<BaseResponse<SummonResult>>(ApiMethod.POST, ApiEndpoints.Summon.Open, request, { withCredentials: true }).pipe(timeout(30000));
  }
  result(requestId: string) {
    return this.api.CallApi<BaseResponse<SummonResult>>(ApiMethod.GET, ApiEndpoints.Summon.Result(requestId), { withCredentials: true }).pipe(timeout(30000));
  }
}
