import { Component, inject, AfterViewInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { AuthService } from './auth.service';
import { Auth, getAuth, signInAnonymously } from '@angular/fire/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements AfterViewInit {
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private auth: Auth = inject(Auth);
  private router = inject(Router);

  loginForm: FormGroup;
  errorMessage: string = '';

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      remember: [false],
    });
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
          if (response.user) {
            console.log('Login erfolgreich', response.user);
            this.errorMessage = '';
            this.router.navigate(['/summary']); // Beispielhafte Weiterleitung nach dem Login
          } else if (response.error) {
            console.error('Login fehlgeschlagen', response.error);
            this.errorMessage = response.error.message;
          }
        },
        error: (err) => {
          console.error('Unerwarteter Fehler beim Login', err);
          this.errorMessage =
            'Ein unerwarteter Fehler ist aufgetreten. Bitte versuche es später erneut.';
        },
      });
    } else {
      this.errorMessage = 'Bitte fülle alle Felder korrekt aus.';
    }
  }

  guestLogin(): void {
    signInAnonymously(this.auth)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log('Gast-Login erfolgreich', user);
        this.errorMessage = '';
        this.router.navigate(['/summary']); // Beispielhafte Weiterleitung nach dem Gast-Login
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error('Gast-Login fehlgeschlagen', errorCode, errorMessage);
        this.errorMessage = errorMessage;
      });
  }
}
