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
import { Observable } from 'rxjs';
import { Subscription } from 'rxjs';
import { UsersService } from '../../../users/data-access/services/users-service';
import { User } from '../../../../common/models/user.model';

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
  assignedTo: string[];
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

  totalElements = 0;

  currentPage = 0;

  pageSize = 20;

  pageSizeOptions: number[] = [20, 50, 100];

  // Modal and user selection properties

  showUserModal: boolean = false;

  selectedCaseId: string = '';

  userSearchTerm: string = '';

  selectedUser: string = '';

  selectedUserIds: string[] = [];

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

  // Users data for assignment modal
  users: User[] = [];

  filteredUsers: User[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private routerSubscription: Subscription | null = null;
  private createdCaseSubscription: Subscription | null = null;
  private userRoles: string[] = [];
  private readonly ALLOWED_ROLES = ['PRESTADOR_SALUD', 'MUNICIPIO', 'CAJA_COMPENSACION', 'PROFESIONAL'];
  private readonly PROFESSIONAL_ASSIGNER_ROLES = ['MUNICIPIO', 'PRESTADOR_SALUD', 'CAJA_COMPENSACION'];

  constructor(
    private caseFormService: CaseFormService,
    private sidebarService: SidebarService,
    private router: Router,
    private confirmDialogService: ConfirmDialogService,
    private masterDataService: MasterDataService,
    private caseService: CaseService,
    private cdr: ChangeDetectorRef,
    private usersService: UsersService,
  ) {
    // Initialize with empty data, will be set in ngOnInit
  }

  // Events data from master data service

  public events$!: any;

  public allEvents: any[] = []; // Store original events

  public filteredEvents: any[] = [];

  cases: Case[] = [];

  ngAfterViewInit(): void {
    // No conectamos el paginator al dataSource porque usamos paginación del servidor
    // El paginator se controla manualmente con totalElements, currentPage y pageSize
  }

  ngOnInit(): void {
    // Cargar perfil del usuario para verificar roles antes de cargar casos
    this.loadUserProfile();

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
    }
  }

  deleteCase(caseId: string): void {
    // TODO: Implement delete functionality
  }

  filterCases(): void {
    // Mapear filtros del componente a CaseFilters del servicio
    const serverFilters = this.mapFiltersToServerFormat();

    // Resetear a página 0 cuando se aplican filtros
    this.currentPage = 0;

    // Cargar casos con filtros del servidor
    this.loadCases(this.currentPage, this.pageSize, serverFilters);
  }

  /**
   * Mapea los filtros del componente al formato CaseFilters del servicio
   */
  private mapFiltersToServerFormat(): any {
    const filters: any = {};

    // Mapear búsqueda por término
    if (this.searchTerm) {
      filters.upgdCode = this.searchTerm;
    }

    // Mapear filtro de evento
    if (this.activeFilters.eventId) {
      filters.eventCode = this.activeFilters.eventId;
    }

    // Mapear filtro de categoría
    if (this.activeFilters.categoria) {
      filters.categoryEventCode = this.activeFilters.categoria;
    }

    // Mapear filtro de estado (como array)
    if (this.activeFilters.estado) {
      filters.states = [this.activeFilters.estado];
    }

    // Mapear filtro de municipio
    if (this.activeFilters.municipio) {
      filters.cityCode = this.activeFilters.municipio;
    }

    // Mapear filtro de fecha de notificación
    if (this.activeFilters.fechaNotificacion) {
      filters.notificationDateStart = this.activeFilters.fechaNotificacion;
      filters.notificationDateEnd = this.activeFilters.fechaNotificacion;
    }

    return filters;
  }

  /**
   * Carga el perfil del usuario para obtener sus roles
   */
  private loadUserProfile(): void {
    this.usersService.getMyProfile().subscribe({
      next: (user) => {
        // Extraer los nombres de los roles del usuario
        if (user.roles && user.roles.length > 0) {
          this.userRoles = user.roles.map(role => role.name);
        } else {
          this.userRoles = [];
        }
        // Cargar casos después de obtener los roles del usuario
        this.loadCases();
      },
      error: (error) => {
        console.error('Error al cargar perfil del usuario:', error);
        this.userRoles = [];
        // Cargar casos incluso si falla la carga del perfil (usará endpoint por defecto)
        this.loadCases();
      },
    });
  }

  /**
   * Verifica si el usuario tiene alguno de los roles permitidos
   */
  private hasAllowedRole(): boolean {
    return this.userRoles.some(role => this.ALLOWED_ROLES.includes(role));
  }

  /**
   * Verifica si el usuario puede asignar profesionales (roles MUNICIPIO, PRESTADOR_SALUD, CAJA_COMPENSACION)
   */
  private canAssignProfessionals(): boolean {
    return this.userRoles.some(role => this.PROFESSIONAL_ASSIGNER_ROLES.includes(role));
  }

  /**



   * Carga los casos desde el backend usando CaseService
   * @param page Número de página (0-indexed para paginator, se convierte a 1-indexed para backend)
   * @param size Tamaño de página
   * @param filters Filtros opcionales para la consulta



   */

  private loadCases(page: number = 0, size: number = 20, filters?: any): void {
    // Convertir de 0-indexed (paginator) a 1-indexed (backend)
    const backendPage = page + 1;

    // Decidir qué endpoint usar según los roles del usuario
    const caseObservable = this.hasAllowedRole()
      ? this.caseService.getMyCases({
          page: backendPage,
          size: size,
          ...filters,
        })
      : this.caseService.getCasesPage({
          page: backendPage,
          size: size,
          ...filters,
        });

    caseObservable.subscribe({
      next: (response) => {
        // Guardar el total de elementos del backend
        this.totalElements = response.totalElements;
        // Convertir de 1-indexed (backend) a 0-indexed (paginator)
        this.currentPage = response.number - 1;
        this.pageSize = response.size;

        // Transformar CaseBasic a la estructura de Case usada en la tabla

        const transformedCases = response.content.map((caseBasic: CaseBasic) =>
          this.transformCaseBasicToCase(caseBasic),
        );

        this.cases = transformedCases;

        this.dataSource.data = this.cases;

        // Actualizar explícitamente el length del paginator
        if (this.paginator) {
          this.paginator.length = this.totalElements;
            this.paginator.pageIndex = this.currentPage;
            this.paginator.pageSize = this.pageSize;
          }

          // Forzar detección de cambios
          this.cdr.detectChanges();
        },

        error: (error) => {
          console.error('Error al cargar casos:', error);

          // En caso de error, dejar el array vacío o usar datos mock solo en desarrollo

          this.cases = [];

          this.dataSource.data = this.cases;
          this.totalElements = 0;

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

    // Extraer nombres de usuarios asignados del array assignees
    const assignedNames = c.assignees && c.assignees.length > 0
      ? c.assignees.map(assignee => `${assignee.firstName} ${assignee.lastName}`)
      : [];

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

      assignedTo: assignedNames,
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
    }
  }

  openUserModal(caseId: string): void {
    this.selectedCaseId = caseId;

    this.showUserModal = true;

    this.userSearchTerm = '';

    // Initialize selected user IDs from current case assignments
    this.selectedUserIds = [];

    // Load users by roles from backend
    this.loadUsersByRoles();
  }

  /**
   * Carga usuarios disponibles para asignar a un caso específico
   * - Si el usuario tiene roles MUNICIPIO, PRESTADOR_SALUD, CAJA_COMPENSACION: carga profesionales (GET /api/v1/cases/:caseId/available-professionals)
   * - De lo contrario: carga responsables (GET /api/v1/cases/:caseId/available-responsibles)
   */
  private loadUsersByRoles(): void {
    const caseIdNumber = parseInt(this.selectedCaseId, 10);

    if (isNaN(caseIdNumber)) {
      console.error('Error: caseId no es un número válido:', this.selectedCaseId);
      this.users = [];
      this.filteredUsers = [];
      this.cdr.detectChanges();
      return;
    }

    // Decidir qué endpoint usar según los roles del usuario
    const usersObservable = this.canAssignProfessionals()
      ? this.caseService.getAvailableProfessionals(caseIdNumber)
      : this.caseService.getAvailableResponsibles(caseIdNumber);

    usersObservable.subscribe({
      next: (users) => {
        this.users = users;
        this.filteredUsers = [...this.users];
        // Forzar detección de cambios para actualizar la vista inmediatamente
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar usuarios disponibles para el caso:', error);
        // En caso de error, dejar el array vacío
        this.users = [];
        this.filteredUsers = [];
        // Forzar detección de cambios incluso en caso de error
        this.cdr.detectChanges();
      },
    });
  }

  closeUserModal(): void {
    this.showUserModal = false;

    this.selectedCaseId = '';

    this.userSearchTerm = '';

    this.selectedUserIds = [];
  }

  filterUsers(): void {
    if (this.userSearchTerm) {
      const searchLower = this.userSearchTerm.toLowerCase();

      this.filteredUsers = this.users.filter(
        (user) =>
          (user.fullName && user.fullName.toLowerCase().includes(searchLower)) ||
          (user.email && user.email.toLowerCase().includes(searchLower)) ||
          (user.roles && user.roles.some((role) => role.name.toLowerCase().includes(searchLower))),
      );
    } else {
      this.filteredUsers = [...this.users];
    }
  }

  toggleUserSelection(user: User): void {
    if (!user.id) return;
    
    const userId = user.id;
    const userIndex = this.selectedUserIds.indexOf(userId);

    if (userIndex > -1) {
      // User already selected, remove them
      this.selectedUserIds.splice(userIndex, 1);
    } else {
      // User not selected, add them
      this.selectedUserIds.push(userId);
    }
  }

  isUserSelected(user: User): boolean {
    if (!user.id) return false;
    return this.selectedUserIds.includes(user.id);
  }

  /**
   * Formatea los roles de un usuario como un string separado por comas
   * @param user Usuario del cual obtener los roles
   * @returns String con los nombres de los roles separados por comas
   */
  getUserRolesString(user: User): string {
    if (!user.roles || user.roles.length === 0) {
      return '';
    }
    return user.roles.map((role) => role.name).join(', ');
  }

  toggleFiltersDropdown(): void {
    this.showFiltersDropdown = !this.showFiltersDropdown;
  }

  saveUserSelections(): void {
    if (this.selectedUserIds.length === 0) {
      return;
    }

    // Obtener información del caso
    const caseItem = this.cases.find((c) => c.id === this.selectedCaseId);
    const caseCode = caseItem?.upgdCode || this.selectedCaseId;

    // Obtener nombres de usuarios seleccionados para el mensaje de confirmación
    const selectedUsersList = this.users.filter(user => user.id && this.selectedUserIds.includes(user.id));
    const usersNames = selectedUsersList.map(u => u.fullName || `${u.firstName} ${u.lastName}`).join(', ');

    // Determinar si estamos asignando profesionales o responsables según los roles del usuario
    const isAssigningProfessionals = this.canAssignProfessionals();

    // Crear mensaje de confirmación según el tipo de asignación
    const message =
      this.selectedUserIds.length === 1
        ? isAssigningProfessionals
          ? `¿Está seguro que desea asignar el profesional "${usersNames}" al caso ${caseCode}?`
          : `¿Está seguro que desea asignar el responsable "${usersNames}" al caso ${caseCode}?`
        : isAssigningProfessionals
          ? `¿Está seguro que desea asignar los siguientes profesionales al caso ${caseCode}: ${usersNames}?`
          : `¿Está seguro que desea asignar los siguientes responsables al caso ${caseCode}: ${usersNames}?`;

    const confirmData: ConfirmDialogData = {
      title: isAssigningProfessionals ? 'Confirmar Asignación de Profesionales' : 'Confirmar Asignación de Responsables',
      message: message,
      confirmText: 'Asignar',
      cancelText: 'Cancelar',
      type: 'success',
    };

    this.confirmDialogService.customConfirm(confirmData).subscribe((result) => {
      if (result && result.confirmed) {
        // Convertir caseId de string a número
        const caseIdNumber = parseInt(this.selectedCaseId, 10);

        if (isNaN(caseIdNumber)) {
          console.error('Error: caseId no es un número válido:', this.selectedCaseId);
          return;
        }

        // Decidir qué servicio usar según los roles del usuario
        const assignmentObservable: Observable<any> = isAssigningProfessionals
          ? this.caseService.assignProfessionalToCase(caseIdNumber, this.selectedUserIds[0])
          : this.caseService.assignUsersToCase(caseIdNumber, this.selectedUserIds);

        assignmentObservable.subscribe({
          next: (response: any) => {
            // Actualizar la UI con los nombres de los usuarios asignados
            const caseIndex = this.cases.findIndex((c) => c.id === this.selectedCaseId);
            if (caseIndex !== -1) {
              this.cases[caseIndex].assignedTo = [...usersNames.split(', ')];

              // Update data source as well
              const dataSourceIndex = this.dataSource.data.findIndex(
                (c) => c.id === this.selectedCaseId,
              );
              if (dataSourceIndex !== -1) {
                this.dataSource.data[dataSourceIndex].assignedTo = [...usersNames.split(', ')];
              }
            }

            this.closeUserModal();

            // Mostrar modal de confirmación exitosa
            const successData: ConfirmDialogData = {
              title: 'Asignación Completada',
              message: this.selectedUserIds.length === 1
                ? `El responsable "${usersNames}" ha sido asignado exitosamente al caso ${caseCode}.`
                : `Los responsables han sido asignados exitosamente al caso ${caseCode}.`,
              confirmText: 'Aceptar',
              type: 'success',
            };
            this.confirmDialogService.customConfirm(successData).subscribe();
          },
          error: (error: any) => {
            console.error('Error al asignar usuarios al caso:', error);
            const errorData: ConfirmDialogData = {
              title: 'Error en Asignación',
              message: 'Error al asignar usuarios. Por favor intente nuevamente.',
              confirmText: 'Aceptar',
              type: 'error',
            };
            this.confirmDialogService.customConfirm(errorData).subscribe();
          }
        });
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

  /**
   * Maneja el cambio de página en el paginator
   * @param event Evento del paginator con pageIndex y pageSize
   */
  onPageChange(event: any): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;

    // Incluir filtros actuales al cambiar de página
    const serverFilters = this.mapFiltersToServerFormat();
    this.loadCases(this.currentPage, this.pageSize, serverFilters);
  }
}
