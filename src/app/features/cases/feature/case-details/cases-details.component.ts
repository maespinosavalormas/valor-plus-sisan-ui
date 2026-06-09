import { Component, OnInit, Input, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { CaseTraceabilityComponent } from '../case-traceability/case-traceability.component';
import { CaseNutritionalMonitoringComponent } from '../case-nutritional-monitoring/case-nutritional-monitoring.component';
import { CaseDetailsHeaderComponent, CaseViewType } from '../../ui/case-details-header/case-details-header.component';
import { CaseTasksComponent } from '../case-tasks/case-tasks.component';
import { CaseService, CaseFull, ResolvedMasterRecord } from '../../data-access/services/case.service';

@Component({
  selector: 'app-cases-details',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatDialogModule, CaseTraceabilityComponent, CaseNutritionalMonitoringComponent, CaseDetailsHeaderComponent, CaseTasksComponent],
  templateUrl: './cases-details.component.html',
  styleUrls: ['./cases-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CasesDetailsComponent implements OnInit {
  @Input() caseId: string | null = null;
  selectedCaseInfo: CaseFull | null = null;
  currentView: CaseViewType = 'details';
  isLoading = false;
  errorMessage: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private caseService: CaseService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.caseId = this.route.snapshot.paramMap.get('id');
    this.loadCaseDetails();
  }

  onBackClick(): void {
    this.router.navigate(['/cases']);
  }

  onViewChange(view: CaseViewType): void {
    this.currentView = view;
    this.cdr.markForCheck();
  }

  getCaseName(): string {
    const patient = this.selectedCaseInfo?.patientInformation;
    if (patient?.firstName && patient?.firstLastName) {
      return `${patient.firstName} ${patient.middleName || ''} ${patient.firstLastName} ${patient.secondLastName || ''}`.trim();
    }
    return 'Detalles del Caso';
  }

  getStatusClass(): string {
    const code = this.selectedCaseInfo?.state?.code?.toLowerCase() || '';
    const name = this.selectedCaseInfo?.state?.name?.toLowerCase() || '';
    switch (name || code) {
      case 'activo':
      case 'active':
        return 'status-active';
      case 'completado':
      case 'completed':
        return 'status-completed';
      case 'cancelado':
      case 'cancelled':
        return 'status-cancelled';
      default:
        return 'status-active';
    }
  }

  getStatusLabel(): string {
    return this.selectedCaseInfo?.state?.name || '—';
  }

  loadCaseDetails(): void {
    if (!this.caseId || this.caseId === 'null' || this.caseId === 'undefined') {
      console.error('Invalid caseId:', this.caseId);
      this.errorMessage = 'ID de caso inválido';
      this.cdr.markForCheck();
      return;
    }

    const caseIdNum = Number(this.caseId);
    if (isNaN(caseIdNum) || caseIdNum <= 0) {
      console.error('Invalid caseId number:', this.caseId);
      this.errorMessage = 'ID de caso inválido';
      this.cdr.markForCheck();
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    this.caseService.getCaseById(caseIdNum).subscribe({
      next: (caseData) => {
        this.selectedCaseInfo = caseData;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error al cargar caso:', error);
        this.errorMessage = error?.error?.message || 'Error al cargar los detalles del caso.';
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  onCloseModal(): void {
    this.onBackClick();
  }

  openTraceabilityDialog(): void {
    this.router.navigate(['/cases', this.caseId, 'traceability']);
  }

  masterName(record: ResolvedMasterRecord | null | undefined): string {
    return record?.name || '—';
  }
}
