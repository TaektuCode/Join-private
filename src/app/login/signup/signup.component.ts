import { Component, OnInit, inject } from '@angular/core';
import { Location } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [RouterModule, ReactiveFormsModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss',
})
export class SignupComponent implements OnInit {
  signupForm: FormGroup;
  errorMessage: string = '';
  showSuccessMessage: boolean = false;
  private location = inject(Location);
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Neue Properties für die Passwort-Sichtbarkeit
  passwordVisible: boolean = false;
  confirmPasswordVisible: boolean = false;

  constructor() {
    this.signupForm = this.fb.group(
      {
        name: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
        accept: [false, Validators.requiredTrue],
      },
      { validator: this.checkPasswords }
    );
  }

  ngOnInit(): void {}

  checkPasswords(group: FormGroup) {
    const passwordCtrl = group.controls['password'];
    const confirmPasswordCtrl = group.controls['confirmPassword'];

    if (passwordCtrl.value !== confirmPasswordCtrl.value) {
      confirmPasswordCtrl.setErrors({ notSame: true });
    } else {
      confirmPasswordCtrl.setErrors(null);
    }
  }

  backPage() {
    this.location.back();
  }

  // Neue Methoden zum Umschalten der Passwort-Sichtbarkeit
  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }

  toggleConfirmPasswordVisibility() {
    this.confirmPasswordVisible = !this.confirmPasswordVisible;
  }

  onSubmit(): void {
    this.signupForm.markAllAsTouched();

    Object.keys(this.signupForm.controls).forEach((key) => {
      this.signupForm.controls[key].updateValueAndValidity();
    });

    if (this.signupForm.valid) {
      const { name, email, password } = this.signupForm.value;
      this.authService.signup({ name, email, password }).subscribe({
        next: (response) => {
          if (response.user) {
            console.log('Registrierung erfolgreich', response.user);
            this.errorMessage = '';
            this.showSuccessMessage = true;
            setTimeout(() => {
              this.showSuccessMessage = false;
              this.router.navigate(['/summary']);
            }, 3000);
          } else if (response.error) {
            console.error('Registrierung fehlgeschlagen', response.error);
            this.errorMessage = response.error.message;
          }
        },
        error: (err) => {
          console.error('Unerwarteter Fehler bei der Registrierung', err);
          this.errorMessage =
            'Ein unerwarteter Fehler ist aufgetreten. Bitte versuche es später erneut.';
        },
      });
    }
  }
}