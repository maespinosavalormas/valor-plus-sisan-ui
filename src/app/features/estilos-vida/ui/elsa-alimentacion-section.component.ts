import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';
import { calculateAlimentationRisk } from '../../../shared/utils/elsa-calculations';
import { NutritionRisk } from '../data-access/elsa.contracts';

@Component({
  selector: 'app-elsa-alimentacion-section',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatCheckboxModule],
  template: `
    <section class="elsa-section" data-testid="elsa-alimentacion-section" [formGroup]="form">
      <h2 class="elsa-section__title">Alimentación</h2>

      <div class="elsa-section__row">
        <mat-form-field appearance="outline" class="elsa-field">
          <mat-label>Días consumo frutas / semana</mat-label>
          <input
            matInput
            type="number"
            formControlName="alim_fruits_days"
            min="0"
            max="7"
            data-testid="alim-fruits-days"
          />
          <mat-error *ngIf="form.get('alim_fruits_days')?.hasError('max')" data-testid="alim-fruits-days-error">
            Los días no pueden ser mayores a 7
          </mat-error>
          <mat-error *ngIf="form.get('alim_fruits_days')?.hasError('required')">
            Campo requerido
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="elsa-field">
          <mat-label>Porciones / día</mat-label>
          <input
            matInput
            type="number"
            formControlName="alim_fruits_portions"
            min="1"
            max="20"
            data-testid="alim-fruits-portions"
          />
          <mat-error *ngIf="form.get('alim_fruits_portions')?.hasError('required')">
            Requerido cuando días > 0
          </mat-error>
        </mat-form-field>
      </div>

      <div class="elsa-section__row">
        <mat-form-field appearance="outline" class="elsa-field">
          <mat-label>Días consumo verduras / semana</mat-label>
          <input
            matInput
            type="number"
            formControlName="alim_vegetables_days"
            min="0"
            max="7"
            data-testid="alim-vegetables-days"
          />
          <mat-error *ngIf="form.get('alim_vegetables_days')?.hasError('max')" data-testid="alim-vegetables-days-error">
            Los días no pueden ser mayores a 7
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="elsa-field">
          <mat-label>Porciones / día</mat-label>
          <input
            matInput
            type="number"
            formControlName="alim_vegetables_portions"
            min="1"
            max="20"
            data-testid="alim-vegetables-portions"
          />
          <mat-error *ngIf="form.get('alim_vegetables_portions')?.hasError('required')">
            Requerido cuando días > 0
          </mat-error>
        </mat-form-field>
      </div>

      <div class="elsa-section__row">
        <mat-checkbox formControlName="alim_salt_added" data-testid="alim-salt-added">
          ¿Agrega sal a la comida?
        </mat-checkbox>
      </div>

      <div *ngIf="preview" class="elsa-preview" data-testid="alimentacion-preview">
        <strong>Consumo promedio:</strong> {{ preview.total }} porciones/día — {{ preview.label }}
      </div>
    </section>
  `,
  styles: [`
    .elsa-section { display: flex; flex-direction: column; gap: 16px; }
    .elsa-section__title { margin: 0; font-size: 1.25rem; }
    .elsa-section__row { display: flex; flex-wrap: wrap; gap: 16px; }
    .elsa-field { flex: 1 1 240px; min-width: 200px; }
    .elsa-preview { padding: 12px; border-radius: 8px; background: rgba(0,0,0,0.04); }
  `],
})
export class ElsaAlimentacionSectionComponent implements OnInit, OnDestroy {
  @Input() form!: FormGroup;
  @Output() previewChange = new EventEmitter<NutritionRisk>();

  preview: NutritionRisk | null = null;
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    const controls = ['alim_fruits_days', 'alim_fruits_portions', 'alim_vegetables_days', 'alim_vegetables_portions'];
    controls.forEach((name) => {
      const ctrl = this.form.get(name);
      if (ctrl) {
        ctrl.valueChanges.pipe(takeUntil(this.destroy$), debounceTime(300)).subscribe(() => this.refreshPreview());
      }
    });
    this.refreshPreview();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onBlur(controlName: string): void {
    this.form.get(controlName)?.markAsTouched();
  }

  sectionValid(): boolean {
    const daysF = this.form.get('alim_fruits_days');
    const daysV = this.form.get('alim_vegetables_days');
    const portionsF = this.form.get('alim_fruits_portions');
    const portionsV = this.form.get('alim_vegetables_portions');
    const salt = this.form.get('alim_salt_added');
    if (!daysF?.valid || !daysV?.valid || !salt?.valid) return false;
    if (daysF.value > 0 && !portionsF?.valid) return false;
    if (daysV.value > 0 && !portionsV?.valid) return false;
    return true;
  }

  refreshPreview(): void {
    const daysF = this.form.get('alim_fruits_days')?.value;
    const daysV = this.form.get('alim_vegetables_days')?.value;
    if (daysF === null || daysF === undefined || daysV === null || daysV === undefined) {
      this.preview = null;
      return;
    }
    const porcF = this.form.get('alim_fruits_portions')?.value ?? null;
    const porcV = this.form.get('alim_vegetables_portions')?.value ?? null;
    const calc = calculateAlimentationRisk(daysF, porcF, daysV, porcV);
    this.preview = { ...calc, threshold: '< 5 porciones/día' } as NutritionRisk;
    this.previewChange.emit(this.preview);
  }
}
