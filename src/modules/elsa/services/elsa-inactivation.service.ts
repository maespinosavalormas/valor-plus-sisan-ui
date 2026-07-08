import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { InactivateElsaDTO, InactivateElsaResponse } from '../../../shared/models/inactivate-elsa.model';

@Injectable({ providedIn: 'root' })
export class ElsaInactivationService {
  private readonly apiUrl = '/api/v1/forms/elsa';

  constructor(private http: HttpClient) {}

  /**
   * Inactivate ELSA form with 2FA token
   */
  inactivateElsa(
    idElsa: string,
    payload: InactivateElsaDTO,
  ): Observable<InactivateElsaResponse> {
    return this.http
      .post<InactivateElsaResponse>(
        `${this.apiUrl}/${idElsa}/inactivate`,
        payload,
      )
      .pipe(
        catchError((error: HttpErrorResponse) => {
          return throwError(() => this.handleError(error));
        }),
      );
  }

  /**
   * Get ELSA form details
   */
  getElsaForm(idElsa: string): Observable<any> {
    return this.http
      .get<any>(`${this.apiUrl}/${idElsa}`)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          return throwError(() => this.handleError(error));
        }),
      );
  }

  private handleError(error: HttpErrorResponse): { message: string; statusCode: number } {
    let message = 'Error desconocido';
    const statusCode = error.status;

    switch (statusCode) {
      case 400:
        message = error.error?.message || 'Solicitud inválida';
        break;
      case 401:
        message = 'No autorizado. Verifique su token 2FA';
        break;
      case 403:
        message = 'No tiene permiso para inactivar este registro';
        break;
      case 404:
        message = 'Registro ELSA no encontrado';
        break;
      case 409:
        message = 'Este registro ya ha sido inactivado';
        break;
      case 429:
        message = 'Demasiados intentos fallidos. Intente más tarde';
        break;
      case 503:
        message = 'Servicio de autenticación no disponible. Intente más tarde';
        break;
      default:
        message = 'Error en el servidor. Intente más tarde';
    }

    return { message, statusCode };
  }
}
