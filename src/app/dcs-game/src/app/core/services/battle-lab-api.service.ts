import { Injectable, inject } from '@angular/core';
import { HrkApiService } from '../../../../../../libs/core/http/hrk-api/hrk-api.service';
import { ApiMethod } from '../../../../../../libs/shared/common/constants/ApiMethod.constants';
import { ApiEndpoints } from '../../../../../../libs/shared/common/constants/api-endpoints';
import { BaseResponse } from '../models/player.model';
import { LabCatalog, LabReport, LabRequest } from '../models/battle-lab.model';

@Injectable({ providedIn: 'root' })
export class BattleLabApiService {
  private readonly api = inject(HrkApiService);
  catalog() {
    return this.api.CallApi<BaseResponse<LabCatalog>>(ApiMethod.GET, ApiEndpoints.Battle.LabCatalog,
      { withCredentials: true });
  }
  run(request: LabRequest) {
    return this.api.CallApi<BaseResponse<LabReport>>(ApiMethod.POST, ApiEndpoints.Battle.LabRun,
      request, { withCredentials: true });
  }
}
