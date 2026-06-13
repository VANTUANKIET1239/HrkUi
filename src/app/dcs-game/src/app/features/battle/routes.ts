import { Routes } from '@angular/router';

export const BATTLE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/battle-page/battle-page.component').then(m => m.BattlePageComponent)
  }
];
