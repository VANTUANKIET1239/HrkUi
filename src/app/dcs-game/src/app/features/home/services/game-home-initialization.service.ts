import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, delay, finalize, map } from 'rxjs/operators';
import { PlayerService } from '../../../core/services/player.service';
import { PlayerProfileDto, PlayerWalletDto } from '../../../core/models/player.model';
import { LoadingService } from '../../../../../../../libs/core/loading/loading.service';

export interface GameHomeInitialData {
  profile: PlayerProfileDto | null;
  wallet: PlayerWalletDto | null;
  formationPower?: number;
  selectedFormationId?: number | null;
  selectedFormationCode?: string | null;
  selectedFormationName?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class GameHomeInitializationService {
  constructor(
    private playerService: PlayerService,
    private loadingService: LoadingService
  ) {}

  /**
   * Runs mandatory APIs (getProfile, getWallet) in parallel with 'global' loading mode.
   * Handles errors on each stream independently with catchError so neither failure
   * will hang the loading overlay or cause the forkJoin to reject.
   */
  loadHomeData(): Observable<GameHomeInitialData> {
    this.loadingService.show(true);
    return this.playerService.getGameInfo('global').pipe(
      map(res => ({
        profile: res?.success ? res.data?.profile ?? null : null,
        wallet: res?.success ? res.data?.wallet ?? null : null,
        formationPower: res?.success ? (res.data?.formationPower ?? res.data?.profile?.power ?? 0) : 0,
        selectedFormationId: res?.success ? res.data?.selectedFormationId : null,
        selectedFormationCode: res?.success ? res.data?.selectedFormationCode : null,
        selectedFormationName: res?.success ? res.data?.selectedFormationName : null
      })),
      catchError(() => of({ profile: null, wallet: null, formationPower: 0 })),
      delay(2000),
      finalize(() => {
        this.loadingService.hide();
      })
    );
  }
}
