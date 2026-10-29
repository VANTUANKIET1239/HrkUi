import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { App } from './app';
import { authGuard } from '../../../../libs/core/auth/guards';
import { playerReadyGuard } from './core/guards/player-ready.guard';

const routes: Routes = [
  {
    path: '',
    component: App,
    children: [
      {
        path: 'setup',
        canActivate: [authGuard],
        data: { appCode: 'dcs-game', audience: 'game-api' },
        loadComponent: () => import('./features/auth/components/player-setup/player-setup.component').then(m => m.PlayerSetupComponent)
      },
      {
        path: 'check-in',
        canActivate: [authGuard, playerReadyGuard],
        data: { appCode: 'dcs-game', audience: 'game-api' },
        loadComponent: () => import('./features/check-in/check-in-page.component').then(m => m.CheckInPageComponent)
      },
      {
        path: 'summon',
        canActivate: [authGuard, playerReadyGuard],
        data: { appCode: 'dcs-game', audience: 'game-api' },
        loadComponent: () => import('./features/summon/pages/summon-page.component').then(m => m.SummonPageComponent)
      },
      {
        path: 'battle',
        canActivate: [authGuard, playerReadyGuard],
        data: { appCode: 'dcs-game', audience: 'game-api' },
        loadChildren: () => import('./features/battle/routes').then(m => m.BATTLE_ROUTES)
      },
      {
        path: 'campaign',
        canActivate: [authGuard, playerReadyGuard],
        data: { appCode: 'dcs-game', audience: 'game-api' },
        loadChildren: () => import('./features/campaign/routes').then(m => m.CAMPAIGN_ROUTES)
      },
      {
        path: 'home',
        canActivate: [authGuard, playerReadyGuard],
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
