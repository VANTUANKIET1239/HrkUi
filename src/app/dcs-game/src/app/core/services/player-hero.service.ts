import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HrkApiService } from '../../../../../../libs/core/http/hrk-api/hrk-api.service';
import { ApiMethod } from '../../../../../../libs/shared/common/constants/ApiMethod.constants';
import { ApiEndpoints } from '../../../../../../libs/shared/common/constants/api-endpoints';
import { BaseResponse } from '../models/player.model';
import { HeroUpgradePreviewDto, PlayerHeroDetailDto, PlayerHeroDto } from '../models/player-hero.model';

@Injectable({ providedIn: 'root' })
export class PlayerHeroService {
  constructor(private readonly api: HrkApiService) {}

  list(): Observable<BaseResponse<PlayerHeroDto[]>> {
    return this.api.CallApi<BaseResponse<PlayerHeroDto[]>>(ApiMethod.GET, ApiEndpoints.PlayerHeroes.List, { withCredentials: true });
  }

  detail(heroId: number): Observable<BaseResponse<PlayerHeroDetailDto>> {
    return this.api.CallApi<BaseResponse<PlayerHeroDetailDto>>(ApiMethod.GET, ApiEndpoints.PlayerHeroes.Detail, {
      withCredentials: true,
      params: new HttpParams().set('heroId', String(heroId))
    });
  }

  updateFlags(heroId: number, flags: { isLocked?: boolean; isFavorite?: boolean }): Observable<BaseResponse<{ heroId: number; isLocked: boolean; isFavorite: boolean }>> {
    return this.api.CallApi(ApiMethod.PATCH, ApiEndpoints.PlayerHeroes.Flags(heroId), flags, { withCredentials: true });
  }

  equip(heroId: number, inventoryItemId: number): Observable<BaseResponse<PlayerHeroDetailDto>> {
    return this.api.CallApi<BaseResponse<PlayerHeroDetailDto>>(
      ApiMethod.POST,
      ApiEndpoints.PlayerHeroes.Equip(heroId),
      { inventoryItemId },
      { withCredentials: true }
    );
  }

  unequip(heroId: number, slotCode: string): Observable<BaseResponse<PlayerHeroDetailDto>> {
    return this.api.CallApi<BaseResponse<PlayerHeroDetailDto>>(
      ApiMethod.DELETE,
      ApiEndpoints.PlayerHeroes.Unequip(heroId, slotCode),
      { withCredentials: true }
    );
  }

  getUpgradePreview(heroId: number): Observable<BaseResponse<HeroUpgradePreviewDto>> {
    return this.api.CallApi<BaseResponse<HeroUpgradePreviewDto>>(ApiMethod.GET, ApiEndpoints.PlayerHeroes.UpgradePreview(heroId), { withCredentials: true });
  }

  upgrade(heroId: number, levels = 1): Observable<BaseResponse<PlayerHeroDetailDto>> {
    return this.api.CallApi<BaseResponse<PlayerHeroDetailDto>>(ApiMethod.POST, ApiEndpoints.PlayerHeroes.Upgrade(heroId), { levels }, { withCredentials: true });
  }
}
