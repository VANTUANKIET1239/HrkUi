import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HrkApiService } from '../../../../../../libs/core/http/hrk-api/hrk-api.service';
import { ApiMethod } from '../../../../../../libs/shared/common/constants/ApiMethod.constants';
import { ApiEndpoints } from '../../../../../../libs/shared/common/constants/api-endpoints';
import { BaseResponse } from '../models/player.model';
import {
  EnhanceEquipmentRequest,
  EnhanceEquipmentResult,
  EnhancementConfigResponse
} from '../models/enhancement.model';

@Injectable({
  providedIn: 'root'
})
export class EnhancementService {
  private readonly inventoryApi = ApiEndpoints.Inventory;

  constructor(private hrkApiService: HrkApiService) {}

  /**
   * Get enhancement level configurations and materials metadata
   */
  getEnhancementConfigs(): Observable<BaseResponse<EnhancementConfigResponse>> {
    return this.hrkApiService.CallApi<BaseResponse<EnhancementConfigResponse>>(
      ApiMethod.GET,
      this.inventoryApi.EnhancementConfigs,
      { withCredentials: true }
    );
  }

  /**
   * Execute equipment enhancement attempt with atomic server roll
   */
  enhanceEquipment(request: EnhanceEquipmentRequest): Observable<BaseResponse<EnhanceEquipmentResult>> {
    return this.hrkApiService.CallApi<BaseResponse<EnhanceEquipmentResult>>(
      ApiMethod.POST,
      this.inventoryApi.Enhance,
      request,
      { withCredentials: true }
    );
  }
}
