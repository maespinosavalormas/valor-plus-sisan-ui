import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';
import { PatientResponse } from '../data-access/elsa.contracts';

@Component({
  selector: 'app-elsa-tabaco-section',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatRadioModule],
  template: `
    <section class="elsa-section" data-testid="elsa-tabaco-section" [formGroup]="form">
      <h2 class="elsa-section__title">Tabaco</h2>

      <div class="elsa-section__row">
        <label class="elsa-label">¿Actualmente fuma?</label>
        <mat-radio-group formControlName="tobacco_current" data-testid="tobacco-current">
          <mat-radio-button [value]="true" data-testid="tobacco-current-yes">Sí</mat-radio-button>
          <mat-radio-button [value]="false" data-testid="tobacco-current-no">No</mat-radio-button>
        </mat-radio-group>
      </div>

      <div class="elsa-section__row">
        <mat-form-field appearance="outline" class="elsa-field">
          <mat-label>Edad de inicio</mat-label>
          <input
            matInput
            type="number"
            formControlName="tobacco_start_age"
            min="6"
            data-testid="tobacco-start-age"
          />
          <mat-error *ngIf="form.get('tobacco_start_age')?.hasError('required')">
            Requerido si fuma
          </mat-error>
          <mat-error *ngIf="form.get('tobacco_start_age')?.hasError('ageInvalid')" data-testid="tobacco-start-age-error">
            {{ form.get('tobacco_start_age')?.errors?.['ageInvalid'] }}
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="elsa-field">
          <mat-label>Cigarrillos / día</mat-label>
          <input
            matInput
            type="number"
            formControlName="tobacco_cigs_day"
            min="1"
            max="150"
            data-testid="tobacco-cigs-day"
          />
          <mat-error *ngIf="form.get('tobacco_cigs_day')?.hasError('required')">
            Requerido si fuma
          </mat-error>
        </mat-form-field>
      </div>
    </section>
  `,
  styles: [`
    .elsa-section { display: flex; flex-direction: column; gap: 16px; }
    .elsa-section__title { margin: 0; font-size: 1.25rem; }
    .elsa-section__row { display: flex; flex-wrap: wrap; gap: 16px; align-items: center; }
    .elsa-field { flex: 1 1 240px; min-width: 200px; }
    .elsa-label { font-weight: 500; width: 100%; }
    mat-radio-button { margin-right: 16px; }
  `],
})
export class ElsaTabacoSectionComponent implements OnInit, OnDestroy {
  @Input() form!: FormGroup;
  @Input() patient: PatientResponse | null = null;
  @Input() patientAge: number | null = null;

  private ageErrorMessage: string | null = null;
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    const current = this.form.get('tobacco_current');
    current?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((v) => this.toggleFields(v));

    this.form.get('tobacco_start_age')?.valueChanges
      .pipe(takeUntil(this.destroy$), debounceTime(150))
      .subscribe(() => this.validateAge());

    this.toggleFields(current?.value);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ageError(): string | null {
    return this.ageErrorMessage;
  }

  sectionValid(): boolean {
    const current = this.form.get('tobacco_current')!;
    if (!current.valid) return false;
    if (current.value !== true) return true;
    const age = this.form.get('tobacco_start_age')!;
    const cigs = this.form.get('tobacco_cigs_day')!;
    return age.valid && cigs.valid && this.ageErrorMessage === null;
  }

  private toggleFields(current: boolean): void {
    const startAge = this.form.get('tobacco_start_age');
    const cigsDay = this.form.get('tobacco_cigs_day');
    if (!startAge || !cigsDay) return;

    if (current === true) {
      startAge.enable({ emitEvent: false });
      cigsDay.enable({ emitEvent: false });
      startAge.setValidators([Validators.required, Validators.min(6)]);
      cigsDay.setValidators([Validators.required, Validators.min(1), Validators.max(150)]);
    } else {
      startAge.disable({ emitEvent: false });
      cigsDay.disable({ emitEvent: false });
      startAge.setValue(null, { emitEvent: false });
      cigsDay.setValue(null, { emitEvent: false });
      startAge.setValidators([]);
      cigsDay.setValidators([]);
      startAge.setErrors(null);
      this.ageErrorMessage = null;
    }
    startAge.updateValueAndValidity({ emitEvent: false });
    cigsDay.updateValueAndValidity({ emitEvent: false });
  }

  validateAge(): void {
    const ctrl = this.form.get('tobacco_start_age');
    if (!ctrl) return;
    const age = ctrl.value;
    if (age === null || age === undefined || ctrl.disabled) {
      this.ageErrorMessage = null;
      ctrl.setErrors(null);
      return;
    }

    const patientAge = this.patientAge ?? this.patient?.age;
    let message: string | null = null;
    if (age <= 5) {
      message = 'La edad debe ser mayor a 5 años';
    } else if (patientAge !== undefined && patientAge !== null && age > patientAge) {
      message = 'La edad no puede superar la edad del paciente';
    }

    this.ageErrorMessage = message;
    if (message) {
      ctrl.setErrors({ ...ctrl.errors, ageInvalid: message });
    } else {
      const errors = ctrl.errors;
      if (errors) {
        const { ageInvalid, ...rest } = errors;
        ctrl.setErrors(Object.keys(rest).length ? rest : null);
      }
    }
  }
}
