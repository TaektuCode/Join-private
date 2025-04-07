import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MenuoverlayComponent } from '../../menuoverlay/menuoverlay.component';
import { AuthService } from '../../login/auth.service'; // Import AuthService
import { Subscription } from 'rxjs'; // Import Subscription
import { User } from '@angular/fire/auth'; // Use User interface

/**
 * Component for the application header, displaying navigation links, user initials, and a menu overlay.
 */
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, MenuoverlayComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  /**
   * Controls the visibility of the menu overlay.
   */
  overlayVisible = false;
  /**
   * Indicates whether the user is logged in.
   */
  isLoggedIn = false;
  /**
   * The initials of the logged-in user to display in the header. Defaults to 'G' (Guest).
   */
  userInitials = 'G';
  /**
   * Subscription to the isLoggedIn observable from the AuthService.
   */
  private isLoggedInSubscription: Subscription | undefined;

  /**
   * Constructs the HeaderComponent.
   * @param authService The AuthService for checking user authentication status and retrieving user data.
   */
  constructor(private authService: AuthService) {} // Inject AuthService

  /**
   * Lifecycle hook called once the component is initialized.
   * Subscribes to the isLoggedIn observable and fetches the current user's data to display initials.
   */
  ngOnInit() {
    this.isLoggedInSubscription = this.authService
      .isLoggedIn()
      .subscribe((loggedIn) => {
        this.isLoggedIn = loggedIn; // Update isLoggedIn
      });
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        // Check if user exists and displayName is set
        if (user && user.displayName) {
          this.userInitials = this.getUserInitials(user.displayName);
        }
      },
      error: (err) => {
        console.error('Error fetching user:', err);
      },
    });
  }

  /**
   * Lifecycle hook called just before the component is destroyed.
   * Unsubscribes from the isLoggedIn subscription to prevent memory leaks.
   */
  ngOnDestroy() {
    if (this.isLoggedInSubscription) {
      this.isLoggedInSubscription.unsubscribe(); // Unsubscribe from subscription
    }
  }

  /**
   * Extracts the initials from a full name (first and last name).
   * @param fullName The full name string.
   * @returns A string containing the uppercase initials of the first and last names.
   */
  getUserInitials(fullName: string): string {
    const [first, second] = fullName.trim().split(' ');
    let initials = first.charAt(0);
    if (second) {
      initials += second.charAt(0);
    }
    return initials.toUpperCase();
  }

  /**
   * Toggles the visibility of the menu overlay.
   * Prevents the click event from propagating to other elements.
   * @param event The mouse click event.
   */
  toggleOverlay(event: MouseEvent): void {
    event.stopPropagation();
    this.overlayVisible = !this.overlayVisible;
  }
}