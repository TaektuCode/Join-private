import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../login/auth.service';
import { Subscription } from 'rxjs';

/**
 * Component for the application footer, displaying login/logout links based on the user's authentication status.
 */
@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent implements OnInit, OnDestroy {
  /**
   * Indicates whether the user is currently logged in. Defaults to false.
   */
  isLoggedIn = false;
  /**
   * Subscription to the isLoggedIn observable from the AuthService.
   */
  private isLoggedInSubscription: Subscription | undefined;

  /**
   * Constructs the FooterComponent.
   * @param authService The AuthService for checking user authentication status.
   */
  constructor(private authService: AuthService) {}

  /**
   * Lifecycle hook called once the component is initialized.
   * Subscribes to the isLoggedIn observable to update the component's isLoggedIn property.
   */
  ngOnInit() {
    this.isLoggedInSubscription = this.authService.isLoggedIn().subscribe(loggedIn => {
      this.isLoggedIn = loggedIn; // Assign the observable value
    });
  }

  /**
   * Lifecycle hook called just before the component is destroyed.
   * Unsubscribes from the isLoggedIn subscription to prevent memory leaks.
   */
  ngOnDestroy() {
    if (this.isLoggedInSubscription) {
      this.isLoggedInSubscription.unsubscribe(); // Unsubscribe from the subscription
    }
  }
}