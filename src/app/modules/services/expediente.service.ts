import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ExpedienteDetailDto, TrazabilidadResponseDto, ListaSeguimientosResponseDto, SeguimientoResponseDto } from '../models';

@Injectable({
  providedIn: 'root',
})
export class ExpedienteService {
  private apiUrl = '/api/v1/estilos-vida/elsa';

  constructor(private http: HttpClient) {}

  /**
   * GET /api/v1/estilos-vida/elsa/{id}/expediente
   * Obtiene detalle del expediente (Tab 1 + Tab 2, lazy load Tabs 3-4)
   */
  getExpediente(id: string): Observable<ExpedienteDetailDto> {
    return this.http.get<ExpedienteDetailDto>(`${this.apiUrl}/${id}/expediente`);
  }

  /**
   * GET /api/v1/estilos-vida/elsa/{id}/trazabilidad
   * Obtiene timeline de cambios (Tab 3, lazy load)
   */
  getTrazabilidad(id: string, skip = 0, limit = 50): Observable<TrazabilidadResponseDto> {
    return this.http.get<TrazabilidadResponseDto>(`${this.apiUrl}/${id}/trazabilidad?skip=${skip}&limit=${limit}`);
  }

  /**
   * GET /api/v1/estilos-vida/elsa/{id}/seguimientos
   * Obtiene listado de seguimientos con presigned URLs (Tab 4, lazy load)
   */
  getSeguimientos(id: string, skip = 0, limit = 20): Observable<ListaSeguimientosResponseDto> {
    return this.http.get<ListaSeguimientosResponseDto>(`${this.apiUrl}/${id}/seguimientos?skip=${skip}&limit=${limit}`);
  }

  /**
   * POST /api/v1/estilos-vida/elsa/{id}/seguimientos
   * Crea nuevo seguimiento (multipart/form-data)
   */
  createSeguimiento(id: string, formData: FormData): Observable<SeguimientoResponseDto> {
    return this.http.post<SeguimientoResponseDto>(`${this.apiUrl}/${id}/seguimientos`, formData);
  }

  /**
   * GET /api/v1/estilos-vida/elsa/{id}/seguimientos/{seguimiento_id}/descargar
   * Genera presigned URL para descarga (redirect 302)
   */
  descargarAdjunto(id: string, seguimientoId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}/seguimientos/${seguimientoId}/descargar`, {
      responseType: 'blob',
    });
  }
}
