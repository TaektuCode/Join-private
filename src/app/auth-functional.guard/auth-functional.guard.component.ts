import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../login/auth.service';
import { Observable, map, take } from 'rxjs';

/**
 * An Angular route guard that checks if the user is authenticated.
 * If the user is authenticated, access to the route is allowed.
 * Otherwise, the user is redirected to the '/login' page, with the current URL as a query parameter.
 *
 * @param route The current ActivatedRouteSnapshot.
 * @param state The current RouterStateSnapshot.
 * @returns An Observable that emits a boolean or a UrlTree.
 * - `true`: Access to the route is allowed.
 * - `UrlTree`: A URL to navigate to (the login page).
 */
export const authGuard: CanActivateFn = (
  route,
  state
): Observable<boolean | UrlTree> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isLoggedIn().pipe(
    take(1),
    map((isAuthenticated) => {
      if (isAuthenticated) {
        return true;
      } else {
        return router.createUrlTree(['/login'], {
          queryParams: { returnUrl: state.url },
        });
      }
    })
  );
};