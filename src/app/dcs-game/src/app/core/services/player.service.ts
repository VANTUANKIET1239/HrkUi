import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HrkApiService } from '../../../../../../libs/core/http/hrk-api/hrk-api.service';
import { ApiMethod } from '../../../../../../libs/shared/common/constants/ApiMethod.constants';
import { ApiEndpoints } from '../../../../../../libs/shared/common/constants/api-endpoints';
import { BaseResponse, PlayerGameInfoDto, PlayerProfileDto, PlayerWalletDto } from '../models/player.model';
import { LoadingMode, withLoading } from '../../../../../../libs/core/loading/loading.tokens';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  private readonly playerApi = ApiEndpoints.Player;

  constructor(private hrkApiService: HrkApiService) {}

  /**
   * Get current player's profile (name, level, etc.)
   */
  getProfile(loadingMode: LoadingMode = 'none'): Observable<BaseResponse<PlayerProfileDto>> {
    return this.hrkApiService.CallApi<BaseResponse<PlayerProfileDto>>(
      ApiMethod.GET,
      this.playerApi.Profile,
      {
        withCredentials: true,
        loading: loadingMode,
        context: withLoading(loadingMode)
      }
    );
  }

  getGameInfo(loadingMode: LoadingMode = 'none'): Observable<BaseResponse<PlayerGameInfoDto>> {
    return this.hrkApiService.CallApi<BaseResponse<PlayerGameInfoDto>>(ApiMethod.GET, this.playerApi.Me, { withCredentials: true, loading: loadingMode, context: withLoading(loadingMode) });
  }

  /**
   * Get current player's wallet balances (gold, diamonds, materials)
   */
  getWallet(loadingMode: LoadingMode = 'none'): Observable<BaseResponse<PlayerWalletDto>> {
    return this.hrkApiService.CallApi<BaseResponse<PlayerWalletDto>>(
      ApiMethod.GET,
      this.playerApi.Wallet,
      {
        withCredentials: true,
        loading: loadingMode,
        context: withLoading(loadingMode)
      }
    );
  }
}
