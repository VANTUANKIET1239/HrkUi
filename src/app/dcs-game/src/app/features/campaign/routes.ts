import { Routes } from '@angular/router';

export const CAMPAIGN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/campaign-event-list/campaign-event-list.component').then(m => m.CampaignEventListComponent)
  },
  {
    path: 'events',
    loadComponent: () => import('./pages/campaign-event-list/campaign-event-list.component').then(m => m.CampaignEventListComponent)
  },
  {
    path: 'events/tower',
    loadComponent: () => import('./pages/tower-climb/tower-climb.component').then(m => m.TowerClimbComponent)
  },
  {
    path: 'dungeons',
    loadComponent: () => import('./pages/campaign-map-list/campaign-map-list.component').then(m => m.CampaignMapListComponent)
  },
  {
    path: 'maps/:id',
    loadComponent: () => import('./pages/campaign-stage-map/campaign-stage-map.component').then(m => m.CampaignStageMapComponent)
  }
];
