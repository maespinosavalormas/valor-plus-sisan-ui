import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CaseBatchService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Carga casos masivamente desde un archivo Excel
   * POST /api/v1/cases/batch
   * @param file Archivo Excel (.xlsx)
   * @param sheetName Nombre de la hoja del Excel (por defecto 'Consolidado 2026')
   * @returns Observable con el resultado de la carga masiva
   */
  uploadBatchCases(file: File, sheetName: string = 'Consolidado 2026'): Observable<BatchCaseResponse> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    formData.append('sheetName', sheetName);

    return this.http.post<BatchCaseResponse>(`${this.baseUrl}/cases/batch`, formData).pipe(
      catchError(error => {
        console.error('Error en carga masiva de casos:', error);
        throw error;
      })
    );
  }

  /**
   * Valida si un archivo es de tipo Excel
   * @param file Archivo a validar
   * @returns true si es un archivo Excel válido
   */
  isValidExcelFile(file: File): boolean {
    const validMimeTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'application/octet-stream'
    ];
    
    const validExtensions = ['.xlsx', '.xls'];
    const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
    
    return validMimeTypes.includes(file.type) || validExtensions.includes(fileExtension);
  }
}

// ── Interfaces para respuesta del endpoint batch ──

export interface BatchCaseResponse {
  summary: BatchSummary;
  imported: ImportedCase[];
  failed: FailedCase[];
}

export interface BatchSummary {
  total: number;
  imported: number;
  failed: number;
  success: boolean;
}

export interface ImportedCase {
  row: number;
  caseId: string;
}

export interface FailedCase {
  row: number;
  error: string;
}
