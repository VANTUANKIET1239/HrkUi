import { Routes } from '@angular/router';

export const BATTLE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/game-home/game-home.component').then(m => m.GameHomeComponent)
  }
];
