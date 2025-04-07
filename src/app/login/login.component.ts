import { Component, inject, AfterViewInit, OnInit } from '@angular/core';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { AuthService } from './auth.service';
import { Auth, signInAnonymously } from '@angular/fire/auth';
import { LoginStatusService } from './../login/login-status.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit, AfterViewInit {
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private auth: Auth = inject(Auth);
  private router = inject(Router);
  private route = inject(ActivatedRoute); // Injizieren Sie ActivatedRoute
  private loginStatusService = inject(LoginStatusService);

  loginForm: FormGroup;
  errorMessage: string = '';
  returnUrl: string | null = null; // Variable für die Rücksprung-URL

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      remember: [false],
    });
  }

  ngOnInit(): void {
    // Überprüfen, ob der returnUrl Parameter vorhanden ist
    if (this.route.snapshot.queryParams['returnUrl']) {
      console.log('returnUrl Parameter in der URL gefunden. Weiterleitung zur normalen Login-Seite.');
      this.router.navigate(['/login']); // Leitet zur /login-Seite ohne Query-Parameter weiter
      return; // Beendet die weitere Initialisierung
    }

    // Wenn kein returnUrl vorhanden ist, lies ihn aus (für den normalen Weiterleitungsfluss nach dem Login)
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/summary'; // Standardmäßig auf '/summary' setzen, falls kein returnUrl vorhanden ist
    console.log('Return URL beim Login (falls vorhanden):', this.returnUrl);
  }

  ngAfterViewInit() {
    const loginSite = document.querySelector('.login-site');
    loginSite?.classList.add('animation-phase');

    setTimeout(() => {
      loginSite?.classList.remove('animation-phase');
    }, 3000);
  }

  loginWithEmailAndPassword(): void {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      this.authService.login(email, password).subscribe({
        next: (response) => {
          console.log('Server response:', response);
          if (response.user) {
            console.log('Login successful', response.user);
            this.errorMessage = '';
            this.loginStatusService.setLoginStatus(true);
            this.router.navigateByUrl(this.returnUrl!); // Verwenden Sie navigateByUrl mit der gespeicherten returnUrl
          } else if (response.error) {
            this.errorMessage =
              'Invalid login credentials. Please check your email and password.';
          }
        },
      });
    }
  }

  guestLogin(): void {
    signInAnonymously(this.auth)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log('Gast-Login erfolgreich', user);
        this.errorMessage = '';
        this.loginStatusService.setLoginStatus(true);
        this.router.navigateByUrl(this.returnUrl!); // Verwenden Sie navigateByUrl mit der gespeicherten returnUrl
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error('Gast-Login fehlgeschlagen', errorCode, errorMessage);
        this.errorMessage = errorMessage;
      });
  }
}