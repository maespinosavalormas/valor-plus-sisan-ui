import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { AppState } from '../store/app.state';
import { selectUser } from '../../features/auth/data-access/store/auth.selectors';

@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {
  constructor(private store: Store<AppState>, private router: Router) {}

  canActivate(route: any): Observable<boolean | UrlTree> {
    const expectedRoles = route.data.expectedRoles as string[];

    return this.store.select(selectUser).pipe(
      take(1),
      map((user) => {
        const hasRole = user?.roles?.some((role) => expectedRoles.includes(role));
        return hasRole ? true : this.router.createUrlTree(['/unauthorized']);
      })
    );
  }
}
