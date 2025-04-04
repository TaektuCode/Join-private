import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MenuoverlayComponent } from '../../menuoverlay/menuoverlay.component';
import { AuthService } from '../../login/auth.service'; // Importiere AuthService
import { Subscription } from 'rxjs'; // Importiere Subscription
import { User } from '@angular/fire/auth'; // User-Interface nutzen
// Test mit Vor und Nachnamen machen

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, MenuoverlayComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  overlayVisible = false;
  isLoggedIn = false;
  userInitials = '';
  private isLoggedInSubscription: Subscription | undefined;

  constructor(private authService: AuthService) {} // Injiziere AuthService

  ngOnInit() {
    this.isLoggedInSubscription = this.authService
      .isLoggedIn()
      .subscribe((loggedIn) => {
        this.isLoggedIn = loggedIn; // Aktualisiere isLoggedIn
      });
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        // Prüfen, ob user da ist und displayName gesetzt ist
        if (user && user.displayName) {
          this.userInitials = this.getUserInitials(user.displayName);
        }
      },
      error: (err) => {
        console.error('Fehler beim Abrufen des Users:', err);
      },
    });
  }

  ngOnDestroy() {
    if (this.isLoggedInSubscription) {
      this.isLoggedInSubscription.unsubscribe(); // Melde Abonnement ab
    }
  }

  getUserInitials(fullName: string): string {
    const [first, second] = fullName.trim().split(' ');
    let initials = first.charAt(0);
    if (second) {
      initials += second.charAt(0);
    }
    return initials.toUpperCase();
  }

  toggleOverlay(event: MouseEvent): void {
    event.stopPropagation();
    this.overlayVisible = !this.overlayVisible;
  }
}
