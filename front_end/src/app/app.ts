import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, RouterLink, HttpClientModule],
  template: `
    <div [ngClass]="currentTheme">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: `
    :host { display: block; }
    nav { padding: 10px; transition: all 0.3s ease; }
    nav a { margin: 0 10px; text-decoration: none; transition: color 0.3s ease; }
    nav a:hover { color: #ff4500; }
  `
})
export class AppComponent {
  currentTheme: string = 'default-theme';

  constructor(private router: Router) {
    this.router.events.pipe(
      filter(event => event instanceof ActivationEnd)
    ).subscribe((event: any) => {
      const type = event.snapshot.params['type'];
      if (type) {
        this.currentTheme = this.getTheme(type) || 'default-theme';
      }
    });
  }

  getTheme(type: string): string {
    switch (type) {
      case 'hotel': return 'hotel-theme';
      case 'restaurant': return 'restaurant-theme';
      case 'car_rental': return 'car-theme';
      case 'electronic_stor': return 'electronic_stor';
      default: return 'default-theme';
    }
  }
}