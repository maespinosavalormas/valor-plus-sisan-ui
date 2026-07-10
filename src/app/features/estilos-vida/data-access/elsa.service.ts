import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { timeout } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import {
  ApiResponse,
  CreateELSAFormDto,
  ELSAFormResponse,
  PatientResponse,
} from './elsa.contracts';

function generateUUID(): string {
  const g = (globalThis as any).crypto;
  if (g && typeof g.randomUUID === 'function') return g.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

@Injectable({ providedIn: 'root' })
export class ElsaService {
  private readonly apiUrl = `${environment.apiUrl}/estilos-vida`;
  private readonly pacientesUrl = `${environment.apiUrl}/pacientes`;

  constructor(private readonly http: HttpClient) {}

  /** GET /pacientes/search?document=<doc>&status=ACTIVO — timeout 5s */
  searchPatients(document: string): Observable<ApiResponse<PatientResponse[]>> {
    const params = new HttpParams().set('document', document).set('status', 'ACTIVO');
    return this.http
      .get<ApiResponse<PatientResponse[]>>(`${this.pacientesUrl}/search`, { params })
      .pipe(timeout(5000));
  }

  /** POST /estilos-vida/elsa — timeout 10s, idempotency-key via dto */
  createELSA(dto: CreateELSAFormDto): Observable<ApiResponse<ELSAFormResponse>> {
    const idempotency_key = dto.idempotency_key ?? generateUUID();
    return this.http
      .post<ApiResponse<ELSAFormResponse>>(`${this.apiUrl}/elsa`, { ...dto, idempotency_key })
      .pipe(timeout(10000));
  }

  /** GET /estilos-vida/elsa/:id */
  getELSA(id: string): Observable<ApiResponse<ELSAFormResponse>> {
    return this.http.get<ApiResponse<ELSAFormResponse>>(`${this.apiUrl}/elsa/${id}`);
  }
}