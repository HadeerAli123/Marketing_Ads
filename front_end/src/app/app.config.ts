import { ApplicationConfig } from '@angular/core';
import { provideRouter, Routes } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { CampaignList } from './components/user/campaign-list/campaign-list';
import { CampaignDetail } from './components/user/campaign-detail/campaign-detail';

const routes: Routes = [
  { path: 'campaigns/:adId', component: CampaignList },
  { path: 'product/:id', component: CampaignDetail },
  { path: '', redirectTo: '/campaigns/1', pathMatch: 'full' },
  { path: '**', redirectTo: '/campaigns/1' }
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient()
  ]
};