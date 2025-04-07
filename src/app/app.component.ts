import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { HeaderComponent } from './shared/header/header.component';
import { FooterComponent } from './shared/footer/footer.component';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './login/signup/signup.component';
import { FormsModule } from '@angular/forms';
import { filter } from 'rxjs/operators';

/**
 * The root component of the application. Manages the display of the header, footer, and overall page margins
 * based on the current route.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    FormsModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  /**
   * The title of the application.
   */
  title = 'join';
  /**
   * Controls the visibility of the footer component.
   */
  showFooter = true;
  /**
   * Controls the visibility of the header component.
   */
  showHeader = true;
  /**
   * Controls whether the main content area has margins.
   */
  showMargins = true;

  /**
   * Constructs the AppComponent.
   * @param router The Router service for accessing routing events.
   */
  constructor(private router: Router) {}

  /**
   * Lifecycle hook called once the component is initialized.
   * Subscribes to the router's navigation events to determine whether to show the header, footer, and margins
   * based on the current route. Specifically, the header, footer, and margins are hidden on the '/login' and '/signup' routes.
   */
  ngOnInit() {
    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd => event instanceof NavigationEnd
        )
      )
      .subscribe((event: NavigationEnd) => {
        this.showFooter = event.url !== '/login' && event.url !== '/signup';
        this.showHeader = event.url !== '/login' && event.url !== '/signup';
        this.showMargins = event.url !== '/login' && event.url !== '/signup';
        const appRoot = document.querySelector('app-root')?.classList;
        if (!this.showMargins && appRoot) {
          appRoot.add('no-margins');
        } else if (appRoot) {
          appRoot.remove('no-margins');
        }
      });
  }
}