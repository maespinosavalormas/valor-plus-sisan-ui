import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

export interface MasterDataItem {
  code: string;
  name: string;
}

// Interfaces para elementos con IDs numéricos
export interface NumericMasterDataItem {
  id: number;
  code: string;
  name: string;
}

// Interfaz específica para Provincias
export interface Province extends NumericMasterDataItem {
  id: number;
  code: string;
  name: string;
}

export interface IdentificationType extends MasterDataItem {
  code: string;
  requiresDigits?: number;
}

export interface Country extends NumericMasterDataItem {
  code: string;
  nationality?: string;
}

export interface Gender extends MasterDataItem {
  code: string;
}

export interface AgeUnit extends MasterDataItem {
  code: string;
}

export interface Occupation extends NumericMasterDataItem {
  code: string;
}

export interface EducationalLevel extends MasterDataItem {
  code: string;
}

export interface AppetiteTestResult extends MasterDataItem {
  code: string;
}

export interface ImmunizationStatus extends MasterDataItem {
  code: string;
}

export interface HealthInsuranceRegime extends MasterDataItem {
  code: string;
}

export interface Ethnicity extends MasterDataItem {
  code: string;
}

export interface Stratum extends MasterDataItem {
  code: string;
  value: number;
}

export interface PopulationGroup extends MasterDataItem {
  code: string;
  isPregnantRelevant?: boolean;
}

export interface GenderIdentity extends MasterDataItem {
  code: string;
  requiresOther?: boolean;
}

export interface SexualOrientation extends MasterDataItem {
  code: string;
  requiresOther?: boolean;
}

export interface Area extends MasterDataItem {
  code: string;
}

export interface NotificationSource extends MasterDataItem {
  code: string;
}

export interface InitialClassification extends MasterDataItem {
  code: string;
}

export interface FinalCondition extends MasterDataItem {
  code: string;
}

export interface Diagnostic extends NumericMasterDataItem {
  code: string;
}

export interface Event extends MasterDataItem {
  code: string;
}

export interface TypeOfCareProvided extends MasterDataItem {
  code: string;
}

export interface YesOrNot extends MasterDataItem {
  code: string;
}

@Injectable({
  providedIn: 'root'
})
export class MasterDataService {
  private baseUrl = 'http://localhost:3000/api/v1'; // Base URL para API de datos maestros

  // Método genérico para cargar registros maestros por categorías
  private loadMasterRecordsByCategory<T extends MasterDataItem>(
    category: string,
    subject: BehaviorSubject<T[]>,
    useMockData: boolean = false,
    mockData?: T[]
  ): void {
    if (useMockData && mockData) {
      subject.next(mockData);
      return;
    }

    this.http.get<T[]>(`${this.baseUrl}/master-records?categories=${category}`).subscribe(
      data => subject.next(data),
      error => {
        console.error(`Error loading ${category} from API:`, error);
        if (mockData) {
          subject.next(mockData);
        } else {
          subject.next([]);
        }
      }
    );
  }

  // BehaviorSubjects para caché de datos
  private identificationTypesSubject = new BehaviorSubject<IdentificationType[]>([]);
  private countriesSubject = new BehaviorSubject<Country[]>([]);
  private gendersSubject = new BehaviorSubject<Gender[]>([]);
  private ageUnitsSubject = new BehaviorSubject<AgeUnit[]>([]);
  private occupationsSubject = new BehaviorSubject<Occupation[]>([]);
  private educationalLevelsSubject = new BehaviorSubject<EducationalLevel[]>([]);
  private appetiteTestResultsSubject = new BehaviorSubject<AppetiteTestResult[]>([]);
  private immunizationStatusesSubject = new BehaviorSubject<ImmunizationStatus[]>([]);
  private healthInsuranceRegimesSubject = new BehaviorSubject<HealthInsuranceRegime[]>([]);
  private ethnicitiesSubject = new BehaviorSubject<Ethnicity[]>([]);
  private strataSubject = new BehaviorSubject<Stratum[]>([]);
  private populationGroupsSubject = new BehaviorSubject<PopulationGroup[]>([]);
  private genderIdentitiesSubject = new BehaviorSubject<GenderIdentity[]>([]);
  private sexualOrientationsSubject = new BehaviorSubject<SexualOrientation[]>([]);
  private areasSubject = new BehaviorSubject<Area[]>([]);
  private notificationSourcesSubject = new BehaviorSubject<NotificationSource[]>([]);
  private initialClassificationsSubject = new BehaviorSubject<InitialClassification[]>([]);
  private finalConditionsSubject = new BehaviorSubject<FinalCondition[]>([]);
  private eventsSubject = new BehaviorSubject<Event[]>([]);
  private typeOfCareProvidedSubject = new BehaviorSubject<TypeOfCareProvided[]>([]);
  private yesOrNotSubject = new BehaviorSubject<YesOrNot[]>([]);
  private diagnosticsSubject = new BehaviorSubject<Diagnostic[]>([]);
  private citiesSubject = new BehaviorSubject<MasterDataItem[]>([]);

  constructor(private http: HttpClient) {}

  // Métodos para obtener tipos de identificación
  getIdentificationTypes(): Observable<IdentificationType[]> {
    if (this.identificationTypesSubject.value.length === 0) {
      this.loadIdentificationTypes();
    }
    return this.identificationTypesSubject.asObservable();
  }

  private loadIdentificationTypes(): void {
    this.loadMasterRecordsByCategory('IDENTIFICATION_TYPES', this.identificationTypesSubject, false);
  }

  // Métodos para obtener niveles educativos
  getEducationalLevels(): Observable<EducationalLevel[]> {
    if (this.educationalLevelsSubject.value.length === 0) {
      this.loadEducationalLevels();
    }
    return this.educationalLevelsSubject.asObservable();
  }

  private loadEducationalLevels(): void {
    this.loadMasterRecordsByCategory('EDUCATION_LEVEL', this.educationalLevelsSubject, false);
  }

  // Método para obtener el código de nivel educativo por nombre
  getEducationalLevelCodeByName(name: string): string | null {
    const levels = this.educationalLevelsSubject.value;
    const level = levels.find(level => 
      level.name.toLowerCase() === name.toLowerCase() ||
      level.name.toLowerCase().includes(name.toLowerCase()) ||
      name.toLowerCase().includes(level.name.toLowerCase())
    );
    return level ? level.code : null;
  }

  // Métodos para obtener resultados de prueba de apetito
  getAppetiteTestResults(): Observable<AppetiteTestResult[]> {
    if (this.appetiteTestResultsSubject.value.length === 0) {
      this.loadAppetiteTestResults();
    }
    return this.appetiteTestResultsSubject.asObservable();
  }

  private loadAppetiteTestResults(): void {
    this.loadMasterRecordsByCategory('APPETITE_TEST_RESULT', this.appetiteTestResultsSubject, false);
  }

  // Métodos para obtener estados de inmunización
  getImmunizationStatuses(): Observable<ImmunizationStatus[]> {
    if (this.immunizationStatusesSubject.value.length === 0) {
      this.loadImmunizationStatuses();
    }
    return this.immunizationStatusesSubject.asObservable();
  }

  private loadImmunizationStatuses(): void {
    this.loadMasterRecordsByCategory('IMMUNIZATION_STATUS_ID', this.immunizationStatusesSubject, false);
  }

  // Métodos para obtener países
  getCountries(): Observable<Country[]> {
    if (this.countriesSubject.value.length === 0) {
      this.loadCountries();
    }
    return this.countriesSubject.asObservable();
  }

  private loadCountries(): void {
    this.http.get<Country[]>(`${this.baseUrl}/countries`).subscribe(
      data => this.countriesSubject.next(data),
      error => {
        console.error('Error loading countries from API:', error);
        this.countriesSubject.next([]);
      }
    );
  }

  // Métodos para obtener géneros
  getGenders(): Observable<Gender[]> {
    if (this.gendersSubject.value.length === 0) {
      this.loadGenders();
    }
    return this.gendersSubject.asObservable();
  }

  private loadGenders(): void {
    this.loadMasterRecordsByCategory('GENDER', this.gendersSubject, false);
  }

  // Métodos para obtener unidades de edad
  getAgeUnits(): Observable<AgeUnit[]> {
    if (this.ageUnitsSubject.value.length === 0) {
      this.loadAgeUnits();
    }
    return this.ageUnitsSubject.asObservable();
  }

  private loadAgeUnits(): void {
    this.loadMasterRecordsByCategory('AGE_UNIT', this.ageUnitsSubject, false);
  }

  // Métodos para obtener ocupaciones
  getOccupations(): Observable<Occupation[]> {
    if (this.occupationsSubject.value.length === 0) {
      this.loadOccupations();
    }
    return this.occupationsSubject.asObservable();
  }

  private loadOccupations(): void {
    this.http.get<Occupation[]>(`${this.baseUrl}/occupations`).subscribe(
      data => this.occupationsSubject.next(data),
      error => {
        console.error('Error loading occupations from API:', error);
        this.occupationsSubject.next([]);
      }
    );
  }

  // Métodos para obtener regímenes de salud
  getHealthInsuranceRegimes(): Observable<HealthInsuranceRegime[]> {
    if (this.healthInsuranceRegimesSubject.value.length === 0) {
      this.loadHealthInsuranceRegimes();
    }
    return this.healthInsuranceRegimesSubject.asObservable();
  }

  private loadHealthInsuranceRegimes(): void {
    this.loadMasterRecordsByCategory('HEALTH_INSURANCE_REGIME', this.healthInsuranceRegimesSubject, false);
  }

  // Métodos para obtener etnias
  getEthnicities(): Observable<Ethnicity[]> {
    if (this.ethnicitiesSubject.value.length === 0) {
      this.loadEthnicities();
    }
    return this.ethnicitiesSubject.asObservable();
  }

  private loadEthnicities(): void {
    this.loadMasterRecordsByCategory('ETHNICITY', this.ethnicitiesSubject, false);
  }

  // Métodos para obtener estratos
  getStrata(): Observable<Stratum[]> {
    if (this.strataSubject.value.length === 0) {
      this.loadStrata();
    }
    return this.strataSubject.asObservable();
  }

  private loadStrata(): void {
    this.loadMasterRecordsByCategory('STRATUM', this.strataSubject, false);
  }

  // Métodos para obtener grupos poblacionales
  getPopulationGroups(): Observable<PopulationGroup[]> {
    if (this.populationGroupsSubject.value.length === 0) {
      this.loadPopulationGroups();
    }
    return this.populationGroupsSubject.asObservable();
  }

  private loadPopulationGroups(): void {
    this.loadMasterRecordsByCategory('POPULATION_GROUP', this.populationGroupsSubject, false);
  }

  // Métodos para obtener identidades de género
  getGenderIdentities(): Observable<GenderIdentity[]> {
    if (this.genderIdentitiesSubject.value.length === 0) {
      this.loadGenderIdentities();
    }
    return this.genderIdentitiesSubject.asObservable();
  }

  private loadGenderIdentities(): void {
    this.loadMasterRecordsByCategory('GENDER_IDENTITY', this.genderIdentitiesSubject, false);
  }

  // Métodos para obtener orientaciones sexuales
  getSexualOrientations(): Observable<SexualOrientation[]> {
    if (this.sexualOrientationsSubject.value.length === 0) {
      this.loadSexualOrientations();
    }
    return this.sexualOrientationsSubject.asObservable();
  }

  private loadSexualOrientations(): void {
    this.loadMasterRecordsByCategory('SEXUAL_ORIENTATION', this.sexualOrientationsSubject, false);
  }

  // Métodos para obtener áreas
  getAreas(): Observable<Area[]> {
    if (this.areasSubject.value.length === 0) {
      this.loadAreas();
    }
    return this.areasSubject.asObservable();
  }

  // Métodos para obtener fuentes de notificación
  getNotificationSources(): Observable<NotificationSource[]> {
    if (this.notificationSourcesSubject.value.length === 0) {
      this.loadNotificationSources();
    }
    return this.notificationSourcesSubject.asObservable();
  }

  // Métodos para obtener clasificaciones iniciales
  getInitialClassifications(): Observable<InitialClassification[]> {
    if (this.initialClassificationsSubject.value.length === 0) {
      this.loadInitialClassifications();
    }
    return this.initialClassificationsSubject.asObservable();
  }

  // Métodos para obtener condiciones finales
  getFinalConditions(): Observable<FinalCondition[]> {
    if (this.finalConditionsSubject.value.length === 0) {
      this.loadFinalConditions();
    }
    return this.finalConditionsSubject.asObservable();
  }

  private loadFinalConditions(): void {
    this.loadMasterRecordsByCategory('FINAL_CONDITION', this.finalConditionsSubject, false);
  }

  // Métodos para obtener diagnósticos CIE10
  getDiagnostics(): Observable<Diagnostic[]> {
    if (this.diagnosticsSubject.value.length === 0) {
      this.loadDiagnostics();
    }
    return this.diagnosticsSubject.asObservable();
  }

  private loadDiagnostics(): void {
    this.http.get<Diagnostic[]>(`${this.baseUrl}/cie10-diagnostics`).subscribe(
      data => this.diagnosticsSubject.next(data),
      error => {
        console.error('Error loading diagnostics from API:', error);
        this.diagnosticsSubject.next([]);
      }
    );
  }

  // Métodos para obtener eventos
  getEvents(): Observable<Event[]> {
    if (this.eventsSubject.value.length === 0) {
      this.loadEvents();
    }
    return this.eventsSubject.asObservable();
  }

  private loadEvents(): void {
    this.loadMasterRecordsByCategory('EVENT', this.eventsSubject, false);
  }

  // Métodos para obtener tipo de atención proporcionada
  getTypeOfCareProvided(): Observable<TypeOfCareProvided[]> {
    if (this.typeOfCareProvidedSubject.value.length === 0) {
      this.loadTypeOfCareProvided();
    }
    return this.typeOfCareProvidedSubject.asObservable();
  }

  private loadTypeOfCareProvided(): void {
    this.loadMasterRecordsByCategory('TYPE_OF_CARE_PROVIDE', this.typeOfCareProvidedSubject, false);
  }

  // Métodos para obtener opciones Sí/No
  getYesOrNot(): Observable<YesOrNot[]> {
    if (this.yesOrNotSubject.value.length === 0) {
      this.loadYesOrNot();
    }
    return this.yesOrNotSubject.asObservable();
  }

  private loadYesOrNot(): void {
    this.loadMasterRecordsByCategory('YES_OR_NOT', this.yesOrNotSubject, false);
  }

  private loadAreas(): void {
    this.loadMasterRecordsByCategory('AREA', this.areasSubject, false);
  }

  private loadNotificationSources(): void {
    this.loadMasterRecordsByCategory('NOTIFICATION_SOURCE', this.notificationSourcesSubject, false);
  }

  private loadInitialClassifications(): void {
    this.loadMasterRecordsByCategory('INITIAL_CLASIFICATION', this.initialClassificationsSubject, false);
  }

  // Métodos para obtener departamentos/provincias
  getProvinces(): Observable<Province[]> {
    if (this.provincesSubject.value.length === 0) {
      this.loadProvinces();
    }
    return this.provincesSubject.asObservable();
  }

  private provincesSubject = new BehaviorSubject<Province[]>([]);

  private loadProvinces(): void {
    this.http.get<Province[]>(`${this.baseUrl}/provinces`).subscribe(
      data => this.provincesSubject.next(data),
      error => {
        console.error('Error loading provinces from API:', error);
        this.provincesSubject.next([]);
      }
    );
  }

  // Métodos para obtener ciudades por provincia (usando ID numérico)
  getCitiesByProvince(provinceId: number): Observable<NumericMasterDataItem[]> {
    return this.http.get<NumericMasterDataItem[]>(`${this.baseUrl}/provinces/${provinceId}/cities`);
  }

  // Métodos utilitarios
  getItemByCode<T extends MasterDataItem>(items: T[], code: string): T | undefined {
    return items.find(item => item.code === code);
  }

  getItemsByCode<T extends MasterDataItem>(items: T[], code: string): T | undefined {
    return items.find(item => item.code === code);
  }

  // Método para refrescar todos los datos maestros
  refreshAllMasterData(): void {
    this.loadIdentificationTypes();
    this.loadCountries();
    this.loadGenders();
    this.loadAgeUnits();
    this.loadOccupations();
    this.loadEducationalLevels();
    this.loadAppetiteTestResults();
    this.loadImmunizationStatuses();
    this.loadHealthInsuranceRegimes();
    this.loadEthnicities();
    this.loadStrata();
    this.loadPopulationGroups();
    this.loadGenderIdentities();
    this.loadSexualOrientations();
    this.loadAreas();
    this.loadNotificationSources();
    this.loadInitialClassifications();
    this.loadFinalConditions();
    this.loadEvents();
    this.loadTypeOfCareProvided();
    this.loadYesOrNot();
    this.loadProvinces();
    this.loadDiagnostics();
  }
}
