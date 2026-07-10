import { createAction, props } from '@ngrx/store';

export const login = createAction('[Auth] Login', props<{ username: string; password: string }>());

export const loginSuccess = createAction(
  '[Auth] Login Success',
  props<{ user: any; token: string }>()
);

export const loginFailure = createAction('[Auth] Login Failure', props<{ error: any }>());

export const logout = createAction('[Auth] Logout');

export const checkAuth = createAction('[Auth] Check Auth');

export const checkAuthComplete = createAction('[Auth] Check Auth Complete');

export const authError = createAction('[Auth] Error', props<{ error: any }>());
