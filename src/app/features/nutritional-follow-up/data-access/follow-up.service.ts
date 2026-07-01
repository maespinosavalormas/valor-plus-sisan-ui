import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  SeguimientoEvolutivo,
  ExpedienteEvolutivo,
  CambioEstadoPayload,
  ApiResponse,
  PaginatedResponse,
  CrearSeguimientoDto,
  MuroQueryParams,
} from './follow-up.contracts';

@Injectable({ providedIn: 'root' })
export class FollowUpService {
  private readonly apiUrl = `${environment.apiUrl}/casos`;

  constructor(private readonly http: HttpClient) {}

  /**
   * GET /casos/:casoId/seguimientos
   * Muro timeline con keyset pagination (EE-09)
   */
  listarSeguimientos(
    casoId: string,
    params?: MuroQueryParams
  ): Observable<ApiResponse<PaginatedResponse<SeguimientoEvolutivo>>> {
    let httpParams = new HttpParams();
    if (params?.cursor) httpParams = httpParams.set('cursor', params.cursor);
    if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());
    if (params?.tipo) httpParams = httpParams.set('tipo', params.tipo);

    return this.http.get<ApiResponse<PaginatedResponse<SeguimientoEvolutivo>>>(
      `${this.apiUrl}/${casoId}/seguimientos`,
      { params: httpParams }
    );
  }

  /**
   * POST /casos/:casoId/seguimientos
   * Crear nota evolutiva (append-only)
   */
  crearSeguimiento(
    casoId: string,
    dto: CrearSeguimientoDto
  ): Observable<ApiResponse<SeguimientoEvolutivo>> {
    return this.http.post<ApiResponse<SeguimientoEvolutivo>>(
      `${this.apiUrl}/${casoId}/seguimientos`,
      dto
    );
  }

  /**
   * PUT /casos/:casoId/cambio-estado
   * Cambio de estado con multipart/form-data (evidencia opcional)
   */
  cambiarEstado(
    casoId: string,
    payload: CambioEstadoPayload
  ): Observable<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('nuevoEstado', payload.nuevoEstado);
    formData.append('motivoCambio', payload.motivoCambio);

    if (payload.justificacionAltaInjustificada) {
      formData.append('justificacionAltaInjustificada', payload.justificacionAltaInjustificada);
    }

    if (payload.evidencia) {
      // CA-09: Validación de tamaño (≤5MB) se hace en UI antes de enviar
      formData.append('evidencia', payload.evidencia, payload.evidencia.name);
    }

    return this.http.put<ApiResponse<any>>(
      `${this.apiUrl}/${casoId}/cambio-estado`,
      formData
    );
  }

  /**
   * GET /casos/:casoId/expediente-evolutivo
   * Ficha evolutiva completa (EE-10)
   */
  obtenerExpedienteEvolutivo(
    casoId: string
  ): Observable<ApiResponse<ExpedienteEvolutivo>> {
    return this.http.get<ApiResponse<ExpedienteEvolutivo>>(
      `${this.apiUrl}/${casoId}/expediente-evolutivo`
    );
  }

  /**
   * GET /casos/:casoId/evidencias/:evidenciaId/url-descarga
   * URL presigned para descarga (CA-05)
   */
  obtenerUrlDescarga(
    casoId: string,
    evidenciaId: string
  ): Observable<ApiResponse<{ url: string; expiraEnSegundos: number }>> {
    return this.http.get<ApiResponse<{ url: string; expiraEnSegundos: number }>>(
      `${this.apiUrl}/${casoId}/evidencias/${evidenciaId}/url-descarga`
    );
  }
}
