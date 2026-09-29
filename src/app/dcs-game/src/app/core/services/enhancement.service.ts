import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HrkApiService } from '../../../../../../libs/core/http/hrk-api/hrk-api.service';
import { ApiMethod } from '../../../../../../libs/shared/common/constants/ApiMethod.constants';
import { ApiEndpoints } from '../../../../../../libs/shared/common/constants/api-endpoints';
import { BaseResponse } from '../models/player.model';
import {
  EnhanceEquipmentRequest,
  EnhanceEquipmentResult,
  EnhancementConfigResponse,
  EquipmentEnhancementPreview,
  ForgeEquipmentItem, EquipmentDowngradePreview
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
   * Get equipment inventory browser list for the Forge with Domain eligibility
   */
  getForgeEquipment(): Observable<BaseResponse<ForgeEquipmentItem[]>> {
    return this.hrkApiService.CallApi<BaseResponse<ForgeEquipmentItem[]>>(
      ApiMethod.GET,
      this.inventoryApi.ForgeEquipment,
      { withCredentials: true }
    );
  }

  /**
   * Get detailed current vs next level stats & cost preview for selected equipment
   */
  getEnhancementPreview(inventoryItemId: number): Observable<BaseResponse<EquipmentEnhancementPreview>> {
    return this.hrkApiService.CallApi<BaseResponse<EquipmentEnhancementPreview>>(
      ApiMethod.GET,
      this.inventoryApi.EnhancementPreview(inventoryItemId),
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

  getDowngradePreview(id: number, targetLevel: number): Observable<BaseResponse<EquipmentDowngradePreview>> {
    return this.hrkApiService.CallApi(ApiMethod.GET, this.inventoryApi.DowngradePreview(id, targetLevel), { withCredentials: true });
  }
  downgradeEquipment(request: { requestId: string; inventoryItemId: number; targetEnhancement: number }): Observable<BaseResponse<EquipmentDowngradePreview>> {
    return this.hrkApiService.CallApi(ApiMethod.POST, this.inventoryApi.Downgrade, request, { withCredentials: true });
  }
}
