import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Location } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import {
    FormBuilder,
    FormGroup,
    Validators,
    ReactiveFormsModule,
} from '@angular/forms';
import { AuthService } from '../auth.service';

/**
 * @component
 * @selector app-signup
 * @standalone
 * @imports RouterModule, ReactiveFormsModule
 * @templateUrl ./signup.component.html
 * @styleUrl ./signup.component.scss
 *
 * Component for user registration.
 * Allows users to enter their name, email, password, and accept terms.
 * Implements form validation and interacts with the {@link AuthService} to create a new user.
 * Persists form data in session storage to retain information if the user navigates away and returns.
 */
@Component({
    selector: 'app-signup',
    standalone: true,
    imports: [RouterModule, ReactiveFormsModule],
    templateUrl: './signup.component.html',
    styleUrl: './signup.component.scss',
})
export class SignupComponent implements OnInit, OnDestroy {
    /**
     * The form group for the signup form.
     * Contains controls for name, email, password, confirm password, and acceptance of terms.
     */
    signupForm: FormGroup;

    /**
     * Message to display when an error occurs during the signup process.
     */
    errorMessage: string = '';

    /**
     * Flag to indicate whether the signup was successful and a success message should be displayed.
     */
    showSuccessMessage: boolean = false;

    /**
     * Injected service for interacting with the browser's location.
     */
    private location = inject(Location);

    /**
     * Injected service for building reactive forms.
     */
    private fb = inject(FormBuilder);

    /**
     * Injected service for handling authentication-related operations, including signup.
     */
    private authService = inject(AuthService);

    /**
     * Injected service for navigating between different routes.
     */
    private router = inject(Router);

    /**
     * Controls the visibility of the password input.
     */
    passwordVisible: boolean = false;

    /**
     * Controls the visibility of the confirm password input.
     */
    confirmPasswordVisible: boolean = false;

    /**
     * Constructor for the {@link SignupComponent}.
     * Initializes the {@link signupForm} with necessary form controls and validators.
     * Uses a custom validator {@link checkPasswords} to ensure that the password and confirm password fields match.
     */
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

    /**
     * Lifecycle hook called after data-bound properties of a directive are initialized.
     * Calls {@link loadFormData} to populate the form with any data stored in session storage.
     */
    ngOnInit(): void {
        this.loadFormData();
    }

    /**
     * Lifecycle hook called just before the directive is destroyed.
     * Calls {@link saveFormData} to persist the current form data in session storage.
     */
    ngOnDestroy(): void {
        this.saveFormData();
    }

    /**
     * Loads form data from session storage and patches the form values.
     * This helps to retain user input if they navigate away from the signup page and return.
     * **Caution:** Sensitive data like passwords are also stored temporarily.
     */
    loadFormData(): void {
        const storedName = sessionStorage.getItem('signupName');
        const storedEmail = sessionStorage.getItem('signupEmail');
        const storedPassword = sessionStorage.getItem('signupPassword'); // Caution with sensitive data!
        const storedConfirmPassword = sessionStorage.getItem('signupConfirmPassword'); // Caution!
        const storedAccept = sessionStorage.getItem('signupAccept');

        if (storedName) {
            this.signupForm.patchValue({ name: storedName });
        }
        if (storedEmail) {
            this.signupForm.patchValue({ email: storedEmail });
        }
        if (storedPassword) {
            this.signupForm.patchValue({ password: storedPassword });
        }
        if (storedConfirmPassword) {
            this.signupForm.patchValue({ confirmPassword: storedConfirmPassword });
        }
        if (storedAccept === 'true') {
            this.signupForm.patchValue({ accept: true });
        } else if (storedAccept === 'false') {
            this.signupForm.patchValue({ accept: false });
        }
    }

    /**
     * Saves the current form data to session storage.
     * This allows the form to be pre-filled if the user returns to the signup page later.
     * **Caution:** Sensitive data like passwords are also stored temporarily.
     */
    saveFormData(): void {
        sessionStorage.setItem('signupName', this.signupForm.get('name')?.value);
        sessionStorage.setItem('signupEmail', this.signupForm.get('email')?.value);
        sessionStorage.setItem('signupPassword', this.signupForm.get('password')?.value); // Caution!
        sessionStorage.setItem('signupConfirmPassword', this.signupForm.get('confirmPassword')?.value); // Caution!
        sessionStorage.setItem('signupAccept', String(this.signupForm.get('accept')?.value));
    }

    /**
     * Custom validator function to check if the password and confirm password fields have the same value.
     * @param group The form group containing the password and confirm password controls.
     */
    checkPasswords(group: FormGroup) {
        const passwordCtrl = group.controls['password'];
        const confirmPasswordCtrl = group.controls['confirmPassword'];

        if (passwordCtrl.value !== confirmPasswordCtrl.value) {
            confirmPasswordCtrl.setErrors({ notSame: true });
        } else {
            confirmPasswordCtrl.setErrors(null);
        }
    }

    /**
     * Navigates the user back to the previous page using the {@link Location} service.
     */
    backPage() {
        this.location.back();
    }

    /**
     * Toggles the visibility of the password input field.
     */
    togglePasswordVisibility() {
        this.passwordVisible = !this.passwordVisible;
    }

    /**
     * Toggles the visibility of the confirm password input field.
     */
    toggleConfirmPasswordVisibility() {
        this.confirmPasswordVisible = !this.confirmPasswordVisible;
    }

    /**
     * Handles the submission of the signup form.
     * Marks all form controls as touched to trigger validation messages.
     * If the form is valid, it calls the {@link AuthService.signup} method to register the user.
     * Handles both successful and failed signup attempts, displaying appropriate messages to the user.
     * On successful signup, it clears the session storage and navigates the user to the '/summary' route after a short delay.
     */
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
                        console.log('Registration successful', response.user);
                        this.errorMessage = '';
                        this.showSuccessMessage = true;
                        sessionStorage.clear();
                        setTimeout(() => {
                            this.showSuccessMessage = false;
                            this.router.navigate(['/summary']);
                        }, 3000);
                    } else if (response.error) {
                        console.error('Registration failed', response.error);
                        this.errorMessage = response.error.message;
                    }
                },
                error: (err) => {
                    console.error('Unexpected error during registration', err);
                    this.errorMessage =
                        'An unexpected error occurred. Please try again later.';
                },
            });
        }
    }
}