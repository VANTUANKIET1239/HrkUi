import { Routes } from '@angular/router';

export const BATTLE_ROUTES: Routes = [
  {
    path: 'demo',
    loadComponent: () => import('./pages/demo-battle-page/demo-battle-page.component').then(m => m.DemoBattlePageComponent)
  },
  {
    path: '',
    loadComponent: () => import('./pages/battle-page/battle-page.component').then(m => m.BattlePageComponent)
  }
];
