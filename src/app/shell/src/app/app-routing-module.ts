import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./pages/auth/auth-module').then(m => m.AuthModule)
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
