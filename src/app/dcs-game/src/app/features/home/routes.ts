import { Routes } from '@angular/router';
import { gameHomeResolver } from './resolvers/game-home.resolver';

export const BATTLE_ROUTES: Routes = [
  {
    path: '',
    resolve: {
      homeData: gameHomeResolver
    },
    loadComponent: () => import('./pages/game-home/game-home.component').then(m => m.GameHomeComponent)
  }
];
