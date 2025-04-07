import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  BehaviorSubject,
  Observable,
  from,
  of,
  filter,
  switchMap,
  take,
} from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { User, updateProfile } from '@angular/fire/auth';

import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from '@angular/fire/auth';

/**
 * Represents the response from an authentication operation.
 */
interface AuthResponse {
  /** The authenticated user, if successful. */
  user?: User | null;
  /** A message related to the authentication operation. */
  message?: string;
  /** Any error that occurred during the authentication operation. */
  error?: any;
}

/**
 * Provides authentication services using AngularFire Auth.
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private router = inject(Router);
  private auth: Auth = inject(Auth);

  private _user = new BehaviorSubject<User | null>(null);
  /** An Observable that emits the current authenticated user. */
  user$ = this._user.asObservable();
  private _isAuthenticated = new BehaviorSubject<boolean>(false);
  /** An Observable that emits a boolean indicating whether the user is currently authenticated. */
  isAuthenticated$ = this._isAuthenticated.asObservable();
  private _initialAuthLoaded = new BehaviorSubject<boolean>(false);
  /**
   * An Observable that emits `true` once the initial authentication state has been loaded.
   * It filters out any `false` values, emitting only when the initial load is complete.
   */
  initialAuthLoaded$ = this._initialAuthLoaded
    .asObservable()
    .pipe(filter((loaded) => loaded)); // Only allow true values

  /**
   * Initializes the AuthService and sets up a listener for authentication state changes.
   */
  constructor() {
    onAuthStateChanged(this.auth, (user) => {
      this._user.next(user);
      this._isAuthenticated.next(!!user);
      this._initialAuthLoaded.next(true); // Initialization complete
    });
  }

  /**
   * Registers a new user with the provided email and password.
   *
   * @param userData An object containing the user's email, password, and optionally a name.
   * @returns An Observable emitting an AuthResponse.
   */
  signup(userData: any): Observable<AuthResponse> {
    return from(
      createUserWithEmailAndPassword(
        this.auth,
        userData.email,
        userData.password
      )
    ).pipe(
      map((userCredential) => userCredential.user),
      tap((user) => {
        if (user && userData.name) {
          updateProfile(user, { displayName: userData.name })
            .then(() => {})
            .catch((error) => {});
        }
      }),
      map((user) => ({ user })),
      catchError((error) => of({ error }))
    );
  }

  /**
   * Logs in an existing user with the provided email and password.
   *
   * @param email The user's email address.
   * @param password The user's password.
   * @returns An Observable emitting an AuthResponse.
   */
  login(email: string, password: string): Observable<AuthResponse> {
    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
      map((userCredential) => ({ user: userCredential.user })),
      catchError((error) => of({ error }))
    );
  }

  /**
   * Logs out the current user.
   *
   * @returns An Observable that completes when the logout is successful.
   */
  logout(): Observable<void> {
    return from(signOut(this.auth)).pipe(
      tap(() => {
        this._user.next(null);
        this._isAuthenticated.next(false);
        this.router.navigate(['/login']); // Optional: Redirect after logout
      }),
      catchError((error) => {
        return of(undefined); // Return an Observable<void> even on error
      })
    );
  }

  /**
   * Checks if the user is currently logged in.
   * It waits for the initial authentication state to be loaded before emitting.
   *
   * @returns An Observable emitting a boolean indicating the authentication status.
   */
  isLoggedIn(): Observable<boolean> {
    return this.initialAuthLoaded$.pipe(
      take(1), // Ensure we only wait once
      switchMap(() => this.isAuthenticated$)
    );
  }

  /**
   * Returns an Observable of the current authenticated user.
   *
   * @returns An Observable emitting the current User object or null if not authenticated.
   */
  getCurrentUser(): Observable<User | null> {
    return this.user$;
  }
}