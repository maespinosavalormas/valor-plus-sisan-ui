import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatOptionModule } from '@angular/material/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';

import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

import { MasterDataService } from '../../../cases/ui/case-form/services/master-data.service';
import { SidebarService } from '../../../../common/services/sidebar.service';

export interface Report {
  id: string;
  title: string;
  description: string;
  query: string;
}

export interface Case {
  id: string;
  upgdCode: string;
  eventId: string;
  upgdnName: string;
  municipio: string;
  notificationDate: Date;
  categoria?: string;
  estado?: string;
  assignedTo?: string[];
  fechaNotificacion?: string;

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
  selector: 'app-view-reports-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatSelectModule,
    MatOptionModule,
    MatPaginatorModule,
    NgxMatSelectSearchModule,
  ],
  templateUrl: './view-reports-page.component.html',
  styleUrls: ['./view-reports-page.component.scss'],
})
export class ViewReportsPageComponent implements AfterViewInit {
  searchTerm: string = '';

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

  dataSource = new MatTableDataSource<Case>();
  pageSize = 20;
  pageSizeOptions: number[] = [20, 50, 100];

  // Filters modal properties (same structure as cases-list)
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

  public eventCtrl: FormControl = new FormControl();
  public eventFilterCtrl: FormControl = new FormControl();

  public events$!: any;
  public allEvents: any[] = [];
  public filteredEvents: any[] = [];

  // Reports
  reports: Report[] = [
    {
      id: '1',
      title: 'Casos de Medellin y Envigado',
      description:
        'Reporte detallado de casos de desnutrición en los municipios de Medellín y Envigado, incluyendo estadísticas por edad, género y tipo de desnutrición.',
      query:
        "SELECT * FROM cases WHERE municipio IN ('Medellín', 'Envigado') AND categoria LIKE '%desnutricion%'",
    },
    {
      id: '2',
      title: 'Casos de Desnutrición Aguda',
      description:
        'Análisis de casos con diagnóstico de desnutrición aguda, incluyendo indicadores clínicos y evolución del paciente.',
      query: "SELECT * FROM cases WHERE categoria = 'Desnutricion aguda'",
    },
  ];

  selectedReport: Report | null = null;

  // Modal and user selection properties
  showUserModal: boolean = false;
  selectedCaseId: string = '';
  userSearchTerm: string = '';
  selectedUsers: string[] = [];
  filteredUsers: any[] = [];
  users: any[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  cases: Case[] = [];

  constructor(
    private sidebarService: SidebarService,
    private router: Router,
    private route: ActivatedRoute,
    private masterDataService: MasterDataService
  ) {
    // Initialize with empty data; in real app these would come from backend
    this.cases = [
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
        assignedTo: ['Municipio de Medellín'],

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
        deathDate: null,
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

    this.users = [
      { id: '1', name: 'Hospital San Juan de Dios', type: 'hospital', email: 'sanjuan@hospital.com' },
      { id: '3', name: 'Municipio de Medellín', type: 'municipio', email: 'medellin@municipio.gov' },
    ];

    this.filteredUsers = [...this.users];
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  ngOnInit(): void {
    this.dataSource.data = [...this.cases];

    this.events$ = this.masterDataService.getEvents();
    this.events$.subscribe((events: any[]) => {
      this.allEvents = events;
      this.filteredEvents = [...events];
    });

    this.eventFilterCtrl.valueChanges.subscribe((search: string) => {
      this.filteredEvents = this.filterEvents(search);
    });

    this.eventCtrl.valueChanges.subscribe((selectedEvent: any) => {
      this.filtersModal.eventId = selectedEvent ? selectedEvent.id : '';
    });

    this.route.queryParams.subscribe(params => {
      const reportId = params['reportId'];
      if (reportId) {
        const report = this.reports.find(r => r.id === reportId);
        if (report) {
          this.selectReport(report);
        }
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
        (event.id && event.id.toString().toLowerCase().includes(searchLower))
    );
  }

  selectReport(report: Report): void {
    this.selectedReport = report;
    this.filterCasesByReport(report.query);
  }

  filterCasesByReport(query: string): void {
    let filtered = [...this.cases];

    if (query.includes("municipio IN ('Medellín', 'Envigado')")) {
      filtered = filtered.filter(c => c.municipio === 'Medellín' || c.municipio === 'Envigado');
    }

    if (query.includes("categoria = 'Desnutricion aguda'")) {
      filtered = filtered.filter(c => c.categoria === 'Desnutricion aguda');
    }

    this.dataSource.data = filtered;
  }

  filterCases(): void {
    let filtered = [...this.cases];

    if (this.selectedReport) {
      filtered = this.applyReportFilter(filtered, this.selectedReport.query);
    }

    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(
        caseItem =>
          caseItem.upgdCode.toLowerCase().includes(searchLower) ||
          caseItem.eventId.toLowerCase().includes(searchLower) ||
          caseItem.upgdnName.toLowerCase().includes(searchLower) ||
          (caseItem.fechaNotificacion && caseItem.fechaNotificacion.includes(searchLower)) ||
          (caseItem.categoria && caseItem.categoria.toLowerCase().includes(searchLower))
      );
    }

    if (this.activeFilters.categoria) {
      filtered = filtered.filter(caseItem => caseItem.categoria === this.activeFilters.categoria);
    }

    if (this.activeFilters.estado) {
      filtered = filtered.filter(caseItem => caseItem.estado === this.activeFilters.estado);
    }

    if (this.activeFilters.municipio) {
      const municipioLower = this.activeFilters.municipio.toLowerCase();
      filtered = filtered.filter(caseItem => caseItem.municipio.toLowerCase().includes(municipioLower));
    }

    if (this.activeFilters.fechaNotificacion) {
      filtered = filtered.filter(caseItem => caseItem.fechaNotificacion === this.activeFilters.fechaNotificacion);
    }

    this.dataSource.data = filtered;
  }

  private applyReportFilter(cases: Case[], query: string): Case[] {
    let filtered = [...cases];

    if (query.includes("municipio IN ('Medellín', 'Envigado')")) {
      filtered = filtered.filter(c => c.municipio === 'Medellín' || c.municipio === 'Envigado');
    }

    if (query.includes("categoria = 'Desnutricion aguda'")) {
      filtered = filtered.filter(c => c.categoria === 'Desnutricion aguda');
    }

    return filtered;
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.filterCases();
  }

  toggleFiltersDropdown(): void {
    this.showFiltersDropdown = !this.showFiltersDropdown;
  }

  applyFilters(): void {
    this.activeFilters = { ...this.filtersModal };
    this.filterCases();
    this.showFiltersDropdown = false;
  }

  clearFilters(): void {
    this.filtersModal = {
      categoria: '',
      estado: '',
      municipio: '',
      fechaNotificacion: '',
      eventId: '',
    };

    this.activeFilters = { ...this.filtersModal };
    this.filterCases();

    this.eventCtrl.reset();
    this.eventFilterCtrl.reset();
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
    const event = this.allEvents.find(e => e.id === eventId || e.code === eventId);
    return event ? event.name : eventId;
  }

  getEstadoDisplay(estado?: string): string {
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

  openUserModal(caseId: string): void {
    this.selectedCaseId = caseId;
    this.showUserModal = true;
    this.userSearchTerm = '';
    this.filteredUsers = [...this.users];

    const caseItem = this.cases.find(c => c.id === caseId);
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
        user => user.name.toLowerCase().includes(searchLower) || user.email.toLowerCase().includes(searchLower)
      );
    } else {
      this.filteredUsers = [...this.users];
    }
  }

  toggleUserSelection(user: any): void {
    const userIndex = this.selectedUsers.indexOf(user.name);
    if (userIndex > -1) {
      this.selectedUsers.splice(userIndex, 1);
    } else {
      this.selectedUsers.push(user.name);
    }
  }

  isUserSelected(user: any): boolean {
    return this.selectedUsers.includes(user.name);
  }

  saveUserSelections(): void {
    const caseIndex = this.cases.findIndex(c => c.id === this.selectedCaseId);
    if (caseIndex !== -1) {
      this.cases[caseIndex].assignedTo = [...this.selectedUsers];
    }

    this.filterCases();
    this.closeUserModal();
  }

  navigateToCaseDetails(caseId: string): void {
    this.router.navigate(['/cases', caseId]);
  }

  goBack(): void {
    this.router.navigate(['/reports']);
  }
}
