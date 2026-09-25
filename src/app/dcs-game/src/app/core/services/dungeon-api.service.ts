import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HrkApiService } from '../../../../../../libs/core/http/hrk-api/hrk-api.service';
import { ApiMethod } from '../../../../../../libs/shared/common/constants/ApiMethod.constants';
import { ApiEndpoints } from '../../../../../../libs/shared/common/constants/api-endpoints';
import { BaseResponse } from '../models/player.model';
import { ClaimStarChestResult, DungeonMap, DungeonMapDetail, DungeonStamina, StartDungeonStageResult, BattleFormationDraft, FormationPreviewResponse } from '../models/dungeon.model';

@Injectable({ providedIn:'root' })
export class DungeonApiService {
  constructor(private readonly api:HrkApiService) {}
  maps():Observable<BaseResponse<DungeonMap[]>> { return this.api.CallApi<BaseResponse<DungeonMap[]>>(ApiMethod.GET, ApiEndpoints.Dungeon.Maps, {withCredentials:true}); }
  map(id:number):Observable<BaseResponse<DungeonMapDetail>> { return this.api.CallApi<BaseResponse<DungeonMapDetail>>(ApiMethod.GET, ApiEndpoints.Dungeon.Map(id), {withCredentials:true}); }
  stamina():Observable<BaseResponse<DungeonStamina>> { return this.api.CallApi<BaseResponse<DungeonStamina>>(ApiMethod.GET, ApiEndpoints.Dungeon.Stamina, {withCredentials:true}); }
  purchaseStamina():Observable<BaseResponse<DungeonStamina>> { return this.api.CallApi<BaseResponse<DungeonStamina>>(ApiMethod.POST, ApiEndpoints.Dungeon.PurchaseStamina, {}, {withCredentials:true}); }
  start(stageId: number, draft?: BattleFormationDraft): Observable<BaseResponse<StartDungeonStageResult>> {
    const payload = {
      formationCode: draft?.formationCode || 'DEFAULT',
      positions: draft?.positions || [],
      clientRequestId: crypto.randomUUID().replaceAll('-', '')
    };
    return this.api.CallApi<BaseResponse<StartDungeonStageResult>>(ApiMethod.POST, ApiEndpoints.Dungeon.Start(stageId), payload, {withCredentials:true});
  }
  previewFormation(stageId: number, draft: BattleFormationDraft): Observable<BaseResponse<FormationPreviewResponse>> {
    return this.api.CallApi<BaseResponse<FormationPreviewResponse>>(ApiMethod.POST, ApiEndpoints.Dungeon.FormationPreview(stageId), draft, {withCredentials:true});
  }
  claimChest(chestId:number):Observable<BaseResponse<ClaimStarChestResult>> {
    return this.api.CallApi<BaseResponse<ClaimStarChestResult>>(ApiMethod.POST, ApiEndpoints.Dungeon.ClaimChest(chestId), {}, {withCredentials:true});
  }
}

