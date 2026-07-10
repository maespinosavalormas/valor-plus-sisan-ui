import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import {
  ExpedienteDetail,
  Trazabilidad,
  ListSeguidos,
  CreateSeguimientoRequest,
  CreateSeguimientoResponse,
  PaginationParams,
} from '../domain/models/expediente.model';
import { ExpedienteApiService } from './expediente.api.service';

interface ExpedienteState {
  expediente: ExpedienteDetail | null;
  trazabilidad: Trazabilidad | null;
  seguimientos: ListSeguidos | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ExpedienteState = {
  expediente: null,
  trazabilidad: null,
  seguimientos: null,
  isLoading: false,
  error: null,
};

@Injectable({
  providedIn: 'root',
})
export class ExpedienteStateService {
  private readonly stateSubject = new BehaviorSubject<ExpedienteState>(initialState);
  readonly state$ = this.stateSubject.asObservable();

  readonly expediente$ = this.state$.pipe(
    tap((state) => state.expediente),
    tap((state) => state.expediente),
  );
  readonly trazabilidad$ = this.state$.pipe(tap((state) => state.trazabilidad));
  readonly seguimientos$ = this.state$.pipe(tap((state) => state.seguimientos));
  readonly isLoading$ = this.state$.pipe(tap((state) => state.isLoading));
  readonly error$ = this.state$.pipe(tap((state) => state.error));

  constructor(private readonly apiService: ExpedienteApiService) {}

  /**
   * Cargar expediente detail
   */
  loadExpediente(elsaId: string): void {
    this.setState({ isLoading: true, error: null });
    this.apiService.getExpedienteDetail(elsaId).subscribe({
      next: (expediente) => {
        this.setState({
          expediente,
          isLoading: false,
        });
      },
      error: (error) => {
        this.setState({
          error: error.message || 'Error loading expediente',
          isLoading: false,
        });
      },
    });
  }

  /**
   * Cargar trazabilidad
   */
  loadTrazabilidad(elsaId: string, pagination: PaginationParams): void {
    this.setState({ isLoading: true, error: null });
    this.apiService.getTrazabilidad(elsaId, pagination).subscribe({
      next: (trazabilidad) => {
        this.setState({
          trazabilidad,
          isLoading: false,
        });
      },
      error: (error) => {
        this.setState({
          error: error.message || 'Error loading trazabilidad',
          isLoading: false,
        });
      },
    });
  }

  /**
   * Cargar seguimientos
   */
  loadSeguimientos(elsaId: string, pagination: PaginationParams): void {
    this.setState({ isLoading: true, error: null });
    this.apiService.listSeguimientos(elsaId, pagination).subscribe({
      next: (seguimientos) => {
        this.setState({
          seguimientos,
          isLoading: false,
        });
      },
      error: (error) => {
        this.setState({
          error: error.message || 'Error loading seguimientos',
          isLoading: false,
        });
      },
    });
  }

  /**
   * Crear seguimiento
   */
  createSeguimiento(
    elsaId: string,
    request: CreateSeguimientoRequest,
    file?: File,
  ): Observable<CreateSeguimientoResponse> {
    this.setState({ isLoading: true, error: null });
    const idempotencyKey = this.generateIdempotencyKey();
    return this.apiService.createSeguimiento(elsaId, request, file, idempotencyKey).pipe(
      tap((response) => {
        this.setState({ isLoading: false });
        // Refresh seguimientos list
        this.loadSeguimientos(elsaId, { page: 1, pageSize: 20 });
      }),
      catchError((error) => {
        this.setState({
          error: error.message || 'Error creating seguimiento',
          isLoading: false,
        });
        return throwError(() => error);
      }),
    );
  }

  /**
   * Descargar adjunto
   */
  getDownloadUrl(elsaId: string, segId: string, adjId: string): Observable<{ url: string; expiresIn: number }> {
    return this.apiService.generateDownloadUrl(elsaId, segId, adjId);
  }

  /**
   * Obtener estado actual
   */
  getState(): ExpedienteState {
    return this.stateSubject.value;
  }

  /**
   * Actualizar estado
   */
  private setState(partialState: Partial<ExpedienteState>): void {
    const currentState = this.stateSubject.value;
    this.stateSubject.next({ ...currentState, ...partialState });
  }

  /**
   * Limpiar estado
   */
  resetState(): void {
    this.stateSubject.next(initialState);
  }

  /**
   * Generar Idempotency-Key (UUID v4)
   */
  private generateIdempotencyKey(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}
