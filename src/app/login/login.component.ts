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

/**
 * Component for user login.
 */
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
  private route = inject(ActivatedRoute);
  private loginStatusService = inject(LoginStatusService);

  /**
   * The form group for user login.
   */
  loginForm: FormGroup;
  /**
   * Message to display for login errors.
   */
  errorMessage: string = '';
  /**
   * The URL to navigate to after successful login.
   */
  returnUrl: string | null = null;

  /**
   * Initializes the LoginComponent and sets up the login form.
   */
  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      remember: [false],
    });
  }

  /**
   * Lifecycle hook called after data-bound properties have been initialized.
   * It checks for a 'returnUrl' query parameter and handles redirection if present.
   */
  ngOnInit(): void {
    // Check if the returnUrl parameter exists
    if (this.route.snapshot.queryParams['returnUrl']) {
      this.router.navigate(['/login']); // Redirect to /login without query parameters
      return; // Stop further initialization
    }

    // If no returnUrl is present, read it (for normal post-login redirection)
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/summary'; // Default to '/summary' if no returnUrl
  }

  /**
   * Lifecycle hook called after the component's view has been fully initialized.
   * It adds and then removes an animation class from the login site element.
   */
  ngAfterViewInit() {
    const loginSite = document.querySelector('.login-site');
    loginSite?.classList.add('animation-phase');

    setTimeout(() => {
      loginSite?.classList.remove('animation-phase');
    }, 3000);
  }

  /**
   * Logs in the user with the provided email and password.
   */
  loginWithEmailAndPassword(): void {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      this.authService.login(email, password).subscribe({
        next: (response) => {
          if (response.user) {
            this.errorMessage = '';
            this.loginStatusService.setLoginStatus(true);
            this.router.navigateByUrl(this.returnUrl!); // Navigate using the stored returnUrl
          } else if (response.error) {
            this.errorMessage =
              'Invalid login credentials. Please check your email and password.';
          }
        },
      });
    }
  }

  /**
   * Logs in the user anonymously as a guest.
   */
  guestLogin(): void {
    signInAnonymously(this.auth)
      .then((userCredential) => {
        const user = userCredential.user;
        this.errorMessage = '';
        this.loginStatusService.setLoginStatus(true);
        this.router.navigateByUrl(this.returnUrl!); // Navigate using the stored returnUrl
      })
      .catch((error) => {
        const errorMessage = error.message;
        this.errorMessage = errorMessage;
      });
  }
}