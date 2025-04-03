import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, from, of } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { User, updateProfile } from '@angular/fire/auth';

import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from '@angular/fire/auth';

interface AuthResponse {
  user?: User | null;
  message?: string;
  error?: any;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private router = inject(Router);
  private auth: Auth = inject(Auth);

  private _user = new BehaviorSubject<User | null>(null);
  user$ = this._user.asObservable();
  private _isAuthenticated = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this._isAuthenticated.asObservable();

  constructor() {
    onAuthStateChanged(this.auth, (user) => {
      this._user.next(user);
      this._isAuthenticated.next(!!user);
    });
  }

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
            .then(() => console.log('Anzeigename aktualisiert'))
            .catch((error) =>
              console.error(
                'Fehler beim Aktualisieren des Anzeigenamens',
                error
              )
            );
        }
      }),
      map((user) => ({ user })),
      catchError((error) => of({ error }))
    );
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
      map((userCredential) => ({ user: userCredential.user })),
      catchError((error) => of({ error }))
    );
  }

  logout(): Observable<void> {
    return from(signOut(this.auth)).pipe(
      tap(() => {
        this._user.next(null);
        this._isAuthenticated.next(false);
        this.router.navigate(['/login']); // Optional: Weiterleitung nach dem Ausloggen
      }),
      catchError((error) => {
        console.error('Logout fehlgeschlagen', error);
        return of(undefined); // Gib ein Observable<void> zurück, auch im Fehlerfall
      })
    );
  }

  isLoggedIn(): Observable<boolean> {
    return this.isAuthenticated$;
  }

  getCurrentUser(): Observable<User | null> {
    return this.user$;
  }
}
