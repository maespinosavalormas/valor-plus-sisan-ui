import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CaseFormData {
  step1?: {
    // Información General
    stateCode: string;
    upgdCode: string;
    upgdName: string;
    eventCode: string; 
    notificationDate: Date;
  };
  step2?: {
    // Identificación del Paciente
    identificationTypeCode: string | null;
    identificationNumber: string;
    firstName: string;
    middleName: string;
    firstLastName: string;
    secondLastName: string;
    phoneNumber: string;
    birthDate: Date;
    age: number;
    ageUnitCode: string | null;
    nationalityCountryCode: string | null;
    genderCode: string | null;
    genderIdentityCode: string | null;
    genderIdentityOther: string;
    sexualOrientationCode: string | null;
    sexualOrientationOther: string;
    countryCode: string | null;
    provinceCode: string | null;
    cityCode: string | null;
    areaCode: string | null;
    locality: string;
    neighborhood: string;
    populatedCenter: string;
    ruralArea: string;
    occupationCode: string | null;
    healthInsuranceRegimeCode: string | null;
    benefitsPlanAdministratorName: string;
    ethnicityCode: string | null;
    ethnicityOther: string;
    stratumCode: string | null;
    // Grupos poblacionales (selector múltiple)
    populationGroupCode: string[];
    populationGroupPregnantWeek: string | null;
  };
  step3?: {
    // Datos de Notificación
    notificationSourceCode: string | null; 
    countryCode: string | null; 
    provinceCode: string | null; 
    cityCode: string | null;
    address: string; 
    consultationDate: Date; 
    initialSymptomsDate: Date; 
    initialClasificationCode: string | null; 
    hospitalizedCode: string; 
    hospitalizedDate: Date | null; 
    finalConditionCode: string | null; 
    deathDate: Date | null; 
    deathCertificateNumber: string; 
    deathCauseCode: string | null; 
    professionalName: string; 
    professionalPhoneNumber: string; 
  };
  step4?: {
    // Datos de la madre
    firstName: string;
    middleName: string;
    firstLastName: string;
    secondLastName: string;
    documentTypeCode: string | null;
    documentNumber: string;
    educationalLevelCode: string | null;
    childrenNumber: number;
  };
  step5?: {
    // Identificacion de factores
    birthWeight: number;
    birthLength: number;
    gestationalAgeAtBirth: number;
    breastfeedingDuration: number;
    complementaryFeedingStartAge: number;
    enrolledInGrowthMonitoringCode: string;
    immunizationStatusCode: string;
    referredByVaccinationCardCode: string;
    currentWeight: number; // decimal
    currentHeight: number; // decimal
    midUpperArmCircumference: number; // decimal
    appetiteTestResultCode: string;
  };
  step6?: {
    // Signos Clínicos
    edemaPresentCode: string;
    visibleWastingCode: string;
    dryOrRoughSkinCode: string;
    skinPigmentationChangesCode: string;
    hairChangesCode: string;
    clinicalAnemiaSignsCode: string;
  };
  step7?: {
    // Ruta de Atención
    carePathwayActivatedCode: string;
    typeOfCareProvidedCode: string;
    medicalDiagnosisCode: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class CaseFormDataService {
  private formDataSubject = new BehaviorSubject<CaseFormData>({});
  private hasUnsavedChangesSubject = new BehaviorSubject<boolean>(false);
  private baseUrl = 'http://localhost:3000/api/v1'; // Base URL para API de casos

  constructor(private http: HttpClient) {}

  // Observable para el formulario
  getFormData() {
    return this.formDataSubject.asObservable();
  }

  // Observable para cambios no guardados
  getHasUnsavedChanges() {
    return this.hasUnsavedChangesSubject.asObservable();
  }

  // Actualizar datos de un paso específico
  updateStepData(step: keyof CaseFormData, data: any): void {
    const currentData = this.formDataSubject.value;
    const updatedData = {
      ...currentData,
      [step]: data
    };
    this.formDataSubject.next(updatedData);
    this.hasUnsavedChangesSubject.next(true);
  }

  // Obtener datos de un paso específico
  getStepData(step: keyof CaseFormData): any {
    const currentData = this.formDataSubject.value;
    return currentData[step] || {};
  }

  // Obtener todos los datos del formulario
  getAllFormData(): CaseFormData {
    return this.formDataSubject.value;
  }

  // Obtener datos completos del caso en formato para API
  getCompleteCaseData(): any {
    const formData = this.getAllFormData();
    
    return {
      stateCode: formData.step1?.stateCode || '1',
      eventCode: formData.step1?.eventCode || '',
      upgdCode: formData.step1?.upgdCode || '',
      upgdName: formData.step1?.upgdName || '',
      notificationDate: this.formatDate(formData.step1?.notificationDate),
      
      patientInformation: {
        identificationTypeCode: formData.step2?.identificationTypeCode || '',
        identificationNumber: formData.step2?.identificationNumber || '',
        firstName: formData.step2?.firstName || '',
        middleName: formData.step2?.middleName || '',
        firstLastName: formData.step2?.firstLastName || '',
        secondLastName: formData.step2?.secondLastName || '',
        phoneNumber: formData.step2?.phoneNumber || '',
        birthDate: this.formatDate(formData.step2?.birthDate),
        age: formData.step2?.age || 0,
        ageUnitCode: formData.step2?.ageUnitCode || '',
        nationalityCountryCode: formData.step2?.nationalityCountryCode || '',
        genderCode: formData.step2?.genderCode || '',
        genderIdentityCode: formData.step2?.genderIdentityCode || '',
        genderIdentityOther: formData.step2?.genderIdentityOther || '',
        sexualOrientationCode: formData.step2?.sexualOrientationCode || '',
        sexualOrientationOther: formData.step2?.sexualOrientationOther || '',
        countryCode: formData.step2?.countryCode || '',
        provinceCode: this.padWithZeros(formData.step2?.provinceCode, 2) || '',
        cityCode: this.padWithZeros(formData.step2?.cityCode, 3) || '',
        areaCode: formData.step2?.areaCode || '',
        locality: formData.step2?.locality || '',
        neighborhood: formData.step2?.neighborhood || '',
        populatedCenter: formData.step2?.populatedCenter || '',
        ruralArea: formData.step2?.ruralArea || '',
        occupationCode: formData.step2?.occupationCode || '',
        healthInsuranceRegimeCode: formData.step2?.healthInsuranceRegimeCode || '',
        benefitsPlanAdministratorName: formData.step2?.benefitsPlanAdministratorName || '',
        ethnicityCode: formData.step2?.ethnicityCode || '',
        ethnicityOther: formData.step2?.ethnicityOther || '',
        stratumCode: formData.step2?.stratumCode || '',
        ...this.transformPopulationGroups(formData.step2?.populationGroupCode),
        populationGroupPregnantWeek: formData.step2?.populationGroupPregnantWeek ? String(formData.step2.populationGroupPregnantWeek) : null
      },
      
      notificationInformation: {
        notificationSourceCode: formData.step3?.notificationSourceCode || '',
        countryCode: formData.step3?.countryCode || '',
        provinceCode: this.padWithZeros(formData.step3?.provinceCode, 2) || '',
        cityCode: this.padWithZeros(formData.step3?.cityCode, 3) || '',
        address: formData.step3?.address || '',
        consultationDate: this.formatDate(formData.step3?.consultationDate),
        initialSymptomsDate: this.formatDate(formData.step3?.initialSymptomsDate),
        initialClasificationCode: formData.step3?.initialClasificationCode || '',
        hospitalizedCode: formData.step3?.hospitalizedCode || '2',
        hospitalizedDate: formData.step3?.hospitalizedDate ? this.formatDate(formData.step3?.hospitalizedDate) : null,
        finalConditionCode: formData.step3?.finalConditionCode || '',
        deathDate: formData.step3?.deathDate ? this.formatDate(formData.step3?.deathDate) : null,
        deathCertificateNumber: formData.step3?.deathCertificateNumber || '',
        deathCauseCode: formData.step3?.deathCauseCode || '',
        professionalName: formData.step3?.professionalName || '',
        professionalPhoneNumber: formData.step3?.professionalPhoneNumber || ''
      },
      
      responsibleCaregiver: {
        firstName: formData.step4?.firstName || '',
        middleName: formData.step4?.middleName || '',
        firstLastName: formData.step4?.firstLastName || '',
        secondLastName: formData.step4?.secondLastName || '',
        documentTypeCode: formData.step4?.documentTypeCode || '',
        documentNumber: formData.step4?.documentNumber || '',
        educationalLevelCode: formData.step4?.educationalLevelCode || '',
        childrenNumber: formData.step4?.childrenNumber || 0
      },
      
      identificationFactor: {
        birthWeight: formData.step5?.birthWeight || 0,
        birthLength: formData.step5?.birthLength || 0,
        gestationalAgeAtBirth: formData.step5?.gestationalAgeAtBirth || 0,
        breastfeedingDuration: formData.step5?.breastfeedingDuration || 0,
        complementaryFeedingStartAge: formData.step5?.complementaryFeedingStartAge || 0,
        enrolledInGrowthMonitoringCode: formData.step5?.enrolledInGrowthMonitoringCode || '2',
        immunizationStatusCode: formData.step5?.immunizationStatusCode || '',
        referredByVaccinationCardCode: formData.step5?.referredByVaccinationCardCode || '2',
        currentWeight: formData.step5?.currentWeight || 0,
        currentHeight: formData.step5?.currentHeight || 0,
        midUpperArmCircumference: formData.step5?.midUpperArmCircumference || 0,
        appetiteTestResultCode: formData.step5?.appetiteTestResultCode || ''
      },
      
      clinicalSign: {
        edemaPresentCode: formData.step6?.edemaPresentCode || '2',
        visibleWastingCode: formData.step6?.visibleWastingCode || '2',
        dryOrRoughSkinCode: formData.step6?.dryOrRoughSkinCode || '2',
        skinPigmentationChangesCode: formData.step6?.skinPigmentationChangesCode || '2',
        hairChangesCode: formData.step6?.hairChangesCode || '2',
        clinicalAnemiaSignsCode: formData.step6?.clinicalAnemiaSignsCode || '2'
      },
      
      careRoute: {
        carePathwayActivatedCode: formData.step7?.carePathwayActivatedCode || '2',
        typeOfCareProvidedCode: formData.step7?.typeOfCareProvidedCode || '',
        medicalDiagnosisCode: formData.step7?.medicalDiagnosisCode || ''
      }
    };
  }
  
  private formatDate(date: any): string {
    if (!date) return '';
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) return '';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Transformar array de populationGroupCode a campos individuales del backend
  private transformPopulationGroups(populationGroupCode: string[] | undefined): any {
    const groups = populationGroupCode || [];
    return {
      populationGroupDisabilitiesCode: groups.includes('1') ? '1' : '2',
      populationGroupDisplacedCode: groups.includes('2') ? '1' : '2',
      populationGroupMigrantsCode: groups.includes('3') ? '1' : '2',
      populationGroupIncarceratedCode: groups.includes('4') ? '1' : '2',
      populationGroupPregnantCode: groups.includes('5') ? '1' : '2',
      populationGroupHomelessCode: groups.includes('6') ? '1' : '2',
      populationGroupIcbfCode: groups.includes('7') ? '1' : '2',
      populationGroupCommunityMothersCode: groups.includes('8') ? '1' : '2',
      populationGroupDemobilizedCode: groups.includes('9') ? '1' : '2',
      populationGroupPsychiatricCentersCode: groups.includes('10') ? '1' : '2',
      populationGroupVictimsArmedCode: groups.includes('11') ? '1' : '2',
      populationGroupOtherCode: groups.includes('12') ? '1' : '2'
    };
  }
  
  private padWithZeros(value: string | null | undefined, length: number): string {
    if (!value) return '';
    // Si el valor es más largo que la longitud esperada, tomar los últimos 'length' caracteres
    // Esto es útil para códigos de ciudad que vienen con prefijo de provincia (ej: "05001" -> "001")
    if (value.length > length) {
      return value.slice(-length);
    }
    return value.padStart(length, '0');
  }

  // Cargar datos de un caso existente
  loadCaseData(caseData: any): void {
    const formData: CaseFormData = {
      step1: {
        stateCode: caseData.stateCode || '1',
        upgdCode: caseData.upgdCode || caseData.generalInfo?.upgdCode || '',
        upgdName: caseData.upgdName || caseData.generalInfo?.upgdName || '',
        eventCode: caseData.eventCode || caseData.generalInfo?.eventCode || '',
        notificationDate: caseData.notificationDate ? new Date(caseData.notificationDate) : (caseData.generalInfo?.notificationDate ? new Date(caseData.generalInfo.notificationDate) : new Date())
      },
      step2: {
        identificationTypeCode: caseData.patientInformation?.identificationTypeCode || caseData.patient?.identificationTypeCode || null,
        identificationNumber: caseData.patientInformation?.identificationNumber || caseData.patient?.identificationNumber || '',
        firstName: caseData.patientInformation?.firstName || caseData.patient?.firstName || '',
        middleName: caseData.patientInformation?.middleName || caseData.patient?.middleName || '',
        firstLastName: caseData.patientInformation?.firstLastName || caseData.patient?.firstLastName || '',
        secondLastName: caseData.patientInformation?.secondLastName || caseData.patient?.secondLastName || '',
        phoneNumber: caseData.patientInformation?.phoneNumber || caseData.patient?.phoneNumber || '',
        birthDate: caseData.patientInformation?.birthDate ? new Date(caseData.patientInformation.birthDate) : (caseData.patient?.birthDate ? new Date(caseData.patient.birthDate) : new Date()),
        age: caseData.patientInformation?.age || caseData.patient?.age || 0,
        ageUnitCode: caseData.patientInformation?.ageUnitCode || caseData.patient?.ageUnitCode || null,
        nationalityCountryCode: caseData.patientInformation?.nationalityCountryCode || caseData.patient?.nationalityCountryCode || null,
        genderCode: caseData.patientInformation?.genderCode || caseData.patient?.genderCode || null,
        genderIdentityCode: caseData.patientInformation?.genderIdentityCode || caseData.patient?.genderIdentityCode || null,
        genderIdentityOther: caseData.patientInformation?.genderIdentityOther || caseData.patient?.genderIdentityOther || '',
        sexualOrientationCode: caseData.patientInformation?.sexualOrientationCode || caseData.patient?.sexualOrientationCode || null,
        sexualOrientationOther: caseData.patientInformation?.sexualOrientationOther || caseData.patient?.sexualOrientationOther || '',
        countryCode: caseData.patientInformation?.countryCode || caseData.patient?.countryCode || null,
        provinceCode: caseData.patientInformation?.provinceCode || caseData.patient?.provinceCode || null,
        cityCode: caseData.patientInformation?.cityCode || caseData.patient?.cityCode || null,
        areaCode: caseData.patientInformation?.areaCode || caseData.patient?.areaCode || null,
        locality: caseData.patientInformation?.locality || caseData.patient?.locality || '',
        neighborhood: caseData.patientInformation?.neighborhood || caseData.patient?.neighborhood || '',
        populatedCenter: caseData.patientInformation?.populatedCenter || caseData.patient?.populatedCenter || '',
        ruralArea: caseData.patientInformation?.ruralArea || caseData.patient?.ruralArea || '',
        occupationCode: caseData.patientInformation?.occupationCode || caseData.patient?.occupationCode || null,
        healthInsuranceRegimeCode: caseData.patientInformation?.healthInsuranceRegimeCode || caseData.patient?.healthInsuranceRegimeCode || null,
        benefitsPlanAdministratorName: caseData.patientInformation?.benefitsPlanAdministratorName || caseData.patient?.benefitsPlanAdministratorName || '',
        ethnicityCode: caseData.patientInformation?.ethnicityCode || caseData.patient?.ethnicityCode || null,
        ethnicityOther: caseData.patientInformation?.ethnicityOther || caseData.patient?.ethnicityOther || '',
        stratumCode: caseData.patientInformation?.stratumCode || caseData.patient?.stratumCode || null,
        populationGroupCode: caseData.patientInformation?.populationGroupCode || [],
        populationGroupPregnantWeek: caseData.patientInformation?.populationGroupPregnantWeek ? String(caseData.patientInformation.populationGroupPregnantWeek) : null
      },
      step3: {
        notificationSourceCode: caseData.notificationInformation?.notificationSourceCode || caseData.notification?.notificationSourceCode || null,
        countryCode: caseData.notificationInformation?.countryCode || caseData.notification?.countryCode || null,
        provinceCode: caseData.notificationInformation?.provinceCode || caseData.notification?.provinceCode || null,
        cityCode: caseData.notificationInformation?.cityCode || caseData.notification?.cityCode || null,
        address: caseData.notificationInformation?.address || caseData.notification?.address || '',
        consultationDate: caseData.notificationInformation?.consultationDate ? new Date(caseData.notificationInformation.consultationDate) : (caseData.notification?.consultationDate ? new Date(caseData.notification.consultationDate) : new Date()),
        initialSymptomsDate: caseData.notificationInformation?.initialSymptomsDate ? new Date(caseData.notificationInformation.initialSymptomsDate) : (caseData.notification?.initialSymptomsDate ? new Date(caseData.notification.initialSymptomsDate) : new Date()),
        initialClasificationCode: caseData.notificationInformation?.initialClasificationCode || caseData.notification?.initialClasificationCode || null,
        hospitalizedCode: caseData.notificationInformation?.hospitalizedCode || caseData.notification?.hospitalizedCode || '2',
        hospitalizedDate: caseData.notificationInformation?.hospitalizedDate ? new Date(caseData.notificationInformation.hospitalizedDate) : (caseData.notification?.hospitalizedDate ? new Date(caseData.notification.hospitalizedDate) : null),
        finalConditionCode: caseData.notificationInformation?.finalConditionCode || caseData.notification?.finalConditionCode || null,
        deathDate: caseData.notificationInformation?.deathDate ? new Date(caseData.notificationInformation.deathDate) : (caseData.notification?.deathDate ? new Date(caseData.notification.deathDate) : null),
        deathCertificateNumber: caseData.notificationInformation?.deathCertificateNumber || caseData.notification?.deathCertificateNumber || '',
        deathCauseCode: caseData.notificationInformation?.deathCauseCode || caseData.notification?.deathCauseCode || null,
        professionalName: caseData.notificationInformation?.professionalName || caseData.notification?.professionalName || '',
        professionalPhoneNumber: caseData.notificationInformation?.professionalPhoneNumber || caseData.notification?.professionalPhoneNumber || ''
      },
      step4: {
        firstName: caseData.responsibleCaregiver?.firstName || caseData.caregiver?.firstName || '',
        middleName: caseData.responsibleCaregiver?.middleName || caseData.caregiver?.middleName || '',
        firstLastName: caseData.responsibleCaregiver?.firstLastName || caseData.caregiver?.firstLastName || '',
        secondLastName: caseData.responsibleCaregiver?.secondLastName || caseData.caregiver?.secondLastName || '',
        documentTypeCode: caseData.responsibleCaregiver?.documentTypeCode || caseData.caregiver?.documentTypeCode || null,
        documentNumber: caseData.responsibleCaregiver?.documentNumber || caseData.caregiver?.documentNumber || '',
        educationalLevelCode: caseData.responsibleCaregiver?.educationalLevelCode || caseData.caregiver?.educationalLevelCode || null,
        childrenNumber: caseData.responsibleCaregiver?.childrenNumber || caseData.caregiver?.childrenNumber || 0
      },
      step5: {
        birthWeight: caseData.identificationFactor?.birthWeight || caseData.anthropometricData?.birthWeight || 0,
        birthLength: caseData.identificationFactor?.birthLength || caseData.anthropometricData?.birthLength || 0,
        gestationalAgeAtBirth: caseData.identificationFactor?.gestationalAgeAtBirth || caseData.anthropometricData?.gestationalAgeAtBirth || 0,
        breastfeedingDuration: caseData.identificationFactor?.breastfeedingDuration || caseData.anthropometricData?.breastfeedingDuration || 0,
        complementaryFeedingStartAge: caseData.identificationFactor?.complementaryFeedingStartAge || caseData.anthropometricData?.complementaryFeedingStartAge || 0,
        enrolledInGrowthMonitoringCode: caseData.identificationFactor?.enrolledInGrowthMonitoringCode || caseData.anthropometricData?.enrolledInGrowthMonitoringCode || '2',
        immunizationStatusCode: caseData.identificationFactor?.immunizationStatusCode || caseData.anthropometricData?.immunizationStatusCode || '',
        referredByVaccinationCardCode: caseData.identificationFactor?.referredByVaccinationCardCode || caseData.anthropometricData?.referredByVaccinationCardCode || '2',
        currentWeight: caseData.identificationFactor?.currentWeight || caseData.anthropometricData?.currentWeight || 0,
        currentHeight: caseData.identificationFactor?.currentHeight || caseData.anthropometricData?.currentHeight || 0,
        midUpperArmCircumference: caseData.identificationFactor?.midUpperArmCircumference || caseData.anthropometricData?.midUpperArmCircumference || 0,
        appetiteTestResultCode: caseData.identificationFactor?.appetiteTestResultCode || caseData.anthropometricData?.appetiteTestResultCode || ''
      },
      step6: {
        edemaPresentCode: caseData.clinicalSign?.edemaPresentCode || caseData.clinicalSigns?.edemaPresentCode || '2',
        visibleWastingCode: caseData.clinicalSign?.visibleWastingCode || caseData.clinicalSigns?.visibleWastingCode || '2',
        dryOrRoughSkinCode: caseData.clinicalSign?.dryOrRoughSkinCode || caseData.clinicalSigns?.dryOrRoughSkinCode || '2',
        skinPigmentationChangesCode: caseData.clinicalSign?.skinPigmentationChangesCode || caseData.clinicalSigns?.skinPigmentationChangesCode || '2',
        hairChangesCode: caseData.clinicalSign?.hairChangesCode || caseData.clinicalSigns?.hairChangesCode || '2',
        clinicalAnemiaSignsCode: caseData.clinicalSign?.clinicalAnemiaSignsCode || caseData.clinicalSigns?.clinicalAnemiaSignsCode || '2'
      },
      step7: {
        carePathwayActivatedCode: caseData.careRoute?.carePathwayActivatedCode || caseData.carePathway?.carePathwayActivatedCode || '2',
        typeOfCareProvidedCode: caseData.careRoute?.typeOfCareProvidedCode || caseData.carePathway?.typeOfCareProvidedCode || '',
        medicalDiagnosisCode: caseData.careRoute?.medicalDiagnosisCode || caseData.carePathway?.medicalDiagnosisCode || ''
      }
    };
    
    this.formDataSubject.next(formData);
    this.hasUnsavedChangesSubject.next(false);
  }

  // Resetear todos los datos del formulario
  resetFormData(): void {
    this.formDataSubject.next({});
    this.hasUnsavedChangesSubject.next(false);
  }

  // Verificar si hay cambios no guardados
  hasUnsavedChanges(): boolean {
    return this.hasUnsavedChangesSubject.value;
  }

  // Marcar como guardado
  markAsSaved(): void {
    this.hasUnsavedChangesSubject.next(false);
  }

  // Guardar caso creado (endpoint POST /api/v1/cases)
  saveCreatedCase(caseData: any): Observable<any> {
    console.log('Enviando caso al backend:', caseData);
    return this.http.post(`${this.baseUrl}/cases`, caseData);
  }

  // Actualizar caso existente (endpoint PUT /api/v1/cases/:id)
  updateCase(caseId: string, caseData: any): Observable<any> {
    console.log('Actualizando caso en el backend:', caseId, caseData);
    return this.http.put(`${this.baseUrl}/cases/${caseId}`, caseData);
  }

  // Validar que todos los pasos requeridos estén completos
  validateAllSteps(): { isValid: boolean; errors: string[] } {
    const formData = this.getAllFormData();
    const errors: string[] = [];

    // Validar paso 1 - Información General
    if (!formData.step1?.upgdCode) errors.push('El código UPGD es requerido');
    if (!formData.step1?.upgdName) errors.push('El nombre UPGD es requerido');
    if (!formData.step1?.eventCode) errors.push('El ID del evento es requerido');
    if (!formData.step1?.notificationDate) errors.push('La fecha de notificación es requerida');

    // Validar paso 2 - Identificación del Paciente
    if (!formData.step2?.identificationNumber) errors.push('El número de identificación es requerido');
    if (!formData.step2?.firstName) errors.push('El primer nombre es requerido');
    if (!formData.step2?.firstLastName) errors.push('El primer apellido es requerido');
    if (!formData.step2?.phoneNumber) errors.push('El teléfono es requerido');
    if (!formData.step2?.birthDate) errors.push('La fecha de nacimiento es requerida');
    if (!formData.step2?.age) errors.push('La edad es requerida');
    if (!formData.step2?.identificationTypeCode) errors.push('El tipo de identificación es requerido');
    if (!formData.step2?.nationalityCountryCode) errors.push('La nacionalidad es requerida');
    if (!formData.step2?.genderCode) errors.push('El género es requerido');
    if (!formData.step2?.countryCode) errors.push('El país es requerido');
    if (!formData.step2?.provinceCode) errors.push('El departamento es requerido');
    if (!formData.step2?.cityCode) errors.push('La ciudad es requerida');
    if (!formData.step2?.areaCode) errors.push('El área es requerida');
    if (!formData.step2?.locality) errors.push('La localidad es requerida');
    if (!formData.step2?.neighborhood) errors.push('El barrio es requerido');
    if (!formData.step2?.populatedCenter) errors.push('El centro poblado es requerido');
    if (!formData.step2?.ruralArea) errors.push('La zona rural es requerida');
    if (!formData.step2?.occupationCode) errors.push('La ocupación es requerida');
    if (!formData.step2?.healthInsuranceRegimeCode) errors.push('El régimen de salud es requerido');
    if (!formData.step2?.benefitsPlanAdministratorName) errors.push('La administradora del plan es requerida');
    if (!formData.step2?.ethnicityCode) errors.push('La etnia es requerida');
    if (!formData.step2?.stratumCode) errors.push('El estrato es requerido');

    // Validar paso 3 - Datos de Notificación
    if (!formData.step3?.notificationSourceCode) errors.push('La fuente de notificación es requerida');
    if (!formData.step3?.countryCode) errors.push('El país es requerido');
    if (!formData.step3?.provinceCode) errors.push('El departamento es requerido');
    if (!formData.step3?.cityCode) errors.push('La ciudad es requerida');
    if (!formData.step3?.address) errors.push('La dirección es requerida');
    if (!formData.step3?.consultationDate) errors.push('La fecha de consulta es requerida');
    if (!formData.step3?.initialSymptomsDate) errors.push('La fecha de inicio de síntomas es requerida');
    if (!formData.step3?.initialClasificationCode) errors.push('La clasificación inicial es requerida');
    if (!formData.step3?.hospitalizedCode) errors.push('El estado de hospitalización es requerido');
    if (!formData.step3?.finalConditionCode) errors.push('La condición final es requerida');
    if (!formData.step3?.professionalName) errors.push('El nombre del profesional es requerido');
    if (!formData.step3?.professionalPhoneNumber) errors.push('El teléfono del profesional es requerido');

    // Validar paso 4 - Datos del Contacto
    if (!formData.step4?.firstName) errors.push('El primer nombre del contacto es requerido');
    if (!formData.step4?.firstLastName) errors.push('El primer apellido del contacto es requerido');
    if (!formData.step4?.documentNumber) errors.push('El número de documento del contacto es requerido');
    if (!formData.step4?.childrenNumber && formData.step4?.childrenNumber !== 0) errors.push('El número de hijos es requerido');

    // Validar paso 5 - Datos Antropométricos y de Salud
    if (!formData.step5?.birthWeight && formData.step5?.birthWeight !== 0) errors.push('El peso al nacer es requerido');
    if (!formData.step5?.birthLength && formData.step5?.birthLength !== 0) errors.push('La longitud al nacer es requerida');
    if (!formData.step5?.gestationalAgeAtBirth && formData.step5?.gestationalAgeAtBirth !== 0) errors.push('La edad gestacional al nacer es requerida');
    if (!formData.step5?.breastfeedingDuration && formData.step5?.breastfeedingDuration !== 0) errors.push('La duración de lactancia es requerida');
    if (!formData.step5?.complementaryFeedingStartAge && formData.step5?.complementaryFeedingStartAge !== 0) errors.push('La edad de inicio de alimentación complementaria es requerida');
    if (!formData.step5?.immunizationStatusCode) errors.push('El estado de inmunización es requerido');
    if (!formData.step5?.appetiteTestResultCode) errors.push('El resultado de prueba de apetito es requerido');

    // Validar paso 6 - Signos Clínicos
    // Todos los campos son booleanos, no requieren validación de obligatoriedad
    // Se validan automáticamente como false si no se proporcionan

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
