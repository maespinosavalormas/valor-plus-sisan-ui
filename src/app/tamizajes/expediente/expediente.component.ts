import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { Observable, Subject, combineLatest, takeUntil } from 'rxjs';
import { Actions, ofType } from '@ngrx/effects';
import * as TamizajesActions from '../store/tamizajes.actions';
import { TamizajeFacade } from '../facade/tamizaje.facade';
import { CrecimientoChartComponent } from '../components/crecimiento-chart.component';
import { TamizajeFormComponent } from '../components/tamizaje-form.component';
import { HistorialTableComponent } from '../components/historial-table.component';
import {
  CreateTamizajeDto,
  MenorHeader,
  Tamizaje,
  TamizajePunto,
  UpdateTamizajeDto,
} from '../core/contracts/tamizaje.contracts';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { HttpErrorResponse } from '@angular/common/http';
import { TamizajeService } from '../services/tamizaje.service';

interface ExpedienteVm {
  menor: MenorHeader | null;
  serie: TamizajePunto[];
  tamizajes: Tamizaje[];
  loading: boolean;
  notFound: boolean;
  sugerenciaRecuperacion: boolean;
  casoRecuperado: boolean;
}

@Component({
  selector: 'app-expediente',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
    CrecimientoChartComponent,
    TamizajeFormComponent,
    HistorialTableComponent,
  ],
  templateUrl: './expediente.component.html',
  styleUrl: './expediente.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpedienteComponent implements OnInit, OnDestroy, OnChanges {
  @Input() embedded = false;
  @Input() casoIdInput: string | null = null;

  casoId = '';
  saving = false;
  localSaving = false;
  readonly error$: Observable<string | null>;
  lastError: string | null = null;
  editingTamizaje: Tamizaje | null = null;
  bivConfirmRequired = false;

  // View-model de solo lectura: el async pipe gestiona la suscripción y el
  // markForCheck, por lo que el componente puede ser OnPush sin congelarse
  // cuando se embebe dentro de un padre OnPush (cases-details).
  readonly vm$: Observable<ExpedienteVm>;

  private destroy$ = new Subject<void>();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly facade: TamizajeFacade,
    private readonly actions$: Actions,
    private readonly tamizajeService: TamizajeService,
    private readonly cdr: ChangeDetectorRef,
  ) {
    this.error$ = this.facade.error$;
    this.vm$ = combineLatest({
      menor: this.facade.menor$,
      serie: this.facade.serie$,
      tamizajes: this.facade.tamizajes$,
      loading: this.facade.loading$,
      notFound: this.facade.notFound$,
      sugerenciaRecuperacion: this.facade.sugerenciaRecuperacion$,
      casoRecuperado: this.facade.casoRecuperado$,
    });
  }

  ngOnInit(): void {
    if (!this.embedded) {
      this.resolveCasoId();
      this.loadExpedienteData();
    }

    // Los datos de solo lectura llegan por vm$ + async pipe (gestiona CD solo).
    // Aquí solo viven las suscripciones que escriben estado imperativo del
    // componente; con OnPush requieren markForCheck explícito.
    this.facade.saving$.pipe(takeUntil(this.destroy$)).subscribe((s) => {
      this.saving = s;
      this.cdr.markForCheck();
    });
    this.facade.error$.pipe(takeUntil(this.destroy$)).subscribe((e) => {
      if (e) {
        this.lastError = e;
        this.bivConfirmRequired = /biv|422|implausible/i.test(e);
        this.cdr.markForCheck();
      }
    });
    this.actions$
      .pipe(
        ofType(TamizajesActions.createTamizajeFailure, TamizajesActions.updateTamizajeFailure),
        takeUntil(this.destroy$),
      )
      .subscribe(({ error }) => {
        this.lastError = error;
        this.bivConfirmRequired = /biv|422|implausible/i.test(error);
        this.cdr.markForCheck();
      });
    this.facade.editingTamizaje$.pipe(takeUntil(this.destroy$)).subscribe((t) => {
      this.editingTamizaje = t;
      this.cdr.markForCheck();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['casoIdInput'] && this.embedded) {
      this.resolveCasoId();
      this.loadExpedienteData();
    }
  }

  private resolveCasoId(): void {
    this.casoId = this.casoIdInput ?? this.route.snapshot.paramMap.get('casoId') ?? '';
  }

  private loadExpedienteData(): void {
    if (!this.casoId) {
      return;
    }
    this.facade.loadExpediente(this.casoId);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onBack(): void {
    if (this.embedded) {
      return;
    }
    void this.router.navigate(['/cases']);
  }

  onEditTamizaje(tamizaje: Tamizaje): void {
    this.facade.setEditingTamizaje(tamizaje);
  }

  onSubmitForm(dto: CreateTamizajeDto | UpdateTamizajeDto): void {
    if (this.formSaving) {
      return;
    }
    if (!this.bivConfirmRequired) {
      this.lastError = null;
      this.facade.clearError();
    }
    if (this.editingTamizaje) {
      this.facade.updateTamizaje(this.editingTamizaje.id, dto as UpdateTamizajeDto);
      return;
    }
    this.localSaving = true;
    this.cdr.markForCheck();
    this.tamizajeService.crear(this.casoId, dto as CreateTamizajeDto).subscribe({
      next: () => {
        this.localSaving = false;
        this.lastError = null;
        this.bivConfirmRequired = false;
        this.facade.loadExpediente(this.casoId);
      },
      error: (err: HttpErrorResponse) => {
        this.localSaving = false;
        this.lastError = this.parseApiError(err);
        this.bivConfirmRequired = err.status === 422;
        this.cdr.markForCheck();
      },
    });
  }

  get formSaving(): boolean {
    return this.saving || this.localSaving;
  }

  private parseApiError(err: HttpErrorResponse): string {
    let body: { message?: unknown; error?: { message?: unknown } } | null = err.error;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body) as { message?: unknown; error?: { message?: unknown } };
      } catch {
        return String(body) || err.message || 'Unexpected error';
      }
    }
    const nested = body?.error;
    const raw =
      body?.message ??
      (typeof nested === 'object' && nested !== null && 'message' in nested
        ? (nested as { message?: unknown }).message
        : undefined);
    if (raw) {
      return Array.isArray(raw) ? raw.join(', ') : String(raw);
    }
    if (err.status === 409) {
      return 'Ya existe un tamizaje para este menor en la fecha indicada (CA-07)';
    }
    if (err.status === 422) {
      return 'Valores biológicamente implausibles detectados. Requiere confirmación explícita (CA-09/422)';
    }
    return err.message || 'Unexpected error';
  }
}
