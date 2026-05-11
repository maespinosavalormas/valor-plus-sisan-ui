import { User } from '../../models/user.model';

export const authFeatureKey = 'auth';

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  authChecked: boolean; // Indica si ya se verificó la autenticación inicial
}

export const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
  isAuthenticated: false,
  authChecked: false,
};
