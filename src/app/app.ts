import { Component, OnInit, signal, inject } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ToastModule } from 'primeng/toast';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    ToastModule,
    HeaderComponent,
    FooterComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  // ThemeService is injected here so it initializes early and applies
  // the persisted theme before anything renders.
  private readonly themeService = inject(ThemeService);
  private readonly router = inject(Router);

  /** Controls whether the app shell (header + footer) is visible.
   *  Hidden on the landing page so it can render its own layout. */
  showShell = signal(true);

  ngOnInit() {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Hide shell on the landing route
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: any) => {
        this.showShell.set(e.urlAfterRedirects !== '/');
      });

    // Check initial route
    this.showShell.set(this.router.url !== '/');
  }
}
