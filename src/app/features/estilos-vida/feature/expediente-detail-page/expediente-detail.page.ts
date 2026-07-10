import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { ExpedienteDetail, Trazabilidad, ListSeguidos } from '../../domain/models/expediente.model';
import { ExpedienteStateService } from '../../data-access/expediente-state.service';
import { ExpedienteDetailComponent } from '../../ui/expediente-detail/expediente-detail.component';
import { TrazabilidadComponent } from '../../ui/trazabilidad/trazabilidad.component';
import { SeguimientoListComponent } from '../../ui/seguimiento-list/seguimiento-list.component';

@Component({
  selector: 'app-expediente-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatCardModule,
    ExpedienteDetailComponent,
    TrazabilidadComponent,
    SeguimientoListComponent,
  ],
  template: `
    <div class="expediente-detail-container">
      <div *ngIf="(isLoading$ | async)" class="loading">
        <mat-spinner></mat-spinner>
      </div>

      <div *ngIf="(error$ | async) as error" class="error-message">
        {{ error }}
      </div>

      <mat-card *ngIf="(expediente$ | async) as expediente" class="expediente-card">
        <mat-card-header>
          <mat-card-title>
            Expediente Clínico - Paciente #{{ expediente.form.patientId }}
          </mat-card-title>
          <mat-card-subtitle>
            Evaluación: {{ expediente.form.createdAt | date: 'short' }}
          </mat-card-subtitle>
        </mat-card-header>

        <mat-tab-group class="expediente-tabs">
          <!-- Tab 1: Detalle del ELSA -->
          <mat-tab>
            <ng-template mat-tab-label>
              <span>Detalle ELSA</span>
            </ng-template>
            <app-expediente-detail [expediente]="expediente"></app-expediente-detail>
          </mat-tab>

          <!-- Tab 2: Trazabilidad -->
          <mat-tab>
            <ng-template mat-tab-label>
              <span>Trazabilidad</span>
            </ng-template>
            <app-trazabilidad
              [trazabilidad]="trazabilidad$ | async"
              [isLoading]="(isLoading$ | async) || false"
              (pageChange)="onTrazabilidadPageChange($event)"
            ></app-trazabilidad>
          </mat-tab>

          <!-- Tab 3: Seguimientos -->
          <mat-tab>
            <ng-template mat-tab-label>
              <span>Seguimientos ({{ (seguimientos$ | async)?.meta?.total || 0 }})</span>
            </ng-template>
            <app-seguimiento-list
              [elsaId]="elsaId"
              [seguimientos]="seguimientos$ | async"
              [isLoading]="(isLoading$ | async) || false"
              (createSeguimiento)="onCreateSeguimiento($event)"
              (pageChange)="onSeguimientosPageChange($event)"
            ></app-seguimiento-list>
          </mat-tab>
        </mat-tab-group>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .expediente-detail-container {
        padding: 2rem;
        max-width: 1200px;
        margin: 0 auto;
      }

      .loading {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 400px;
      }

      .error-message {
        background-color: #ffebee;
        color: #c62828;
        padding: 1rem;
        border-radius: 4px;
        margin-bottom: 1rem;
      }

      .expediente-card {
        margin-bottom: 2rem;
      }

      .expediente-tabs {
        margin-top: 1rem;
      }
    `,
  ],
})
export class ExpedienteDetailPage implements OnInit, OnDestroy {
  elsaId!: string;
  expediente$!: Observable<ExpedienteDetail | null>;
  trazabilidad$!: Observable<Trazabilidad | null>;
  seguimientos$!: Observable<ListSeguidos | null>;
  isLoading$!: Observable<boolean | null>;
  error$!: Observable<string | null>;

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly stateService: ExpedienteStateService,
    private readonly snackBar: MatSnackBar,
  ) {
    this.expediente$ = this.stateService.state$.pipe(
      takeUntil(this.destroy$),
      map(state => state.expediente),
    );
    this.trazabilidad$ = this.stateService.state$.pipe(
      takeUntil(this.destroy$),
      map(state => state.trazabilidad),
    );
    this.seguimientos$ = this.stateService.state$.pipe(
      takeUntil(this.destroy$),
      map(state => state.seguimientos),
    );
    this.isLoading$ = this.stateService.state$.pipe(
      takeUntil(this.destroy$),
      map(state => state.isLoading),
    );
    this.error$ = this.stateService.state$.pipe(
      takeUntil(this.destroy$),
      map(state => state.error),
    );
  }

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.elsaId = params['id'];
      this.stateService.loadExpediente(this.elsaId);
      this.stateService.loadTrazabilidad(this.elsaId, { page: 1, pageSize: 20 });
      this.stateService.loadSeguimientos(this.elsaId, { page: 1, pageSize: 20 });
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.stateService.resetState();
  }

  onTrazabilidadPageChange(page: number): void {
    this.stateService.loadTrazabilidad(this.elsaId, { page, pageSize: 20 });
  }

  onSeguimientosPageChange(page: number): void {
    this.stateService.loadSeguimientos(this.elsaId, { page, pageSize: 20 });
  }

  onCreateSeguimiento(event: { comentario: string; file?: File }): void {
    this.stateService.createSeguimiento(this.elsaId, { segComentario: event.comentario }, event.file).subscribe({
      next: () => {
        this.snackBar.open('Seguimiento creado exitosamente', 'Cerrar', { duration: 3000 });
      },
      error: (error) => {
        this.snackBar.open('Error al crear seguimiento: ' + error.message, 'Cerrar', { duration: 5000 });
      },
    });
  }
}
