import { WireEvent, WireProgress, WireFloor, WireTowerResult, WirePendingReward, WireQuickJob } from '../models/tower-wire.model';
import { mapEvent, mapProgress, mapFloor, mapFloorDetail, mapResult, mapPending, mapJob } from './tower-response.mapper';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { HrkApiService } from '../../../../../../libs/core/http/hrk-api/hrk-api.service';
import { ApiMethod } from '../../../../../../libs/shared/common/constants/ApiMethod.constants';
import { ApiEndpoints } from '../../../../../../libs/shared/common/constants/api-endpoints';
import { BaseResponse } from '../models/player.model';
import {
  GameEventItem,
  TowerProgress,
  TowerFloorSummary,
  TowerFloorDetail,
  StartTowerBattleResult,
  TowerQuickClimbJob,
  PendingReward,
  ClaimMilestoneChestResult
} from '../models/event.model';
import { BattleFormationDraft } from '../models/dungeon.model';

@Injectable({ providedIn: 'root' })
export class TowerApiService {
  constructor(private readonly api: HrkApiService) {}

  getEvents(): Observable<BaseResponse<GameEventItem[]>> {
    return this.api.CallApi<BaseResponse<WireEvent[]>>(
      ApiMethod.GET,
      ApiEndpoints.Events.List,
      { withCredentials: true }
    ).pipe(map(response => ({ ...response, data: response.data ? ((xs: WireEvent[]) => xs.map(mapEvent))(response.data) : response.data })));
  }

  getTowerProgress(): Observable<BaseResponse<TowerProgress>> {
    return this.api.CallApi<BaseResponse<WireProgress>>(
      ApiMethod.GET,
      ApiEndpoints.Events.TowerProgress,
      { withCredentials: true }
    ).pipe(map(response => ({ ...response, data: response.data ? (mapProgress)(response.data) : response.data })));
  }

  getTowerFloors(): Observable<BaseResponse<TowerFloorSummary[]>> {
    return this.api.CallApi<BaseResponse<WireFloor[]>>(
      ApiMethod.GET,
      ApiEndpoints.Events.TowerFloors,
      { withCredentials: true }
    ).pipe(map(response => ({ ...response, data: response.data ? ((xs: WireFloor[]) => xs.map(mapFloor))(response.data) : response.data })));
  }

  getFloorDetail(floorNumber: number): Observable<BaseResponse<TowerFloorDetail>> {
    return this.api.CallApi<BaseResponse<WireFloor>>(
      ApiMethod.GET,
      ApiEndpoints.Events.TowerFloorDetail(floorNumber),
      { withCredentials: true }
    ).pipe(map(response => ({ ...response, data: response.data ? (mapFloorDetail)(response.data) : response.data })));
  }

  startBattle(floorNumber: number, draft?: BattleFormationDraft): Observable<BaseResponse<StartTowerBattleResult>> {
    const payload = {
      floorNumber,
      formationCode: draft?.formationCode,
      positions: draft?.positions || [],
      clientRequestId: crypto.randomUUID().replaceAll('-', '')
    };
    return this.api.CallApi<BaseResponse<WireTowerResult>>(
      ApiMethod.POST,
      ApiEndpoints.Events.TowerStartBattle(floorNumber),
      payload,
      { withCredentials: true }
    ).pipe(map(response => ({ ...response, data: response.data ? (mapResult)(response.data) : response.data })));
  }

  startNewRun(): Observable<BaseResponse<TowerProgress>> {
    return this.api.CallApi<BaseResponse<WireProgress>>(
      ApiMethod.POST,
      ApiEndpoints.Events.TowerStartNewRun,
      {},
      { withCredentials: true }
    ).pipe(map(response => ({ ...response, data: response.data ? (mapProgress)(response.data) : response.data })));
  }

  claimChest(chestId: number): Observable<BaseResponse<ClaimMilestoneChestResult>> {
    return this.api.CallApi<BaseResponse<ClaimMilestoneChestResult>>(
      ApiMethod.POST,
      ApiEndpoints.Events.TowerClaimChest(chestId),
      {},
      { withCredentials: true }
    );
  }

  startQuickClimb(startFloor?: number, targetFloor?: number, draft?: BattleFormationDraft): Observable<BaseResponse<TowerQuickClimbJob>> {
    const payload = {
      
      
      formationCode: draft?.formationCode,
      positions: draft?.positions || []
    };
    return this.api.CallApi<BaseResponse<WireQuickJob>>(
      ApiMethod.POST,
      ApiEndpoints.Events.TowerStartQuickClimb,
      payload,
      { withCredentials: true }
    ).pipe(map(response => ({ ...response, data: response.data ? (mapJob)(response.data) : response.data })));
  }

  getCurrentQuickClimb(): Observable<BaseResponse<TowerQuickClimbJob>> {
    return this.api.CallApi<BaseResponse<WireQuickJob>>(
      ApiMethod.GET,
      ApiEndpoints.Events.TowerCurrentQuickClimb,
      { withCredentials: true }
    ).pipe(map(response => ({ ...response, data: response.data ? (mapJob)(response.data) : response.data })));
  }

  getQuickClimbJob(jobId: string): Observable<BaseResponse<TowerQuickClimbJob>> {
    return this.api.CallApi<BaseResponse<WireQuickJob>>(
      ApiMethod.GET,
      ApiEndpoints.Events.TowerQuickClimbJob(jobId),
      { withCredentials: true }
    ).pipe(map(response => ({ ...response, data: response.data ? (mapJob)(response.data) : response.data })));
  }

  stopQuickClimb(jobId: string): Observable<BaseResponse<WireQuickJob>> {
    return this.api.CallApi<BaseResponse<WireQuickJob>>(
      ApiMethod.POST,
      ApiEndpoints.Events.TowerStopQuickClimb(jobId),
      { jobId },
      { withCredentials: true }
    );
  }

  getPendingRewards(): Observable<BaseResponse<PendingReward[]>> {
    return this.api.CallApi<BaseResponse<WirePendingReward[]>>(
      ApiMethod.GET,
      ApiEndpoints.Events.TowerPendingRewards,
      { withCredentials: true }
    ).pipe(map(response => ({ ...response, data: response.data ? ((xs: WirePendingReward[]) => xs.map(mapPending))(response.data) : response.data })));
  }

  claimPendingReward(pendingId: number): Observable<BaseResponse<{ success: boolean; message: string; isBagFull: boolean }>> {
    return this.api.CallApi<BaseResponse<{ success: boolean; message: string; isBagFull: boolean }>>(
      ApiMethod.POST,
      ApiEndpoints.Events.TowerClaimPendingReward(pendingId),
      {},
      { withCredentials: true }
    );
  }

  getBattleHistory(battleId: string): Observable<BaseResponse<StartTowerBattleResult>> {
    return this.api.CallApi<BaseResponse<WireTowerResult>>(
      ApiMethod.GET, ApiEndpoints.Events.TowerBattleHistory(battleId), { withCredentials: true }
    ).pipe(map(response => ({ ...response, data: response.data ? mapResult(response.data) : response.data })));
  }
}
