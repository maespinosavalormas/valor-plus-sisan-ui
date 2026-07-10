import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { CaseFull } from '../../data-access/services/case.service';

export type CaseViewType = 'details' | 'nutritional' | 'trazability' | 'tasks';

@Component({
  selector: 'app-case-details-header',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './case-details-header.html',
  styleUrl: './case-details-header.scss'
})
export class CaseDetailsHeaderComponent {
  @Input() selectedCaseInfo: CaseFull | null = null;
  @Input() activeView: CaseViewType = 'details';
  @Output() backClicked = new EventEmitter<void>();
  @Output() viewChanged = new EventEmitter<CaseViewType>();

  constructor(private router: Router) {}

  getCaseName(): string {
    const patient = this.selectedCaseInfo?.patientInformation;
    if (patient?.firstName && patient?.firstLastName) {
      return `${patient.firstName} ${patient.middleName || ''} ${patient.firstLastName} ${patient.secondLastName || ''}`.trim();
    }
    return 'Detalles del Caso';
  }

  getStatusClass(): string {
    const name = this.selectedCaseInfo?.state?.name?.toLowerCase() || '';
    const code = this.selectedCaseInfo?.state?.code?.toLowerCase() || '';
    const status = name || code;
    switch (status) {
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

  onBack(): void {
    this.backClicked.emit();
    this.router.navigate(['/cases']);
  }

  onViewChange(view: CaseViewType): void {
    this.viewChanged.emit(view);
  }

  isDetailsView(): boolean {
    return this.activeView === 'details';
  }

  isNutritionalView(): boolean {
    return this.activeView === 'nutritional';
  }

  isTrazabilityView(): boolean {
    return this.activeView === 'trazability';
  }

  isTasksView(): boolean {
    return this.activeView === 'tasks';
  }
}
