// login-status.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * A service that manages the global login status of the application.
 */
@Injectable({
  providedIn: 'root',
})
export class LoginStatusService {
  private loginStatus = new BehaviorSubject<boolean>(false);
  /**
   * An Observable that emits the current login status.
   */
  loginStatus$: Observable<boolean> = this.loginStatus.asObservable();

  /**
   * Sets the login status.
   * @param status The new login status (true for logged in, false otherwise).
   */
  setLoginStatus(status: boolean): void {
    this.loginStatus.next(status);
  }

  /**
   * Resets the login status to false (logged out).
   */
  resetLoginStatus(): void {
    this.loginStatus.next(false);
  }
}