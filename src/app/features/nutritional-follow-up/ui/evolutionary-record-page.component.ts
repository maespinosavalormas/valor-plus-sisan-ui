import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';
import {
  FollowUpState,
  cargarExpediente,
  cargarMuro,
  crearSeguimiento,
  cambiarEstado,
  guardarDraft,
  cargarMasMuro,
  selectExpediente,
  selectSeguimientosConUi,
  selectMuroHasMore,
  selectFollowUpLoading,
  selectFollowUpCreating,
  selectChangingStatus,
  selectFollowUpError,
  selectCasoEsReadOnly,
  selectDraftPorCasoId,
  selectEstadoActual,
  selectDiasEnPrograma,
  selectSparklineData,
} from '../data-access';
import { FollowUpWallComponent } from './follow-up-wall.component';
import { FollowUpComposerComponent } from './follow-up-composer.component';
import { StatusPanelComponent } from './status-panel.component';
import { EvolutionaryHeaderComponent } from './evolutionary-header.component';

/**
 * Página principal: Expediente Evolutivo
 * EE-10: Manejo 404 con redirección informativa
 * Integra: Header (días + sparkline), Composer, Muro, Status Panel
 */
@Component({
  selector: 'app-evolutionary-record-page',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    FollowUpWallComponent,
    FollowUpComposerComponent,
    StatusPanelComponent,
    EvolutionaryHeaderComponent,
  ],
  template: `
    <div class="evolutionary-record-page">
      <!-- Loading -->
      <div *ngIf="loading$ | async" class="loading-container">
        <mat-progress-spinner mode="indeterminate" diameter="50"></mat-progress-spinner>
        <span>Cargando expediente evolutivo...</span>
      </div>

      <!-- Contenido -->
      <div *ngIf="!(loading$ | async)" class="page-content">
      <!-- Header: Días en programa + Sparkline (CA-04, CA-10) -->
      <app-evolutionary-header
        [diasEnPrograma]="diasEnPrograma$ | async"
        [sparklineData]="sparklineData$ | async"
        [estadoActual]="estadoActual$ | async">
      </app-evolutionary-header>

        <!-- Composer (deshabilitado si read_only) -->
        <app-follow-up-composer
          [casoId]="casoId"
          [disabled]="readOnly$ | async"
          [guardando]="creating$ | async"
          (enviarNota)="onEnviarNota($event)"
          (draftChange)="onDraftChange($event)">
        </app-follow-up-composer>

        <!-- Muro de seguimientos -->
        <app-follow-up-wall
          [seguimientos]="seguimientos$ | async"
          [hasMore]="hasMore$ | async"
          [loading]="loading$ | async"
          (cargarMas)="onCargarMas()"
          (filtrar)="onFiltrar($event)">
        </app-follow-up-wall>

        <!-- Panel de cambio de estado -->
        <app-status-panel
          [estadoActual]="estadoActual$ | async"
          [readOnly]="readOnly$ | async"
          [aplicando]="changingStatus$ | async"
          (cambiarEstado)="onCambiarEstado($event)">
        </app-status-panel>
      </div>
    </div>
  `,
  styles: [`
    .evolutionary-record-page {
      padding: 16px;
      max-width: 1200px;
      margin: 0 auto;
    }
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 400px;
      gap: 16px;
    }
  `],
})
export class EvolutionaryRecordPageComponent implements OnInit, OnDestroy {
  casoId!: string;

  // Observables del store
  expediente$ = this.store.select(selectExpediente);
  diasEnPrograma$ = this.store.select(selectDiasEnPrograma);
  sparklineData$ = this.store.select(selectSparklineData);
  estadoActual$ = this.store.select(selectEstadoActual);
  seguimientos$ = this.store.select(selectSeguimientosConUi);
  hasMore$ = this.store.select(selectMuroHasMore);
  loading$ = this.store.select(selectFollowUpLoading);
  creating$ = this.store.select(selectFollowUpCreating);
  changingStatus$ = this.store.select(selectChangingStatus);
  error$ = this.store.select(selectFollowUpError);
  readOnly$ = this.store.select(selectCasoEsReadOnly);

  private destroy$ = new Subject<void>();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly store: Store<{ followUp: FollowUpState }>,
    private readonly snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Obtener casoId de la ruta
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.casoId = params['casoId'];

      if (!this.casoId) {
        // EE-10: 404 - Redirección informativa
        this.snackBar.open('Caso no encontrado', 'Cerrar', { duration: 5000 });
        this.router.navigate(['/casos']);
        return;
      }

      // Cargar datos iniciales
      this.store.dispatch(cargarExpediente({ casoId: this.casoId }));
      this.store.dispatch(cargarMuro({ casoId: this.casoId }));

      // Cargar draft guardado si existe
      const draft$ = this.store.select(selectDraftPorCasoId(this.casoId));
      draft$.pipe(takeUntil(this.destroy$)).subscribe((draft) => {
        if (draft) {
          // TODO: Pasar al composer para restaurar
          console.log('Draft recuperado:', draft.contenido.slice(0, 50) + '...');
        }
      });
    });

    // Manejar errores
    this.error$.pipe(takeUntil(this.destroy$)).subscribe((error) => {
      if (error) {
        this.snackBar.open(error, 'Cerrar', { duration: 5000 });
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onEnviarNota(contenido: string): void {
    this.store.dispatch(
      crearSeguimiento({
        casoId: this.casoId,
        dto: {
          tipo: 'NOTA_EVOLUTIVA',
          contenido,
        },
      })
    );
  }

  onDraftChange(draft: { casoId: string; contenido: string }): void {
    this.store.dispatch(
      guardarDraft({
        casoId: draft.casoId,
        contenido: draft.contenido,
        timestamp: Date.now(),
      })
    );
  }

  onCargarMas(): void {
    // TODO: Implementar con cursor
    this.store.dispatch(cargarMasMuro({ casoId: this.casoId, cursor: '' }));
  }

  onFiltrar(tipo: string | null): void {
    this.store.dispatch(cargarMuro({ casoId: this.casoId, params: { tipo: tipo || undefined } }));
  }

  onCambiarEstado(payload: {
    nuevoEstado: string;
    motivoCambio: string;
    justificacionAlta?: string;
    evidencia?: File;
  }): void {
    this.store.dispatch(
      cambiarEstado({
        casoId: this.casoId,
        payload: {
          nuevoEstado: payload.nuevoEstado as any,
          motivoCambio: payload.motivoCambio,
          justificacionAltaInjustificada: payload.justificacionAlta,
          evidencia: payload.evidencia,
        },
      })
    );
  }
}
