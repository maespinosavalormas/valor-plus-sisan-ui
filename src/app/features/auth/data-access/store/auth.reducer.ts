import { createReducer, on } from '@ngrx/store';
import * as AuthActions from './auth.actions';
import { AuthState, initialState, authFeatureKey } from './auth.state';

export { authFeatureKey };
export const authReducer = createReducer(
  initialState,
  on(
    AuthActions.login,
    (state): AuthState => ({
      ...state,
      loading: true,
      error: null,
    })
  ),

  on(
    AuthActions.loginSuccess,
    (state, { user, token }): AuthState => ({
      ...state,
      user,
      token,
      isAuthenticated: true,
      loading: false,
      error: null,
    })
  ),

  on(
    AuthActions.loginFailure,
    (state, { error }): AuthState => ({
      ...state,
      loading: false,
      error: error.message || 'Login failed',
    })
  ),

  on(
    AuthActions.logout,
    (): AuthState => ({
      ...initialState,
      authChecked: true, // Marcar que ya se verificó (y falló) la auth
    })
  ),

  on(
    AuthActions.checkAuth,
    (state): AuthState => ({
      ...state,
      loading: true,
    })
  ),

  on(
    AuthActions.checkAuthComplete,
    (state): AuthState => ({
      ...state,
      loading: false,
      authChecked: true,
    })
  ),

  on(
    AuthActions.authError,
    (state, { error }): AuthState => ({
      ...state,
      loading: false,
      error: error.message,
    })
  )
);
