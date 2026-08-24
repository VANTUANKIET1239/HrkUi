import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/game-auth/game-auth.component').then(m => m.GameAuthComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/game-auth/game-auth.component').then(m => m.GameAuthComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/game-auth/game-auth.component').then(m => m.GameAuthComponent)
  }
];
