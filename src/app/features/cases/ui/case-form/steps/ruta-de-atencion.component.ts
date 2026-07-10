import { Component, Inject, OnDestroy } from '@angular/core';

import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';

import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule,
  MatDialog,
} from '@angular/material/dialog';

import { MatButtonModule } from '@angular/material/button';

import { MatIconModule } from '@angular/material/icon';

import { MatSelectModule } from '@angular/material/select';

import { MatOptionModule } from '@angular/material/core';

import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

import { CommonModule } from '@angular/common';

import { ConfirmDialogService, ConfirmResult } from '../../confirm-dialog/confirm-dialog';
import { CaseFormDataService } from '../services/form-data.service';
import { MasterDataService } from '../services/master-data.service';

export interface RutaDeAtencionData {
  isEdit?: boolean;

  currentStep?: number;

  totalSteps?: number;

  previousStepData?: any; // Datos del paso anterior

  data?: any; // Datos guardados del paso actual
}

@Component({
  selector: 'app-ruta-de-atencion',

  standalone: true,

  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatOptionModule,
    NgxMatSelectSearchModule,
    CommonModule,
  ],

  templateUrl: './ruta-de-atencion.component.html',

  styleUrls: ['../shared/form-step-styles.scss'],
})
export class RutaDeAtencionComponent implements OnDestroy {
  form: FormGroup;

  isEdit: boolean = false;

  currentStep: number = 7;

  totalSteps: number = 7;

  isLastStep: boolean = true;

  private formSubscription: any;

  // Datos maestros
  typeOfCareProvided$!: any;
  diagnostics$!: any;

  // FormControls para mat-select con búsqueda
  medicalDiagnosisCtrl = new FormControl();

  // FormControls para filtrado
  medicalDiagnosisFilterCtrl = new FormControl();

  // Arrays completos para filtrado
  allDiagnostics: any[] = [];

  // Arrays filtrados
  filteredDiagnostics: any[] = [];

  constructor(
    private fb: FormBuilder,

    private dialogRef: MatDialogRef<RutaDeAtencionComponent>,

    @Inject(MAT_DIALOG_DATA) public data: RutaDeAtencionData,

    private dialog: MatDialog,

    private confirmDialogService: ConfirmDialogService,

    private formDataService: CaseFormDataService,

    private masterDataService: MasterDataService,
  ) {
    console.log('RutaDeAtencionComponent - Constructor iniciado con data:', this.data);

    this.isEdit = data?.isEdit || false;

    this.currentStep = data?.currentStep || 7;

    this.totalSteps = data?.totalSteps || 7;

    this.form = this.initForm();

    // Deshabilitar el cierre del diálogo al hacer clic en el fondo

    this.dialogRef.disableClose = true;

    // Verificar si es el último paso

    this.isLastStep = this.currentStep === this.totalSteps;

    console.log(
      'RutaDeAtencionComponent - currentStep:',
      this.currentStep,
      'totalSteps:',
      this.totalSteps,
      'isLastStep:',
      this.isLastStep,
    );

    // Inicializar datos maestros
    this.typeOfCareProvided$ = this.masterDataService.getTypeOfCareProvided();
    this.diagnostics$ = this.masterDataService.getDiagnostics();

    // Diagnóstico médico con búsqueda
    this.diagnostics$.subscribe((diagnostics: any[]) => {
      this.allDiagnostics = diagnostics || [];
      this.filteredDiagnostics = [...this.allDiagnostics];
    });
    this.medicalDiagnosisFilterCtrl.valueChanges.subscribe((search: string) => {
      this.filteredDiagnostics = this.filterItems(search, this.allDiagnostics, 'name');
    });
    this.medicalDiagnosisCtrl.valueChanges.subscribe((selected: any) => {
      this.form.patchValue({ medicalDiagnosisCode: selected?.code || '' });
    });

    // Suscribirse a cambios en los campos

    this.setupFormSubscription();
  }

  ngOnInit(): void {
    if (this.data?.data) {
      this.form.patchValue(this.data.data);

      console.log('Datos restaurados del paso 7:', this.data.data);

      this.restoreMatSelectValues();
    }
  }

  private restoreMatSelectValues(): void {
    // Diagnóstico médico
    if (this.data?.data?.medicalDiagnosisCode && this.allDiagnostics.length > 0) {
      const diagnosis = this.allDiagnostics.find(
        (d) => d.code === this.data.data.medicalDiagnosisCode,
      );
      if (diagnosis) this.medicalDiagnosisCtrl.setValue(diagnosis);
    }
  }

  private initForm(): FormGroup {
    return this.fb.group({
      // Ruta de Atención - Tipos según interface step7

      carePathwayActivatedCode: ['', Validators.required], // string con códigos '1' o '2'

      typeOfCareProvidedCode: ['', [Validators.required]], // string

      medicalDiagnosisCode: ['', [Validators.required]], // string
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

  private filterItems(search: string, items: any[], field: string): any[] {
    if (!search) return items;
    const searchLower = search.toLowerCase();
    return items.filter((item) =>
      item[field]?.toLowerCase().includes(searchLower)
    );
  }

  saveForm(): void {
    if (this.form.valid) {
      const transformedData = this.transformFormData();
      console.log('Datos transformados del paso 7:', transformedData);
      console.log('Tipos de datos:');
      console.log(
        '  carePathwayActivatedCode:',
        typeof transformedData.carePathwayActivatedCode,
        '=',
        transformedData.carePathwayActivatedCode,
      );
      console.log(
        '  typeOfCareProvidedCode:',
        typeof transformedData.typeOfCareProvidedCode,
        '=',
        transformedData.typeOfCareProvidedCode,
      );
      console.log(
        '  medicalDiagnosisCode:',
        typeof transformedData.medicalDiagnosisCode,
        '=',
        transformedData.medicalDiagnosisCode,
      );

      console.log('=== DEBUG: Verificando isLastStep ===', this.isLastStep);
      console.log('currentStep:', this.currentStep, 'totalSteps:', this.totalSteps);

      // Si es el último paso, mostrar diálogo de confirmación
      if (this.isLastStep) {
        console.log('=== DEBUG: Entrando al bloque isLastStep ===');
        console.log('isEdit:', this.isEdit);

        const confirmDialog = this.isEdit
          ? this.confirmDialogService.confirmUpdateCase()
          : this.confirmDialogService.confirmCreateCase();

        console.log('=== DEBUG: Diálogo de confirmación creado ===');

        confirmDialog.subscribe((result: ConfirmResult) => {
          console.log('=== DEBUG: Resultado del diálogo ===', result);

          if (result.confirmed) {
            console.log('=== DEBUG: Usuario confirmó ===');

            // Usuario confirmó, guardar datos del paso 7 y enviar al backend
            this.formDataService.updateStepData('step7', transformedData);

            // Obtener caso completo y enviar al backend
            const completeCaseData = this.formDataService.getCompleteCaseData();
            console.log('Enviando caso completo al backend:', completeCaseData);

            const saveOperation = this.data.isEdit
              ? this.formDataService.updateCase(completeCaseData.id, completeCaseData)
              : this.formDataService.saveCreatedCase(completeCaseData);

            saveOperation.subscribe({
              next: (response) => {
                console.log('Caso guardado exitosamente:', response);
                this.dialogRef.close({
                  action: 'confirm',
                  stepData: transformedData,
                  caseData: completeCaseData,
                  response: response,
                });
              },
              error: (error) => {
                console.error('Error al guardar el caso:', error);
                // Mostrar error al usuario
                alert('Error al guardar el caso: ' + (error.message || 'Error desconocido'));
              },
            });
          } else {
            console.log('=== DEBUG: Usuario canceló ===');
          }
        });
      } else {
        // No es el último paso, continuar normalmente
        this.dialogRef.close({
          action: 'next',
          stepData: transformedData,
        });
      }
    } else {
      console.log('Formulario inválido:', this.form.errors);
      this.form.markAllAsTouched();
    }
  }

  /**



   * Transforma los datos del formulario al formato requerido por la interface step7



   * Asegura los tipos correctos: boolean, string, y number



   */

  private transformFormData(): any {
    const formValue = this.form.getRawValue();

    return {
      // Ruta de Atención - Tipos según interface step7

      carePathwayActivatedCode: formValue.carePathwayActivatedCode || '2', // string con códigos '1' o '2'

      typeOfCareProvidedCode: formValue.typeOfCareProvidedCode || '', // string

      medicalDiagnosisCode: formValue.medicalDiagnosisCode || '', // string
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

  cancelForm(): void {
    this.dialogRef.close();
  }

  goBack(): void {
    const transformedData = this.transformFormData();

    console.log('Datos transformados al volver atrás:', transformedData);

    // Devuelve un objeto especial que indica que debe volver al paso anterior

    // y pasa los datos del paso anterior para restaurarlos

    // También guarda los datos del paso 7 actual con tipos correctos

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
