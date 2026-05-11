import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import * as AuthActions from './auth.actions';

@Injectable()
export class AuthEffects {
  login$: any;

  constructor(private actions$: Actions, private authService: AuthService, private router: Router) {
    this.login$ = createEffect(() =>
      this.actions$.pipe(
        ofType(AuthActions.login),
        switchMap(({ username, password }) => {
          if (!this.authService) {
            return of(AuthActions.loginFailure({ error: new Error('AuthService not available') }));
          }
          console.log('AuthEffects: login effect triggered for:', username);
          return this.authService.login(username, password).pipe(
            map((response) => {
              // AuthService ya guarda en localStorage, solo extraemos datos para el store
              console.log('AuthEffects: login success, token exists:', !!response.access_token);
              return AuthActions.loginSuccess({ user: response.user, token: response.access_token });
            }),
            catchError((error) => {
              console.error('AuthEffects: login error:', error);
              return of(AuthActions.loginFailure({ error }));
            })
          );
        })
      )
    );

    this.initializeEffects();
  }

  loginSuccess$: any;
  logout$: any;
  checkAuth$: any;

  // Initialize other effects in constructor
  private initializeEffects() {
    this.loginSuccess$ = createEffect(
      () =>
        this.actions$.pipe(
          ofType(AuthActions.loginSuccess),
          tap(() => {
            console.log('AuthEffects: Navigating to /home after login success');
            this.router.navigate(['/home']);
          })
        ),
      { dispatch: false }
    );

    this.logout$ = createEffect(
      () =>
        this.actions$.pipe(
          ofType(AuthActions.logout),
          tap(() => {
            // La limpieza del storage la maneja el authService o el reducer, no aquí directamente
            this.router.navigate(['/auth/login']);
          })
        ),
      { dispatch: false }
    );

    this.checkAuth$ = createEffect(() =>
      this.actions$.pipe(
        ofType(AuthActions.checkAuth),
        switchMap(() => {
          const token = localStorage.getItem('token');
          const userJson = localStorage.getItem('currentUser');
          
          if (!token) {
            return of(
              AuthActions.checkAuthComplete(),
              AuthActions.logout()
            );
          }
          
          // Parsear usuario del localStorage
          let user = null;
          try {
            if (userJson) {
              user = JSON.parse(userJson);
            }
          } catch (e) {
            console.error('AuthEffects: Error parsing user from localStorage:', e);
          }
          
          // Si no hay usuario en localStorage, crear uno básico del token
          if (!user) {
            user = { id: '', email: '', roles: [] };
          }
          
          return of(
            AuthActions.loginSuccess({ user, token }),
            AuthActions.checkAuthComplete()
          );
        })
      )
    );
  }
}
