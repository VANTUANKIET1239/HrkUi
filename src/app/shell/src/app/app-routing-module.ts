import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { noAuthGuard } from '../../../../libs/core/auth/guards';

const routes: Routes = [
  {
    path: 'login',
    canActivate: [noAuthGuard],
    loadComponent: () => import('../../../dcs-game/src/app/features/auth/pages/game-auth/game-auth.component')
      .then(m => m.GameAuthComponent)
  },
  {
    path: 'auth/login',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'hrm',
    loadChildren: () => import('../../../hrm/src/app/hrm.module').then(m => m.HrmModule)
  },
  {
    path: 'dcs-game',
    loadChildren: () => import('../../../dcs-game/src/app/dcs-game.module').then(m => m.DcsGameModule)
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
