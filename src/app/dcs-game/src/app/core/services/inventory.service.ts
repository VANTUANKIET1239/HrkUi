import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HrkApiService } from '../../../../../../libs/core/http/hrk-api/hrk-api.service';
import { ApiMethod } from '../../../../../../libs/shared/common/constants/ApiMethod.constants';
import { ApiEndpoints } from '../../../../../../libs/shared/common/constants/api-endpoints';
import { BaseResponse } from '../models/player.model';
import { HeroEquipmentDto, InventoryItemDto, ItemCategoryDto, ItemRarityDto } from '../models/inventory.model';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private readonly inventoryApi = ApiEndpoints.Inventory;
  private readonly metadataApi = ApiEndpoints.Metadata;

  constructor(private hrkApiService: HrkApiService) {}

  /**
   * Get player inventory items (optionally filtered by categoryCode)
   */
  getInventory(categoryCode?: string): Observable<BaseResponse<InventoryItemDto[]>> {
    let params: HttpParams | undefined;
    if (categoryCode && categoryCode !== 'all') {
      params = new HttpParams().set('categoryCode', categoryCode);
    }

    return this.hrkApiService.CallApi<BaseResponse<InventoryItemDto[]>>(
      ApiMethod.GET,
      this.inventoryApi.List,
      {
        withCredentials: true,
        params
      }
    );
  }

  /**
   * Get player equipment inventory (only items where category IsEquipment = true)
   */
  getEquipment(categoryCode?: string, includeEquipped: boolean = false): Observable<BaseResponse<InventoryItemDto[]>> {
    let params = new HttpParams().set('includeEquipped', includeEquipped.toString());
    if (categoryCode && categoryCode !== 'all' && categoryCode !== 'All') {
      params = params.set('categoryCode', categoryCode);
    }

    return this.hrkApiService.CallApi<BaseResponse<InventoryItemDto[]>>(
      ApiMethod.GET,
      this.inventoryApi.Equipment,
      {
        withCredentials: true,
        params
      }
    );
  }

  /**
   * Get equipment equipped on a specific hero
   */
  getHeroEquipment(heroId: number): Observable<BaseResponse<HeroEquipmentDto>> {
    const params = new HttpParams().set('heroId', heroId.toString());

    return this.hrkApiService.CallApi<BaseResponse<HeroEquipmentDto>>(
      ApiMethod.GET,
      this.inventoryApi.HeroEquipment,
      {
        withCredentials: true,
        params
      }
    );
  }

  /**
   * Get item categories metadata
   */
  getItemCategories(): Observable<BaseResponse<ItemCategoryDto[]>> {
    return this.hrkApiService.CallApi<BaseResponse<ItemCategoryDto[]>>(
      ApiMethod.GET,
      this.metadataApi.ItemCategories,
      { withCredentials: true }
    );
  }

  /**
   * Get item rarities metadata
   */
  getRarities(): Observable<BaseResponse<ItemRarityDto[]>> {
    return this.hrkApiService.CallApi<BaseResponse<ItemRarityDto[]>>(
      ApiMethod.GET,
      this.metadataApi.Rarities,
      { withCredentials: true }
    );
  }

  /**
   * Sell inventory items
   */
  sellItems(items: { inventoryItemId: number; count: number }[]): Observable<BaseResponse<{ earnedGold: number; currentGold: number; soldItemsCount: number }>> {
    return this.hrkApiService.CallApi<BaseResponse<{ earnedGold: number; currentGold: number; soldItemsCount: number }>>(
      ApiMethod.POST,
      this.inventoryApi.Sell,
      { items },
      { withCredentials: true }
    );
  }

  /**
   * Toggle item lock/unlock state
   */
  toggleLock(inventoryItemId: number, isLocked: boolean): Observable<BaseResponse<boolean>> {
    return this.hrkApiService.CallApi<BaseResponse<boolean>>(
      ApiMethod.PUT,
      this.inventoryApi.Lock(inventoryItemId),
      { isLocked },
      { withCredentials: true }
    );
  }

  /**
   * Expand bag capacity using diamonds
   */
  expandCapacity(slotsToAdd: number): Observable<BaseResponse<any>> {
    return this.hrkApiService.CallApi<BaseResponse<any>>(
      ApiMethod.POST,
      this.inventoryApi.ExpandCapacity,
      { slotsToAdd },
      { withCredentials: true }
    );
  }
}
