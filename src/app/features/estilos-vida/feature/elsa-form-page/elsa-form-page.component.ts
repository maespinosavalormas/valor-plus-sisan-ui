import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, filter, take } from 'rxjs/operators';

import { ElsaFacade } from '../../data-access/facade/elsa.facade';
import { CreateELSAFormDto, NutritionRisk, PhysicalActivityRisk, AlcoholRisk } from '../../data-access/elsa.contracts';
import { normalizePayload } from '../../../../shared/utils/elsa-calculations';
import { ElsaPatientSearchComponent } from '../../ui/elsa-patient-search.component';
import { ElsaAlimentacionSectionComponent } from '../../ui/elsa-alimentacion-section.component';
import { ElsaActividadFisicaSectionComponent } from '../../ui/elsa-actividad-fisica-section.component';
import { ElsaTabacoSectionComponent } from '../../ui/elsa-tabaco-section.component';
import { ElsaAlcoholSectionComponent } from '../../ui/elsa-alcohol-section.component';
import { ElsaResumenComponent } from '../../ui/elsa-resumen.component';

const DRAFT_KEY = 'elsa_draft_v1';

@Component({
  selector: 'app-elsa-form-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatIconModule,
    ElsaPatientSearchComponent,
    ElsaAlimentacionSectionComponent,
    ElsaActividadFisicaSectionComponent,
    ElsaTabacoSectionComponent,
    ElsaAlcoholSectionComponent,
    ElsaResumenComponent,
  ],
  templateUrl: './elsa-form-page.component.html',
  styleUrls: ['./elsa-form-page.component.scss'],
})
export class ElsaFormPageComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  readonly elsa = inject(ElsaFacade);

  form!: FormGroup;
  sections = ['Paciente', 'Alimentación', 'Actividad Física', 'Tabaco', 'Alcohol', 'Resumen'];
  currentStep = 0;
  isSubmitting = false;

  nutritionPreview: NutritionRisk | null = null;
  activityPreview: PhysicalActivityRisk | null = null;
  alcoholPreview: AlcoholRisk | null = null;

  patient$ = this.elsa.patient$;
  loading$ = this.elsa.createLoading$;
  error$ = this.elsa.createError$;

  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.form = this.buildForm();
    this.restoreDraft();
    this.listenResponseSuccess();
    this.listenValueChanges();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private buildForm(): FormGroup {
    return this.fb.group({
      patient_id: [null, Validators.required],
      patientDocument: [null],
      evaluation_date: [new Date().toISOString().slice(0, 10), Validators.required],
      alim_fruits_days: [null, [Validators.required, Validators.min(0), Validators.max(7)]],
      alim_fruits_portions: [{ value: null, disabled: true }],
      alim_vegetables_days: [null, [Validators.required, Validators.min(0), Validators.max(7)]],
      alim_vegetables_portions: [{ value: null, disabled: true }],
      alim_salt_added: [false, Validators.required],
      af_vigorous_days: [null, [Validators.required, Validators.min(0), Validators.max(7)]],
      af_vigorous_min: [{ value: null, disabled: true }],
      af_moderate_days: [null, [Validators.required, Validators.min(0), Validators.max(7)]],
      af_moderate_min: [{ value: null, disabled: true }],
      af_sedentary_min: [null, [Validators.required, Validators.min(0), Validators.max(1440)]],
      tobacco_current: [null, Validators.required],
      tobacco_start_age: [{ value: null, disabled: true }],
      tobacco_cigs_day: [{ value: null, disabled: true }],
      alcohol_frequency: [null, [Validators.required, Validators.min(0), Validators.max(4)]],
      alcohol_quantity: [{ value: 0, disabled: true }],
      alcohol_binge: [{ value: 0, disabled: true }],
    });
  }

  private listenValueChanges(): void {
    this.form.valueChanges
      .pipe(takeUntil(this.destroy$), debounceTime(500))
      .subscribe((values) => {
        sessionStorage.setItem(DRAFT_KEY, JSON.stringify(values));
        this.elsa.actualizarDraft(values);
      });

    // Conditional enable/disable for alimentation portions
    this.watchDaysForPortions('alim_fruits_days', 'alim_fruits_portions');
    this.watchDaysForPortions('alim_vegetables_days', 'alim_vegetables_portions');
  }

  private watchDaysForPortions(daysControlName: string, portionsControlName: string): void {
    const daysCtrl = this.form.get(daysControlName);
    const portionsCtrl = this.form.get(portionsControlName);
    if (!daysCtrl || !portionsCtrl) return;

    daysCtrl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((days) => {
      if (days > 0) {
        portionsCtrl.enable({ emitEvent: false });
        portionsCtrl.setValidators([Validators.required, Validators.min(1), Validators.max(20)]);
      } else {
        portionsCtrl.disable({ emitEvent: false });
        portionsCtrl.setValue(null, { emitEvent: false });
        portionsCtrl.setValidators([]);
      }
      portionsCtrl.updateValueAndValidity({ emitEvent: false });
    });
  }

  private restoreDraft(): void {
    const saved = sessionStorage.getItem(DRAFT_KEY);
    if (saved) {
      try {
        const draft = JSON.parse(saved);
        this.form.patchValue(draft);
        this.elsa.restaurarDraft(draft);
      } catch {
        sessionStorage.removeItem(DRAFT_KEY);
      }
    }
  }

  private listenResponseSuccess(): void {
    this.elsa.response$
      .pipe(
        takeUntil(this.destroy$),
        filter((response) => !!response),
        take(1),
      )
      .subscribe((response) => {
        sessionStorage.removeItem(DRAFT_KEY);
        this.elsa.limpiarDraft();
        this.router.navigate(['/estilos-vida', response!.id]);
      });
  }

  onStepChange(index: number): void {
    this.currentStep = index;
  }

  submitForm(): void {
    if (this.isSubmitting || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    setTimeout(() => (this.isSubmitting = false), 500);

    const raw = this.form.getRawValue();
    const normalized = normalizePayload(raw);
    const dto: CreateELSAFormDto = {
      ...raw,
      ...normalized,
      idempotency_key: crypto.randomUUID(),
    };

    this.elsa.actualizarDraft(dto);
    this.elsa.crearELSA(dto);
  }
}
