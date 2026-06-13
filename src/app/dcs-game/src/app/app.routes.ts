import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'battle',
    loadChildren: () => import('./features/battle/routes').then(m => m.BATTLE_ROUTES)
  },
  {
    path: '',
    redirectTo: 'battle',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'battle'
  }
];
