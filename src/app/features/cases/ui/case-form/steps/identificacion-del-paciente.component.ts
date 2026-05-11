import { Component, Inject, OnDestroy, OnInit } from '@angular/core';

import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';

import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';

import { MatButtonModule } from '@angular/material/button';

import { MatIconModule } from '@angular/material/icon';

import { MatSelectModule } from '@angular/material/select';

import { MatOptionModule } from '@angular/material/core';

import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

import { CommonModule } from '@angular/common';

import { Subscription, combineLatest, BehaviorSubject } from 'rxjs';

import { MasterDataService, Province } from '../services/master-data.service';

export interface IdentificacionPacienteData {
  isEdit?: boolean;

  data?: any;

  currentStep?: number;

  totalSteps?: number;

  previousStepData?: any;
}

@Component({
  selector: 'app-identificacion-del-paciente',

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

  templateUrl: './identificacion-del-paciente.component.html',

  styleUrls: ['../shared/form-step-styles.scss'],
})
export class IdentificacionDelPacienteComponent implements OnInit, OnDestroy {
  form: FormGroup;

  isEdit = false;

  currentStep = 2;

  totalSteps = 7;

  isLastStep = false;

  private formSubscription: Subscription | undefined;

  // Datos maestros

  identificationTypes$!: any;

  countries$!: any;

  genders$!: any;

  ageUnits$!: any;

  occupations$!: any;

  healthInsuranceRegimes$!: any;

  ethnicities$!: any;

  strata$!: any;

  populationGroups$!: any;

  genderIdentities$!: any;

  sexualOrientations$!: any;

  areas$!: any;

  // Para datos dependientes

  provinces$ = new BehaviorSubject<Province[]>([]);

  cities$ = new BehaviorSubject<any[]>([]);

  // Arrays completos para filtrado

  allIdentificationTypes: any[] = [];

  allCountries: any[] = [];

  allProvinces: any[] = [];

  allCities: any[] = [];

  allOccupations: any[] = [];
  allPopulationGroups: any[] = [];
  allGenderIdentities: any[] = [];
  allSexualOrientations: any[] = [];
  allEthnicities: any[] = [];

  // Arrays filtrados

  filteredIdentificationTypes: any[] = [];

  filteredCountries: any[] = [];

  filteredProvinces: any[] = [];

  filteredCities: any[] = [];

  filteredOccupations: any[] = [];
  filteredPopulationGroups: any[] = [];

  // Controles para búsqueda

  identificationTypeFilterCtrl = new FormControl();

  nationalityFilterCtrl = new FormControl();

  countryFilterCtrl = new FormControl();

  provinceFilterCtrl = new FormControl();

  cityFilterCtrl = new FormControl();

  occupationFilterCtrl = new FormControl();

  populationGroupFilterCtrl = new FormControl();

  // Controles para mat-select

  identificationTypeCtrl = new FormControl();

  nationalityCtrl = new FormControl();

  countryCtrl = new FormControl();

  provinceCtrl = new FormControl();

  cityCtrl = new FormControl();

  occupationCtrl = new FormControl();

  populationGroupCtrl = new FormControl();

  // Objeto seleccionado para obtener el code real

  selectedProvince: Province | null = null;

  isGestanteSelected = false;
  showGenderIdentityOther = false;
  showSexualOrientationOther = false;
  showEthnicityOther = false;

  constructor(
    private fb: FormBuilder,

    private dialogRef: MatDialogRef<IdentificacionDelPacienteComponent>,

    @Inject(MAT_DIALOG_DATA) public data: IdentificacionPacienteData,

    private masterDataService: MasterDataService,
  ) {
    this.isEdit = data?.isEdit || false;

    this.currentStep = data?.currentStep || 2;

    this.totalSteps = data?.totalSteps || 7;

    this.form = this.initForm();

    this.dialogRef.disableClose = true;

    this.isLastStep = this.currentStep === this.totalSteps;

    // Inicializar observables

    this.identificationTypes$ = this.masterDataService.getIdentificationTypes();

    this.countries$ = this.masterDataService.getCountries();

    this.genders$ = this.masterDataService.getGenders();

    this.ageUnits$ = this.masterDataService.getAgeUnits();

    this.occupations$ = this.masterDataService.getOccupations();

    this.healthInsuranceRegimes$ = this.masterDataService.getHealthInsuranceRegimes();

    this.ethnicities$ = this.masterDataService.getEthnicities();

    this.strata$ = this.masterDataService.getStrata();

    this.populationGroups$ = this.masterDataService.getPopulationGroups();

    this.genderIdentities$ = this.masterDataService.getGenderIdentities();

    this.sexualOrientations$ = this.masterDataService.getSexualOrientations();

    this.areas$ = this.masterDataService.getAreas();

    this.setupFormSubscription();

    this.initializeMasterData();
  }

  private initializeMasterData(): void {
    // Tipo de documento
    this.identificationTypes$.subscribe((types: any[]) => {
      this.allIdentificationTypes = types || [];
      this.filteredIdentificationTypes = [...this.allIdentificationTypes];
    });
    this.identificationTypeFilterCtrl.valueChanges.subscribe((search: string) => {
      this.filteredIdentificationTypes = this.filterItems(search, this.allIdentificationTypes, 'name');
    });
    this.identificationTypeCtrl.valueChanges.subscribe((selected: any) => {
      this.form.patchValue({ identificationTypeCode: selected?.code || '' });
    });

    // Países (para nacionalidad y ubicación)
    this.countries$.subscribe((countries: any[]) => {
      this.allCountries = countries || [];
      this.filteredCountries = [...this.allCountries];
    });
    this.nationalityFilterCtrl.valueChanges.subscribe((search: string) => {
      this.filteredCountries = this.filterItems(search, this.allCountries, 'name');
    });
    this.countryFilterCtrl.valueChanges.subscribe((search: string) => {
      this.filteredCountries = this.filterItems(search, this.allCountries, 'name');
    });
    this.nationalityCtrl.valueChanges.subscribe((selected: any) => {
      this.form.patchValue({ nationalityCountryCode: selected?.code || '' });
    });
    this.countryCtrl.valueChanges.subscribe((selected: any) => {
      if (selected) {
        this.form.patchValue({ countryCode: selected?.code || '' });
        this.loadProvinces(selected.code);
        this.form.get('provinceCode')?.setValue('');
        this.form.get('cityCode')?.setValue('');
      }
    });

    // Ocupaciones
    this.occupations$.subscribe((occupations: any[]) => {
      this.allOccupations = occupations || [];
      this.filteredOccupations = [...this.allOccupations];
    });
    this.occupationFilterCtrl.valueChanges.subscribe((search: string) => {
      this.filteredOccupations = this.filterItems(search, this.allOccupations, 'name');
    });
    this.occupationCtrl.valueChanges.subscribe((selected: any) => {
      this.form.patchValue({ occupationCode: selected?.code || '' });
    });

    // Provincias y Ciudades - observar los BehaviorSubjects
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

    // Grupos poblacionales (selección múltiple)
    this.populationGroups$.subscribe((groups: any[]) => {
      this.allPopulationGroups = groups || [];
      this.filteredPopulationGroups = [...this.allPopulationGroups];
    });
    this.populationGroupFilterCtrl.valueChanges.subscribe((search: string) => {
      this.filteredPopulationGroups = this.filterItems(search, this.allPopulationGroups, 'name');
    });
    this.populationGroupCtrl.valueChanges.subscribe((selected: any[]) => {
      const codes = selected ? selected.map((s: any) => s.code) : [];
      this.form.patchValue({ populationGroupCode: codes });
    });
  }

  private filterItems(search: string, items: any[], field: string): any[] {
    if (!search || search.trim() === '') {
      return [...items];
    }
    const searchLower = search.toLowerCase().trim();
    return items.filter((item: any) =>
      item[field] && item[field].toLowerCase().includes(searchLower),
    );
  }

  private initForm(): FormGroup {
    return this.fb.group({
      // Identificación - string | null

      identificationTypeCode: ['', Validators.required],

      identificationNumber: ['', [Validators.required, Validators.maxLength(20)]],

      // Nombres - string

      firstName: ['', [Validators.required, Validators.maxLength(100)]],

      middleName: ['', Validators.maxLength(100)],

      firstLastName: ['', [Validators.required, Validators.maxLength(100)]],

      secondLastName: ['', Validators.maxLength(100)],

      // Contacto - string

      phoneNumber: ['', [Validators.required, Validators.maxLength(20)]],

      // Datos demográficos - Date y number

      birthDate: [null, Validators.required], // Será Date

      age: [null, [Validators.required, Validators.maxLength(3)]], // number

      ageUnitCode: ['', Validators.required], // string | null

      // Nacionalidad y género

      nationalityCountryCode: ['', Validators.required], // string | null

      genderCode: ['', Validators.required], // string | null

      genderIdentityCode: ['', Validators.required], // string | null

      genderIdentityOther: [''], // string

      sexualOrientationCode: ['', Validators.required], // string | null

      sexualOrientationOther: [''], // string

      // Ubicación

      countryCode: ['', Validators.required], // string | null

      provinceCode: ['', Validators.required], // string | null

      cityCode: ['', Validators.required], // string | null

      areaCode: ['', Validators.required], // string | null

      locality: ['', [Validators.required, Validators.maxLength(100)]], // string

      neighborhood: ['', [Validators.required, Validators.maxLength(100)]], // string

      populatedCenter: ['', [Validators.required, Validators.maxLength(100)]], // string

      ruralArea: ['', [Validators.required, Validators.maxLength(100)]], // string

      // Ocupación y salud

      occupationCode: ['', Validators.required], // string | null

      healthInsuranceRegimeCode: ['', Validators.required], // string | null

      benefitsPlanAdministratorName: ['', [Validators.required, Validators.maxLength(200)]], // string

      // Etnia y estrato

      ethnicityCode: ['', Validators.required], // string | null

      ethnicityOther: [''], // string

      stratumCode: ['', Validators.required], // string | null

      // Grupos poblacionales (selector múltiple)

      populationGroupCode: [[]], // array de strings

      populationGroupPregnantWeek: [null], // number | null
    });
  }

  ngOnInit(): void {
    // Asegurar que los datos maestros estén cargados

    this.masterDataService.refreshAllMasterData();

    if (this.data?.data) {
      console.log('Datos restaurados del paso 2:', this.data.data);

      // Cargar datos dependientes PRIMERO si hay país y provincia seleccionados

      if (this.data.data.countryCode) {
        this.loadProvinces(this.data.data.countryCode); // No convertir a Number
      }

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

      // Transformar y aplicar los datos DESPUÉS de cargar las listas

      const transformedData = this.transformDataForRestore(this.data.data);

      // Pequeño delay para asegurar que las listas se cargaron

      setTimeout(() => {
        this.form.patchValue(transformedData);

        console.log('Datos transformados para restaurar:', transformedData);

        // Restaurar valores en los controles de mat-select
        this.restoreMatSelectValues();
      }, 100);
    }

    this.setupDependentFields();
  }

  private restoreMatSelectValues(): void {
    // Tipo de documento
    if (this.data?.data?.identificationTypeCode && this.allIdentificationTypes.length > 0) {
      const type = this.allIdentificationTypes.find(
        (t) => t.code === this.data.data.identificationTypeCode,
      );
      if (type) this.identificationTypeCtrl.setValue(type);
    }

    // Nacionalidad
    if (this.data?.data?.nationalityCountryCode && this.allCountries.length > 0) {
      const country = this.allCountries.find(
        (c) => c.code === this.data.data.nationalityCountryCode,
      );
      if (country) this.nationalityCtrl.setValue(country);
    }

    // País
    if (this.data?.data?.countryCode && this.allCountries.length > 0) {
      const country = this.allCountries.find((c) => c.code === this.data.data.countryCode);
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

    // Ocupación
    if (this.data?.data?.occupationCode && this.allOccupations.length > 0) {
      const occupation = this.allOccupations.find(
        (o) => o.code === this.data.data.occupationCode,
      );
      if (occupation) this.occupationCtrl.setValue(occupation);
    }

    // Grupos poblacionales (selección múltiple)
    if (this.data?.data?.populationGroupCode && this.allPopulationGroups.length > 0) {
      const groupCodes = Array.isArray(this.data.data.populationGroupCode)
        ? this.data.data.populationGroupCode
        : [this.data.data.populationGroupCode];
      const selectedGroups = this.allPopulationGroups.filter((g) =>
        groupCodes.includes(g.code),
      );
      if (selectedGroups.length > 0) {
        this.populationGroupCtrl.setValue(selectedGroups);
        this.isGestanteSelected = groupCodes.includes('5');
      }
    }

    // Inicializar visibilidad de campos condicionales
    const ethnicityCode = this.form.get('ethnicityCode')?.value;
    const selectedEthnicity = this.allEthnicities.find((e: any) => e.code === ethnicityCode);
    this.showEthnicityOther = ethnicityCode === '8' ||
                              ethnicityCode?.toString()?.toLowerCase()?.includes('otro') ||
                              selectedEthnicity?.name?.toLowerCase()?.includes('otro');

    const genderIdentityCode = this.form.get('genderIdentityCode')?.value;
    const selectedIdentity = this.allGenderIdentities.find((g: any) => g.code === genderIdentityCode);
    const genderCodeStr = genderIdentityCode?.toString()?.toLowerCase() || '';
    const genderNameStr = selectedIdentity?.name?.toLowerCase() || '';
    this.showGenderIdentityOther = genderCodeStr === 'otro' || genderCodeStr === 'otra' ||
                                    genderNameStr.includes('otro') || genderNameStr.includes('otra');

    const sexualOrientationCode = this.form.get('sexualOrientationCode')?.value;
    const selectedOrientation = this.allSexualOrientations.find((s: any) => s.code === sexualOrientationCode);
    const orientCodeStr = sexualOrientationCode?.toString()?.toLowerCase() || '';
    const orientNameStr = selectedOrientation?.name?.toLowerCase() || '';
    this.showSexualOrientationOther = orientCodeStr === 'otro' || orientCodeStr === 'otra' ||
                                      orientNameStr.includes('otro') || orientNameStr.includes('otra');
  }

  private setupDependentFields(): void {
    // Cambio de país -> cargar provincias

    this.form.get('countryCode')?.valueChanges.subscribe((countryCode) => {
      console.log(
        'setupDependentFields - countryCode cambiado:',
        countryCode,
        'tipo:',
        typeof countryCode,
      );

      if (countryCode) {
        this.loadProvinces(countryCode); // No convertir a Number

        this.form.get('provinceCode')?.setValue('');

        this.form.get('cityCode')?.setValue('');
      }
    });

    // Cambio de provincia -> cargar ciudades

    this.form.get('provinceCode')?.valueChanges.subscribe((provinceId) => {
      console.log('setupDependentFields - provinceId cambiado:', provinceId);

      if (provinceId) {
        // Buscar la provincia seleccionada para obtener su code

        const province = this.provinces$.value.find((p) => p.id === Number(provinceId));

        this.selectedProvince = province || null;

        console.log('Provincia seleccionada:', this.selectedProvince);

        this.loadCities(Number(provinceId));

        this.form.get('cityCode')?.setValue('');
      }
    });

    // Cargar y almacenar etnias
    this.ethnicities$.subscribe((ethnicities: any[]) => {
      this.allEthnicities = ethnicities || [];
    });

    // Cambio de etnia -> mostrar/ocultar campo "otro"
    this.form.get('ethnicityCode')?.valueChanges.subscribe((ethnicityCode) => {
      const ethnicityOtherControl = this.form.get('ethnicityOther');
      // Verificar si es "otro" por código o nombre
      const selectedEthnicity = this.allEthnicities.find((e: any) => e.code === ethnicityCode);
      const isOther = ethnicityCode === '8' ||
                      ethnicityCode?.toString()?.toLowerCase()?.includes('otro') ||
                      selectedEthnicity?.name?.toLowerCase()?.includes('otro');
      this.showEthnicityOther = !!isOther;

      if (isOther) {
        ethnicityOtherControl?.setValidators(Validators.required);
      } else {
        ethnicityOtherControl?.clearValidators();
        ethnicityOtherControl?.setValue('');
      }
      ethnicityOtherControl?.updateValueAndValidity();
    });

    // Cargar y almacenar identidades de género
    this.genderIdentities$.subscribe((identities: any[]) => {
      this.allGenderIdentities = identities || [];
    });

    // Cambio de identidad de género -> campo "otro"
    this.form.get('genderIdentityCode')?.valueChanges.subscribe((genderIdentityCode) => {
      const genderIdentityOtherControl = this.form.get('genderIdentityOther');
      // Verificar si es "otro/otra" por código o nombre
      const selectedIdentity = this.allGenderIdentities.find((g: any) => g.code === genderIdentityCode);
      const codeStr = genderIdentityCode?.toString()?.toLowerCase().trim() || '';
      const nameStr = selectedIdentity?.name?.toLowerCase() || '';
      // Verificar código directamente o buscar en el nombre
      const isOther = codeStr === 'otro' || codeStr === 'otra' || codeStr.includes('otro') || codeStr.includes('otra') ||
                      nameStr.includes('otro') || nameStr.includes('otra');
      console.log('Gender identity changed:', genderIdentityCode, 'codeStr:', codeStr, 'nameStr:', nameStr, 'isOther:', isOther, 'allGenderIdentities:', this.allGenderIdentities);
      this.showGenderIdentityOther = !!isOther;

      if (isOther) {
        genderIdentityOtherControl?.setValidators(Validators.required);
      } else {
        genderIdentityOtherControl?.clearValidators();
        genderIdentityOtherControl?.setValue('');
      }
      genderIdentityOtherControl?.updateValueAndValidity();
    });

    // Cargar y almacenar orientaciones sexuales
    this.sexualOrientations$.subscribe((orientations: any[]) => {
      this.allSexualOrientations = orientations || [];
    });

    // Cambio de orientación sexual -> campo "otro"
    this.form.get('sexualOrientationCode')?.valueChanges.subscribe((sexualOrientationCode) => {
      const sexualOrientationOtherControl = this.form.get('sexualOrientationOther');
      // Verificar si es "otro/otra" por código o nombre
      const selectedOrientation = this.allSexualOrientations.find((s: any) => s.code === sexualOrientationCode);
      const codeStr = sexualOrientationCode?.toString()?.toLowerCase().trim() || '';
      const nameStr = selectedOrientation?.name?.toLowerCase() || '';
      // Verificar código directamente o buscar en el nombre
      const isOther = codeStr === 'otro' || codeStr === 'otra' || codeStr.includes('otro') || codeStr.includes('otra') ||
                      nameStr.includes('otro') || nameStr.includes('otra');
      console.log('Sexual orientation changed:', sexualOrientationCode, 'codeStr:', codeStr, 'nameStr:', nameStr, 'isOther:', isOther, 'allSexualOrientations:', this.allSexualOrientations);
      this.showSexualOrientationOther = !!isOther;

      if (isOther) {
        sexualOrientationOtherControl?.setValidators(Validators.required);
      } else {
        sexualOrientationOtherControl?.clearValidators();
        sexualOrientationOtherControl?.setValue('');
      }
      sexualOrientationOtherControl?.updateValueAndValidity();
    });

    // Cambio de grupos poblacionales -> mostrar/ocultar semanas de gestación
    this.form.get('populationGroupCode')?.valueChanges.subscribe((codes: string[]) => {
      this.isGestanteSelected = codes?.includes('5') || false;
      if (!this.isGestanteSelected) {
        this.form.get('populationGroupPregnantWeek')?.setValue(null);
      }
    });
  }

  private loadProvinces(countryId: string): void {
    this.masterDataService.getProvinces().subscribe(
      (provinces: any[]) => this.provinces$.next(provinces),

      (error: any) => {
        console.error('Error loading provinces:', error);

        this.provinces$.next([]);
      },
    );
  }

  private loadCities(provinceId: number): void {
    this.masterDataService.getCitiesByProvince(provinceId).subscribe(
      (cities) => this.cities$.next(cities),

      (error) => {
        console.error('Error loading cities:', error);

        this.cities$.next([]);
      },
    );
  }

  togglePopulationGroup(code: string): void {
    const currentValue = this.form.get('populationGroupCode')?.value || [];
    if (currentValue.includes(code)) {
      this.form
        .get('populationGroupCode')
        ?.setValue(currentValue.filter((c: string) => c !== code));
    } else {
      this.form.get('populationGroupCode')?.setValue([...currentValue, code]);
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

      birthDate: data.birthDate ? this.formatDateForInput(data.birthDate) : null,
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

   * Transforma los datos del formulario al formato requerido por la interface step2

   * Convierte strings a strings donde sea necesario y asegura los tipos correctos

   */

  private transformFormData(): any {
    const formValue = this.form.getRawValue();

    return {
      // Strings - mantener como están si son null/undefined

      identificationTypeCode: formValue.identificationTypeCode ?? null,

      identificationNumber: formValue.identificationNumber || '',

      firstName: formValue.firstName || '',

      middleName: formValue.middleName || '',

      firstLastName: formValue.firstLastName || '',

      secondLastName: formValue.secondLastName || '',

      phoneNumber: formValue.phoneNumber || '',

      // Date - convertir string a Date object

      birthDate: formValue.birthDate ? new Date(formValue.birthDate) : new Date(),

      // Number

      age: formValue.age ? Number(formValue.age) : 0,

      // String | null

      ageUnitCode: formValue.ageUnitCode ?? null,

      genderCode: formValue.genderCode ?? null,

      genderIdentityCode: formValue.genderIdentityCode ?? null,

      sexualOrientationCode: formValue.sexualOrientationCode ?? null,

      areaCode: formValue.areaCode ?? null,

      healthInsuranceRegimeCode: formValue.healthInsuranceRegimeCode ?? null,

      ethnicityCode: formValue.ethnicityCode ?? null,

      stratumCode: formValue.stratumCode ?? null,

      populationGroupCode: formValue.populationGroupCode || [],

      populationGroupPregnantWeek: formValue.populationGroupPregnantWeek || null,

      // Strings

      genderIdentityOther: formValue.genderIdentityOther || '',

      sexualOrientationOther: formValue.sexualOrientationOther || '',

      locality: formValue.locality || '',

      neighborhood: formValue.neighborhood || '',

      populatedCenter: formValue.populatedCenter || '',

      ruralArea: formValue.ruralArea || '',

      benefitsPlanAdministratorName: formValue.benefitsPlanAdministratorName || '',

      ethnicityOther: formValue.ethnicityOther || '',

      // Strings | null - mantener como strings

      nationalityCountryCode: formValue.nationalityCountryCode ?? null,

      countryCode: formValue.countryCode ?? null,

      provinceCode: this.selectedProvince?.code ?? formValue.provinceCode ?? null,

      cityCode: formValue.cityCode ?? null,

      occupationCode: formValue.occupationCode ?? null,
    };
  }

  saveForm(): void {
    if (this.form.valid) {
      const transformedData = this.transformFormData();

      console.log('Datos transformados a enviar:', transformedData);

      console.log('Tipos de datos:');

      console.log('  age:', typeof transformedData.age, '=', transformedData.age);

      console.log(
        '  nationalityCountryCode:',
        typeof transformedData.nationalityCountryCode,
        '=',
        transformedData.nationalityCountryCode,
      );

      console.log(
        '  countryCode:',
        typeof transformedData.countryCode,
        '=',
        transformedData.countryCode,
      );

      console.log(
        '  provinceCode:',
        typeof transformedData.provinceCode,
        '=',
        transformedData.provinceCode,
      );

      console.log('  cityCode:', typeof transformedData.cityCode, '=', transformedData.cityCode);

      console.log(
        '  occupationCode:',
        typeof transformedData.occupationCode,
        '=',
        transformedData.occupationCode,
      );

      console.log('  birthDate:', typeof transformedData.birthDate, '=', transformedData.birthDate);

      this.dialogRef.close({
        action: 'next',

        stepData: transformedData,
      });
    } else {
      console.log('Formulario inválido:', this.form.errors);

      this.form.markAllAsTouched();
    }
  }

  cancelForm(): void {
    this.dialogRef.close();
  }

  goBack(): void {
    const transformedData = this.transformFormData();

    this.dialogRef.close({
      action: 'back',

      previousStepData: this.data?.previousStepData,

      currentStepData: transformedData,
    });
  }

  private setupFormSubscription(): void {
    this.formSubscription = combineLatest([
      this.form.get('identificationTypeCode')?.valueChanges || [],

      this.form.get('identificationNumber')?.valueChanges || [],

      this.form.get('firstName')?.valueChanges || [],

      this.form.get('firstLastName')?.valueChanges || [],

      this.form.get('phoneNumber')?.valueChanges || [],

      this.form.get('birthDate')?.valueChanges || [],

      this.form.get('age')?.valueChanges || [],

      this.form.get('nationalityCountryCode')?.valueChanges || [],

      this.form.get('genderCode')?.valueChanges || [],

      this.form.get('countryCode')?.valueChanges || [],

      this.form.get('provinceCode')?.valueChanges || [],

      this.form.get('cityCode')?.valueChanges || [],

      this.form.get('areaCode')?.valueChanges || [],

      this.form.get('locality')?.valueChanges || [],

      this.form.get('neighborhood')?.valueChanges || [],

      this.form.get('populatedCenter')?.valueChanges || [],

      this.form.get('ruralArea')?.valueChanges || [],

      this.form.get('occupationCode')?.valueChanges || [],

      this.form.get('healthInsuranceRegimeCode')?.valueChanges || [],

      this.form.get('benefitsPlanAdministratorName')?.valueChanges || [],

      this.form.get('ethnicityCode')?.valueChanges || [],

      this.form.get('stratumCode')?.valueChanges || [],

      this.form.get('populationGroupCode')?.valueChanges || [],
    ]).subscribe(() => {
      console.log('Formulario válido:', this.form.valid);

      console.log('Valores actuales:', this.form.value);
    });
  }

  ngOnDestroy(): void {
    if (this.formSubscription) {
      this.formSubscription.unsubscribe();
    }
  }
}
