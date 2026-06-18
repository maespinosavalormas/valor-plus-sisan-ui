import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Notification, PaginatedResponse, NotificationStatus } from '../models/notification.model';

@Injectable({
  providedIn: 'root',
})
export class NotificationsService {
  private apiUrl = `${environment.apiUrl}/notifications`;

  constructor(private http: HttpClient) {}

  /**
   * Obtener notificaciones del usuario actual
   * GET /api/v1/notifications/me?status={status}
   * @param status - 'all' | 'read' | 'unread'
   * @returns Observable con la respuesta paginada de notificaciones
   */
  getNotifications(status: NotificationStatus = 'all'): Observable<PaginatedResponse<Notification>> {
    const url = `${this.apiUrl}/me`;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    });

    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<PaginatedResponse<Notification>>(url, { headers, params }).pipe(
      catchError((error) => {
        console.error('Error en NotificationsService.getNotifications():', error);
        console.error('Status:', error.status);
        console.error('URL:', url);

        if (error.status === 400) {
          console.error('Error 400: Bad Request - Posibles causas:');
          console.error('1. Backend no está corriendo en localhost:3000');
          console.error('2. Endpoint incorrecto (debería ser /api/v1/notifications/me)');
          console.error('3. Token inválido o expirado');
          console.error('4. Permisos insuficientes');
        }

        return throwError(error);
      })
    );
  }

  /**
   * Marcar una notificación como leída
   * PATCH /api/v1/notifications/{id}/read
   * @param id ID de la notificación
   * @returns Observable con la respuesta del backend
   */
  markAsRead(id: number): Observable<{ success: boolean }> {
    const url = `${this.apiUrl}/${id}/read`;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    });

    return this.http.patch<{ success: boolean }>(url, {}, { headers }).pipe(
      catchError((error) => {
        console.error('Error en NotificationsService.markAsRead():', error);
        console.error('Status:', error.status);
        console.error('URL:', url);

        if (error.status === 400) {
          console.error('Error 400: Bad Request - Posibles causas:');
          console.error('1. Backend no está corriendo en localhost:3000');
          console.error('2. Endpoint incorrecto (debería ser /api/v1/notifications/{id}/read)');
          console.error('3. Token inválido o expirado');
          console.error('4. Permisos insuficientes');
        }

        return throwError(error);
      })
    );
  }
}
