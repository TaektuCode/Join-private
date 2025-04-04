import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../login/auth.service';
import { Observable, map, take } from 'rxjs';

export const alreadyLoggedInGuard: CanActivateFn = (
  route,
  state
): Observable<boolean | UrlTree> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isLoggedIn().pipe(
    take(1),
    map((isAuthenticated) => {
      if (isAuthenticated) {
        return router.createUrlTree(['/summary']); // Weiterleitung zur Startseite (oder einer anderen gewünschten Seite)
      } else {
        return true; // Erlaube den Zugriff auf die Login-Seite, wenn nicht eingeloggt
      }
    })
  );
};
