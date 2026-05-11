import { ActionReducerMap, MetaReducer } from '@ngrx/store';
import { environment } from '../../../environments/environment';
import { authReducer } from '../../features/auth/data-access/store/auth.reducer';
import { AuthState } from '../../features/auth/data-access/store/auth.state';

// Root reducer interface
export interface AppState {
  auth: AuthState;
}

// Root reducer
export const appReducers: ActionReducerMap<AppState> = {
  auth: authReducer,
};

// Meta reducers
export const metaReducers: MetaReducer<AppState>[] = !environment.production ? [] : [];
