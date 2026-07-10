import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pcd-emergencies-details-header',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './pcd-emergencies-details-header.html',
  styleUrl: './pcd-emergencies-details-header.scss'
})
export class PcdEmergenciesDetailsHeaderComponent {
  @Input() emergency: any = null;
  @Input() showBackButton: boolean = true;
  @Input() activeView: 'details' | 'traceability' = 'details';
  @Output() backClicked = new EventEmitter<void>();
  @Output() viewChanged = new EventEmitter<'details' | 'traceability'>();
  @Output() editClicked = new EventEmitter<void>();

  constructor(private router: Router) {}

  getStatusClass(autoriza?: string): string {
    return autoriza === 'Si' ? 'status-authorized' : 'status-pending';
  }

  getStatusLabel(autoriza?: string): string {
    return autoriza === 'Si' ? 'Autorizado' : 'Pendiente';
  }

  onBack(): void {
    this.backClicked.emit();
    // Also navigate back to emergencies page
    this.router.navigate(['/pcd-emergencies']);
  }

  onViewChange(view: 'details' | 'traceability'): void {
    this.viewChanged.emit(view);
  }

  onEditClick(): void {
    this.editClicked.emit();
  }

  getBeneficiaryName(): string {
    if (!this.emergency) return 'Emergencia PCD';
    
    const firstName = this.emergency.primerNombreBeneficiario || '';
    const lastName = this.emergency.primerApellidoBeneficiario || '';
    const secondLastName = this.emergency.segundoApellidoBeneficiario || '';
    
    return `${firstName} ${lastName} ${secondLastName}`.trim() || 'Emergencia PCD';
  }

  getEmergencyId(): string {
    return this.emergency?.id || 'N/A';
  }
}
