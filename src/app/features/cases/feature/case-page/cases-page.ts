import { Component, OnDestroy } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { CasesListComponent } from '../../ui/cases-list/cases-list.component';
import { CommonModule } from '@angular/common';
import { CaseFormService } from '../../data-access/services/case-form.service';
import { MasterDataService } from '../../ui/case-form/services/master-data.service';
import { CaseFormDataService } from '../../ui/case-form/services/form-data.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-cases-page',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, MatDialogModule, MatMenuModule, CasesListComponent, CommonModule],
  templateUrl: './cases-page.html',
  styleUrls: ['./cases-page.scss']
})
export class CasesPageComponent implements OnDestroy {
  private step1Data: any = {};
  private step2Data: any = {};
  private step3Data: any = {};
  private step4Data: any = {};
  private step5Data: any = {};
  private step6Data: any = {};
  private step7Data: any = {};

  private editingSubscription: Subscription;

  showCsvUploadModal = false;
  selectedCsvFile: File | null = null;

  showIcbfUploadModal = false;
  selectedIcbfFile: File | null = null;

  showArrullosUploadModal = false;
  selectedArrullosFile: File | null = null;

  showComfamaUploadModal = false;
  selectedComfamaFile: File | null = null;

  showComfenalcoUploadModal = false;
  selectedComfenalcoFile: File | null = null;

  constructor(private dialog: MatDialog, private caseFormService: CaseFormService, private masterDataService: MasterDataService, private formDataService: CaseFormDataService) {
    this.editingSubscription = this.caseFormService.getEditingCase().subscribe(caseData => {
      if (caseData) {
        this.openEditWizard(caseData);
      }
    });
  }

  ngOnDestroy() {
    this.editingSubscription.unsubscribe();
  }

  /**
   * Convierte el nombre del nivel educativo al código numérico correspondiente
   */
  private getEducationalLevelCode(educationalLevel: string): string {
    if (!educationalLevel) return '';
    
    // Si ya es un código numérico, devolverlo tal cual
    if (/^\d+$/.test(educationalLevel)) {
      return educationalLevel;
    }
    
    // Mapeo de nombres a códigos
    const nameToCodeMap: { [key: string]: string } = {
      'primaria': '1',
      'básica primaria': '1',
      'secundaria': '2',
      'básica secundaria': '2',
      'técnico': '3',
      'tecnológico': '4',
      'universitario': '5',
      'postgrado': '6',
      'ninguno': '7'
    };
    
    const normalizedName = educationalLevel.toLowerCase().trim();
    return nameToCodeMap[normalizedName] || educationalLevel;
  }

  async openCaseForm() {
    // Limpiar datos de pasos anteriores al crear un nuevo caso
    this.clearStepData();
    this.openStep1();
  }

  /**
   * Limpia todos los datos de los pasos del formulario
   */
  private clearStepData(): void {
    this.step1Data = {};
    this.step2Data = {};
    this.step3Data = {};
    this.step4Data = {};
    this.step5Data = {};
    this.step6Data = {};
    this.step7Data = {};
  }

  async openStep1() {
    const { DatosInformacionGeneralComponent } = await import('../../ui/case-form/steps/datos-informacion-general.component');
    
    const dialogRef = this.dialog.open(DatosInformacionGeneralComponent, {
      width: '60%',
      maxWidth: '2000px',
      data: {
        isEdit: false,
        data: this.step1Data || {} // Restaurar datos guardados o formulario vacío
      }
    });

    dialogRef.afterClosed().subscribe(async result => {
      console.log('Resultado del paso 1:', result);
      if (result === 'next') {
        this.step1Data = dialogRef.componentInstance.form.value;
        this.formDataService.updateStepData('step1', this.step1Data);
        console.log('Datos guardados del paso 1:', this.step1Data);
        this.openStep2();
      } else if (result && typeof result === 'object' && result.action === 'next') {
        this.step1Data = result.stepData;
        this.formDataService.updateStepData('step1', this.step1Data);
        console.log('Datos guardados del paso 1 (formato objeto):', this.step1Data);
        this.openStep2();
      } else {
        console.log('El formulario del paso 1 se cerró sin continuar. Result:', result);
      }
    });
  }

  async openStep2() {
    const { IdentificacionDelPacienteComponent } = await import('../../ui/case-form/steps/identificacion-del-paciente.component');
    const dialogRef2 = this.dialog.open(IdentificacionDelPacienteComponent, {
      width: '60%',
      maxWidth: '2000px',
      data: {
        isEdit: false,
        currentStep: 2,
        totalSteps: 7,
        previousStepData: this.step1Data,
        data: this.step2Data || {} // Restaurar datos guardados o formulario vacío
      }
    });

    dialogRef2.afterClosed().subscribe(async result2 => {
      if (result2 && typeof result2 === 'object' && result2.action === 'back') {
        if (result2.currentStepData) {
          this.step2Data = result2.currentStepData;
          console.log('Datos guardados del paso 2 al volver:', this.step2Data);
        }
        this.openStep1();
      } else if (result2 && typeof result2 === 'object' && result2.action === 'next') {
        this.step2Data = result2.stepData;
        this.formDataService.updateStepData('step2', this.step2Data);
        console.log('Datos guardados del paso 2 al continuar:', this.step2Data);
        console.log('Intentando abrir paso 3...');
        this.openStep3();
      }
    });
  }

  async openStep3() {
    console.log('Paso 3 abierto');
    try {
      const { DatosNotificacionComponent } = await import('../../ui/case-form/steps/datos-notificacion.component');
      console.log('DatosNotificacionComponent importado correctamente');
      const dialogRef3 = this.dialog.open(DatosNotificacionComponent, {
        width: '60%',
        maxWidth: '2000px',
        data: {
          isEdit: false,
          currentStep: 3,
          totalSteps: 7,
          previousStepData: this.step2Data,
          data: this.step3Data || {} // Restaurar datos guardados o formulario vacío
        }
      });
      console.log('Diálogo de paso 3 abierto');

      dialogRef3.afterClosed().subscribe(async result3 => {
        if (result3 && typeof result3 === 'object' && result3.action === 'back') {
          if (result3.currentStepData) {
            this.step3Data = result3.currentStepData;
            console.log('Datos guardados del paso 3 al volver:', this.step3Data);
          }
          this.openStep2();
        } else if (result3 && typeof result3 === 'object' && result3.action === 'next') {
          this.step3Data = result3.stepData;
          this.formDataService.updateStepData('step3', this.step3Data);
          console.log('Datos guardados del paso 3 al continuar:', this.step3Data);
          console.log('Continuar al paso 4');
          this.openStep4();
        } else if (result3 === 'next') {
          this.step3Data = dialogRef3.componentInstance.form.value;
          this.formDataService.updateStepData('step3', this.step3Data);
          console.log('Datos guardados del paso 3 al continuar (formato antiguo):', this.step3Data);
          console.log('Continuar al paso 4');
          this.openStep4();
        }
      });
    } catch (error) {
      console.error('Error al importar o abrir DatosNotificacionComponent:', error);
    }
  }

  async openStep4() {
    console.log('Paso 4 abierto');
    try {
      const { DatosDeLaMadreComponent } = await import('../../ui/case-form/steps/datos-de-la-madre-o-cuidador.component');
      console.log('DatosDeLaMadreComponent importado correctamente');
      const dialogRef4 = this.dialog.open(DatosDeLaMadreComponent, {
        width: '60%',
        maxWidth: '2000px',
        data: {
          isEdit: false,
          currentStep: 4,
          totalSteps: 7,
          previousStepData: this.step3Data,
          data: this.step4Data || {} // Restaurar datos guardados o formulario vacío
        }
      });
      console.log('Diálogo de paso 4 abierto');

      dialogRef4.afterClosed().subscribe(async result4 => {
        if (result4 && typeof result4 === 'object' && result4.action === 'back') {
          if (result4.currentStepData) {
            this.step4Data = result4.currentStepData;
            console.log('Datos guardados del paso 4 al volver:', this.step4Data);
          }
          this.openStep3();
        } else if (result4 && typeof result4 === 'object' && result4.action === 'next') {
          this.step4Data = result4.stepData;
          this.formDataService.updateStepData('step4', this.step4Data);
          console.log('Datos guardados del paso 4 al continuar:', this.step4Data);
          console.log('Continuar al paso 5');
          this.openStep5();
        } else if (result4 === 'next') {
          this.step4Data = dialogRef4.componentInstance.form.value;
          this.formDataService.updateStepData('step4', this.step4Data);
          console.log('Datos guardados del paso 4 al continuar (formato antiguo):', this.step4Data);
          console.log('Continuar al paso 5');
          this.openStep5();
        }
      });
    } catch (error) {
      console.error('Error al importar o abrir DatosDeLaMadreComponent:', error);
    }
  }

  async openStep5() {
    console.log('Paso 5 abierto');
    try {
      const { IdentificacionDeFactoresComponent } = await import('../../ui/case-form/steps/identificacion-de-factores.component');
      console.log('IdentificacionDeFactoresComponent importado correctamente');
      const dialogRef5 = this.dialog.open(IdentificacionDeFactoresComponent, {
        width: '60%',
        maxWidth: '2000px',
        data: {
          isEdit: false,
          currentStep: 5,
          totalSteps: 7,
          previousStepData: this.step4Data,
          data: this.step5Data || {} // Restaurar datos guardados o formulario vacío
        }
      });
      console.log('Diálogo de paso 5 abierto');

      dialogRef5.afterClosed().subscribe(async result5 => {
        if (result5 && typeof result5 === 'object' && result5.action === 'back') {
          if (result5.currentStepData) {
            this.step5Data = result5.currentStepData;
            console.log('Datos guardados del paso 5 al volver:', this.step5Data);
          }
          this.openStep4();
        } else if (result5 && typeof result5 === 'object' && result5.action === 'next') {
          this.step5Data = result5.stepData;
          this.formDataService.updateStepData('step5', this.step5Data);
          console.log('Datos guardados del paso 5 al continuar:', this.step5Data);
          console.log('Continuar al paso 6');
          this.openStep6();
        } else if (result5 === 'next') {
          this.step5Data = dialogRef5.componentInstance.form.value;
          this.formDataService.updateStepData('step5', this.step5Data);
          console.log('Datos guardados del paso 5 al continuar (formato antiguo):', this.step5Data);
          console.log('Continuar al paso 6');
          this.openStep6();
        }
      });
    } catch (error) {
      console.error('Error al importar o abrir IdentificacionDeFactoresComponent:', error);
    }
  }

  async openStep6() {
    console.log('Paso 6 abierto');
    try {
      const { SignosClinicosComponent } = await import('../../ui/case-form/steps/signos-clinicos.component');
      console.log('SignosClinicosComponent importado correctamente');
      const dialogRef6 = this.dialog.open(SignosClinicosComponent, {
        width: '60%',
        maxWidth: '2000px',
        data: {
          isEdit: false,
          currentStep: 6,
          totalSteps: 7,
          previousStepData: this.step5Data,
          data: this.step6Data || {} // Restaurar datos guardados o formulario vacío
        }
      });
      console.log('Diálogo de paso 6 abierto');

      dialogRef6.afterClosed().subscribe(async result6 => {
        if (result6 && typeof result6 === 'object' && result6.action === 'back') {
          if (result6.currentStepData) {
            this.step6Data = result6.currentStepData;
            console.log('Datos guardados del paso 6 al volver:', this.step6Data);
          }
          this.openStep5();
        } else if (result6 && typeof result6 === 'object' && result6.action === 'next') {
          this.step6Data = result6.stepData;
          this.formDataService.updateStepData('step6', this.step6Data);
          console.log('Datos guardados del paso 6 al continuar:', this.step6Data);
          console.log('Continuar al paso 7');
          this.openStep7();
        } else if (result6 === 'next') {
          this.step6Data = dialogRef6.componentInstance.form.value;
          this.formDataService.updateStepData('step6', this.step6Data);
          console.log('Datos guardados del paso 6 al continuar (formato antiguo):', this.step6Data);
          console.log('Continuar al paso 7');
          this.openStep7();
        }
      });
    } catch (error) {
      console.error('Error al importar o abrir SignosClinicosComponent:', error);
    }
  }

  async openStep7() {
    console.log('Paso 7 abierto (último paso)');
    try {
      const { RutaDeAtencionComponent } = await import('../../ui/case-form/steps/ruta-de-atencion.component');
      console.log('RutaDeAtencionComponent importado correctamente');
      const dialogRef7 = this.dialog.open(RutaDeAtencionComponent, {
        width: '60%',
        maxWidth: '2000px',
        data: {
          isEdit: false,
          currentStep: 7,
          totalSteps: 7,
          previousStepData: this.step6Data,
          data: this.step7Data || {} // Restaurar datos guardados o formulario vacío
        }
      });
      console.log('Diálogo de paso 7 abierto');

      dialogRef7.afterClosed().subscribe(async result7 => {
        if (result7 && typeof result7 === 'object' && result7.action === 'back') {
          if (result7.currentStepData) {
            this.step7Data = result7.currentStepData;
            console.log('Datos guardados del paso 7 al volver:', this.step7Data);
          }
          this.openStep6();
        } else if (result7 && typeof result7 === 'object' && result7.action === 'next') {
          this.step7Data = result7.stepData;
          console.log('Datos guardados del paso 7 al continuar:', this.step7Data);
          console.log('Wizard completado. Todos los datos:', {
            step1: this.step1Data,
            step2: this.step2Data,
            step3: this.step3Data,
            step4: this.step4Data,
            step5: this.step5Data,
            step6: this.step6Data,
            step7: this.step7Data
          });
          
          // Enviar todos los datos al backend
          this.sendDataToBackend({
            step1: this.step1Data,
            step2: this.step2Data,
            step3: this.step3Data,
            step4: this.step4Data,
            step5: this.step5Data,
            step6: this.step6Data,
            step7: this.step7Data
          });
          
          // Limpiar datos después de enviar
          this.clearStepData();
        } else if (result7 === 'next') {
          this.step7Data = dialogRef7.componentInstance.form.value;
          console.log('Datos guardados del paso 7 al continuar (formato antiguo):', this.step7Data);
          console.log('Wizard completado. Todos los datos:', {
            step1: this.step1Data,
            step2: this.step2Data,
            step3: this.step3Data,
            step4: this.step4Data,
            step5: this.step5Data,
            step6: this.step6Data,
            step7: this.step7Data
          });
          
          // Enviar todos los datos al backend
          this.sendDataToBackend({
            step1: this.step1Data,
            step2: this.step2Data,
            step3: this.step3Data,
            step4: this.step4Data,
            step5: this.step5Data,
            step6: this.step6Data,
            step7: this.step7Data
          });
          
          // Limpiar datos después de enviar
          this.clearStepData();
        }
      });
    } catch (error) {
      console.error('Error al importar o abrir RutaDeAtencionComponent:', error);
    }
  }

  sendDataToBackend(data: any) {
    console.log('Enviando datos al backend:', data);
    
    // Unir todos los datos de los pasos en un solo objeto plano
    const flatData = {
      ...data.step1,
      ...data.step2,
      ...data.step3,
      ...data.step4,
      ...data.step5,
      ...data.step6,
      ...data.step7
    };
    
    console.log('Datos unificados en objeto plano:', flatData);
    
    // Guardar los datos del caso como objeto plano usando el servicio
    this.caseFormService.saveCreatedCase(flatData);
    
    // TODO: Implementar la lógica para enviar los datos al backend
    // Por ejemplo:
    // this.caseService.createCase(flatData).subscribe(
    //   response => console.log('Caso creado:', response),
    //   error => console.error('Error:', error)
    // );
  }

  importCase() {
    console.log('Importar caso');
    // TODO: Implementar lógica para importar casos
  }

  openCsvUploadModal() {
    this.showCsvUploadModal = true;
  }

  closeCsvUploadModal() {
    this.showCsvUploadModal = false;
    this.selectedCsvFile = null;
  }

  onCsvFileSelected(event: any) {
    const file = event.target.files[0];
    if (file && file.type !== 'text/csv') {
      alert('Solo se permiten archivos CSV');
      return;
    }
    this.selectedCsvFile = file;
  }

  uploadCsvFile() {
    if (this.selectedCsvFile) {
      console.log('Uploading CSV:', this.selectedCsvFile);
      this.closeCsvUploadModal();
    }
  }

  loadIcbfCase() {
    console.log('Cargar caso de ICBF');
    this.showIcbfUploadModal = true;
  }

  loadArrullosCase() {
    console.log('Cargar casos de Arrullos');
    this.showArrullosUploadModal = true;
  }

  loadComfamaCase() {
    console.log('Cargar casos de Comfama');
    this.showComfamaUploadModal = true;
  }

  loadComfenalcoCase() {
    console.log('Cargar casos de Comfenalco');
    this.showComfenalcoUploadModal = true;
  }

  closeIcbfUploadModal() {
    this.showIcbfUploadModal = false;
    this.selectedIcbfFile = null;
  }

  closeArrullosUploadModal() {
    this.showArrullosUploadModal = false;
    this.selectedArrullosFile = null;
  }

  closeComfamaUploadModal() {
    this.showComfamaUploadModal = false;
    this.selectedComfamaFile = null;
  }

  closeComfenalcoUploadModal() {
    this.showComfenalcoUploadModal = false;
    this.selectedComfenalcoFile = null;
  }

  onIcbfFileSelected(event: any) {
    const file = event.target.files[0];
    if (file && file.type !== 'text/csv') {
      alert('Solo se permiten archivos CSV');
      return;
    }
    this.selectedIcbfFile = file;
  }

  onArrullosFileSelected(event: any) {
    const file = event.target.files[0];
    if (file && file.type !== 'text/csv') {
      alert('Solo se permiten archivos CSV');
      return;
    }
    this.selectedArrullosFile = file;
  }

  onComfamaFileSelected(event: any) {
    const file = event.target.files[0];
    if (file && file.type !== 'text/csv') {
      alert('Solo se permiten archivos CSV');
      return;
    }
    this.selectedComfamaFile = file;
  }

  onComfenalcoFileSelected(event: any) {
    const file = event.target.files[0];
    if (file && file.type !== 'text/csv') {
      alert('Solo se permiten archivos CSV');
      return;
    }
    this.selectedComfenalcoFile = file;
  }

  uploadIcbfFile() {
    if (this.selectedIcbfFile) {
      console.log('Uploading ICBF CSV:', this.selectedIcbfFile);
      this.closeIcbfUploadModal();
    }
  }

  uploadArrullosFile() {
    if (this.selectedArrullosFile) {
      console.log('Uploading Arrullos CSV:', this.selectedArrullosFile);
      this.closeArrullosUploadModal();
    }
  }

  uploadComfamaFile() {
    if (this.selectedComfamaFile) {
      console.log('Uploading Comfama CSV:', this.selectedComfamaFile);
      this.closeComfamaUploadModal();
    }
  }

  uploadComfenalcoFile() {
    if (this.selectedComfenalcoFile) {
      console.log('Uploading Comfenalco CSV:', this.selectedComfenalcoFile);
      this.closeComfenalcoUploadModal();
    }
  }

  async openEditWizard(caseData: any) {
    this.prepareEditData(caseData);
    this.openStep1Edit();
  }

  prepareEditData(caseData: any) {
    // Mapear todos los datos del caso a sus respectivos pasos
    this.step1Data = {
      upgdCode: caseData.upgdCode || '',
      upgdnName: caseData.upgdnName || '',
      eventId: caseData.eventId || '',
      notificationDate: caseData.notificationDate || new Date()
    };
    
    // Datos del paso 2 - Identificación del Paciente
    this.step2Data = {
      identificationTypeId: caseData.identificationTypeId || 'CC',
      identificationNumber: caseData.identificationNumber || '',
      firstName: caseData.firstName || '',
      middleName: caseData.middleName || '',
      firstLastName: caseData.firstLastName || '',
      secondLastName: caseData.secondLastName || '',
      phoneNumber: caseData.phoneNumber || '',
      birthDate: caseData.birthDate || new Date(),
      age: caseData.age || 0,
      ageUnitId: caseData.ageUnitId || '1',
      nationalityCountryId: caseData.nationalityCountryId || 45,
      genderId: caseData.genderId || 'F',
      genderIdentityId: caseData.genderIdentityId || '1',
      genderIdentityOther: caseData.genderIdentityOther || '',
      sexualOrientationId: caseData.sexualOrientationId || '1',
      sexualOrientationOther: caseData.sexualOrientationOther || '',
      countryId: caseData.patientCountryId || 45,
      provinceId: caseData.patientProvinceId || 5,
      cityId: caseData.patientCityId || 501,
      areaId: caseData.areaId || '1',
      locality: caseData.locality || '',
      neighborhood: caseData.neighborhood || '',
      populatedCenter: caseData.populatedCenter || '',
      ruralArea: caseData.ruralArea || '',
      occupationId: caseData.occupationId || 1,
      healthInsuranceRegimeId: caseData.healthInsuranceRegimeId || '1',
      benefitsPlanAdministratorName: caseData.benefitsPlanAdministratorName || '',
      ethnicityId: caseData.ethnicityId?.toString() || '1',
      ethnicityOther: caseData.ethnicityOther || '',
      stratumId: caseData.stratumId || '3',
      populationGroupId: caseData.populationGroupId?.toString() || '1',
      populationGroupPregnant: caseData.populationGroupPregnant || ''
    };
    
    // Datos del paso 3 - Datos Notificación
    this.step3Data = {
      notificationSourceId: caseData.notificationSourceId || '1',
      countryId: caseData.notificationCountryId || 45,
      provinceId: caseData.notificationProvinceId || 5,
      cityId: caseData.notificationCityId || 501,
      address: caseData.address || '',
      consultationDate: caseData.consultationDate || new Date(),
      initialSymptomsDate: caseData.initialSymptomsDate || new Date(),
      initialClasificationId: caseData.initialClasificationId || '1',
      hospitalized: caseData.hospitalized || false,
      hospitalizedDate: caseData.hospitalizedDate || null,
      finalConditionId: caseData.finalConditionId || '1',
      deathDate: caseData.deathDate || null,
      deathCertificateNumber: caseData.deathCertificateNumber || '',
      deathCauseId: caseData.deathCauseId || null,
      professionalName: caseData.professionalName || '',
      professionalPhoneNumber: caseData.professionalPhoneNumber || ''
    };
    
    // Datos del paso 4 - Datos de la Madre/Cuidador
    this.step4Data = {
      firstName: caseData.motherFirstName || '',
      middleName: caseData.motherMiddleName || '',
      firstLastName: caseData.motherFirstLastName || '',
      secondLastName: caseData.motherSecondLastName || '',
      documentTypeId: caseData.documentTypeId || 'CC',
      documentNumber: caseData.documentNumber || '',
      educationalLevelId: this.getEducationalLevelCode(caseData.educationalLevelId) || '',
      childrenNumber: caseData.childrenNumber || 0
    };
    
    // Datos del paso 5 - Identificación de Factores
    this.step5Data = {
      birthWeight: caseData.birthWeight || 3000,
      birthLength: caseData.birthLength || 50,
      gestationalAgeAtBirth: caseData.gestationalAgeAtBirth || 38,
      breastfeedingDuration: caseData.breastfeedingDuration || 6,
      complementaryFeedingStartAge: caseData.complementaryFeedingStartAge || 6,
      enrolledInGrowthMonitoringId: caseData.enrolledInGrowthMonitoringId || true,
      immunizationStatusId: caseData.immunizationStatusId || '1', // "1" = Sí
      referredByVaccinationCard: caseData.referredByVaccinationCard || true,
      currentWeight: caseData.currentWeight || 65.5,
      currentHeight: caseData.currentHeight || 165.2,
      midUpperArmCircumference: caseData.midUpperArmCircumference || 25.3,
      appetiteTestResultId: caseData.appetiteTestResultId || '1' // "1" = Positiva
    };
    
    // Datos del paso 6 - Signos Clínicos
    this.step6Data = {
      edemaPresent: caseData.edemaPresent || false,
      visibleWasting: caseData.visibleWasting || false,
      dryOrRoughSkin: caseData.dryOrRoughSkin || false,
      skinPigmentationChanges: caseData.skinPigmentationChanges || false,
      hairChanges: caseData.hairChanges || false,
      clinicalAnemiaSigns: caseData.clinicalAnemiaSigns || false
    };
    
    // Datos del paso 7 - Ruta de Atención
    this.step7Data = {
      carePathwayActivated: caseData.carePathwayActivated || true,
      typeOfCareProvidedId: caseData.typeOfCareProvidedId || 'HOSPITALARIA',
      medicalDiagnosisId: caseData.medicalDiagnosisId || 150
    };
  }

  async openStep1Edit() {
    const { DatosInformacionGeneralComponent } = await import('../../ui/case-form/steps/datos-informacion-general.component');
    
    const dialogRef = this.dialog.open(DatosInformacionGeneralComponent, {
      width: '60%',
      maxWidth: '2000px',
      data: {
        isEdit: true,
        currentStep: 1,
        totalSteps: 7,
        data: this.step1Data
      }
    });

    dialogRef.afterClosed().subscribe(async result => {
      if (result && typeof result === 'object' && result.action === 'next') {
        this.step1Data = result.stepData;
        console.log('Datos guardados del paso 1 al continuar:', this.step1Data);
        this.openStep2Edit();
      } else if (result && typeof result === 'object' && result.action === 'back') {
        // En modo edición, no hay paso anterior, así que solo cerramos
        this.caseFormService.clearEditing();
      } else if (result === 'next') {
        // Compatibilidad con formato antiguo
        this.step1Data = dialogRef.componentInstance.form.value;
        console.log('Datos guardados del paso 1 al continuar (formato antiguo):', this.step1Data);
        this.openStep2Edit();
      } else if (result === 'cancel') {
        this.caseFormService.clearEditing();
      }
    });
  }

  async openStep2Edit() {
    const { IdentificacionDelPacienteComponent } = await import('../../ui/case-form/steps/identificacion-del-paciente.component');
    const dialogRef2 = this.dialog.open(IdentificacionDelPacienteComponent, {
      width: '60%',
      maxWidth: '2000px',
      data: {
        isEdit: true,
        currentStep: 2,
        totalSteps: 7,
        previousStepData: this.step1Data,
        data: this.step2Data
      }
    });

    dialogRef2.afterClosed().subscribe(async result2 => {
      if (result2 && typeof result2 === 'object' && result2.action === 'back') {
        if (result2.step2Data) {
          this.step2Data = result2.step2Data;
        }
        this.openStep1Edit();
      } else if (result2 && typeof result2 === 'object' && result2.action === 'next') {
        this.step2Data = result2.stepData;
        console.log('Datos guardados del paso 2 al continuar:', this.step2Data);
        this.openStep3Edit();
      } else if (result2 === 'next') {
        // Compatibilidad con formato antiguo
        this.step2Data = dialogRef2.componentInstance.form.value;
        console.log('Datos guardados del paso 2 al continuar:', this.step2Data);
        this.openStep3Edit();
      } else if (result2 === 'cancel') {
        this.caseFormService.clearEditing();
      }
    });
  }

  async openStep3Edit() {
    const { DatosNotificacionComponent } = await import('../../ui/case-form/steps/datos-notificacion.component');
    const dialogRef3 = this.dialog.open(DatosNotificacionComponent, {
      width: '60%',
      maxWidth: '2000px',
      data: {
        isEdit: true,
        currentStep: 3,
        totalSteps: 7,
        previousStepData: this.step2Data,
        data: this.step3Data
      }
    });

    dialogRef3.afterClosed().subscribe(async result3 => {
      if (result3 && typeof result3 === 'object' && result3.action === 'back') {
        if (result3.currentStepData) {
          this.step3Data = result3.currentStepData;
        }
        this.openStep2Edit();
      } else if (result3 && typeof result3 === 'object' && result3.action === 'next') {
        this.step3Data = result3.stepData;
        console.log('Datos guardados del paso 3 al continuar:', this.step3Data);
        this.openStep4Edit();
      } else if (result3 === 'next') {
        this.step3Data = dialogRef3.componentInstance.form.value;
        console.log('Datos guardados del paso 3 al continuar (formato antiguo):', this.step3Data);
        this.openStep4Edit();
      } else if (result3 === 'cancel') {
        this.caseFormService.clearEditing();
      }
    });
  }

  async openStep4Edit() {
    const { DatosDeLaMadreComponent } = await import('../../ui/case-form/steps/datos-de-la-madre-o-cuidador.component');
    const dialogRef4 = this.dialog.open(DatosDeLaMadreComponent, {
      width: '60%',
      maxWidth: '2000px',
      data: {
        isEdit: true,
        currentStep: 4,
        totalSteps: 7,
        previousStepData: this.step3Data,
        data: this.step4Data
      }
    });

    dialogRef4.afterClosed().subscribe(async result4 => {
      if (result4 && typeof result4 === 'object' && result4.action === 'back') {
        if (result4.currentStepData) {
          this.step4Data = result4.currentStepData;
        }
        this.openStep3Edit();
      } else if (result4 && typeof result4 === 'object' && result4.action === 'next') {
        this.step4Data = result4.stepData;
        console.log('Datos guardados del paso 4 al continuar:', this.step4Data);
        this.openStep5Edit();
      } else if (result4 === 'next') {
        this.step4Data = dialogRef4.componentInstance.form.value;
        console.log('Datos guardados del paso 4 al continuar (formato antiguo):', this.step4Data);
        this.openStep5Edit();
      } else if (result4 === 'cancel') {
        this.caseFormService.clearEditing();
      }
    });
  }

  async openStep5Edit() {
    const { IdentificacionDeFactoresComponent } = await import('../../ui/case-form/steps/identificacion-de-factores.component');
    const dialogRef5 = this.dialog.open(IdentificacionDeFactoresComponent, {
      width: '60%',
      maxWidth: '2000px',
      data: {
        isEdit: true,
        currentStep: 5,
        totalSteps: 7,
        previousStepData: this.step4Data,
        data: this.step5Data
      }
    });

    dialogRef5.afterClosed().subscribe(async result5 => {
      if (result5 && typeof result5 === 'object' && result5.action === 'back') {
        if (result5.currentStepData) {
          this.step5Data = result5.currentStepData;
        }
        this.openStep4Edit();
      } else if (result5 && typeof result5 === 'object' && result5.action === 'next') {
        this.step5Data = result5.stepData;
        console.log('Datos guardados del paso 5 al continuar:', this.step5Data);
        this.openStep6Edit();
      } else if (result5 === 'next') {
        this.step5Data = dialogRef5.componentInstance.form.value;
        console.log('Datos guardados del paso 5 al continuar (formato antiguo):', this.step5Data);
        this.openStep6Edit();
      } else if (result5 === 'cancel') {
        this.caseFormService.clearEditing();
      }
    });
  }

  async openStep6Edit() {
    const { SignosClinicosComponent } = await import('../../ui/case-form/steps/signos-clinicos.component');
    const dialogRef6 = this.dialog.open(SignosClinicosComponent, {
      width: '60%',
      maxWidth: '2000px',
      data: {
        isEdit: true,
        currentStep: 6,
        totalSteps: 7,
        previousStepData: this.step5Data,
        data: this.step6Data
      }
    });

    dialogRef6.afterClosed().subscribe(async result6 => {
      if (result6 && typeof result6 === 'object' && result6.action === 'back') {
        if (result6.currentStepData) {
          this.step6Data = result6.currentStepData;
        }
        this.openStep5Edit();
      } else if (result6 && typeof result6 === 'object' && result6.action === 'next') {
        this.step6Data = result6.stepData;
        console.log('Datos guardados del paso 6 al continuar:', this.step6Data);
        this.openStep7Edit();
      } else if (result6 === 'next') {
        this.step6Data = dialogRef6.componentInstance.form.value;
        console.log('Datos guardados del paso 6 al continuar (formato antiguo):', this.step6Data);
        this.openStep7Edit();
      } else if (result6 === 'cancel') {
        this.caseFormService.clearEditing();
      }
    });
  }

  async openStep7Edit() {
    const { RutaDeAtencionComponent } = await import('../../ui/case-form/steps/ruta-de-atencion.component');
    const dialogRef7 = this.dialog.open(RutaDeAtencionComponent, {
      width: '60%',
      maxWidth: '2000px',
      data: {
        isEdit: true,
        currentStep: 7,
        totalSteps: 7,
        previousStepData: this.step6Data,
        data: this.step7Data
      }
    });

    dialogRef7.afterClosed().subscribe(async result7 => {
      if (result7 && typeof result7 === 'object' && result7.action === 'back') {
        if (result7.currentStepData) {
          this.step7Data = result7.currentStepData;
        }
        this.openStep6Edit();
      } else if (result7 && typeof result7 === 'object' && result7.action === 'next') {
        this.step7Data = result7.stepData;
        console.log('Datos guardados del paso 7 al continuar:', this.step7Data);
        this.saveUpdatedCase();
      } else if (result7 === 'next') {
        this.step7Data = dialogRef7.componentInstance.form.value;
        console.log('Datos guardados del paso 7 al continuar (formato antiguo):', this.step7Data);
        this.saveUpdatedCase();
      } else if (result7 === 'cancel') {
        this.caseFormService.clearEditing();
      }
    });
  }

  saveUpdatedCase() {
    // Unir todos los datos de los pasos en un solo objeto plano
    const flatData = {
      ...this.step1Data,
      ...this.step2Data,
      ...this.step3Data,
      ...this.step4Data,
      ...this.step5Data,
      ...this.step6Data,
      ...this.step7Data
    };
    
    console.log('Caso actualizado como objeto plano:', flatData);
    
    // Guardar los datos del caso actualizado usando el servicio
    this.caseFormService.saveCreatedCase(flatData);
    
    // TODO: Enviar al backend para actualizar
    // Por ejemplo:
    // this.caseService.updateCase(flatData).subscribe(
    //   response => console.log('Caso actualizado:', response),
    //   error => console.error('Error:', error)
    // );
    
    this.caseFormService.clearEditing();
  }
}