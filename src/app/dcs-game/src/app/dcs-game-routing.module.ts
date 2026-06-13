import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { App } from './app';

const routes: Routes = [
  {
    path: '',
    component: App,
    children: [
      {
        path: 'battle',
        loadChildren: () => import('./features/battle/routes').then(m => m.BATTLE_ROUTES)
      },
      {
        path: 'home',
        loadChildren: () => import('./features/home/routes').then(m => m.BATTLE_ROUTES)
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
