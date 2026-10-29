import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { PlayerService } from '../services/player.service';

// Used alongside authGuard. Never enter gameplay with a half-created account.
export const playerReadyGuard: CanActivateFn = (_route, state) => {
  const router = inject(Router);
  const waiting = router.createUrlTree(['/dcs-game/setup'], { queryParams: { returnUrl: state.url } });
  return inject(PlayerService).getInitialization().pipe(
    map(response => response.data?.status === 'Ready' ? true : waiting),
    catchError(() => of(waiting))
  );
};
