import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HrkApiService } from '../../../../../../libs/core/http/hrk-api/hrk-api.service';
import { ApiMethod } from '../../../../../../libs/shared/common/constants/ApiMethod.constants';
import { ApiEndpoints } from '../../../../../../libs/shared/common/constants/api-endpoints';
import { BaseResponse } from '../models/player.model';
import { CatalogHero, CatalogItem } from '../models/catalog.model';

@Injectable({ providedIn: 'root' })
export class CatalogService {
  constructor(private readonly api: HrkApiService) {}

  getHeroes(): Observable<BaseResponse<CatalogHero[]>> {
    return this.api.CallApi<BaseResponse<CatalogHero[]>>(ApiMethod.GET, ApiEndpoints.Catalog.Heroes, {
      withCredentials: true
    });
  }

  getItems(categoryId?: number, rarityId?: number): Observable<BaseResponse<CatalogItem[]>> {
    let params = new HttpParams();
    if (categoryId) params = params.set('categoryId', categoryId);
    if (rarityId) params = params.set('rarityId', rarityId);
    return this.api.CallApi<BaseResponse<CatalogItem[]>>(ApiMethod.GET, ApiEndpoints.Catalog.Items, {
      withCredentials: true,
      params
    });
  }
}
