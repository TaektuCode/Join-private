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
    this.signupForm.markAllAsTouched(); // Alle Steuerelemente als "touched" markieren

    // Validierungsfehler manuell aktualisieren
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
            this.router.navigate(['/summary']);
          }
        },
      });
    }
  }
}
