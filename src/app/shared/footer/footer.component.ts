import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {

}

// import { Component, signal, effect } from '@angular/core';
// import { RouterModule, Router, NavigationEnd } from '@angular/router';
// import { AuthService } from '../auth.service'; // Pfad zu AuthService eingeben

// @Component({
//   selector: 'app-footer',
//   standalone: true,
//   imports: [RouterModule],
//   templateUrl: './footer.component.html',
//   styleUrl: './footer.component.scss'
// })
// export class FooterComponent {
//   isUserLoggedIn = signal(false);
//   isLoginPage = signal(false);

//   constructor(private authService: AuthService, private router: Router) {
//     this.isUserLoggedIn.set(this.authService.isLoggedIn());

//     this.router.events.subscribe(event => {
//       if (event instanceof NavigationEnd) {
//         this.isLoginPage.set(event.url === '/logIn');
//       }
//     });

//     this.authService.loginStatusChanged.subscribe((loggedIn: boolean) => {
//       this.isUserLoggedIn.set(loggedIn);
//     });

//     // Automatische Reaktion auf Änderungen
//     effect(() => {
//       console.log('Login-Status geändert:', this.isUserLoggedIn());
//     });
//   }
// }
