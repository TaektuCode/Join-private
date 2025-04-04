// login-status.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoginStatusService {
  private loginStatus = new BehaviorSubject<boolean>(false);
  loginStatus$ = this.loginStatus.asObservable();

  setLoginStatus(status: boolean) {
    this.loginStatus.next(status);
  }

  resetLoginStatus() {
    this.loginStatus.next(false);
  }
}