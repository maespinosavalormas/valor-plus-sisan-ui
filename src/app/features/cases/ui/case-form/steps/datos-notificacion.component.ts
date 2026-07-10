import { Component, Inject, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { CommonModule } from '@angular/common';
import { Subscription, BehaviorSubject } from 'rxjs';
import { MasterDataService, Province } from '../services/master-data.service';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';

export interface DatosNotificacionData {
  isEdit?: boolean;
  data?: any;
  currentStep?: number;
  totalSteps?: number;
  previousStepData?: any;
}

@Component({
  selector: 'app-datos-notificacion',
  standalone: true,
  imports: [ReactiveFormsModule, MatDialogModule, MatButtonModule, MatIconModule, MatSelectModule, MatOptionModule, NgxMatSelectSearchModule, CommonModule],
  templateUrl: './datos-notificacion.component.html',
  styleUrls: ['../shared/form-step-styles.scss'],
})
export class DatosNotificacionComponent implements OnDestroy {
  form: FormGroup;
  isEdit = false;
  currentStep = 1;
  totalSteps = 9;
  isLastStep = false;
  private formSubscription: Subscription | undefined;

  // Datos maestros
  notificationSources$!: any;
  countries$!: any;
  provinces$!: BehaviorSubject<Province[]>;
  cities$!: any;
  initialClassifications$!: any;
  finalConditions$!: any;
  deathCauses$!: any;

  // FormControls para mat-select con búsqueda
  countryCtrl = new FormControl();
  provinceCtrl = new FormControl();
  cityCtrl = new FormControl();
  deathCauseCtrl = new FormControl();

  // FormControls para filtrado
  countryFilterCtrl = new FormControl();
  provinceFilterCtrl = new FormControl();
  cityFilterCtrl = new FormControl();
  deathCauseFilterCtrl = new FormControl();

  // Arrays completos para filtrado
  allCountries: any[] = [];
  allProvinces: any[] = [];
  allCities: any[] = [];
  allDeathCauses: any[] = [];

  // Arrays filtrados
  filteredCountries: any[] = [];
  filteredProvinces: any[] = [];
  filteredCities: any[] = [];
  filteredDeathCauses: any[] = [];

  // Objeto seleccionado para obtener el code real
  selectedProvince: Province | null = null;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<DatosNotificacionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DatosNotificacionData,
    private masterDataService: MasterDataService,
  ) {
    this.isEdit = data?.isEdit || false;
    this.currentStep = data?.currentStep || 3;
    this.totalSteps = data?.totalSteps || 7;
    this.form = this.initForm();
    this.dialogRef.disableClose = true;
    this.isLastStep = this.currentStep === this.totalSteps;
    this.initializeMasterData();
  }

  private initForm(): FormGroup {
    return this.fb.group({
      notificationSourceCode: ['', Validators.required],
      countryCode: ['', Validators.required],
      provinceCode: ['', Validators.required],
      cityCode: ['', Validators.required],
      address: ['', [Validators.required, Validators.maxLength(200)]],
      consultationDate: [null, Validators.required],
      initialSymptomsDate: [null, Validators.required],
      initialClasificationCode: ['', Validators.required],
      hospitalizedCode: ['', Validators.required],
      hospitalizedDate: [null],
      finalConditionCode: ['', Validators.required],
      deathDate: [null],
      deathCertificateNumber: [''],
      deathCauseCode: [''],
      professionalName: ['', [Validators.required, Validators.maxLength(100)]],
      professionalPhoneNumber: ['', [Validators.required, Validators.maxLength(20)]],
    });
  }

  private initializeMasterData(): void {
    this.notificationSources$ = this.masterDataService.getNotificationSources();
    this.countries$ = this.masterDataService.getCountries();
    this.initialClassifications$ = this.masterDataService.getInitialClassifications();
    this.finalConditions$ = this.masterDataService.getFinalConditions();
    this.deathCauses$ = this.masterDataService.getDiagnostics();
    this.provinces$ = new BehaviorSubject<Province[]>([]);
    this.cities$ = new BehaviorSubject<any[]>([]);

    // Países
    this.countries$.subscribe((countries: any[]) => {
      this.allCountries = countries || [];
      this.filteredCountries = [...this.allCountries];
    });
    this.countryFilterCtrl.valueChanges.subscribe((search: string) => {
      this.filteredCountries = this.filterItems(search, this.allCountries, 'name');
    });
    this.countryCtrl.valueChanges.subscribe((selected: any) => {
      this.form.patchValue({ countryCode: selected?.code || '' });
    });

    // Provincias
    this.provinces$.subscribe((provinces: any[]) => {
      this.allProvinces = provinces || [];
      this.filteredProvinces = [...this.allProvinces];
    });
    this.provinceFilterCtrl.valueChanges.subscribe((search: string) => {
      this.filteredProvinces = this.filterItems(search, this.allProvinces, 'name');
    });
    this.provinceCtrl.valueChanges.subscribe((selected: any) => {
      if (selected) {
        this.form.patchValue({ provinceCode: String(selected.id) || '' });
        this.loadCities(selected.id);
        this.form.get('cityCode')?.setValue('');
      }
    });

    // Ciudades
    this.cities$.subscribe((cities: any[]) => {
      this.allCities = cities || [];
      this.filteredCities = [...this.allCities];
    });
    this.cityFilterCtrl.valueChanges.subscribe((search: string) => {
      this.filteredCities = this.filterItems(search, this.allCities, 'name');
    });
    this.cityCtrl.valueChanges.subscribe((selected: any) => {
      this.form.patchValue({ cityCode: selected?.code || '' });
    });

    // Causas de muerte
    this.deathCauses$.subscribe((deathCauses: any[]) => {
      this.allDeathCauses = deathCauses || [];
      this.filteredDeathCauses = [...this.allDeathCauses];
    });
    this.deathCauseFilterCtrl.valueChanges.subscribe((search: string) => {
      this.filteredDeathCauses = this.filterItems(search, this.allDeathCauses, 'name');
    });
    this.deathCauseCtrl.valueChanges.subscribe((selected: any) => {
      this.form.patchValue({ deathCauseCode: selected?.code || '' });
    });
  }

  private filterItems(search: string, items: any[], field: string): any[] {
    if (!search) return items;
    const searchLower = search.toLowerCase();
    return items.filter((item) =>
      item[field]?.toLowerCase().includes(searchLower)
    );
  }

  ngOnInit(): void {
    this.masterDataService.refreshAllMasterData();

    if (this.data?.data) {
      if (this.data.data.countryCode) {
        this.loadProvinces(this.data.data.countryCode);
      }
      // Esperar a que las provincias carguen para encontrar el id correcto
      if (this.data.data.provinceCode) {
        this.provinces$.subscribe((provinces) => {
          if (provinces.length > 0) {
            // Buscar provincia por código DANE (ej: "05")
            const province = provinces.find((p) => p.code === this.data.data.provinceCode);
            if (province) {
              this.selectedProvince = province;
              console.log('Provincia restaurada:', this.selectedProvince);
              this.loadCities(province.id);
              // Actualizar el formulario con el ID, no el code
              this.form.patchValue({ provinceCode: String(province.id) });
            }
          }
        });
      }
      const transformedData = this.transformDataForRestore(this.data.data);
      setTimeout(() => {
        this.form.patchValue(transformedData);
        this.restoreMatSelectValues();
      }, 100);
    }
    this.setupDependentFields();
  }

  private setupDependentFields(): void {
    this.form.get('countryCode')?.valueChanges.subscribe((countryCode) => {
      if (countryCode) {
        this.loadProvinces(countryCode);
        this.form.get('provinceCode')?.setValue('');
        this.form.get('cityCode')?.setValue('');
      }
    });

    this.form.get('provinceCode')?.valueChanges.subscribe((provinceId) => {
      if (provinceId) {
        // Buscar la provincia seleccionada para obtener su code
        const province = this.provinces$.value.find((p) => p.id === Number(provinceId));
        this.selectedProvince = province || null;
        console.log('Provincia seleccionada:', this.selectedProvince);
        this.loadCities(Number(provinceId));
        this.form.get('cityCode')?.setValue('');
      }
    });

    this.form.get('finalConditionCode')?.valueChanges.subscribe((finalConditionCode) => {
      const isDeathCondition = ['2', '3'].includes(finalConditionCode);
      const deathFields = ['deathDate', 'deathCertificateNumber', 'deathCauseCode'];
      deathFields.forEach((field) => {
        const control = this.form.get(field);
        if (isDeathCondition) {
          control?.setValidators(Validators.required);
        } else {
          control?.clearValidators();
          control?.setValue(null);
        }
        control?.updateValueAndValidity();
      });
    });
  }

  private loadProvinces(countryCode: string): void {
    this.masterDataService.getProvinces().subscribe(
      (provinces: Province[]) => this.provinces$.next(provinces),
      (error: any) => {
        console.error('Error loading provinces:', error);
        this.provinces$.next([]);
      },
    );
  }

  private loadCities(provinceId: number): void {
    this.masterDataService.getCitiesByProvince(provinceId).subscribe(
      (cities: any[]) => this.cities$.next(cities),
      (error: any) => {
        console.error('Error loading cities:', error);
        this.cities$.next([]);
      },
    );
  }

  private restoreMatSelectValues(): void {
    // País
    if (this.data?.data?.countryCode && this.allCountries.length > 0) {
      const country = this.allCountries.find(
        (c) => c.code === this.data.data.countryCode,
      );
      if (country) this.countryCtrl.setValue(country);
    }

    // Provincia - necesita que las provincias estén cargadas
    if (this.data?.data?.provinceCode && this.allProvinces.length > 0) {
      const province = this.allProvinces.find(
        (p) => String(p.id) === String(this.data.data.provinceCode),
      );
      if (province) this.provinceCtrl.setValue(province);
    }

    // Ciudad - necesita que las ciudades estén cargadas
    if (this.data?.data?.cityCode && this.allCities.length > 0) {
      const city = this.allCities.find((c) => c.code === this.data.data.cityCode);
      if (city) this.cityCtrl.setValue(city);
    }

    // Causa de muerte
    if (this.data?.data?.deathCauseCode && this.allDeathCauses.length > 0) {
      const deathCause = this.allDeathCauses.find(
        (d) => d.code === this.data.data.deathCauseCode,
      );
      if (deathCause) this.deathCauseCtrl.setValue(deathCause);
    }
  }

  private transformFormData(): any {
    const formValue = this.form.getRawValue();
    return {
      notificationSourceCode: formValue.notificationSourceCode ?? null,
      initialClasificationCode: formValue.initialClasificationCode ?? null,
      finalConditionCode: formValue.finalConditionCode ?? null,
      countryCode: formValue.countryCode ?? null,
      provinceCode: this.selectedProvince?.code ?? formValue.provinceCode ?? null,
      cityCode: formValue.cityCode ?? null,
      deathCauseCode: formValue.deathCauseCode ?? null,
      address: formValue.address || '',
      deathCertificateNumber: formValue.deathCertificateNumber || '',
      professionalName: formValue.professionalName || '',
      professionalPhoneNumber: formValue.professionalPhoneNumber || '',
      consultationDate: this.parseDate(formValue.consultationDate),
      initialSymptomsDate: this.parseDate(formValue.initialSymptomsDate),
      hospitalizedDate: this.parseDate(formValue.hospitalizedDate),
      deathDate: this.parseDate(formValue.deathDate),
      hospitalizedCode: formValue.hospitalizedCode || '2',
    };
  }

  private parseDate(value: any): Date {
    if (!value) return new Date();
    if (value instanceof Date) return value;
    const date = new Date(value);
    return isNaN(date.getTime()) ? new Date() : date;
  }

  private transformDataForRestore(data: any): any {
    return {
      ...data,
      consultationDate: data.consultationDate
        ? this.formatDateForInput(data.consultationDate)
        : null,
      initialSymptomsDate: data.initialSymptomsDate
        ? this.formatDateForInput(data.initialSymptomsDate)
        : null,
      hospitalizedDate: data.hospitalizedDate
        ? this.formatDateForInput(data.hospitalizedDate)
        : null,
      deathDate: data.deathDate ? this.formatDateForInput(data.deathDate) : null,
    };
  }

  private formatDateForInput(date: any): string | null {
    if (!date) return null;
    if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) return null;
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  saveForm(): void {
    if (this.form.valid) {
      const transformedData = this.transformFormData();
      this.dialogRef.close({
        action: 'next',
        stepData: transformedData,
        currentStepData: this.form.getRawValue(),
      });
    } else {
      this.form.markAllAsTouched();
    }
  }

  cancelForm(): void {
    this.dialogRef.close('cancel');
  }

  goBack(): void {
    this.dialogRef.close({
      action: 'back',
      currentStepData: this.form.getRawValue(),
    });
  }

  ngOnDestroy(): void {
    if (this.formSubscription) {
      this.formSubscription.unsubscribe();
    }
  }
}
