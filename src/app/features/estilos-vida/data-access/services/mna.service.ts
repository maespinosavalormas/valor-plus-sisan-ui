import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';

export interface MnaAnswer {
  questionKey: string;
  value: number;
}

export interface CreateMnaRequest {
  patientId: string;
  answers: MnaAnswer[];
  useCCWhenBedridden?: boolean;
}

export interface MnaResponse {
  id: string;
  patientId: string;
  scoreCribaje: number;
  scoreTotal: number;
  classification: 'NORMAL' | 'RISK' | 'MALNUTRITION';
  status: 'draft' | 'finalized';
  answers: Record<string, number | null>;
  createdBy: {
    id: string;
    username: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root',
})
export class MnaService {
  private apiUrl = `${environment.apiUrl}/v1/mna`;

  constructor(private http: HttpClient) {}

  createMna(request: CreateMnaRequest, tenantId: string, token: string): Observable<MnaResponse> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'X-Tenant-ID': tenantId,
      'Content-Type': 'application/json',
    });

    return this.http.post<MnaResponse>(this.apiUrl, request, { headers }).pipe(
      catchError((error) => {
        console.error('Error creating MNA form:', error);
        return throwError(() => error);
      }),
    );
  }

  getMnaById(id: string, tenantId: string, token: string): Observable<MnaResponse> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'X-Tenant-ID': tenantId,
    });

    return this.http.get<MnaResponse>(`${this.apiUrl}/${id}`, { headers }).pipe(
      catchError((error) => {
        console.error('Error fetching MNA form:', error);
        return throwError(() => error);
      }),
    );
  }

  calculateScreeningScore(answers: Record<string, number>): number {
    const keys = ['A', 'B', 'C', 'D', 'E', 'F'];
    return keys.reduce((sum, key) => sum + (answers[key] || 0), 0);
  }

  calculateTotalScore(answers: Record<string, number>, screeningScore: number): number {
    if (screeningScore >= 12) {
      return screeningScore;
    }
    const allKeys = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R'];
    return allKeys.reduce((sum, key) => sum + (answers[key] || 0), 0);
  }

  classifyOMS(totalScore: number): 'NORMAL' | 'RISK' | 'MALNUTRITION' {
    if (totalScore >= 24.0) return 'NORMAL';
    if (totalScore >= 17.0) return 'RISK';
    return 'MALNUTRITION';
  }

  getClassificationColor(classification: string): string {
    switch (classification) {
      case 'NORMAL':
        return 'success';
      case 'RISK':
        return 'warning';
      case 'MALNUTRITION':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  getClassificationLabel(classification: string): string {
    switch (classification) {
      case 'NORMAL':
        return 'Estado nutricional normal';
      case 'RISK':
        return 'Riesgo de malnutrición';
      case 'MALNUTRITION':
        return 'Malnutrición';
      default:
        return 'Desconocido';
    }
  }
}
