import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';
import { calculateAUDITC } from '../../../shared/utils/elsa-calculations';
import { AlcoholRisk, PatientResponse } from '../data-access/elsa.contracts';

@Component({
  selector: 'app-elsa-alcohol-section',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatSelectModule, MatInputModule],
  template: `
    <section class="elsa-section" data-testid="elsa-alcohol-section" [formGroup]="form">
      <h2 class="elsa-section__title">Alcohol</h2>

      <div class="elsa-section__row">
        <mat-form-field appearance="outline" class="elsa-field elsa-field--full">
          <mat-label>¿Con qué frecuencia toma alcohol?</mat-label>
          <mat-select formControlName="alcohol_frequency" data-testid="alcohol-frequency">
            <mat-option [value]="0" data-testid="alcohol-frequency-0">Nunca</mat-option>
            <mat-option [value]="1" data-testid="alcohol-frequency-1">Mensual o menos</mat-option>
            <mat-option [value]="2" data-testid="alcohol-frequency-2">2-4 veces al mes</mat-option>
            <mat-option [value]="3" data-testid="alcohol-frequency-3">2-3 veces a la semana</mat-option>
            <mat-option [value]="4" data-testid="alcohol-frequency-4">4+ veces a la semana</mat-option>
          </mat-select>
          <mat-error *ngIf="form.get('alcohol_frequency')?.hasError('required')">
            Campo requerido
          </mat-error>
        </mat-form-field>
      </div>

      <div class="elsa-section__row">
        <mat-form-field appearance="outline" class="elsa-field">
          <mat-label>¿Cuántos tragos toma un día típico?</mat-label>
          <mat-select formControlName="alcohol_quantity" data-testid="alcohol-quantity">
            <mat-option [value]="0" data-testid="alcohol-quantity-0">1-2</mat-option>
            <mat-option [value]="1" data-testid="alcohol-quantity-1">3-4</mat-option>
            <mat-option [value]="2" data-testid="alcohol-quantity-2">5-6</mat-option>
            <mat-option [value]="3" data-testid="alcohol-quantity-3">7-9</mat-option>
            <mat-option [value]="4" data-testid="alcohol-quantity-4">10+</mat-option>
          </mat-select>
          <mat-error *ngIf="form.get('alcohol_quantity')?.hasError('required')">
            Requerido si frecuencia > 0
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="elsa-field">
          <mat-label>¿Con qué frecuencia bebe 6+ tragos?</mat-label>
          <mat-select formControlName="alcohol_binge" data-testid="alcohol-binge">
            <mat-option [value]="0" data-testid="alcohol-binge-0">Nunca</mat-option>
            <mat-option [value]="1" data-testid="alcohol-binge-1">Menos de mensual</mat-option>
            <mat-option [value]="2" data-testid="alcohol-binge-2">Mensual</mat-option>
            <mat-option [value]="3" data-testid="alcohol-binge-3">Semanal</mat-option>
            <mat-option [value]="4" data-testid="alcohol-binge-4">Diario o casi diario</mat-option>
          </mat-select>
          <mat-error *ngIf="form.get('alcohol_binge')?.hasError('required')">
            Requerido si frecuencia > 0
          </mat-error>
        </mat-form-field>
      </div>

      <div *ngIf="preview" class="elsa-preview" data-testid="alcohol-preview">
        <strong>AUDIT-C:</strong> {{ preview.score }} — {{ preview.label }} ({{ preview.threshold }})
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
export class ElsaAlcoholSectionComponent implements OnInit, OnDestroy {
  @Input() form!: FormGroup;
  @Input() patient: PatientResponse | null = null;
  @Input() patientSex: 'M' | 'F' | null = null;
  @Output() previewChange = new EventEmitter<AlcoholRisk>();

  preview: AlcoholRisk | null = null;
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    const freq = this.form.get('alcohol_frequency');
    freq?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((v) => this.toggleFields(v));

    ['alcohol_frequency', 'alcohol_quantity', 'alcohol_binge'].forEach((name) => {
      this.form.get(name)?.valueChanges.pipe(takeUntil(this.destroy$), debounceTime(300)).subscribe(() => this.refreshPreview());
    });

    this.toggleFields(freq?.value);
    this.refreshPreview();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  sectionValid(): boolean {
    const freq = this.form.get('alcohol_frequency')!;
    if (!freq.valid) return false;
    if (!freq.value || freq.value === 0) return true;
    return this.form.get('alcohol_quantity')!.valid && this.form.get('alcohol_binge')!.valid;
  }

  private toggleFields(freq: number): void {
    const qty = this.form.get('alcohol_quantity');
    const binge = this.form.get('alcohol_binge');
    if (!qty || !binge) return;

    if (freq > 0) {
      qty.enable({ emitEvent: false });
      binge.enable({ emitEvent: false });
      qty.setValidators([Validators.required, Validators.min(0), Validators.max(4)]);
      binge.setValidators([Validators.required, Validators.min(0), Validators.max(4)]);
    } else {
      qty.disable({ emitEvent: false });
      binge.disable({ emitEvent: false });
      qty.setValue(0, { emitEvent: false });
      binge.setValue(0, { emitEvent: false });
      qty.setValidators([]);
      binge.setValidators([]);
    }
    qty.updateValueAndValidity({ emitEvent: false });
    binge.updateValueAndValidity({ emitEvent: false });
  }

  refreshPreview(): void {
    const freq = this.form.get('alcohol_frequency')?.value;
    if (freq === null || freq === undefined) {
      this.preview = null;
      return;
    }
    const sex = this.patientSex ?? this.patient?.sex ?? null;
    if (!sex) {
      this.preview = null;
      return;
    }
    const qty = this.form.get('alcohol_quantity')?.value ?? 0;
    const binge = this.form.get('alcohol_binge')?.value ?? 0;
    this.preview = calculateAUDITC(freq, qty, binge, sex) as AlcoholRisk;
    this.previewChange.emit(this.preview);
  }
}
