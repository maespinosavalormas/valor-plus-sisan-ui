import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState, authFeatureKey } from './auth.state';

export const selectAuthState = createFeatureSelector<AuthState>(authFeatureKey);

export const selectUser = createSelector(selectAuthState, (state: AuthState) => state.user);

export const selectIsAuthenticated = createSelector(
  selectAuthState,
  (state: AuthState) => state.isAuthenticated
);

export const selectAuthLoading = createSelector(
  selectAuthState,
  (state: AuthState) => state.loading
);

export const selectAuthError = createSelector(selectAuthState, (state: AuthState) => state.error);

export const selectToken = createSelector(selectAuthState, (state: AuthState) => state.token);

export const selectAuthChecked = createSelector(
  selectAuthState,
  (state: AuthState) => state.authChecked
);
