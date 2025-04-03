import { Component, OnInit, inject } from '@angular/core';
import { Location } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  getAuth,
  createUserWithEmailAndPassword,
  Auth,
} from '@angular/fire/auth';

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
  private auth: Auth = inject(Auth);

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
      const { email, password } = this.signupForm.value;
      createUserWithEmailAndPassword(this.auth, email, password)
        .then((userCredential) => {
          const user = userCredential.user;
          console.log('Registrierung erfolgreich', user);
          this.errorMessage = '';
          // Optional: Weiterleitung des Benutzers
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          console.error(
            'Registrierung fehlgeschlagen',
            errorCode,
            errorMessage
          );
          this.errorMessage = errorMessage;
        });
    } else {
      this.errorMessage = 'Bitte fülle alle Felder korrekt aus.';
    }
  }
}
