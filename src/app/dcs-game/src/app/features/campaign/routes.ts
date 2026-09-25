import { Routes } from '@angular/router';
export const CAMPAIGN_ROUTES:Routes = [
  { path:'', loadComponent:()=>import('./pages/campaign-map-list/campaign-map-list.component').then(m=>m.CampaignMapListComponent) },
  { path:'maps/:id', loadComponent:()=>import('./pages/campaign-stage-map/campaign-stage-map.component').then(m=>m.CampaignStageMapComponent) }
];
