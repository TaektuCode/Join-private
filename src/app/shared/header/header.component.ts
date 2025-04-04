import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MenuoverlayComponent } from '../../menuoverlay/menuoverlay.component';
import { AuthService } from '../../login/auth.service'; // Importiere AuthService
import { Subscription } from 'rxjs'; // Importiere Subscription

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, MenuoverlayComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'] 
})
export class HeaderComponent implements OnInit, OnDestroy {
  overlayVisible = false;
  isLoggedIn = false; 
  private isLoggedInSubscription: Subscription | undefined;

  constructor(private authService: AuthService) {} // Injiziere AuthService

  ngOnInit() {
    this.isLoggedInSubscription = this.authService.isLoggedIn().subscribe(loggedIn => {
      this.isLoggedIn = loggedIn; // Aktualisiere isLoggedIn
    });
  }

  ngOnDestroy() {
    if (this.isLoggedInSubscription) {
      this.isLoggedInSubscription.unsubscribe(); // Melde Abonnement ab
    }
  }

  toggleOverlay(event: MouseEvent): void {
    event.stopPropagation();
    this.overlayVisible = !this.overlayVisible;
  }
}