import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../login/auth.service';
import { Observable, map, take } from 'rxjs';

/**
 * An Angular route guard that checks if the user is already logged in.
 * If the user is authenticated, they are redirected to the '/summary' page.
 * Otherwise, the guard allows access to the requested route.
 *
 * @param route The current ActivatedRouteSnapshot.
 * @param state The current RouterStateSnapshot.
 * @returns An Observable that emits a boolean or a UrlTree.
 * - `true`: Access to the route is allowed.
 * - `UrlTree`: A URL to navigate to.
 */
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
        return router.createUrlTree(['/summary']);
      } else {
        return true;
      }
    })
  );
};