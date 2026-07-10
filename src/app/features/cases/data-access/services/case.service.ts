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
        return response.case;
      }),
      catchError(error => {
        console.error(`Error loading case with id ${id}:`, error);
        throw error;
      })
    );
  }

  /**
   * Asigna usuarios a un caso
   * POST /api/v1/cases/:caseId/responsibles
   * @param caseId ID del caso (número)
   * @param userIds Array de IDs de usuarios a asignar
   * @returns Observable con la respuesta de asignación
   */
  assignUsersToCase(caseId: number, userIds: string[]): Observable<CaseAssignmentResponse> {
    const url = `${this.baseUrl}/cases/${caseId}/responsibles`;
    const body = { userIds };

    return this.http.post<CaseAssignmentResponse>(url, body).pipe(
      catchError(error => {
        console.error('Error en CaseService.assignUsersToCase():', error);
        console.error('Status:', error.status);
        console.error('URL:', url);
        console.error('Body:', body);

        if (error.status === 400) {
          console.error('Error 400: Bad Request - Posibles causas:');
          console.error('1. Backend no está corriendo en localhost:3000');
          console.error('2. Endpoint incorrecto (debería ser /api/v1/cases/:caseId/responsibles)');
          console.error('3. Token inválido o expirado');
          console.error('4. Permisos insuficientes');
          console.error('5. caseId o userIds inválidos');
        }

        throw error;
      })
    );
  }

  /**
   * Obtiene los usuarios disponibles para asignar como responsables a un caso específico
   * GET /api/v1/cases/:caseId/available-responsibles
   * @param caseId ID del caso (número)
   * @returns Observable con la lista de usuarios disponibles
   */
  getAvailableResponsibles(caseId: number): Observable<any[]> {
    const url = `${this.baseUrl}/cases/${caseId}/available-responsibles`;

    return this.http.get<any[]>(url).pipe(
      catchError(error => {
        console.error('Error en CaseService.getAvailableResponsibles():', error);
        console.error('Status:', error.status);
        console.error('URL:', url);

        if (error.status === 400) {
          console.error('Error 400: Bad Request - Posibles causas:');
          console.error('1. Backend no está corriendo en localhost:3000');
          console.error('2. Endpoint incorrecto (debería ser /api/v1/cases/:caseId/available-responsibles)');
          console.error('3. Token inválido o expirado');
          console.error('4. Permisos insuficientes');
          console.error('5. caseId inválido');
        }

        throw error;
      })
    );
  }

  /**
   * Obtiene los casos asignados al usuario actual
   * GET /api/v1/cases/me
   * @param filters Filtros opcionales para la consulta (incluye paginación)
   * @returns Observable con la página de casos asignados al usuario
   */
  getMyCases(filters?: CaseFilters): Observable<CasePage> {
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

    return this.http.get<CasePage>(`${this.baseUrl}/cases/me`, { params }).pipe(
      catchError(error => {
        console.error('Error loading my cases:', error);
        throw error;
      })
    );
  }

  /**
   * Obtiene los profesionales disponibles para asignar a un caso específico
   * GET /api/v1/cases/:caseId/available-professionals
   * @param caseId ID del caso (número)
   * @returns Observable con la lista de profesionales disponibles
   */
  getAvailableProfessionals(caseId: number): Observable<any[]> {
    const url = `${this.baseUrl}/cases/${caseId}/available-professionals`;

    return this.http.get<any[]>(url).pipe(
      catchError(error => {
        console.error('Error en CaseService.getAvailableProfessionals():', error);
        console.error('Status:', error.status);
        console.error('URL:', url);

        if (error.status === 400) {
          console.error('Error 400: Bad Request - Posibles causas:');
          console.error('1. Backend no está corriendo en localhost:3000');
          console.error('2. Endpoint incorrecto (debería ser /api/v1/cases/:caseId/available-professionals)');
          console.error('3. Token inválido o expirado');
          console.error('4. Permisos insuficientes');
          console.error('5. caseId inválido');
        }

        throw error;
      })
    );
  }

  /**
   * Asigna un profesional a un caso específico
   * POST /api/v1/cases/:caseId/professionals
   * @param caseId ID del caso (número)
   * @param userId ID del usuario profesional a asignar
   * @returns Observable con la respuesta de la asignación
   */
  assignProfessionalToCase(caseId: number, userId: string): Observable<{ caseId: number; professionalUserId: string }> {
    const url = `${this.baseUrl}/cases/${caseId}/professionals`;
    const body = { userId };

    return this.http.post<{ caseId: number; professionalUserId: string }>(url, body).pipe(
      catchError(error => {
        console.error('Error en CaseService.assignProfessionalToCase():', error);
        console.error('Status:', error.status);
        console.error('URL:', url);
        console.error('Body:', body);

        if (error.status === 400) {
          console.error('Error 400: Bad Request - Posibles causas:');
          console.error('1. Backend no está corriendo en localhost:3000');
          console.error('2. Endpoint incorrecto (debería ser /api/v1/cases/:caseId/professionals)');
          console.error('3. Token inválido o expirado');
          console.error('4. Permisos insuficientes');
          console.error('5. caseId o userId inválidos');
        }

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

export interface CaseAssignee {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  roles: string[];
  assignedAt: string;
}

export interface CaseResponsible {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  roles: string[];
  assignedAt: string;
}

export interface CaseProfessional {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  assignedAt: string;
  assignedByUserId: string;
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
  assignees: CaseAssignee[];
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
  responsibles?: CaseResponsible[];
  professionals?: CaseProfessional[];
}

export interface PatientInformation {
  id: number;
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
  createdBy: string;
  createdAt: string;
  modifiedBy: string | null;
  modifiedAt: string | null;
}

export interface NotificationInformation {
  id: number;
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
  createdBy: string;
  createdAt: string;
  modifiedBy: string | null;
  modifiedAt: string | null;
}

export interface ResponsibleCaregiver {
  id: number;
  firstName: string;
  middleName: string | null;
  firstLastName: string;
  secondLastName: string | null;
  documentNumber: string;
  childrenNumber: number;
  documentTypeId: ResolvedMasterRecord | null;
  educationalLevelId: ResolvedMasterRecord | null;
  createdBy: string;
  createdAt: string;
  modifiedBy: string | null;
  modifiedAt: string | null;
}

export interface IdentificationFactor {
  id: number;
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
  createdBy: string;
  createdAt: string;
  modifiedBy: string | null;
  modifiedAt: string | null;
}

export interface ClinicalSign {
  id: number;
  edemaPresentId: ResolvedMasterRecord | null;
  visibleWastingId: ResolvedMasterRecord | null;
  dryOrRoughSkinId: ResolvedMasterRecord | null;
  skinPigmentationChangesId: ResolvedMasterRecord | null;
  hairChangesId: ResolvedMasterRecord | null;
  clinicalAnemiaSignsId: ResolvedMasterRecord | null;
  createdBy: string;
  createdAt: string;
  modifiedBy: string | null;
  modifiedAt: string | null;
}

export interface CareRoute {
  id: number;
  carePathwayActivatedId: ResolvedMasterRecord | null;
  typeOfCareProvidedId: ResolvedMasterRecord | null;
  medicalDiagnosisId: ResolvedMasterRecord | null;
  createdBy: string;
  createdAt: string;
  modifiedBy: string | null;
  modifiedAt: string | null;
}

interface CaseFullResponse {
  case: CaseFull;
}

// ── Interfaces para asignación de usuarios a casos ──

export interface CaseAssignmentRequest {
  userIds: string[];
}

export interface CaseAssignmentResponse {
  caseId: number;
  assignedUserIds: string[];
}
