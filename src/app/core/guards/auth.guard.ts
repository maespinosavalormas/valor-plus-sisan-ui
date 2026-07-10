import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable, of, race, timer } from 'rxjs';
import { map, take, filter } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { selectIsAuthenticated, selectAuthChecked } from '../../features/auth/data-access/store/auth.selectors';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);
  private store = inject(Store);
  private platformId = inject(PLATFORM_ID);

  canActivate(): Observable<boolean | UrlTree> {
    // En el servidor, permitir acceso temporalmente
    if (!isPlatformBrowser(this.platformId)) {
      return of(true);
    }

    // Verificar localStorage primero (más rápido que esperar el store)
    if (this.authService.isLoggedIn()) {
      return of(true);
    }

    // Esperar a que se complete la verificación de autenticación inicial
    // con un timeout de seguridad de 500ms
    const authChecked$ = this.store.select(selectAuthChecked).pipe(
      filter((checked) => checked),
      take(1),
      map(() => {
        const isAuthenticated = this.authService.isLoggedIn();
        if (isAuthenticated) {
          return true;
        }
        console.log('AuthGuard: Not authenticated after check, redirecting to login');
        return this.router.createUrlTree(['/auth/login']);
      })
    );

    const timeout$ = timer(500).pipe(
      map(() => {
        // Timeout: verificar directamente el token
        if (this.authService.isLoggedIn()) {
          return true;
        }
        console.log('AuthGuard: Timeout waiting for auth check, redirecting to login');
        return this.router.createUrlTree(['/auth/login']);
      })
    );

    return race(authChecked$, timeout$);
  }
}
