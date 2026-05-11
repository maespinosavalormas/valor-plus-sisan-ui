import { Component, Inject, OnDestroy } from '@angular/core';

import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';

import { MatButtonModule } from '@angular/material/button';

import { MatIconModule } from '@angular/material/icon';

import { CommonModule } from '@angular/common';

import { Observable } from 'rxjs';

import {
  MasterDataService,
  AppetiteTestResult,
  ImmunizationStatus,
} from '../services/master-data.service';

export interface IdentificacionDeFactoresData {
  isEdit?: boolean;

  currentStep?: number;

  totalSteps?: number;

  previousStepData?: any; // Datos del paso anterior

  data?: any; // Datos guardados del paso actual
}

@Component({
  selector: 'app-identificacion-de-factores',

  standalone: true,

  imports: [ReactiveFormsModule, MatDialogModule, MatButtonModule, MatIconModule, CommonModule],

  templateUrl: './identificacion-de-factores.component.html',

  styleUrls: ['../shared/form-step-styles.scss'],
})
export class IdentificacionDeFactoresComponent implements OnDestroy {
  form: FormGroup;

  isEdit: boolean = false;

  currentStep: number = 5;

  totalSteps: number = 7;

  isLastStep: boolean = false;

  private formSubscription: any;

  // Observables para datos maestros

  appetiteTestResults$: Observable<AppetiteTestResult[]>;

  immunizationStatuses$: Observable<ImmunizationStatus[]>;

  constructor(
    private fb: FormBuilder,

    private dialogRef: MatDialogRef<IdentificacionDeFactoresComponent>,

    private masterDataService: MasterDataService,

    @Inject(MAT_DIALOG_DATA) public data: IdentificacionDeFactoresData,
  ) {
    console.log('IdentificacionDeFactoresComponent - Constructor iniciado con data:', this.data);

    this.isEdit = data?.isEdit || false;

    this.currentStep = data?.currentStep || 5;

    this.totalSteps = data?.totalSteps || 7;

    this.form = this.initForm();

    // Inicializar observables de datos maestros

    this.appetiteTestResults$ = this.masterDataService.getAppetiteTestResults();

    this.immunizationStatuses$ = this.masterDataService.getImmunizationStatuses();

    // Deshabilitar el cierre del diálogo al hacer clic en el fondo

    this.dialogRef.disableClose = true;

    // Verificar si es el último paso

    this.isLastStep = this.currentStep === this.totalSteps;

    console.log(
      'IdentificacionDeFactoresComponent - currentStep:',
      this.currentStep,
      'totalSteps:',
      this.totalSteps,
      'isLastStep:',
      this.isLastStep,
    );

    // Suscribirse a cambios en los campos

    this.setupFormSubscription();
  }

  ngOnInit(): void {
    // Asegurar que los datos maestros estén cargados

    this.masterDataService.refreshAllMasterData();

    if (this.data?.data) {
      this.form.patchValue(this.data.data);

      console.log('Datos restaurados del paso 5:', this.data.data);
    }
  }

  private initForm(): FormGroup {
    return this.fb.group({
      // Datos Antropométricos y de Salud - Tipos según interface step5

      birthWeight: [null, [Validators.required, Validators.min(0)]], // number

      birthLength: [null, [Validators.required, Validators.min(0)]], // number

      gestationalAgeAtBirth: [null, [Validators.required, Validators.min(0)]], // number

      breastfeedingDuration: [null, [Validators.required, Validators.min(0)]], // number

      complementaryFeedingStartAge: [null, [Validators.required, Validators.min(0)]], // number

      enrolledInGrowthMonitoringCode: ['', Validators.required], // string con códigos '1' o '2'

      immunizationStatusCode: ['', [Validators.required]], // string

      referredByVaccinationCardCode: ['', Validators.required], // string con códigos '1' o '2'

      currentWeight: [null, [Validators.min(0)]], // number (decimal)

      currentHeight: [null, [Validators.min(0)]], // number (decimal)

      midUpperArmCircumference: [null, [Validators.min(0)]], // number (decimal)

      appetiteTestResultCode: ['', [Validators.required]], // string
    });
  }

  private setupFormSubscription(): void {
    // Simplificado para evitar problemas con muchos campos

    this.formSubscription = this.form.valueChanges.subscribe(() => {
      // Debug: mostrar estado del formulario

      console.log('Formulario válido:', this.form.valid);

      console.log('Valores:', this.form.value);
    });
  }

  saveForm(): void {
    if (this.form.valid) {
      const transformedData = this.transformFormData();

      console.log('Datos transformados del paso 5:', transformedData);

      console.log('Tipos de datos:');

      console.log(
        '  birthWeight:',
        typeof transformedData.birthWeight,
        '=',
        transformedData.birthWeight,
      );

      console.log(
        '  birthLength:',
        typeof transformedData.birthLength,
        '=',
        transformedData.birthLength,
      );

      console.log(
        '  gestationalAgeAtBirth:',
        typeof transformedData.gestationalAgeAtBirth,
        '=',
        transformedData.gestationalAgeAtBirth,
      );

      console.log(
        '  breastfeedingDuration:',
        typeof transformedData.breastfeedingDuration,
        '=',
        transformedData.breastfeedingDuration,
      );

      console.log(
        '  complementaryFeedingStartAge:',
        typeof transformedData.complementaryFeedingStartAge,
        '=',
        transformedData.complementaryFeedingStartAge,
      );

      console.log(
        '  enrolledInGrowthMonitoringCode:',
        typeof transformedData.enrolledInGrowthMonitoringCode,
        '=',
        transformedData.enrolledInGrowthMonitoringCode,
      );

      console.log(
        '  immunizationStatusCode:',
        typeof transformedData.immunizationStatusCode,
        '=',
        transformedData.immunizationStatusCode,
      );

      console.log(
        '  referredByVaccinationCardCode:',
        typeof transformedData.referredByVaccinationCardCode,
        '=',
        transformedData.referredByVaccinationCardCode,
      );

      console.log(
        '  currentWeight:',
        typeof transformedData.currentWeight,
        '=',
        transformedData.currentWeight,
      );

      console.log(
        '  currentHeight:',
        typeof transformedData.currentHeight,
        '=',
        transformedData.currentHeight,
      );

      console.log(
        '  midUpperArmCircumference:',
        typeof transformedData.midUpperArmCircumference,
        '=',
        transformedData.midUpperArmCircumference,
      );

      console.log(
        '  appetiteTestResultCode:',
        typeof transformedData.appetiteTestResultCode,
        '=',
        transformedData.appetiteTestResultCode,
      );

      this.dialogRef.close({
        action: 'next',

        stepData: transformedData,
      });
    } else {
      console.log('Formulario inválido:', this.form.errors);

      this.form.markAllAsTouched();
    }
  }

  /**

   * Transforma los datos del formulario al formato requerido por la interface step5

   * Asegura los tipos correctos: numbers, booleans, y strings

   */

  private transformFormData(): any {
    const formValue = this.form.getRawValue();

    return {
      // Numbers - requeridos

      birthWeight: this.parseNumber(formValue.birthWeight),

      birthLength: this.parseNumber(formValue.birthLength),

      gestationalAgeAtBirth: this.parseNumber(formValue.gestationalAgeAtBirth),

      breastfeedingDuration: this.parseNumber(formValue.breastfeedingDuration),

      complementaryFeedingStartAge: this.parseNumber(formValue.complementaryFeedingStartAge),

      // String codes

      enrolledInGrowthMonitoringCode: formValue.enrolledInGrowthMonitoringCode || '2',

      referredByVaccinationCardCode: formValue.referredByVaccinationCardCode || '2',

      // Strings - requeridos

      immunizationStatusCode: formValue.immunizationStatusCode || '',

      appetiteTestResultCode: formValue.appetiteTestResultCode || '',

      // Numbers - opcionales (decimales)

      currentWeight: this.parseDecimal(formValue.currentWeight),

      currentHeight: this.parseDecimal(formValue.currentHeight),

      midUpperArmCircumference: this.parseDecimal(formValue.midUpperArmCircumference),
    };
  }

  /**

   * Helper para convertir valores a number

   * Maneja strings, números y valores null/undefined

   */

  private parseNumber(value: any): number {
    if (value === null || value === undefined || value === '') {
      return 0;
    }

    const parsed = Number(value);

    return isNaN(parsed) ? 0 : parsed;
  }

  /**

   * Helper para convertir valores a decimal (number con precisión)

   * Maneja strings, números y valores null/undefined

   */

  private parseDecimal(value: any): number {
    if (value === null || value === undefined || value === '') {
      return 0;
    }

    const parsed = Number(value);

    return isNaN(parsed) ? 0 : parsed;
  }

  cancelForm(): void {
    this.dialogRef.close();
  }

  goBack(): void {
    const transformedData = this.transformFormData();

    console.log('Datos transformados al volver atrás:', transformedData);

    // Devuelve un objeto especial que indica que debe volver al paso anterior

    // y pasa los datos del paso anterior para restaurarlos

    // También guarda los datos del paso 5 actual con tipos correctos

    this.dialogRef.close({
      action: 'back',

      previousStepData: this.data?.previousStepData,

      currentStepData: transformedData, // Usar datos transformados como en saveForm
    });
  }

  ngOnDestroy(): void {
    if (this.formSubscription) {
      this.formSubscription.unsubscribe();
    }
  }
}
