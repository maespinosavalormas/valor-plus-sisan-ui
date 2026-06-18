import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of, throwError, BehaviorSubject } from 'rxjs';
import { tap, catchError, map, timeout, finalize, take } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environment';

export interface LoginResponse {
  access_token: string;
  user: User;
}

export interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  // BehaviorSubject para mantener el estado de autenticación reactivo
  private readonly isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public readonly isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor() {
    // Solo verificar localStorage si estamos en el navegador
    if (this.isBrowser) {
      this.isAuthenticatedSubject.next(this.isLoggedIn());
    }
  }

  /**
   * Login del usuario
   * Almacena el token y los datos del usuario en localStorage
   */
  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<any>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap((response) => {
        // Manejar tanto access_token como token (por compatibilidad con backend)
        const token = response.access_token || response.token;
        const user = response.user || response.usuario || response.data;
        
        if (!token) {
          throw new Error('No token received from server');
        }
        
        const normalizedResponse: LoginResponse = {
          access_token: token,
          user: user || { id: '', email, username: email.split('@')[0], roles: ['user'] }
        };
        
        this.saveAuthData(normalizedResponse);
        this.isAuthenticatedSubject.next(true);
      }),
      catchError((error) => {
        console.error('Login error en AuthService:', error);
        throw error;
      })
    );
  }

  /**
   * Logout completo:
   * 1. Intenta llamar al backend (con timeout de 5s)
   * 2. Siempre limpia el cliente (graceful degradation)
   * 3. Navega al login
   */
  logout(): Observable<void> {
    const token = this.getToken();
    
    // Si no hay token, solo limpiar y navegar
    if (!token) {
      this.clearAuthData();
      this.isAuthenticatedSubject.next(false);
      this.router.navigate(['/auth/login']);
      return of(void 0);
    }

    // Logout híbrido: intentar llamar backend pero siempre limpiar cliente
    const logoutRequest = this.http.post<void>(`${this.apiUrl}/logout`, {}).pipe(
      timeout(5000), // Timeout de 5 segundos
      catchError((error) => {
        // Graceful degradation: si el backend falla, continuamos con la limpieza
        return of(void 0);
      })
    );
    
    return logoutRequest.pipe(
      finalize(() => {
        // Siempre limpiar el cliente, sin importar el resultado del backend
        this.clearAuthData();
        this.isAuthenticatedSubject.next(false);
        this.router.navigate(['/auth/login']);
      })
    );
  }

  /**
   * Obtiene el token almacenado
   */
  getToken(): string | null {
    if (this.isBrowser) {
      try {
        return localStorage.getItem('token');
      } catch (e) {
        console.error('AuthService: Error reading from localStorage:', e);
        return null;
      }
    }
    return null;
  }

  /**
   * Obtiene los datos del usuario almacenados
   */
  getUser(): User | null {
    try {
      if (this.isBrowser) {
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
          return JSON.parse(currentUser) as User;
        }
      }
      return null;
    } catch (error) {
      console.error('AuthService: Error parsing user from localStorage:', error);
      return null;
    }
  }

  /**
   * Verifica si el usuario está autenticado (token existe y no expirado)
   */
  isLoggedIn(): boolean {
    try {
      const token = this.getToken();
      if (!token) {
        return false;
      }

      // Verificar expiración del JWT
      if (this.isTokenExpired(token)) {
        this.clearAuthData();
        return false;
      }

      return true;
    } catch (error) {
      console.error('AuthService: Error checking login status:', error);
      return false;
    }
  }

  /**
   * Verifica si el usuario tiene un rol específico
   */
  hasRole(role: string): boolean {
    const user = this.getUser();
    if (!user || !user.roles) {
      return false;
    }
    return user.roles.includes(role);
  }

  /**
   * Limpia todos los datos de autenticación del storage
   */
  clearAuthData(): void {
    if (this.isBrowser) {
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('currentUser');
    }
  }

  /**
   * Guarda los datos de autenticación en localStorage
   */
  private saveAuthData(response: LoginResponse): void {
    if (this.isBrowser) {
      try {
        localStorage.setItem('token', response.access_token);
        localStorage.setItem('currentUser', JSON.stringify(response.user));
      } catch (e) {
        console.error('AuthService: Error saving to localStorage:', e);
      }
    }
  }

  /**
   * Verifica si el token JWT está expirado
   */
  private isTokenExpired(token: string): boolean {
    try {
      const payload = this.decodeToken(token);
      if (!payload || !payload.exp) {
        return false; // Si no tiene exp, asumimos que no expira
      }

      const expirationTime = payload.exp * 1000; // Convertir a milisegundos
      const currentTime = Date.now();

      return currentTime > expirationTime;
    } catch (error) {
      console.error('AuthService: Error checking token expiration:', error);
      return false;
    }
  }

  /**
   * Decodifica el payload del token JWT
   */
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

  /**
   * Obtiene el usuario actual desde el backend
   * Usado principalmente para validar el token y obtener datos frescos
   */
  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`).pipe(
      tap((user) => {
        // Actualizar los datos del usuario en localStorage
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('currentUser', JSON.stringify(user));
        }
      }),
      catchError((error) => {
        console.error('AuthService: Error fetching current user:', error);
        throw error;
      })
    );
  }

  /**
   * Login simulado para desarrollo/pruebas
   * Guarda un token mock y datos de usuario en localStorage
   */
  loginMock(email: string, password: string): Observable<LoginResponse> {

    // Crear un payload JWT mock con expiración en 24 horas
    const now = Math.floor(Date.now() / 1000);
    const exp = now + (24 * 60 * 60); // 24 horas desde ahora
    const payload = {
      sub: 'mock-user-id',
      email: email,
      username: email.split('@')[0],
      roles: ['user'],
      exp: exp,
      iat: now
    };

    // Codificar payload en base64 (simulación simple de JWT)
    const encodedPayload = btoa(JSON.stringify(payload));
    const mockToken = `mock.${encodedPayload}.signature`;

    const mockResponse: LoginResponse = {
      access_token: mockToken,
      user: {
        id: 'mock-user-id',
        email: email,
        username: email.split('@')[0],
        firstName: 'Usuario',
        lastName: 'Demo',
        roles: ['user']
      }
    };

    return of(mockResponse).pipe(
      tap((response) => {
        this.saveAuthData(response);
        this.isAuthenticatedSubject.next(true);
      })
    );
  }
}
