import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HrkApiService } from '../../../../../../libs/core/http/hrk-api/hrk-api.service';
import { ApiMethod } from '../../../../../../libs/shared/common/constants/ApiMethod.constants';
import { ApiEndpoints } from '../../../../../../libs/shared/common/constants/api-endpoints';
import { BaseResponse } from '../models/player.model';
import { StartBattleRequest, StartBattleResultDto } from '../models/battle.model';

@Injectable({ providedIn: 'root' })
export class BattleApiService {
  constructor(private readonly api: HrkApiService) {}

  start(request: StartBattleRequest): Observable<BaseResponse<StartBattleResultDto>> {
    return this.api.CallApi<BaseResponse<StartBattleResultDto>>(
      ApiMethod.POST,
      ApiEndpoints.Battle.Start,
      request,
      { withCredentials: true }
    );
  }

}
