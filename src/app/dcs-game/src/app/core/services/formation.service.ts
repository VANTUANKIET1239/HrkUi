import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HrkApiService } from '../../../../../../libs/core/http/hrk-api/hrk-api.service';
import { ApiMethod } from '../../../../../../libs/shared/common/constants/ApiMethod.constants';
import { ApiEndpoints } from '../../../../../../libs/shared/common/constants/api-endpoints';
import { BaseResponse } from '../models/player.model';
import {
  FormationDetailDto,
  FormationUpgradeResultDto,
  PlayerFormationSummaryDto,
  SlotHeroPositionDto,
  UpdateFormationPositionsRequest
} from '../models/formation.model';

@Injectable({ providedIn: 'root' })
export class FormationService {
  constructor(private readonly api: HrkApiService) {}

  getFormations(): Observable<BaseResponse<PlayerFormationSummaryDto[]>> {
    return this.api.CallApi<BaseResponse<PlayerFormationSummaryDto[]>>(
      ApiMethod.GET,
      ApiEndpoints.Formation.List,
      { withCredentials: true }
    );
  }

  getFormationDetail(code: string): Observable<BaseResponse<FormationDetailDto>> {
    return this.api.CallApi<BaseResponse<FormationDetailDto>>(
      ApiMethod.GET,
      ApiEndpoints.Formation.Detail(code),
      { withCredentials: true }
    );
  }

  updatePositions(code: string, positions: SlotHeroPositionDto[]): Observable<BaseResponse<FormationDetailDto>> {
    const payload: UpdateFormationPositionsRequest = { positions };
    return this.api.CallApi<BaseResponse<FormationDetailDto>>(
      ApiMethod.PUT,
      ApiEndpoints.Formation.UpdatePositions(code),
      payload,
      { withCredentials: true }
    );
  }

  selectFormation(code: string): Observable<BaseResponse<FormationDetailDto>> {
    return this.api.CallApi<BaseResponse<FormationDetailDto>>(
      ApiMethod.PUT,
      ApiEndpoints.Formation.Select(code),
      null,
      { withCredentials: true }
    );
  }

  upgradeFormation(code: string): Observable<BaseResponse<FormationUpgradeResultDto>> {
    return this.api.CallApi<BaseResponse<FormationUpgradeResultDto>>(
      ApiMethod.POST,
      ApiEndpoints.Formation.Upgrade(code),
      null,
      { withCredentials: true }
    );
  }
}
