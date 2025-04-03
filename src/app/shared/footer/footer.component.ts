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

// import { Component, OnInit } from '@angular/core';
// import { RouterModule, Router, NavigationEnd } from '@angular/router';
// import { AuthService } from '../auth.service'; // Pfad zu AuthService eingeben

// @Component({
//   selector: 'app-footer',
//   standalone: true,
//   imports: [RouterModule],
//   templateUrl: './footer.component.html',
//   styleUrl: './footer.component.scss'
// })
// export class FooterComponent implements OnInit {
//   isUserLoggedIn: boolean = false;
//   isLoginPage: boolean = false;

//   constructor(private authService: AuthService, private router: Router) { }

//   ngOnInit() {
//     this.isUserLoggedIn = this.authService.isLoggedIn();

//     this.router.events.subscribe(event => {
//       if (event instanceof NavigationEnd) {
//         this.isLoginPage = event.url === '/logIn';
//       }
//     });

//     this.authService.loginStatusChanged.subscribe((loggedIn: boolean) => {
//       this.isUserLoggedIn = loggedIn;
//     });
//   }
// }
