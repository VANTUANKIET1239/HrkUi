import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { App } from './app';
import { authGuard } from '../../../../libs/core/auth/guards';

const routes: Routes = [
  {
    path: '',
    component: App,
    children: [
      {
        path: 'battle',
        canActivate: [authGuard],
        data: { appCode: 'dcs-game', audience: 'game-api' },
        loadChildren: () => import('./features/battle/routes').then(m => m.BATTLE_ROUTES)
      },
      {
        path: 'campaign',
        canActivate: [authGuard],
        data: { appCode: 'dcs-game', audience: 'game-api' },
        loadChildren: () => import('./features/campaign/routes').then(m => m.CAMPAIGN_ROUTES)
      },
      {
        path: 'home',
        canActivate: [authGuard],
        data: { appCode: 'dcs-game', audience: 'game-api' },
        loadChildren: () => import('./features/home/routes').then(m => m.BATTLE_ROUTES)
      },
      {
        path: 'auth/login',
        redirectTo: '/login',
        pathMatch: 'full'
      },
      {
        path: 'auth/register',
        redirectTo: '/login',
        pathMatch: 'full'
      },
      {
        path: 'auth',
        redirectTo: '/login',
        pathMatch: 'full'
      },
      {
        path: 'login',
        redirectTo: '/login',
        pathMatch: 'full'
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
