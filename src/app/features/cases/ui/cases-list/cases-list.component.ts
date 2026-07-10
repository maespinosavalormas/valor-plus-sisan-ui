import { Component, ViewChild, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CaseFormService } from '../../data-access/services/case-form.service';
import { CaseFormData } from '../case-form/services/form-data.service';
import { MatDivider } from '@angular/material/divider';
import { SidebarService } from '../../../../common/services/sidebar.service';
import { Router, NavigationEnd } from '@angular/router';
import { ConfirmDialogService, ConfirmDialogData } from '../confirm-dialog/confirm-dialog';
import { MasterDataService } from '../case-form/services/master-data.service';
import { CaseService, CasePage, CaseBasic } from '../../data-access/services/case.service';
import { Subscription } from 'rxjs';

export interface Case {
  id: string;
  // Campos para el listado (mismos nombres que CaseFormData)
  upgdCode: string;
  eventId: string;
  upgdnName: string;
  municipio: string;
  notificationDate: Date;
  categoria?: string;
  estado?: string;
  assignedTo?: string[];
  fechaNotificacion?: string;
  // Todos los campos del formulario (77 campos)

  identificationTypeId: string | null;

  identificationNumber: string;

  firstName: string;

  middleName: string;

  firstLastName: string;

  secondLastName: string;

  phoneNumber: string;

  birthDate: Date;

  age: number;

  ageUnitId: string | null;

  nationalityCountryId: number | null;

  genderId: string | null;

  genderIdentityId: string | null;

  genderIdentityOther: string;

  sexualOrientationId: string | null;

  sexualOrientationOther: string;

  countryId: number | null;

  provinceId: number | null;

  cityId: number | null;

  areaId: string | null;

  locality: string;

  neighborhood: string;

  populatedCenter: string;

  ruralArea: string;

  occupationId: number | null;

  healthInsuranceRegimeId: string | null;

  benefitsPlanAdministratorName: string;

  ethnicityId: string | null;

  ethnicityOther: string;

  stratumId: string | null;

  populationGroupId: string | null;

  populationGroupPregnant: string;

  notificationSourceId: string | null;

  notificationCountryId: number | null;

  notificationProvinceId: number | null;

  notificationCityId: number | null;

  address: string;

  consultationDate: Date;

  initialSymptomsDate: Date;

  initialClasificationId: string | null;

  hospitalized: boolean;

  hospitalizedDate: Date;

  finalConditionId: string | null;

  deathDate: Date | null;

  deathCertificateNumber: string;

  deathCauseId: number | null;

  professionalName: string;

  professionalPhoneNumber: string;

  motherFirstName: string;

  motherMiddleName: string;

  motherFirstLastName: string;

  motherSecondLastName: string;

  documentTypeId: string | null;

  documentNumber: string;

  educationalLevelId: string | null;

  childrenNumber: number;

  birthWeight: number;

  birthLength: number;

  gestationalAgeAtBirth: number;

  breastfeedingDuration: number;

  complementaryFeedingStartAge: number;

  enrolledInGrowthMonitoringId: boolean;

  immunizationStatusId: string;

  referredByVaccinationCard: boolean;

  currentWeight: number;

  currentHeight: number;

  midUpperArmCircumference: number;

  appetiteTestResultId: string;

  edemaPresent: boolean;

  visibleWasting: boolean;

  dryOrRoughSkin: boolean;

  skinPigmentationChanges: boolean;

  hairChanges: boolean;

  clinicalAnemiaSigns: boolean;

  carePathwayActivated: boolean;

  typeOfCareProvidedId: string;

  medicalDiagnosisId: number;
}

@Component({
  selector: 'app-cases-list',

  standalone: true,

  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatSelectModule,
    MatOptionModule,
    MatPaginatorModule,
    MatCheckboxModule,
    NgxMatSelectSearchModule,
  ],

  templateUrl: './cases-list.component.html',

  styleUrls: ['./cases-list.component.scss'],
})
export class CasesListComponent implements AfterViewInit, OnDestroy {
  searchTerm: string = '';

  selectedCategoria: string = '';

  displayedColumns: string[] = [
    'upgdCode',
    'eventId',
    'upgdnName',
    'municipio',
    'fechaNotificacion',
    'categoria',
    'estado',
    'assignedTo',
    'actions',
  ];

  // Pagination properties

  dataSource = new MatTableDataSource<Case>();

  pageSize = 20;

  pageSizeOptions: number[] = [20, 50, 100];

  // Modal and user selection properties

  showUserModal: boolean = false;

  selectedCaseId: string = '';

  userSearchTerm: string = '';

  selectedUser: string = '';

  selectedUsers: string[] = [];

  // Case info modal properties

  showCaseInfoModal: boolean = false;

  selectedCaseInfo: Case | null = null;

  // Filters modal properties

  showFiltersModal: boolean = false;

  showFiltersDropdown: boolean = false;

  filtersModal = {
    categoria: '',

    estado: '',

    municipio: '',

    fechaNotificacion: '',

    eventId: '',
  };

  activeFilters = {
    categoria: '',

    estado: '',

    municipio: '',

    fechaNotificacion: '',

    eventId: '',
  };

  // Event filter controls for ngx-mat-select-search

  public eventCtrl: FormControl = new FormControl();

  public eventFilterCtrl: FormControl = new FormControl();

  // Sample prestadores de salud y municipios data

  users = [
    { id: '1', name: 'Hospital San Juan de Dios', type: 'hospital', email: 'sanjuan@hospital.com' },

    { id: '2', name: 'Clínica Las Américas', type: 'clinica', email: 'americas@clinica.com' },

    { id: '3', name: 'Municipio de Medellín', type: 'municipio', email: 'medellin@municipio.gov' },

    { id: '4', name: 'Hospital Pablo Tobón Uribe', type: 'hospital', email: 'tobon@hospital.com' },

    { id: '5', name: 'Municipio de Envigado', type: 'municipio', email: 'envigado@municipio.gov' },

    { id: '6', name: 'Clínica del Country', type: 'clinica', email: 'country@clinica.com' },

    { id: '7', name: 'Municipio de Bello', type: 'municipio', email: 'bello@municipio.gov' },

    {
      id: '8',
      name: 'Hospital General de Medellín',
      type: 'hospital',
      email: 'general@hospital.com',
    },
  ];

  filteredUsers = [...this.users];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private routerSubscription: Subscription | null = null;
  private createdCaseSubscription: Subscription | null = null;

  constructor(
    private caseFormService: CaseFormService,
    private sidebarService: SidebarService,
    private router: Router,
    private confirmDialogService: ConfirmDialogService,
    private masterDataService: MasterDataService,
    private caseService: CaseService,
    private cdr: ChangeDetectorRef,
  ) {
    // Initialize with empty data, will be set in ngOnInit
  }

  // Events data from master data service

  public events$!: any;

  public allEvents: any[] = []; // Store original events

  public filteredEvents: any[] = [];

  cases: Case[] = [
    {
      id: '1',
      upgdCode: '00001',
      eventId: '1',
      upgdnName: 'Hospital San Juan de Dios',
      municipio: 'Medellín',
      notificationDate: new Date('2024-01-15'),
      fechaNotificacion: '2024-01-15',
      categoria: 'Riesgo desnutricion',
      estado: 'ACTIVO',

      identificationTypeId: 'CC',
      identificationNumber: '80123456',
      firstName: 'MARÍA',
      middleName: 'EUGENIA',
      firstLastName: 'GONZÁLEZ',
      secondLastName: 'PÉREZ',
      phoneNumber: '3001234567',

      birthDate: new Date('1990-05-15'),
      age: 33,
      ageUnitId: '1',
      nationalityCountryId: 45,
      genderId: 'F',
      genderIdentityId: '2',
      genderIdentityOther: '',

      sexualOrientationId: '1',
      sexualOrientationOther: '',
      countryId: 45,
      provinceId: 5,
      cityId: 501,
      areaId: '1',
      locality: 'LAURELES',

      neighborhood: 'BOSTON',
      populatedCenter: 'MEDELLÍN',
      ruralArea: 'SANTA ELENA',
      occupationId: 1,
      healthInsuranceRegimeId: '1',

      benefitsPlanAdministratorName: 'SURA',
      ethnicityId: '1',
      ethnicityOther: '',
      stratumId: '3',
      populationGroupId: '1',

      populationGroupPregnant: '',
      notificationSourceId: '1',
      notificationCountryId: 45,
      notificationProvinceId: 5,
      notificationCityId: 501,

      address: 'CALLE 45 #23-67',
      consultationDate: new Date('2024-01-12'),
      initialSymptomsDate: new Date('2024-01-10'),

      initialClasificationId: '2',
      hospitalized: true,
      hospitalizedDate: new Date('2024-01-12'),
      finalConditionId: '1',

      deathDate: null as any,
      deathCertificateNumber: '',
      deathCauseId: null,
      professionalName: 'DR. CARLOS RODRÍGUEZ',

      professionalPhoneNumber: '3001234567',
      motherFirstName: 'ANA',
      motherMiddleName: 'LUCIA',
      motherFirstLastName: 'PÉREZ',

      motherSecondLastName: 'GARCÍA',
      documentTypeId: 'CC',
      documentNumber: '50789123',
      educationalLevelId: 'BÁSICA PRIMARIA',

      childrenNumber: 2,
      birthWeight: 3000,
      birthLength: 50,
      gestationalAgeAtBirth: 38,
      breastfeedingDuration: 6,

      complementaryFeedingStartAge: 6,
      enrolledInGrowthMonitoringId: true,
      immunizationStatusId: '1',

      referredByVaccinationCard: true,
      currentWeight: 65.5,
      currentHeight: 165.2,
      midUpperArmCircumference: 25.3,

      appetiteTestResultId: '1',
      edemaPresent: true,
      visibleWasting: false,
      dryOrRoughSkin: false,

      skinPigmentationChanges: true,
      hairChanges: false,
      clinicalAnemiaSigns: false,

      carePathwayActivated: true,
      typeOfCareProvidedId: 'HOSPITALARIA',
      medicalDiagnosisId: 150,
    },
  ];

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  ngOnInit(): void {
    // Cargar casos desde el backend
    this.loadCases();

    this.events$ = this.masterDataService.getEvents();

    this.events$.subscribe((events: any[]) => {
      this.allEvents = events; // Store original events

      this.filteredEvents = [...events]; // Initialize filtered events
    });

    // Set up ngx-mat-select-search filtering

    this.eventFilterCtrl.valueChanges.subscribe((search) => {
      this.filteredEvents = this.filterEvents(search);
    });

    // Update filtersModal.eventId when event selection changes

    this.eventCtrl.valueChanges.subscribe((selectedEvent) => {
      if (selectedEvent) {
        this.filtersModal.eventId = selectedEvent.id;
      } else {
        this.filtersModal.eventId = '';
      }
    });

    // Suscribirse a eventos de navegación para recargar casos al regresar
    this.routerSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // Recargar casos cuando el usuario regresa a la página de lista
        if (event.url === '/cases' || event.urlAfterRedirects === '/cases') {
          this.loadCases();
        }
      }
    });

    // Suscribirse a casos creados para recargar la lista automáticamente
    this.createdCaseSubscription = this.caseFormService.getCreatedCase().subscribe((caseData) => {
      if (caseData) {
        console.log('Nuevo caso creado detectado, recargando lista...');
        this.loadCases();
        // Limpiar el caso creado para evitar recargas múltiples
        this.caseFormService.clearCreatedCase();
      }
    });
  }

  private filterEvents(search: string): any[] {
    if (!search || search.trim() === '') {
      return [...this.allEvents]; // Return all events if no search term
    }

    const searchLower = search.toLowerCase().trim();

    return this.allEvents.filter(
      (event: any) =>
        (event.name && event.name.toLowerCase().includes(searchLower)) ||
        (event.id && event.id.toString().toLowerCase().includes(searchLower)),
    );
  }

  calcularCodigoUgdp(codigoDepartamento: string, codigoMunicipio: string): string {
    return codigoDepartamento + codigoMunicipio;
  }

  editCase(caseId: string): void {
    const caseToEdit = this.cases.find((c) => c.id === caseId);

    if (caseToEdit) {
      this.caseFormService.editCase(caseToEdit);

      console.log('Iniciando edición del caso con datos completos:', caseToEdit);
    }
  }

  deleteCase(caseId: string): void {
    console.log('Delete case:', caseId);

    // TODO: Implement delete functionality
  }

  filterCases(): void {
    let filtered = [...this.cases];

    // Filter by search term

    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase();

      filtered = filtered.filter(
        (caseItem) =>
          caseItem.upgdCode.toLowerCase().includes(searchLower) ||
          caseItem.eventId.toLowerCase().includes(searchLower) ||
          caseItem.upgdnName.toLowerCase().includes(searchLower) ||
          (caseItem.fechaNotificacion && caseItem.fechaNotificacion.includes(searchLower)) ||
          (caseItem.categoria && caseItem.categoria.toLowerCase().includes(searchLower)),
      );
    }

    // Filter by active filters

    if (this.activeFilters.categoria) {
      filtered = filtered.filter((caseItem) => caseItem.categoria === this.activeFilters.categoria);
    }

    if (this.activeFilters.estado) {
      filtered = filtered.filter((caseItem) => caseItem.estado === this.activeFilters.estado);
    }

    if (this.activeFilters.municipio) {
      const municipioLower = this.activeFilters.municipio.toLowerCase();

      filtered = filtered.filter((caseItem) =>
        caseItem.municipio.toLowerCase().includes(municipioLower),
      );
    }

    if (this.activeFilters.fechaNotificacion) {
      filtered = filtered.filter(
        (caseItem) => caseItem.fechaNotificacion === this.activeFilters.fechaNotificacion,
      );
    }

    this.dataSource.data = filtered;
  }

  /**



   * Carga los casos desde el backend usando CaseService



   */

  private loadCases(): void {
    this.caseService
      .getCasesPage({
        page: 1,

        size: 20,
      })
      .subscribe({
        next: (response) => {
          console.log('Casos cargados desde el backend:', response);

          // Transformar CaseBasic a la estructura de Case usada en la tabla

          const transformedCases = response.content.map((caseBasic: CaseBasic) =>
            this.transformCaseBasicToCase(caseBasic),
          );

          this.cases = transformedCases;

          this.dataSource.data = this.cases;

          // Forzar detección de cambios
          this.cdr.detectChanges();
        },

        error: (error) => {
          console.error('Error al cargar casos:', error);

          // En caso de error, dejar el array vacío o usar datos mock solo en desarrollo

          this.cases = [];

          this.dataSource.data = this.cases;

          // Forzar detección de cambios
          this.cdr.detectChanges();
        },
      });
  }

  /**



   * Transforma un CaseBasic del backend al formato Case usado en la tabla



   */

  private transformCaseBasicToCase(caseBasic: CaseBasic): Case {
    const c = caseBasic.case;

    return {
      id: String(c.id),

      upgdCode: c.upgdCode,

      eventId: c.event?.code || '',

      upgdnName: c.upgdName,

      municipio: c.city?.name || '',

      notificationDate: c.notificationDate ? new Date(c.notificationDate) : new Date(),

      fechaNotificacion: c.notificationDate
        ? new Date(c.notificationDate).toISOString().split('T')[0]
        : '',

      categoria: c.category?.name || '',

      estado: c.state?.name || '',

      assignedTo: '', // Campo opcional, se puede agregar lógica si es necesario
    } as unknown as Case;
  }

  clearSearch(): void {
    this.searchTerm = '';

    this.filterCases();
  }

  onToggleStatus(caseItem: Case, newStatus: string): void {
    const caseIndex = this.cases.findIndex((c) => c.id === caseItem.id);

    if (caseIndex !== -1) {
      this.cases[caseIndex].estado = newStatus;

      // Update data source as well

      const dataSourceIndex = this.dataSource.data.findIndex((c) => c.id === caseItem.id);

      if (dataSourceIndex !== -1) {
        this.dataSource.data[dataSourceIndex].estado = newStatus;
      }

      console.log(`Case ${caseItem.id} status changed to: ${newStatus}`);
    }
  }

  openUserModal(caseId: string): void {
    this.selectedCaseId = caseId;

    this.showUserModal = true;

    this.userSearchTerm = '';

    this.filteredUsers = [...this.users];

    // Initialize selected users from current case assignments

    const caseItem = this.cases.find((c) => c.id === caseId);

    this.selectedUsers = caseItem?.assignedTo ? [...caseItem.assignedTo] : [];
  }

  closeUserModal(): void {
    this.showUserModal = false;

    this.selectedCaseId = '';

    this.userSearchTerm = '';

    this.selectedUsers = [];
  }

  filterUsers(): void {
    if (this.userSearchTerm) {
      const searchLower = this.userSearchTerm.toLowerCase();

      this.filteredUsers = this.users.filter(
        (user) =>
          user.name.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower),
      );
    } else {
      this.filteredUsers = [...this.users];
    }
  }

  toggleUserSelection(user: any): void {
    const userIndex = this.selectedUsers.indexOf(user.name);

    if (userIndex > -1) {
      // User already selected, remove them

      this.selectedUsers.splice(userIndex, 1);
    } else {
      // User not selected, add them

      this.selectedUsers.push(user.name);
    }
  }

  isUserSelected(user: any): boolean {
    return this.selectedUsers.includes(user.name);
  }

  toggleFiltersDropdown(): void {
    this.showFiltersDropdown = !this.showFiltersDropdown;
  }

  saveUserSelections(): void {
    if (this.selectedUsers.length === 0) {
      return;
    }

    // Obtener información del caso

    const caseItem = this.cases.find((c) => c.id === this.selectedCaseId);

    const caseCode = caseItem?.upgdCode || this.selectedCaseId;

    // Crear mensaje de confirmación

    const usersList = this.selectedUsers.join(', ');

    const message =
      this.selectedUsers.length === 1
        ? `¿Está seguro que desea asignar el responsable "${usersList}" al caso ${caseCode}?`
        : `¿Está seguro que desea asignar los siguientes responsables al caso ${caseCode}: ${usersList}?`;

    const confirmData: ConfirmDialogData = {
      title: 'Confirmar Asignación de Responsables',

      message: message,

      confirmText: 'Asignar',

      cancelText: 'Cancelar',

      type: 'success',
    };

    this.confirmDialogService.customConfirm(confirmData).subscribe((result) => {
      if (result && result.confirmed) {
        // Usuario confirmó, asignar los usuarios al caso

        const caseIndex = this.cases.findIndex((c) => c.id === this.selectedCaseId);

        if (caseIndex !== -1) {
          this.cases[caseIndex].assignedTo = [...this.selectedUsers];

          // Update data source as well

          const dataSourceIndex = this.dataSource.data.findIndex(
            (c) => c.id === this.selectedCaseId,
          );

          if (dataSourceIndex !== -1) {
            this.dataSource.data[dataSourceIndex].assignedTo = [...this.selectedUsers];
          }

          console.log(`Case ${this.selectedCaseId} assigned to:`, this.selectedUsers);
        }

        this.closeUserModal();
      }
    });
  }

  assignUserToCase(caseId: string, userNames: string[]): void {
    const caseIndex = this.cases.findIndex((c) => c.id === caseId);

    if (caseIndex !== -1) {
      this.cases[caseIndex].assignedTo = [...userNames];

      // Update data source as well

      const dataSourceIndex = this.dataSource.data.findIndex((c) => c.id === caseId);

      if (dataSourceIndex !== -1) {
        this.dataSource.data[dataSourceIndex].assignedTo = [...userNames];
      }

      console.log(`Case ${caseId} assigned to:`, userNames);
    }
  }

  navigateToCaseDetails(caseId: string): void {
    this.router.navigate(['/cases', caseId]);
  }

  addNewCase(): void {
    this.router.navigate(['/cases', 'new']);
  }

  viewCaseInfo(caseId: number): void {
    const caseToShow = this.cases.find((c) => c.id === caseId.toString());

    if (caseToShow) {
      // Close sidebar when opening modal

      this.sidebarService.close();

      this.selectedCaseInfo = caseToShow;

      this.showCaseInfoModal = true;

      console.log(`Viewing case information for case ID: ${caseId}`);
    }
  }

  closeCaseInfoModal(): void {
    this.showCaseInfoModal = false;

    this.selectedCaseInfo = null;
  }

  openFiltersModal(): void {
    this.showFiltersModal = true;

    // Copy active filters to modal

    this.filtersModal = { ...this.activeFilters };

    // Sync FormControl with current event selection

    if (this.filtersModal.eventId) {
      const selectedEvent = this.allEvents.find(
        (event) =>
          event.id === this.filtersModal.eventId || event.code === this.filtersModal.eventId,
      );

      if (selectedEvent) {
        this.eventCtrl.setValue(selectedEvent);
      }
    }
  }

  closeFiltersModal(): void {
    this.showFiltersModal = false;
  }

  applyFilters(): void {
    this.activeFilters = { ...this.filtersModal };

    this.filterCases();

    this.showFiltersDropdown = false; // Close dropdown
  }

  clearFilters(): void {
    this.filtersModal = {
      categoria: '',

      estado: '',

      municipio: '',

      fechaNotificacion: '',

      eventId: '',
    };

    this.activeFilters = { ...this.filtersModal }; // Reset active filters

    this.filterCases(); // Reapply filtering to show all cases

    // Reset FormControls

    this.eventCtrl.reset();

    this.eventFilterCtrl.reset();

    // Don't close dropdown - let user continue filtering
  }

  getActiveFiltersCount(): number {
    let count = 0;

    if (this.activeFilters.categoria) count++;

    if (this.activeFilters.estado) count++;

    if (this.activeFilters.municipio) count++;

    if (this.activeFilters.fechaNotificacion) count++;

    if (this.activeFilters.eventId) count++;

    return count;
  }

  hasActiveFilters(): boolean {
    return !!(
      this.activeFilters.categoria ||
      this.activeFilters.estado ||
      this.activeFilters.municipio ||
      this.activeFilters.fechaNotificacion ||
      this.activeFilters.eventId
    );
  }

  getEventName(eventId: string): string {
    if (!eventId || !this.allEvents) return '';

    const event = this.allEvents.find((e) => e.id === eventId || e.code === eventId);

    return event ? event.name : eventId;
  }

  getEstadoDisplay(estado: string): string {
    switch (estado?.toUpperCase()) {
      case 'ACTIVO':
        return 'En proceso';

      case 'INACTIVO':
        return 'Inactivo';

      case 'PENDIENTE':
        return 'Pendiente';

      case 'CERRADO':
        return 'Completado';

      default:
        return estado || '';
    }
  }

  ngOnDestroy(): void {
    // Limpiar suscripción del router para evitar memory leaks
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
      this.routerSubscription = null;
    }
    // Limpiar suscripción de casos creados
    if (this.createdCaseSubscription) {
      this.createdCaseSubscription.unsubscribe();
      this.createdCaseSubscription = null;
    }
  }
}
