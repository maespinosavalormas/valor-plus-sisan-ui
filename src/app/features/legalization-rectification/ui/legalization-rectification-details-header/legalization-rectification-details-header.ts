import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';

@Component({
  selector: 'app-legalization-rectification-details-header',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './legalization-rectification-details-header.html',
  styleUrl: './legalization-rectification-details-header.scss'
})
export class LegalizationRectificationDetailsHeaderComponent {
  @Input() rectification: any = null;
  @Input() showBackButton: boolean = true;
  @Input() activeView: 'details' | 'traceability' = 'details';
  @Output() backClicked = new EventEmitter<void>();
  @Output() viewChanged = new EventEmitter<'details' | 'traceability'>();
  @Output() editClicked = new EventEmitter<void>();

  constructor(private router: Router) {}

  getStatusClass(estadoSubsanacion?: string): string {
    const estado = (estadoSubsanacion || '').toLowerCase();
    if (estado.includes('aprob')) return 'status-authorized';
    return 'status-pending';
  }

  getStatusLabel(estadoSubsanacion?: string): string {
    return estadoSubsanacion || 'Pendiente';
  }

  onBack(): void {
    this.backClicked.emit();
    this.router.navigate(['/legalization-rectification']);
  }

  onViewChange(view: 'details' | 'traceability'): void {
    this.viewChanged.emit(view);
  }

  onEditClick(): void {
    this.editClicked.emit();
  }

  getParticipantName(): string {
    if (!this.rectification) return 'Subsanación de Legalización';

    const participante = this.rectification.participante;
    if (participante) return participante;

    const firstName = this.rectification.primerNombreParticipante || '';
    const secondName = this.rectification.segundoNombreParticipante || '';
    const firstLast = this.rectification.primerApellidoParticipante || '';
    const secondLast = this.rectification.segundoApellidoParticipante || '';

    return `${firstName} ${secondName} ${firstLast} ${secondLast}`.trim() || 'Subsanación de Legalización';
  }

  getRectificationId(): string {
    return this.rectification?.id || 'N/A';
  }
}
