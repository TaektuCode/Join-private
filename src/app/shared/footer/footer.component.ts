import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../login/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent implements OnInit, OnDestroy {
  isLoggedIn = false; // Standardmäßig nicht eingeloggt
  private isLoggedInSubscription: Subscription | undefined; // Subscription Variable

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.isLoggedInSubscription = this.authService.isLoggedIn().subscribe(loggedIn => {
      this.isLoggedIn = loggedIn; // Observable wert zuweisen
    });
  }

  ngOnDestroy() {
    if (this.isLoggedInSubscription) {
      this.isLoggedInSubscription.unsubscribe(); // Subscription abmelden
    }
  }
}