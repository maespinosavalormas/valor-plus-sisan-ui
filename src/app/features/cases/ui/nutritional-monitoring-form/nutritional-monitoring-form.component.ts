import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialog,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface NutritionalMonitoringDialogData {
  isEdit?: boolean;
  monitoringData?: any;
}

export interface SignosEnfermedad {
  problemasOido: boolean;
  fiebre: boolean;
  dolorAbdominal: boolean;
  dolorGarganta: boolean;
  lesionesCutaneas: boolean;
  era: boolean;
  dolorCabeza: boolean;
  diarrea: boolean;
  sintomasVisuales: boolean;
  sintomasUrinarios: boolean;
  dolorExtremidades: boolean;
  noPresenta: boolean;
}

export interface FrecuenciaEnfermedad {
  enfermaConFrecuencia: boolean;
  cualTiene: string[];
}

@Component({
  standalone: true,
  selector: 'app-nutritional-monitoring-form',
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './nutritional-monitoring-form.component.html',
  styleUrl: './nutritional-monitoring-form.component.scss'
})
export class NutritionalMonitoringFormComponent implements OnInit {
  form: FormGroup;
  isEditing = false;
  today: string = new Date().toISOString().split('T')[0];

  // Opciones para los desplegables
  clasificacionEstadoNutricionalOptions = [
    'Adecuado',
    'Desnutricion aguda moderada',
    'Desnutricion aguda severa',
    'Desnutricion cronica'
  ];

  signosEnfermedadOptions = [
    { value: 'problemasOido', label: 'Problemas de oído' },
    { value: 'fiebre', label: 'Fiebre' },
    { value: 'dolorAbdominal', label: 'Dolor abdominal' },
    { value: 'dolorGarganta', label: 'Dolor de garganta' },
    { value: 'lesionesCutaneas', label: 'Lesiones cutáneas' },
    { value: 'era', label: 'ERA' },
    { value: 'dolorCabeza', label: 'Dolor de cabeza' },
    { value: 'diarrea', label: 'Diarrea' },
    { value: 'sintomasVisuales', label: 'Síntomas Visuales/Oculares' },
    { value: 'sintomasUrinarios', label: 'Síntomas Urinarios' },
    { value: 'dolorExtremidades', label: 'Dolor en extremidades' },
    { value: 'noPresenta', label: 'No Presenta' }
  ];

  cualTieneOptions = [
    'Sintomas Respiratorios',
    'Dermatitis',
    'Dolor Abdominal',
    'Convulsiones',
    'Dolor de Cabeza',
    'Vomito',
    'Dolores Osteoarticulares',
    'Sangrados',
    'Dolor Toracico',
    'Sintomas Visuales/Oculares'
  ];

  // Opciones para los nuevos campos
  siNoDesconocidoOptions = ['si', 'no', 'desconocido'];

  tipoLimitacionOptions = [
    'motora',
    'auditiva',
    'visual',
    'cognitiva',
    'mental',
    'multiple',
    'sordoceguera'
  ];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<NutritionalMonitoringFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: NutritionalMonitoringDialogData
  ) {
    this.form = this.fb.group({
      fechaMonitoreo: [new Date().toISOString().split('T')[0], [Validators.required]],
      tallaEdad: ['', [Validators.required]],
      pc: ['', [Validators.required]],
      pesoTalla: ['', [Validators.required]],
      imcEdad: ['', [Validators.required]],
      clasificacionEstadoNutricional: ['', [Validators.required]],
      signosEnfermedadActualMultiple: [[]],
      enfermaConFrecuencia: ['no', [Validators.required]],
      cualTiene: [[]],
      hospitalizaciones: ['desconocido', [Validators.required]],
      cirugias: ['desconocido', [Validators.required]],
      tomaMedicamentos: ['desconocido', [Validators.required]],
      cualMedicamento: [''],
      limitacionDiscapacidad: ['desconocido', [Validators.required]],
      tipoLimitacion: [''],
      observacion: ['']
    });
  }

  ngOnInit(): void {
    if (this.data?.monitoringData) {
      this.isEditing = true;
      this.form.patchValue(this.data.monitoringData);
    }

    // Escuchar cambios en el campo enfermaConFrecuencia
    this.form.get('enfermaConFrecuencia')?.valueChanges.subscribe(value => {
      if (value === 'no') {
        this.form.get('cualTiene')?.setValue([]);
      }
    });

    // Escuchar cambios en los signos de enfermedad para manejar la exclusión mutua
    this.form.get('signosEnfermedadActualMultiple')?.valueChanges.subscribe((selectedValues: string[]) => {
      if (selectedValues.includes('noPresenta') && selectedValues.length > 1) {
        // Si se selecciona "No Presenta" junto con otros, mantener solo "No Presenta"
        this.form.get('signosEnfermedadActualMultiple')?.setValue(['noPresenta']);
      } else if (selectedValues.includes('noPresenta')) {
        // Si solo se selecciona "No Presenta", dejarlo así
        // No hacer nada adicional
      } else if (selectedValues.length > 0) {
        // Si se seleccionan otras opciones, asegurarse de que "No Presenta" no esté incluido
        const filteredValues = selectedValues.filter(value => value !== 'noPresenta');
        if (filteredValues.length !== selectedValues.length) {
          this.form.get('signosEnfermedadActualMultiple')?.setValue(filteredValues);
        }
      }
    });

    // Escuchar cambios en tomaMedicamentos
    this.form.get('tomaMedicamentos')?.valueChanges.subscribe(value => {
      if (value !== 'si') {
        this.form.get('cualMedicamento')?.setValue('');
      }
    });

    // Escuchar cambios en limitacionDiscapacidad
    this.form.get('limitacionDiscapacidad')?.valueChanges.subscribe(value => {
      if (value !== 'si') {
        this.form.get('tipoLimitacion')?.setValue('');
      }
    });
  }

  onSave(): void {
    if (this.form.valid) {
      const formData = this.form.value;
      
      // Convertir los datos del multi-select al formato esperado
      const monitoringData = {
        ...formData,
        signosEnfermedadActual: this.convertMultiSelectToSignosObject(formData.signosEnfermedadActualMultiple),
        id: this.isEditing ? this.data.monitoringData.id : Date.now()
      };
      
      this.dialogRef.close(monitoringData);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  // Getters para fácil acceso en el template
  get fechaMonitoreo() { return this.form.get('fechaMonitoreo'); }
  get tallaEdad() { return this.form.get('tallaEdad'); }
  get pc() { return this.form.get('pc'); }
  get pesoTalla() { return this.form.get('pesoTalla'); }
  get imcEdad() { return this.form.get('imcEdad'); }
  get clasificacionEstadoNutricional() { return this.form.get('clasificacionEstadoNutricional'); }
  get enfermaConFrecuencia() { return this.form.get('enfermaConFrecuencia'); }
  get signosEnfermedadActualMultiple() { return this.form.get('signosEnfermedadActualMultiple'); }
  get cualTiene() { return this.form.get('cualTiene'); }
  get hospitalizaciones() { return this.form.get('hospitalizaciones'); }
  get cirugias() { return this.form.get('cirugias'); }
  get tomaMedicamentos() { return this.form.get('tomaMedicamentos'); }
  get cualMedicamento() { return this.form.get('cualMedicamento'); }
  get limitacionDiscapacidad() { return this.form.get('limitacionDiscapacidad'); }
  get tipoLimitacion() { return this.form.get('tipoLimitacion'); }
  get observacion() { return this.form.get('observacion'); }

  // Método para convertir el array del multi-select al formato de objeto esperado
  convertMultiSelectToSignosObject(selectedValues: string[]): SignosEnfermedad {
    const signosObject: SignosEnfermedad = {
      problemasOido: false,
      fiebre: false,
      dolorAbdominal: false,
      dolorGarganta: false,
      lesionesCutaneas: false,
      era: false,
      dolorCabeza: false,
      diarrea: false,
      sintomasVisuales: false,
      sintomasUrinarios: false,
      dolorExtremidades: false,
      noPresenta: false
    };

    selectedValues.forEach(value => {
      if (signosObject.hasOwnProperty(value)) {
        (signosObject as any)[value] = true;
      }
    });

    return signosObject;
  }
}
