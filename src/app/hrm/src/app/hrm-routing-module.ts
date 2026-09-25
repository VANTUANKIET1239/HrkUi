import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from '../../../../libs/core/auth/guards';

const routes: Routes = [
  {
    path: 'home',
    canActivate: [authGuard],
    data: { appCode: 'hrm', audience: 'hrm-api' },
    loadChildren: () => import('./pages/home/home.module').then(m => m.HomeModule)
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HrmRoutingModule { }
