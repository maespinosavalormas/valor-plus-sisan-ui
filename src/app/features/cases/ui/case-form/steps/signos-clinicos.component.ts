import { Component, Inject, OnDestroy } from '@angular/core';

import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';

import { MatButtonModule } from '@angular/material/button';

import { MatIconModule } from '@angular/material/icon';

import { CommonModule } from '@angular/common';

export interface SignosClinicosData {
  isEdit?: boolean;

  currentStep?: number;

  totalSteps?: number;

  previousStepData?: any; // Datos del paso anterior

  data?: any; // Datos guardados del paso actual
}

@Component({
  selector: 'app-signos-clinicos',

  standalone: true,

  imports: [ReactiveFormsModule, MatDialogModule, MatButtonModule, MatIconModule, CommonModule],

  templateUrl: './signos-clinicos.component.html',

  styleUrls: ['../shared/form-step-styles.scss'],
})
export class SignosClinicosComponent implements OnDestroy {
  form: FormGroup;

  isEdit: boolean = false;

  currentStep: number = 6;

  totalSteps: number = 7;

  isLastStep: boolean = false;

  private formSubscription: any;

  constructor(
    private fb: FormBuilder,

    private dialogRef: MatDialogRef<SignosClinicosComponent>,

    @Inject(MAT_DIALOG_DATA) public data: SignosClinicosData,
  ) {
    console.log('SignosClinicosComponent - Constructor iniciado con data:', this.data);

    this.isEdit = data?.isEdit || false;

    this.currentStep = data?.currentStep || 6;

    this.totalSteps = data?.totalSteps || 7;

    this.form = this.initForm();

    // Deshabilitar el cierre del diálogo al hacer clic en el fondo

    this.dialogRef.disableClose = true;

    // Verificar si es el último paso

    this.isLastStep = this.currentStep === this.totalSteps;

    console.log(
      'SignosClinicosComponent - currentStep:',
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
    if (this.data?.data) {
      this.form.patchValue(this.data.data);

      console.log('Datos restaurados del paso 6:', this.data.data);
    }
  }

  private initForm(): FormGroup {
    return this.fb.group({
      // Signos Clínicos - Tipos según interface step6 (todos strings con códigos)

      edemaPresentCode: ['', Validators.required], // string con códigos '1' o '2'

      visibleWastingCode: ['', Validators.required], // string con códigos '1' o '2'

      dryOrRoughSkinCode: ['', Validators.required], // string con códigos '1' o '2'

      skinPigmentationChangesCode: ['', Validators.required], // string con códigos '1' o '2'

      hairChangesCode: ['', Validators.required], // string con códigos '1' o '2'

      clinicalAnemiaSignsCode: ['', Validators.required], // string con códigos '1' o '2'
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

      console.log('Datos transformados del paso 6:', transformedData);

      console.log('Tipos de datos:');

      console.log(
        '  edemaPresentCode:',
        typeof transformedData.edemaPresentCode,
        '=',
        transformedData.edemaPresentCode,
      );

      console.log(
        '  visibleWastingCode:',
        typeof transformedData.visibleWastingCode,
        '=',
        transformedData.visibleWastingCode,
      );

      console.log(
        '  dryOrRoughSkinCode:',
        typeof transformedData.dryOrRoughSkinCode,
        '=',
        transformedData.dryOrRoughSkinCode,
      );

      console.log(
        '  skinPigmentationChangesCode:',
        typeof transformedData.skinPigmentationChangesCode,
        '=',
        transformedData.skinPigmentationChangesCode,
      );

      console.log(
        '  hairChangesCode:',
        typeof transformedData.hairChangesCode,
        '=',
        transformedData.hairChangesCode,
      );

      console.log(
        '  clinicalAnemiaSignsCode:',
        typeof transformedData.clinicalAnemiaSignsCode,
        '=',
        transformedData.clinicalAnemiaSignsCode,
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

   * Transforma los datos del formulario al formato requerido por la interface step6

   * Asegura que todos los campos sean strings con códigos

   */

  private transformFormData(): any {
    const formValue = this.form.getRawValue();

    return {
      // Todos los campos son strings con códigos según interface step6

      edemaPresentCode: formValue.edemaPresentCode || '2', // string con códigos '1' o '2'

      visibleWastingCode: formValue.visibleWastingCode || '2', // string con códigos '1' o '2'

      dryOrRoughSkinCode: formValue.dryOrRoughSkinCode || '2', // string con códigos '1' o '2'

      skinPigmentationChangesCode: formValue.skinPigmentationChangesCode || '2', // string con códigos '1' o '2'

      hairChangesCode: formValue.hairChangesCode || '2', // string con códigos '1' o '2'

      clinicalAnemiaSignsCode: formValue.clinicalAnemiaSignsCode || '2', // string con códigos '1' o '2'
    };
  }

  cancelForm(): void {
    this.dialogRef.close();
  }

  goBack(): void {
    const transformedData = this.transformFormData();

    console.log('Datos transformados al volver atrás:', transformedData);

    // Devuelve un objeto especial que indica que debe volver al paso anterior

    // y pasa los datos del paso anterior para restaurarlos

    // También guarda los datos del paso 6 actual con tipos correctos

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
