import { ActionReducerMap, MetaReducer } from '@ngrx/store';
import { environment } from '../../../environments/environment';
import { authReducer } from '../../features/auth/data-access/store/auth.reducer';
import { AuthState } from '../../features/auth/data-access/store/auth.state';
import { tamizajesReducer } from '../../tamizajes/store/tamizajes.reducer';
import { TamizajesState } from '../../tamizajes/store/tamizajes.state';

// Root reducer interface
export interface AppState {
  auth: AuthState;
  tamizajes: TamizajesState;
}

// Root reducer
export const appReducers: ActionReducerMap<AppState> = {
  auth: authReducer,
  tamizajes: tamizajesReducer,
};

// Meta reducers
export const metaReducers: MetaReducer<AppState>[] = !environment.production ? [] : [];
