import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HrkApiService } from '../../../../../../libs/core/http/hrk-api/hrk-api.service';
import { ApiMethod } from '../../../../../../libs/shared/common/constants/ApiMethod.constants';
import { ApiEndpoints } from '../../../../../../libs/shared/common/constants/api-endpoints';
import { BaseResponse, PlayerProfileDto, PlayerWalletDto } from '../models/player.model';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  private readonly playerApi = ApiEndpoints.Player;

  constructor(private hrkApiService: HrkApiService) {}

  /**
   * Get current player's profile (name, level, etc.)
   */
  getProfile(): Observable<BaseResponse<PlayerProfileDto>> {
    return this.hrkApiService.CallApi<BaseResponse<PlayerProfileDto>>(
      ApiMethod.GET,
      this.playerApi.Profile,
      { withCredentials: true }
    );
  }

  /**
   * Get current player's wallet balances (gold, diamonds, materials)
   */
  getWallet(): Observable<BaseResponse<PlayerWalletDto>> {
    return this.hrkApiService.CallApi<BaseResponse<PlayerWalletDto>>(
      ApiMethod.GET,
      this.playerApi.Wallet,
      { withCredentials: true }
    );
  }
}
