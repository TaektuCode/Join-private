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
  private location = inject(Location);
  private fb = inject(FormBuilder);
  private authService = inject(AuthService); // Injiziere den AuthService
  private router = inject(Router);

  constructor() {
    this.signupForm = this.fb.group(
      {
        name: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', Validators.required],
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

  onSubmit(): void {
    if (this.signupForm.valid) {
      const { name, email, password } = this.signupForm.value; // Hole den 'name'-Wert aus dem Formular
      this.authService.signup({ name, email, password }).subscribe({
        // Übergib das gesamte Objekt an die signup-Methode
        next: (response) => {
          if (response.user) {
            console.log('Registrierung erfolgreich', response.user);
            this.errorMessage = '';
            this.router.navigate(['/summary']); // Stelle sicher, dass du den Router injected hast
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
    } else {
      this.errorMessage = 'Bitte fülle alle Felder korrekt aus.';
    }
  }
}
