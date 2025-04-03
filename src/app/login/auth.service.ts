import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, from, of } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { User } from '@angular/fire/auth';

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
      map((userCredential) => ({ user: userCredential.user })),
      catchError((error) => of({ error }))
    );
  }

  // ... (login, logout, isLoggedIn, getCurrentUser Methoden wie zuvor)
}
