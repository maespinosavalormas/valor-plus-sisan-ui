import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';
import { calculateMETs, validateTimeSum } from '../../../shared/utils/elsa-calculations';
import { PhysicalActivityRisk } from '../data-access/elsa.contracts';

@Component({
  selector: 'app-elsa-actividad-fisica-section',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule],
  template: `
    <section class="elsa-section" data-testid="elsa-actividad-fisica-section" [formGroup]="form">
      <h2 class="elsa-section__title">Actividad Física</h2>

      <div class="elsa-section__row">
        <mat-form-field appearance="outline" class="elsa-field">
          <mat-label>Días actividad vigorosa / semana</mat-label>
          <input
            matInput
            type="number"
            formControlName="af_vigorous_days"
            min="0"
            max="7"
            data-testid="af-vigorous-days"
          />
          <mat-error *ngIf="form.get('af_vigorous_days')?.hasError('max')" data-testid="af-vigorous-days-error">
            Los días no pueden ser mayores a 7
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="elsa-field">
          <mat-label>Minutos / día vigorosa</mat-label>
          <input
            matInput
            type="number"
            formControlName="af_vigorous_min"
            min="10"
            max="960"
            data-testid="af-vigorous-min"
          />
          <mat-error *ngIf="form.get('af_vigorous_min')?.hasError('required')">
            Requerido cuando días > 0
          </mat-error>
        </mat-form-field>
      </div>

      <div class="elsa-section__row">
        <mat-form-field appearance="outline" class="elsa-field">
          <mat-label>Días actividad moderada / semana</mat-label>
          <input
            matInput
            type="number"
            formControlName="af_moderate_days"
            min="0"
            max="7"
            data-testid="af-moderate-days"
          />
          <mat-error *ngIf="form.get('af_moderate_days')?.hasError('max')">
            Los días no pueden ser mayores a 7
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="elsa-field">
          <mat-label>Minutos / día moderada</mat-label>
          <input
            matInput
            type="number"
            formControlName="af_moderate_min"
            min="10"
            max="960"
            data-testid="af-moderate-min"
          />
          <mat-error *ngIf="form.get('af_moderate_min')?.hasError('required')">
            Requerido cuando días > 0
          </mat-error>
        </mat-form-field>
      </div>

      <div class="elsa-section__row">
        <mat-form-field appearance="outline" class="elsa-field elsa-field--full">
          <mat-label>Minutos sedentarios / día</mat-label>
          <input
            matInput
            type="number"
            formControlName="af_sedentary_min"
            min="0"
            max="1440"
            data-testid="af-sedentary-min"
          />
          <mat-error *ngIf="form.get('af_sedentary_min')?.hasError('max')">
            No puede exceder 1440 minutos (24 horas)
          </mat-error>
          <mat-error *ngIf="form.get('af_sedentary_min')?.hasError('timeSum')">
            La suma de tiempos no puede exceder 1440 minutos
          </mat-error>
        </mat-form-field>
      </div>

      <div *ngIf="preview" class="elsa-preview" data-testid="af-preview">
        <strong>METs semanales:</strong> {{ preview.mets }} — {{ preview.label }} ({{ preview.range }})
      </div>
    </section>
  `,
  styles: [`
    .elsa-section { display: flex; flex-direction: column; gap: 16px; }
    .elsa-section__title { margin: 0; font-size: 1.25rem; }
    .elsa-section__row { display: flex; flex-wrap: wrap; gap: 16px; }
    .elsa-field { flex: 1 1 240px; min-width: 200px; }
    .elsa-field--full { flex: 1 1 100%; }
    .elsa-preview { padding: 12px; border-radius: 8px; background: rgba(0,0,0,0.04); }
  `],
})
export class ElsaActividadFisicaSectionComponent implements OnInit, OnDestroy {
  @Input() form!: FormGroup;
  @Output() previewChange = new EventEmitter<PhysicalActivityRisk>();

  preview: PhysicalActivityRisk | null = null;
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    const daysVig = this.form.get('af_vigorous_days');
    const minVig = this.form.get('af_vigorous_min');
    const daysMod = this.form.get('af_moderate_days');
    const minMod = this.form.get('af_moderate_min');

    daysVig?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((d) => this.toggleMinutes(d, minVig!));
    daysMod?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((d) => this.toggleMinutes(d, minMod!));

    [daysVig, minVig, daysMod, minMod, this.form.get('af_sedentary_min')].forEach((ctrl) => {
      ctrl?.valueChanges.pipe(takeUntil(this.destroy$), debounceTime(300)).subscribe(() => this.refreshPreview());
    });

    this.toggleMinutes(daysVig?.value, minVig!, false);
    this.toggleMinutes(daysMod?.value, minMod!, false);
    this.refreshPreview();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private toggleMinutes(days: number, control: any, emit = true): void {
    if (!control) return;
    if (days > 0) {
      control.enable({ emitEvent: emit });
      control.setValidators([Validators.required, Validators.min(10), Validators.max(960)]);
    } else {
      control.disable({ emitEvent: emit });
      control.setValidators([]);
      control.setValue(null, { emitEvent: emit });
    }
    control.updateValueAndValidity({ emitEvent: emit });
  }

  sectionValid(): boolean {
    const daysVig = this.form.get('af_vigorous_days');
    const daysMod = this.form.get('af_moderate_days');
    const sed = this.form.get('af_sedentary_min');
    const minVig = this.form.get('af_vigorous_min');
    const minMod = this.form.get('af_moderate_min');
    if (!daysVig?.valid || !daysMod?.valid || !sed?.valid) return false;
    if (daysVig.value > 0 && (!minVig || minVig.invalid)) return false;
    if (daysMod.value > 0 && (!minMod || minMod.invalid)) return false;
    return true;
  }

  refreshPreview(): void {
    const vigD = this.form.get('af_vigorous_days')?.value;
    if (vigD === null || vigD === undefined) {
      this.preview = null;
      return;
    }
    const vigM = this.form.get('af_vigorous_min')?.value ?? null;
    const modD = this.form.get('af_moderate_days')?.value ?? 0;
    const modM = this.form.get('af_moderate_min')?.value ?? null;
    const sedM = this.form.get('af_sedentary_min')?.value ?? 0;

    this.preview = calculateMETs(vigD, vigM, modD, modM) as PhysicalActivityRisk;
    this.previewChange.emit(this.preview);

    const timeCheck = validateTimeSum(vigM, modM, sedM);
    const sedControl = this.form.get('af_sedentary_min');
    if (!timeCheck.valid) {
      sedControl?.setErrors({ ...sedControl?.errors, timeSum: true });
    } else {
      const errors = sedControl?.errors;
      if (errors) {
        const { timeSum, ...rest } = errors;
        sedControl.setErrors(Object.keys(rest).length ? rest : null);
      }
    }
  }
}
