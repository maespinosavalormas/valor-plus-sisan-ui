import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ElsaFacade } from '../data-access/facade/elsa.facade';

@Component({
  selector: 'app-elsa-patient-search',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatIconModule,
  ],
  template: `
    <section class="elsa-patient-search" data-testid="elsa-patient-search" [formGroup]="form">
      <h2 class="elsa-patient-search__title">Paciente</h2>

      <div class="elsa-patient-search__row">
        <mat-form-field appearance="outline" class="elsa-patient-search__field">
          <mat-label>Número de documento</mat-label>
          <input
            matInput
            type="text"
            formControlName="patientDocument"
            placeholder="Buscar paciente activo"
            data-testid="patient-document-input"
          />
          <mat-error *ngIf="form.get('patientDocument')?.hasError('required')">
            Documento requerido
          </mat-error>
        </mat-form-field>

        <button
          mat-raised-button
          color="primary"
          type="button"
          (click)="searchPatient()"
          [disabled]="loading$ | async"
          data-testid="patient-search-btn"
        >
          <mat-progress-spinner *ngIf="loading$ | async" diameter="20" mode="indeterminate" />
          <span *ngIf="!(loading$ | async)">Buscar</span>
        </button>
      </div>

      <div *ngIf="error$ | async as error" class="elsa-patient-search__error" data-testid="patient-search-error">
        {{ error }}
      </div>

      <mat-card *ngIf="patient$ | async as patient" class="elsa-patient-search__card" data-testid="patient-search-result">
        <mat-card-header>
          <mat-icon mat-card-avatar>person</mat-icon>
          <mat-card-title data-testid="patient-name">{{ patient.fullName }}</mat-card-title>
          <mat-card-subtitle data-testid="patient-info">
            Documento: {{ patient.document }} | Sexo: {{ patient.sex }} | Edad: {{ patient.age }}
          </mat-card-subtitle>
        </mat-card-header>
      </mat-card>
    </section>
  `,
  styles: [`
    .elsa-patient-search { display: flex; flex-direction: column; gap: 16px; }
    .elsa-patient-search__title { margin: 0; font-size: 1.25rem; }
    .elsa-patient-search__row { display: flex; flex-wrap: wrap; gap: 16px; align-items: center; }
    .elsa-patient-search__field { flex: 1 1 240px; min-width: 200px; }
    .elsa-patient-search__error { color: #d32f2f; font-size: 0.875rem; }
    .elsa-patient-search__card { background: rgba(0,0,0,0.04); }
  `],
})
export class ElsaPatientSearchComponent implements OnInit, OnDestroy {
  @Input() form!: FormGroup;

  patient$ = this.elsa.patient$;
  loading$ = this.elsa.searchLoading$;
  error$ = this.elsa.searchError$;

  private destroy$ = new Subject<void>();

  constructor(private readonly elsa: ElsaFacade) {}

  ngOnInit(): void {
    this.form.get('patientDocument')?.valueChanges
      .pipe(takeUntil(this.destroy$), debounceTime(500), distinctUntilChanged())
      .subscribe((doc) => {
        if (doc && doc.length >= 5) {
          this.elsa.buscarPaciente(doc);
        }
      });

    this.patient$.pipe(takeUntil(this.destroy$)).subscribe((patient) => {
      this.form.get('patient_id')?.setValue(patient?.id ?? null, { emitEvent: false });
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  searchPatient(): void {
    const doc = this.form.get('patientDocument')?.value;
    if (doc) {
      this.elsa.buscarPaciente(doc);
    }
  }
}
