import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { FollowUpService } from '../follow-up.service';
import * as fromActions from '../follow-up.actions';
import * as fromSelectors from '../follow-up.selectors';
import {
  FollowUpState,
  SeguimientoEvolutivo,
  ExpedienteEvolutivo,
  CrearSeguimientoDto,
  CambioEstadoPayload,
  TipoSeguimiento,
} from '../follow-up.contracts';

/**
 * Smart Facade: Seguimiento Evolutivo
 * Expone selectors del store y dispara acciones.
 * CA-07: readOnly cuando caso no está ACTIVO
 * EE-04: Draft local persistente
 * CA-05: Descarga de evidencia vía URL presigned
 */
@Injectable({ providedIn: 'root' })
export class EvolutionaryFacade {
  // ========== SELECTORS ==========
  expediente$ = this.store.select(fromSelectors.selectExpediente);
  diasEnPrograma$ = this.store.select(fromSelectors.selectDiasEnPrograma);
  sparklineData$ = this.store.select(fromSelectors.selectSparklineData);
  estadoActual$ = this.store.select(fromSelectors.selectEstadoActual);
  seguimientos$ = this.store.select(fromSelectors.selectSeguimientosConUi);
  seguimientosFiltrados$ = this.store.select(fromSelectors.selectSeguimientosFiltrados);
  hasMore$ = this.store.select(fromSelectors.selectMuroHasMore);
  nextCursor$ = this.store.select(fromSelectors.selectMuroNextCursor);
  loading$ = this.store.select(fromSelectors.selectFollowUpLoading);
  creating$ = this.store.select(fromSelectors.selectFollowUpCreating);
  changingStatus$ = this.store.select(fromSelectors.selectChangingStatus);
  error$ = this.store.select(fromSelectors.selectFollowUpError);
  readOnly$ = this.store.select(fromSelectors.selectCasoEsReadOnly);
  puedeCambiarEstado$ = this.store.select(fromSelectors.selectPuedeCambiarEstado);
  seguimientoSeleccionado$ = this.store.select(fromSelectors.selectSeguimientoSeleccionado);

  constructor(
    private readonly store: Store<{ followUp: FollowUpState }>,
    private readonly followUpService: FollowUpService
  ) {}

  // ========== ACTIONS ==========
  loadEvolutionaryRecord(casoId: string): void {
    this.store.dispatch(fromActions.cargarExpediente({ casoId }));
  }

  createFollowUp(casoId: string, dto: CrearSeguimientoDto): void {
    this.store.dispatch(fromActions.crearSeguimiento({ casoId, dto }));
  }

  changeStatus(casoId: string, payload: CambioEstadoPayload): void {
    this.store.dispatch(fromActions.cambiarEstado({ casoId, payload }));
  }

  loadNextPage(casoId: string, cursor: string): void {
    this.store.dispatch(fromActions.cargarMasMuro({ casoId, cursor }));
  }

  loadMuro(casoId: string, tipo?: TipoSeguimiento): void {
    this.store.dispatch(fromActions.cargarMuro({ casoId, params: tipo ? { tipo } : undefined }));
  }

  filterByTipo(tipo: TipoSeguimiento | null): void {
    this.store.dispatch(fromActions.filtrarPorTipo({ tipo }));
  }

  selectSeguimiento(seguimiento: SeguimientoEvolutivo | null): void {
    this.store.dispatch(fromActions.seleccionarSeguimiento({ seguimiento }));
  }

  saveDraft(casoId: string, contenido: string): void {
    this.store.dispatch(
      fromActions.guardarDraft({ casoId, contenido, timestamp: Date.now() })
    );
  }

  loadDraft(casoId: string): void {
    this.store.dispatch(fromActions.cargarDraft({ casoId }));
  }

  clearDraft(casoId: string): void {
    this.store.dispatch(fromActions.limpiarDraft({ casoId }));
  }

  clearError(): void {
    this.store.dispatch(fromActions.limpiarError());
  }

  // ========== HTTP SERVICE ==========
  downloadEvidence(uuid: string): Observable<void> {
    return new Observable<void>((observer) => {
      this.followUpService.obtenerUrlDescarga(uuid).subscribe({
        next: (response) => {
          if (response?.data?.url) {
            window.open(response.data.url, '_blank');
            observer.next();
            observer.complete();
          } else {
            observer.error(new Error('URL de descarga no disponible'));
          }
        },
        error: (err) => observer.error(err),
      });
    });
  }
}
