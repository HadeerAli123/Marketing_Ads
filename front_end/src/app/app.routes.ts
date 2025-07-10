import { Routes } from '@angular/router';
import { CampaignList } from './components/user/campaign-list/campaign-list';
import { CampaignDetail } from './components/user/campaign-detail/campaign-detail';

export const routes: Routes = [
  { path: '', redirectTo: '/campaigns/electronic_stor', pathMatch: 'full' },
  { path: 'campaigns/:type', component: CampaignList },
  { path: 'campaigns/:type/:adId', component: CampaignList },
  { path: 'product/:id', component: CampaignDetail }
];