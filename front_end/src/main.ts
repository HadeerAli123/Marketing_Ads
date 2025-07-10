// src/main.ts
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { AppComponent } from './app/app';
import { routes } from './app/app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { MatDialogModule } from '@angular/material/dialog';
import { CampaignService } from './app/services/campaign';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes, withComponentInputBinding()),
    provideAnimations(),
    provideHttpClient(withInterceptorsFromDi()),
    { provide: CampaignService, useClass: CampaignService },
    MatDialogModule
  ]
}).catch(err => console.error(err));