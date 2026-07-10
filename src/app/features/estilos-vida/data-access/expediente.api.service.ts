import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  ExpedienteDetail,
  Trazabilidad,
  ListSeguidos,
  CreateSeguimientoRequest,
  CreateSeguimientoResponse,
  PaginationParams,
} from '../domain/models/expediente.model';

interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
  meta?: any;
}

@Injectable({
  providedIn: 'root',
})
export class ExpedienteApiService {
  private readonly apiUrl = '/api/v1/estilos-vida';

  constructor(private readonly http: HttpClient) {}

  /**
   * GET /elsa/{id}/expediente
   * Obtener detalle del expediente con IREV calculado
   */
  getExpedienteDetail(elsaId: string): Observable<ExpedienteDetail> {
    return this.http.get<ApiResponse<ExpedienteDetail>>(`${this.apiUrl}/elsa/${elsaId}/expediente`).pipe(
      map((response) => {
        if (response.status !== 'success') {
          throw new Error(response.message || 'Error loading expediente');
        }
        return response.data;
      }),
    );
  }

  /**
   * GET /elsa/{id}/trazabilidad
   * Obtener timeline de cambios con paginación
   */
  getTrazabilidad(elsaId: string, pagination: PaginationParams): Observable<Trazabilidad> {
    let params = new HttpParams();
    params = params.set('page', pagination.page.toString());
    params = params.set('pageSize', pagination.pageSize.toString());

    return this.http.get<ApiResponse<Trazabilidad>>(`${this.apiUrl}/elsa/${elsaId}/trazabilidad`, { params }).pipe(
      map((response) => {
        if (response.status !== 'success') {
          throw new Error(response.message || 'Error loading trazabilidad');
        }
        return response.data;
      }),
    );
  }

  /**
   * POST /elsa/{id}/seguimientos
   * Crear nuevo seguimiento con archivo opcional
   */
  createSeguimiento(
    elsaId: string,
    request: CreateSeguimientoRequest,
    file?: File,
    idempotencyKey?: string,
  ): Observable<CreateSeguimientoResponse> {
    const formData = new FormData();
    formData.append('segComentario', request.segComentario);
    if (request.segTipoNota) {
      formData.append('segTipoNota', request.segTipoNota);
    }
    if (file) {
      formData.append('file', file);
    }

    const headers = new HttpHeaders();
    if (idempotencyKey) {
      headers.append('Idempotency-Key', idempotencyKey);
    }

    return this.http
      .post<ApiResponse<CreateSeguimientoResponse>>(`${this.apiUrl}/elsa/${elsaId}/seguimientos`, formData, {
        headers,
      })
      .pipe(
        map((response) => {
          if (response.status !== 'success') {
            throw new Error(response.message || 'Error creating seguimiento');
          }
          return response.data;
        }),
      );
  }

  /**
   * GET /elsa/{id}/seguimientos
   * Listar seguimientos con paginación
   */
  listSeguimientos(elsaId: string, pagination: PaginationParams): Observable<ListSeguidos> {
    let params = new HttpParams();
    params = params.set('page', pagination.page.toString());
    params = params.set('pageSize', pagination.pageSize.toString());

    return this.http.get<ApiResponse<ListSeguidos>>(`${this.apiUrl}/elsa/${elsaId}/seguimientos`, { params }).pipe(
      map((response) => {
        if (response.status !== 'success') {
          throw new Error(response.message || 'Error loading seguimientos');
        }
        return response.data;
      }),
    );
  }

  /**
   * GET /elsa/{id}/seguimientos/{segId}/adjunto/{adjId}/download
   * Generar URL presignada para descargar adjunto
   */
  generateDownloadUrl(elsaId: string, segId: string, adjId: string): Observable<{ url: string; expiresIn: number }> {
    return this.http
      .get<ApiResponse<{ url: string; expiresIn: number }>>(
        `${this.apiUrl}/elsa/${elsaId}/seguimientos/${segId}/adjunto/${adjId}/download`,
      )
      .pipe(
        map((response) => {
          if (response.status !== 'success') {
            throw new Error(response.message || 'Error generating download URL');
          }
          return response.data;
        }),
      );
  }
}
