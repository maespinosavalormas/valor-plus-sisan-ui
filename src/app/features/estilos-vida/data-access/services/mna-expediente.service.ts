import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';

export interface MnaExpedienteData {
  mna: MnaData;
  patient?: PatientData;
}

export interface MnaData {
  id: string;
  tenant_id: string;
  patient_id: string;
  score_cribaje: number;
  score_total: number;
  classification: 'NORMAL' | 'RISK' | 'MALNUTRITION';
  status: 'draft' | 'finalized';
  created_by_id: string;
  created_at: Date;
  updated_at: Date;
  [key: string]: any;
}

export interface PatientData {
  id: string;
  nombre: string;
  apellido: string;
  documento: string;
  fecha_nacimiento: Date;
  municipio_id: string;
  [key: string]: any;
}

export interface CalculatedMetrics {
  riesgo_sarcopenia_calculado: string;
  riesgo_sarcopenia_color: string;
  porcentaje_ingesta_icdi: number;
  clasificacion_ingesta: string;
  clasificacion_ingesta_color: string;
  _meta?: { calculated_at: string; duration_ms: number };
}

export interface AuditTrailEntry {
  id: string;
  campo_modificado: string;
  valor_original: string;
  valor_nuevo: string;
  justificacion: string;
  usuario_modificador: string;
  created_at: Date;
}

export interface FollowupEntry {
  id: string;
  tenant_id: string;
  mna_id: string;
  seg_tipo_comentario: string;
  seg_comentario_texto: string;
  seg_archivo_url?: string;
  seg_archivo_nombre?: string;
  seg_archivo_uuid?: string;
  created_at: Date;
  soft_delete: boolean;
}

export interface FollowupPaginationResult {
  followups: FollowupEntry[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export type FollowupTipo =
  | 'Nota Clínica'
  | 'Plan de Intervención'
  | 'Alerta Médica'
  | 'Observación Nutricional'
  | 'Interconsulta';

@Injectable({
  providedIn: 'root',
})
export class MnaExpedienteService {
  private baseUrl = `${environment.apiUrl}/v1/mna`;

  constructor(private http: HttpClient) {}

  private getHeaders(tenantId: string, token: string): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'X-Tenant-ID': tenantId,
    });
  }

  /**
   * GET /mna/:id/expediente
   */
  getExpediente(mnaId: string, tenantId: string, token: string): Observable<MnaExpedienteData> {
    const headers = this.getHeaders(tenantId, token);
    return this.http.get<MnaExpedienteData>(`${this.baseUrl}/${mnaId}/expediente`, { headers }).pipe(
      catchError((error) => {
        console.error('Error fetching MNA expediente:', error);
        return throwError(() => error);
      }),
    );
  }

  /**
   * GET /mna/:id/metrics
   */
  getMetrics(mnaId: string, tenantId: string, token: string): Observable<CalculatedMetrics> {
    const headers = this.getHeaders(tenantId, token);
    return this.http.get<CalculatedMetrics>(`${this.baseUrl}/${mnaId}/metrics`, { headers }).pipe(
      catchError((error) => {
        console.error('Error fetching MNA metrics:', error);
        return throwError(() => error);
      }),
    );
  }

  /**
   * GET /mna/:id/audit-trail
   */
  getAuditTrail(mnaId: string, tenantId: string, token: string): Observable<AuditTrailEntry[]> {
    const headers = this.getHeaders(tenantId, token);
    return this.http.get<AuditTrailEntry[]>(`${this.baseUrl}/${mnaId}/audit-trail`, { headers }).pipe(
      catchError((error) => {
        console.error('Error fetching audit trail:', error);
        return throwError(() => error);
      }),
    );
  }

  /**
   * GET /mna/:id/followups?page=1&limit=10
   */
  getFollowups(
    mnaId: string,
    tenantId: string,
    token: string,
    page: number = 1,
    limit: number = 10,
  ): Observable<FollowupPaginationResult> {
    const headers = this.getHeaders(tenantId, token);
    let params = new HttpParams().set('page', String(page)).set('limit', String(limit));
    return this.http.get<FollowupPaginationResult>(`${this.baseUrl}/${mnaId}/followups`, { headers, params }).pipe(
      catchError((error) => {
        console.error('Error fetching followups:', error);
        return throwError(() => error);
      }),
    );
  }

  /**
   * POST /mna/:id/followups (multipart/form-data)
   */
  createFollowup(
    mnaId: string,
    tenantId: string,
    token: string,
    tipo: FollowupTipo,
    comentario: string,
    file?: File,
  ): Observable<FollowupEntry> {
    const headers = this.getHeaders(tenantId, token);
    const formData = new FormData();
    formData.append('seg_tipo_comentario', tipo);
    formData.append('seg_comentario_texto', comentario);
    if (file) {
      formData.append('file', file, file.name);
    }

    return this.http.post<FollowupEntry>(`${this.baseUrl}/${mnaId}/followups`, formData, { headers }).pipe(
      catchError((error) => {
        console.error('Error creating followup:', error);
        return throwError(() => error);
      }),
    );
  }

  /**
   * GET /mna/:mnaId/followups/:followupId/download
   */
  getDownloadUrl(mnaId: string, followupId: string, tenantId: string, token: string): Observable<{ url: string; expires_in: number }> {
    const headers = this.getHeaders(tenantId, token);
    return this.http.get<{ url: string; expires_in: number }>(
      `${this.baseUrl}/${mnaId}/followups/${followupId}/download`,
      { headers },
    ).pipe(
      catchError((error) => {
        console.error('Error generating download URL:', error);
        return throwError(() => error);
      }),
    );
  }
}
