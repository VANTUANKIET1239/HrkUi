import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { App } from './app';
import { authGuard, noAuthGuard } from '../../../../libs/core/auth/guards';

const routes: Routes = [
  {
    path: '',
    component: App,
    children: [
      {
        path: 'battle',
        canActivate: [authGuard],
        data: { audience: 'game-api' },
        loadChildren: () => import('./features/battle/routes').then(m => m.BATTLE_ROUTES)
      },
      {
        path: 'home',
        canActivate: [authGuard],
        data: { audience: 'game-api' },
        loadChildren: () => import('./features/home/routes').then(m => m.BATTLE_ROUTES)
      },
      {
        path: 'auth',
        canActivate: [noAuthGuard],
        data: { audience: 'game-api' },
        loadChildren: () => import('./features/auth/routes').then(m => m.AUTH_ROUTES)
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      },
      {
        path: '**',
        redirectTo: 'home'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DcsGameRoutingModule { }
