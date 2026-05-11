import { Component, Inject, OnDestroy } from '@angular/core';

import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormControl,
} from '@angular/forms';

import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';

import { MatButtonModule } from '@angular/material/button';

import { MatIconModule } from '@angular/material/icon';

import { CommonModule } from '@angular/common';

import { Subscription } from 'rxjs';

import { MasterDataService } from '../services/master-data.service';

import { MatSelectModule } from '@angular/material/select';

import { MatOptionModule } from '@angular/material/core';

import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

export interface DatosInformacionGeneralData {
  isEdit?: boolean;

  data?: any;

  currentStep?: number;

  totalSteps?: number;
}

@Component({
  selector: 'app-datos-informacion-general',

  standalone: true,

  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    CommonModule,
    MatSelectModule,
    MatOptionModule,
    NgxMatSelectSearchModule,
  ],

  templateUrl: './datos-informacion-general.component.html',

  styleUrls: ['../shared/form-step-styles.scss'],
})
export class DatosInformacionGeneralComponent implements OnDestroy {
  form: FormGroup;

  isEdit = false;

  currentStep = 1;

  totalSteps = 9;

  isLastStep = false;

  private formSubscription: Subscription | undefined;

  // Datos maestros

  events$!: any;

  public allEvents: any[] = [];

  public filteredEvents: any[] = [];

  public eventCtrl: FormControl = new FormControl();

  public eventFilterCtrl: FormControl = new FormControl();

  constructor(
    private fb: FormBuilder,

    private dialogRef: MatDialogRef<DatosInformacionGeneralComponent>,

    @Inject(MAT_DIALOG_DATA) public data: DatosInformacionGeneralData,

    private masterDataService: MasterDataService,
  ) {
    this.isEdit = data?.isEdit || false;

    this.currentStep = data?.currentStep || 1;

    this.totalSteps = data?.totalSteps || 7;

    this.form = this.initForm();

    // Deshabilitar el cierre del diálogo al hacer clic en el fondo

    this.dialogRef.disableClose = true;

    // Verificar si es el último paso

    this.isLastStep = this.currentStep === this.totalSteps;

    // Inicializar datos maestros

    this.initializeMasterData();

    // Suscribirse a cambios en los campos

    this.setupFormSubscription();
  }

  private initForm(): FormGroup {
    return this.fb.group({
      upgdCode: ['', [Validators.required, Validators.maxLength(20)]],

      upgdName: ['', [Validators.required, Validators.maxLength(128)]],

      eventCode: ['', Validators.required],

      notificationDate: [null, Validators.required], // Será Date object
    });
  }

  private initializeMasterData(): void {
    // Inicializar observables de datos maestros

    this.events$ = this.masterDataService.getEvents();

    this.events$.subscribe((events: any[]) => {
      this.allEvents = events;

      this.filteredEvents = [...events];
    });

    // Set up filtering

    this.eventFilterCtrl.valueChanges.subscribe((search: string) => {
      this.filteredEvents = this.filterEvents(search);
    });

    // Update form when event selection changes

    this.eventCtrl.valueChanges.subscribe((selectedEvent: any) => {
      if (selectedEvent) {
        this.form.patchValue({ eventCode: selectedEvent.code });
      } else {
        this.form.patchValue({ eventCode: '' });
      }
    });
  }

  private filterEvents(search: string): any[] {
    if (!search || search.trim() === '') {
      return [...this.allEvents];
    }

    const searchLower = search.toLowerCase().trim();

    return this.allEvents.filter(
      (event: any) =>
        (event.name && event.name.toLowerCase().includes(searchLower)) ||
        (event.code && event.code.toString().toLowerCase().includes(searchLower)),
    );
  }

  ngOnInit(): void {
    // Solo cargar datos existentes si hay, sin datos quemados por defecto

    if (this.data?.data) {
      const transformedData = this.transformDataForRestore(this.data.data);

      this.form.patchValue(transformedData);

      console.log('Datos restaurados:', this.data.data);

      console.log('Datos transformados para restaurar:', transformedData);
    }

    // Esperar a que los eventos se carguen y luego verificar si hay que seleccionar uno

    this.events$.subscribe((events: any[]) => {
      if (events && events.length > 0 && this.data?.data?.eventCode) {
        const eventCodeToSelect = this.data.data.eventCode;

        const eventExists = events.find((event: any) => event.code === eventCodeToSelect);

        if (eventExists) {
          console.log('Evento encontrado:', eventExists);

          this.form.patchValue({ eventCode: eventCodeToSelect });

          this.eventCtrl.setValue(eventExists);
        } else {
          console.log('Evento no encontrado con código:', eventCodeToSelect);

          console.log('Eventos disponibles:', events);
        }
      }
    });
  }

  saveForm(): void {
    console.log('=== DEPURACIÓN SAVE FORM ===');

    console.log('Formulario válido:', this.form.valid);

    console.log('Valores del formulario:', this.form.value);

    console.log('Controles del formulario:', Object.keys(this.form.controls));

    if (this.form.valid) {
      const transformedData = this.transformFormData();

      console.log('Datos transformados que se enviarán:', transformedData);

      console.log('Tipo de notificationDate:', typeof transformedData.notificationDate);

      this.dialogRef.close({
        action: 'next',

        stepData: transformedData,
      });
    } else {
      console.log('Formulario inválido. Errores:', this.form.errors);

      Object.keys(this.form.controls).forEach((key) => {
        const control = this.form.get(key);

        console.log(
          `Campo ${key}:`,
          control?.value,
          'válido:',
          control?.valid,
          'errores:',
          control?.errors,
        );
      });
    }
  }

  /**

   * Transforma los datos guardados al formato que espera el formulario al restaurar

   * Convierte Date objects a formato yyyy-MM-dd para el input date de HTML

   */

  private transformDataForRestore(data: any): any {
    return {
      ...data,

      // Convertir Date object a formato yyyy-MM-dd para el input date

      notificationDate: data.notificationDate
        ? this.formatDateForInput(data.notificationDate)
        : null,
    };
  }

  /**

   * Formatea una fecha al formato yyyy-MM-dd esperado por el input date de HTML

   */

  private formatDateForInput(date: any): string | null {
    if (!date) return null;

    // Si ya es un string en formato correcto, retornarlo

    if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }

    // Convertir a Date si no lo es

    const dateObj = date instanceof Date ? date : new Date(date);

    // Verificar si es una fecha válida

    if (isNaN(dateObj.getTime())) {
      return null;
    }

    // Formatear a yyyy-MM-dd

    const year = dateObj.getFullYear();

    const month = String(dateObj.getMonth() + 1).padStart(2, '0');

    const day = String(dateObj.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  /**

   * Transforma los datos del formulario al formato requerido por la interface step1

   * Convierte notificationDate a Date object

   */

  private transformFormData(): any {
    const formValue = this.form.getRawValue();

    return {
      upgdCode: formValue.upgdCode || '',

      upgdName: formValue.upgdName || '',

      eventCode: formValue.eventCode || '',

      notificationDate: this.parseDate(formValue.notificationDate), // Convertir a Date
    };
  }

  /**

   * Helper para convertir valores a Date

   * Maneja strings, Date objects y valores null/undefined

   */

  private parseDate(value: any): Date {
    if (!value) {
      return new Date(); // Por defecto, fecha actual si no hay valor
    }

    if (value instanceof Date) {
      return value;
    }

    const date = new Date(value);

    return isNaN(date.getTime()) ? new Date() : date;
  }

  cancelForm(): void {
    this.dialogRef.close();
  }

  goBack(): void {
    this.dialogRef.close({
      action: 'back',

      currentStepData: this.form.value,
    });
  }

  private setupFormSubscription(): void {
    this.formSubscription = this.form.valueChanges.subscribe((changes) => {
      console.log('Formulario válido:', this.form.valid);

      console.log('Valores:', changes);
    });
  }

  ngOnDestroy(): void {
    if (this.formSubscription) {
      this.formSubscription.unsubscribe();
    }
  }
}
