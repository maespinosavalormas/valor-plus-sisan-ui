import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError, firstValueFrom } from 'rxjs';
import { tap, catchError, map, timeout, finalize } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import { User } from '../../models/user.model';
import { Router } from '@angular/router';

export interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    roles: string[];
  };
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap((response) => {
        // Store user details and token in local storage
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('currentUser', JSON.stringify(response.user));
          localStorage.setItem('token', response.access_token);
        }
      }),
      catchError((error) => {
        console.error('Login error en AuthService:', error);
        console.log('Error status en AuthService:', error.status);
        console.log('Error completo en AuthService:', JSON.stringify(error, null, 2));
        
        // Preservar el error original con su código de estado
        // No convertir a Error genérico para mantener el status
        throw error;
      })
    );
  }

  getCurrentUser(): Observable<User> {
    if (typeof localStorage !== 'undefined') {
      const currentUser = localStorage.getItem('currentUser');
      const token = localStorage.getItem('token');
      
      // If no token, user is not authenticated
      if (!token) {
        console.log('AuthService: No token found, user not authenticated');
        return throwError(() => new Error('No authentication token'));
      }
      
      // If we have user data in localStorage, return it
      if (currentUser) {
        try {
          const user = JSON.parse(currentUser);
          console.log('AuthService: Returning user from localStorage:', user);
          return of(user);
        } catch (error) {
          console.error('AuthService: Error parsing user from localStorage:', error);
          // Clear corrupted data
          localStorage.removeItem('currentUser');
        }
      }
      
      // Only try to fetch from backend if we have a token but no user data
      console.log('AuthService: Fetching user from backend');
      return this.http.get<User>(`${this.apiUrl}/me`).pipe(
        tap((user) => {
          console.log('AuthService: User fetched from backend:', user);
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('currentUser', JSON.stringify(user));
          }
        }),
        catchError((error) => {
          console.error('AuthService: Error fetching user from backend:', error);
          // If backend call fails, return a basic user from token if possible
          if (token) {
            const basicUser: User = {
              id: 'unknown',
              username: 'user',
              email: 'user@example.com',
              roles: ['user']
            };
            console.log('AuthService: Returning basic user due to backend error');
            return of(basicUser);
          }
          return throwError(() => error);
        })
      );
    }
    
    // If localStorage is not available
    console.log('AuthService: localStorage not available');
    return throwError(() => new Error('localStorage not available'));
  }

  logout(): Observable<void> {
    console.log('AuthService: Logging out user');
    
    const token = this.getToken();
    
    // Logout híbrido: intentar llamar backend pero siempre limpiar cliente
    const logoutRequest = token 
      ? this.http.post<void>(`${this.apiUrl}/logout`, {}).pipe(
          timeout(5000), // Timeout de 5 segundos
          catchError((error) => {
            console.log('AuthService: Backend logout failed, proceeding with client cleanup', error);
            // Graceful degradation: si el backend falla, continuamos con la limpieza
            return of(void 0);
          })
        )
      : of(void 0);
    
    return logoutRequest.pipe(
      finalize(() => {
        // Siempre limpiar el cliente, sin importar el resultado del backend
        this.clearLocalStorage();
        console.log('AuthService: Logout completed');
      })
    );
  }

  clearLocalStorage(): void {
    // Remove user data from local storage
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('token');
      console.log('AuthService: localStorage cleared');
    }
    
    // Also clear session storage
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.clear();
      console.log('AuthService: sessionStorage cleared');
    }
  }

  isAuthenticated(): boolean {
    try {
      if (typeof localStorage !== 'undefined') {
        const token = localStorage.getItem('token');
        const currentUser = localStorage.getItem('currentUser');
        
        const hasToken = !!token;
        const hasUser = !!currentUser;
        const isAuth = hasToken && hasUser;
        
        console.log('AuthService: isAuthenticated =', isAuth, 
                   'token exists =', hasToken, 
                   'user exists =', hasUser);
        
        return isAuth;
      }
      console.log('AuthService: localStorage not available, returning false');
      return false;
    } catch (error) {
      console.error('AuthService: Error checking authentication:', error);
      return false;
    }
  }

  getToken(): string | null {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  refreshToken(): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(`${this.apiUrl}/refresh`, {});
  }

  isLoggedIn(): boolean {
    try {
      const token = this.getToken();
      if (!token) {
        console.log('AuthService: No token found');
        return false;
      }
      
      // Verificar expiración del JWT
      if (this.isTokenExpired(token)) {
        console.log('AuthService: Token expired, user not authenticated');
        // Solo limpiar localStorage si el token está expirado
        this.clearLocalStorage();
        return false;
      }
      
      const currentUser = localStorage.getItem('currentUser');
      const hasUser = !!currentUser;
      
      console.log('AuthService: isLoggedIn =', hasUser, 'token valid =', !this.isTokenExpired(token));
      
      return hasUser && !this.isTokenExpired(token);
    } catch (error) {
      console.error('AuthService: Error checking if logged in:', error);
      return false;
    }
  }

  getUser(): User | null {
    try {
      if (typeof localStorage !== 'undefined') {
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
          const user = JSON.parse(currentUser);
          return user;
        }
      }
      return null;
    } catch (error) {
      console.error('AuthService: Error getting user:', error);
      return null;
    }
  }

  hasRole(role: string): boolean {
    const user = this.getUser();
    if (!user || !user.roles) {
      return false;
    }
    return user.roles.includes(role);
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = this.decodeToken(token);
      if (!payload || !payload.exp) {
        return false; // Si no tiene exp, asumimos que no expira
      }
      
      const expirationTime = payload.exp * 1000; // Convertir a milisegundos
      const currentTime = Date.now();
      
      const isExpired = currentTime > expirationTime;
      console.log('AuthService: Token expiration check - exp:', expirationTime, 'now:', currentTime, 'expired:', isExpired);
      
      return isExpired;
    } catch (error) {
      console.error('AuthService: Error checking token expiration:', error);
      return false; // Si hay error, asumimos que no está expirado
    }
  }

  private decodeToken(token: string): any {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }
      
      const payload = parts[1];
      const decoded = atob(payload);
      return JSON.parse(decoded);
    } catch (error) {
      console.error('AuthService: Error decoding token:', error);
      return null;
    }
  }

  // Nuevo método para login simulado directo
  loginMock(email: string, password: string): Observable<LoginResponse> {
    console.log('Usando login simulado directo para pruebas...');
    
    const mockResponse: LoginResponse = {
      access_token: 'mock-token-' + Date.now(),
      user: {
        id: '1',
        email: email,
        roles: ['admin']
      }
    };
    
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('currentUser', JSON.stringify(mockResponse.user));
      localStorage.setItem('token', mockResponse.access_token);
      console.log('Token simulado guardado en localStorage');
    }
    
    return of(mockResponse);
  }
}
