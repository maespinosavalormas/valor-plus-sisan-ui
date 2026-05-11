import { Component, Inject, OnDestroy } from '@angular/core';

import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';

import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';

import { MatButtonModule } from '@angular/material/button';

import { MatIconModule } from '@angular/material/icon';

import { MatSelectModule } from '@angular/material/select';

import { MatOptionModule } from '@angular/material/core';

import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

import { CommonModule } from '@angular/common';

import { Observable } from 'rxjs';

import {
  MasterDataService,
  IdentificationType,
  EducationalLevel,
} from '../services/master-data.service';

export interface DatosDeLaMadreData {
  isEdit?: boolean;

  currentStep?: number;

  totalSteps?: number;

  previousStepData?: any; // Datos del paso anterior

  data?: any; // Datos guardados del paso actual
}

@Component({
  selector: 'app-datos-de-la-madre',

  standalone: true,

  imports: [ReactiveFormsModule, MatDialogModule, MatButtonModule, MatIconModule, MatSelectModule, MatOptionModule, NgxMatSelectSearchModule, CommonModule],

  templateUrl: './datos-de-la-madre-o-cuidador.component.html',

  styleUrls: ['../shared/form-step-styles.scss'],
})
export class DatosDeLaMadreComponent implements OnDestroy {
  form: FormGroup;

  isEdit: boolean = false;

  currentStep: number = 4;

  totalSteps: number = 7;

  isLastStep: boolean = false;

  private formSubscription: any;

  // Observables para datos maestros

  identificationTypes$: Observable<IdentificationType[]>;

  educationalLevels$: Observable<EducationalLevel[]>;

  // FormControls para mat-select con búsqueda
  documentTypeCtrl = new FormControl();

  // FormControls para filtrado
  documentTypeFilterCtrl = new FormControl();

  // Arrays completos para filtrado
  allIdentificationTypes: any[] = [];

  // Arrays filtrados
  filteredIdentificationTypes: any[] = [];

  constructor(
    private fb: FormBuilder,

    private dialogRef: MatDialogRef<DatosDeLaMadreComponent>,

    private masterDataService: MasterDataService,

    @Inject(MAT_DIALOG_DATA) public data: DatosDeLaMadreData,
  ) {
    console.log('DatosDeLaMadreComponent - Constructor iniciado con data:', this.data);

    this.isEdit = data?.isEdit || false;

    this.currentStep = data?.currentStep || 4;

    this.totalSteps = data?.totalSteps || 7;

    this.form = this.initForm();

    // Inicializar observables de datos maestros

    this.identificationTypes$ = this.masterDataService.getIdentificationTypes();

    this.educationalLevels$ = this.masterDataService.getEducationalLevels();

    // Tipo de documento con búsqueda
    this.identificationTypes$.subscribe((types: any[]) => {
      this.allIdentificationTypes = types || [];
      this.filteredIdentificationTypes = [...this.allIdentificationTypes];
    });
    this.documentTypeFilterCtrl.valueChanges.subscribe((search: string) => {
      this.filteredIdentificationTypes = this.filterItems(search, this.allIdentificationTypes, 'name');
    });
    this.documentTypeCtrl.valueChanges.subscribe((selected: any) => {
      this.form.patchValue({ documentTypeCode: selected?.code || '' });
    });

    // Deshabilitar el cierre del diálogo al hacer clic en el fondo

    this.dialogRef.disableClose = true;

    // Verificar si es el último paso

    this.isLastStep = this.currentStep === this.totalSteps;

    console.log(
      'DatosDeLaMadreComponent - currentStep:',
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

      console.log('Datos restaurados del paso 4:', this.data.data);

      this.restoreMatSelectValues();
    }
  }

  private restoreMatSelectValues(): void {
    // Tipo de documento
    if (this.data?.data?.documentTypeCode && this.allIdentificationTypes.length > 0) {
      const docType = this.allIdentificationTypes.find(
        (t) => t.code === this.data.data.documentTypeCode,
      );
      if (docType) this.documentTypeCtrl.setValue(docType);
    }
  }

  private initForm(): FormGroup {
    return this.fb.group({
      // Datos de la Madre - Tipos según interface step4

      firstName: ['', [Validators.required, Validators.maxLength(100)]], // string

      middleName: ['', Validators.maxLength(100)], // string

      firstLastName: ['', [Validators.required, Validators.maxLength(100)]], // string

      secondLastName: ['', Validators.maxLength(100)], // string

      documentTypeCode: [''], // string | null

      documentNumber: ['', [Validators.required, Validators.maxLength(20)]], // string

      educationalLevelCode: [''], // string | null

      childrenNumber: [null, [Validators.required, Validators.min(0)]], // number
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

      console.log('Datos transformados del paso 4:', transformedData);

      console.log('Tipos de datos:');

      console.log('  firstName:', typeof transformedData.firstName, '=', transformedData.firstName);

      console.log(
        '  middleName:',
        typeof transformedData.middleName,
        '=',
        transformedData.middleName,
      );

      console.log(
        '  firstLastName:',
        typeof transformedData.firstLastName,
        '=',
        transformedData.firstLastName,
      );

      console.log(
        '  secondLastName:',
        typeof transformedData.secondLastName,
        '=',
        transformedData.secondLastName,
      );

      console.log(
        '  documentTypeCode:',
        typeof transformedData.documentTypeCode,
        '=',
        transformedData.documentTypeCode,
      );

      console.log(
        '  documentNumber:',
        typeof transformedData.documentNumber,
        '=',
        transformedData.documentNumber,
      );

      console.log(
        '  educationalLevelCode:',
        typeof transformedData.educationalLevelCode,
        '=',
        transformedData.educationalLevelCode,
      );

      console.log(
        '  childrenNumber:',
        typeof transformedData.childrenNumber,
        '=',
        transformedData.childrenNumber,
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

   * Transforma los datos del formulario al formato requerido por la interface step4

   * Asegura los tipos correctos: strings, string | null, y number

   */

  private transformFormData(): any {
    const formValue = this.form.getRawValue();

    return {
      // Strings - requeridos

      firstName: formValue.firstName || '',

      middleName: formValue.middleName || '',

      firstLastName: formValue.firstLastName || '',

      secondLastName: formValue.secondLastName || '',

      documentNumber: formValue.documentNumber || '',

      // String | null - opcionales

      documentTypeCode: formValue.documentTypeCode ?? null,

      educationalLevelCode: formValue.educationalLevelCode ?? null,

      // Number - requerido

      childrenNumber: this.parseNumber(formValue.childrenNumber),
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

    // También guarda los datos del paso 4 actual con tipos correctos

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
