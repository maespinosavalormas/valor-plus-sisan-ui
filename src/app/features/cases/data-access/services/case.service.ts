import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CaseService {
  private baseUrl = 'http://localhost:3000/api/v1';

  constructor(private http: HttpClient) {}

  /**
   * Obtiene una página de casos con filtros opcionales
   * @param filters Filtros opcionales para la consulta
   * @returns Observable con la página de casos
   */
  getCasesPage(filters?: CaseFilters): Observable<CasePage> {
    let params = new HttpParams();

    if (filters) {
      if (filters.page) params = params.set('page', filters.page.toString());
      if (filters.size) params = params.set('size', filters.size.toString());
      if (filters.orderBy) params = params.set('orderBy', filters.orderBy);
      if (filters.eventCode) params = params.set('eventCode', filters.eventCode);
      if (filters.categoryEventCode) params = params.set('categoryEventCode', filters.categoryEventCode);
      if (filters.cityCode) params = params.set('cityCode', filters.cityCode);
      if (filters.upgdCode) params = params.set('upgdCode', filters.upgdCode);
      if (filters.notificationDateStart) params = params.set('notificationDateStart', filters.notificationDateStart);
      if (filters.notificationDateEnd) params = params.set('notificationDateEnd', filters.notificationDateEnd);
      
      // Manejo especial para array de states
      if (filters.states && filters.states.length > 0) {
        filters.states.forEach(state => {
          params = params.append('states[]', state);
        });
      }
    }

    return this.http.get<CasePage>(`${this.baseUrl}/cases/page`, { params }).pipe(
      catchError(error => {
        console.error('Error loading cases page:', error);
        throw error;
      })
    );
  }

  /**
   * Obtiene el detalle completo de un caso por su ID
   * GET /api/v1/cases/:id
   * @param id ID del caso
   * @returns Observable con el detalle completo del caso (CaseFull)
   */
  getCaseById(id: number): Observable<CaseFull> {
    return this.http.get<CaseFullResponse>(`${this.baseUrl}/cases/${id}`).pipe(
      map(response => {
        console.log('DEBUG - Raw API response:', JSON.stringify(response, null, 2));
        console.log('DEBUG - patientInformation fields:', Object.keys(response.case.patientInformation || {}));
        console.log('DEBUG - identificationTypeId value:', response.case.patientInformation?.identificationTypeId);
        console.log('DEBUG - genderId value:', response.case.patientInformation?.genderId);
        console.log('DEBUG - nationalityCountryId value:', response.case.patientInformation?.nationalityCountryId);
        return response.case;
      }),
      catchError(error => {
        console.error(`Error loading case with id ${id}:`, error);
        throw error;
      })
    );
  }
}

// ── Interfaces para listado de casos (página) ──

export interface CaseFilters {
  page?: number;
  size?: number;
  orderBy?: string;
  states?: string[];
  eventCode?: string;
  categoryEventCode?: string;
  cityCode?: string;
  notificationDateStart?: string;
  notificationDateEnd?: string;
  upgdCode?: string;
}

export interface MasterRecord {
  id: number;
  code: string;
  name: string;
}

export interface CaseData {
  id: number;
  upgdCode: string;
  upgdName: string;
  notificationDate: Date;
  state: MasterRecord;
  event: MasterRecord;
  city: MasterRecord;
  category: MasterRecord;
}

export interface CaseBasic {
  case: CaseData;
}

export interface CasePage {
  content: CaseBasic[];
  totalElements: number;
  number: number;
  size: number;
  totalPages: number;
}

// ── Interfaces para detalle completo del caso (GET /cases/:id) ──

export interface ResolvedMasterRecord {
  code: string;
  name: string;
}

export interface CaseFull {
  id: number;
  upgdCode: string;
  upgdName: string;
  notificationDate: Date;
  state: ResolvedMasterRecord;
  event: ResolvedMasterRecord;
  category: ResolvedMasterRecord;
  patientInformation?: PatientInformation;
  notificationInformation?: NotificationInformation;
  responsibleCaregiver?: ResponsibleCaregiver;
  identificationFactor?: IdentificationFactor;
  clinicalSign?: ClinicalSign;
  careRoute?: CareRoute;
}

export interface PatientInformation {
  firstName: string;
  middleName: string | null;
  firstLastName: string;
  secondLastName: string | null;
  identificationNumber: string;
  phoneNumber: string | null;
  birthDate: Date;
  age: number;
  genderIdentityOther: string | null;
  sexualOrientationOther: string | null;
  locality: string | null;
  neighborhood: string | null;
  populatedCenter: string | null;
  ruralArea: string | null;
  benefitsPlanAdministratorName: string | null;
  ethnicityOther: string | null;
  populationGroupPregnantWeek: number | null;
  identificationTypeId: ResolvedMasterRecord | null;
  ageUnitId: ResolvedMasterRecord | null;
  nationalityCountryId: ResolvedMasterRecord | null;
  genderId: ResolvedMasterRecord | null;
  genderIdentityId: ResolvedMasterRecord | null;
  sexualOrientationId: ResolvedMasterRecord | null;
  countryId: ResolvedMasterRecord | null;
  provinceId: ResolvedMasterRecord | null;
  cityId: ResolvedMasterRecord | null;
  areaId: ResolvedMasterRecord | null;
  occupationId: ResolvedMasterRecord | null;
  healthInsuranceRegimeId: ResolvedMasterRecord | null;
  ethnicityId: ResolvedMasterRecord | null;
  stratumId: ResolvedMasterRecord | null;
  populationGroupDisabilitiesId: ResolvedMasterRecord | null;
  populationGroupDisplacedId: ResolvedMasterRecord | null;
  populationGroupMigrantsId: ResolvedMasterRecord | null;
  populationGroupIncarceratedId: ResolvedMasterRecord | null;
  populationGroupPregnantId: ResolvedMasterRecord | null;
  populationGroupHomelessId: ResolvedMasterRecord | null;
  populationGroupIcbfId: ResolvedMasterRecord | null;
  populationGroupCommunityMothersId: ResolvedMasterRecord | null;
  populationGroupDemobilizedId: ResolvedMasterRecord | null;
  populationGroupPsychiatricCentersId: ResolvedMasterRecord | null;
  populationGroupVictimsArmedId: ResolvedMasterRecord | null;
  populationGroupOtherId: ResolvedMasterRecord | null;
}

export interface NotificationInformation {
  address: string | null;
  consultationDate: Date | null;
  initialSymptomsDate: Date | null;
  professionalName: string | null;
  professionalPhoneNumber: string | null;
  deathCertificateNumber: string | null;
  deathDate: Date | null;
  hospitalizedDate: Date | null;
  notificationSourceId: ResolvedMasterRecord | null;
  countryId: ResolvedMasterRecord | null;
  provinceId: ResolvedMasterRecord | null;
  cityId: ResolvedMasterRecord | null;
  initialClasificationId: ResolvedMasterRecord | null;
  hospitalizedId: ResolvedMasterRecord | null;
  finalConditionId: ResolvedMasterRecord | null;
  deathCauseId: ResolvedMasterRecord | null;
}

export interface ResponsibleCaregiver {
  firstName: string;
  middleName: string | null;
  firstLastName: string;
  secondLastName: string | null;
  documentNumber: string;
  childrenNumber: number;
  documentTypeId: ResolvedMasterRecord | null;
  educationalLevelId: ResolvedMasterRecord | null;
}

export interface IdentificationFactor {
  birthWeight: number;
  birthLength: number;
  gestationalAgeAtBirth: number;
  breastfeedingDuration: number;
  complementaryFeedingStartAge: number;
  currentWeight: number;
  currentHeight: number;
  midUpperArmCircumference: number | null;
  enrolledInGrowthMonitoringId: ResolvedMasterRecord | null;
  immunizationStatusId: ResolvedMasterRecord | null;
  referredByVaccinationCardId: ResolvedMasterRecord | null;
  appetiteTestResultId: ResolvedMasterRecord | null;
}

export interface ClinicalSign {
  edemaPresentId: ResolvedMasterRecord | null;
  visibleWastingId: ResolvedMasterRecord | null;
  dryOrRoughSkinId: ResolvedMasterRecord | null;
  skinPigmentationChangesId: ResolvedMasterRecord | null;
  hairChangesId: ResolvedMasterRecord | null;
  clinicalAnemiaSignsId: ResolvedMasterRecord | null;
}

export interface CareRoute {
  carePathwayActivatedId: ResolvedMasterRecord | null;
  typeOfCareProvidedId: ResolvedMasterRecord | null;
  medicalDiagnosisId: ResolvedMasterRecord | null;
}

interface CaseFullResponse {
  case: CaseFull;
}
