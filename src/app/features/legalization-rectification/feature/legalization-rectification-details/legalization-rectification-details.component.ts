import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  OnDestroy,
  OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { ActivatedRoute, Router } from '@angular/router';
import { LegalizationRectificationTraceabilityComponent } from '../legalization-rectification-traceability/legalization-rectification-traceability.component';
import { LegalizationRectificationDetailsHeaderComponent } from '../../ui/legalization-rectification-details-header/legalization-rectification-details-header';

interface ExtendedLegalizationRectification {
  id?: string;

  // 1️⃣ Tipo de Población
  numeroDocumentoParticipante?: string;
  tipoPoblacionParticipante?: string;
  tipoDocumentoParticipante?: string;
  primerNombreParticipante?: string;
  segundoNombreParticipante?: string;
  primerApellidoParticipante?: string;
  segundoApellidoParticipante?: string;
  generoParticipante?: string;
  regionParticipante?: string;
  municipioParticipante?: string;
  telefonoContactoBeneficiario?: string;
  telefonoActualBeneficiario?: string;
  direccionUbicacionBeneficiario?: string;

  // 2️⃣ Responsable de la Entrega
  regionResponsable?: string;
  municipioResponsable?: string;
  nombresApellidosEntrega?: string;
  tipoDocumentoEntrega?: string;
  numeroDocumentoEntrega?: string;

  // 3️⃣ Entrega del Complemento
  fechaEntrega?: string;
  periodoEntrega?: string;
  quienRecibeComplemento?: string;
  tipoDocumentoCuidador?: string;
  numeroDocumentoCuidador?: string;
  primerNombreCuidador?: string;
  segundoNombreCuidador?: string;
  primerApellidoCuidador?: string;
  segundoApellidoCuidador?: string;
  telefonoContacto1Cuidador?: string;
  telefonoContacto2Cuidador?: string;
  lugarEntregaPaquete?: string;
  ubicacionLatitud?: number;
  ubicacionLongitud?: number;
  consentimientoInformado1?: string;
  consentimientoInformado2?: string;

  // 4️⃣ Datos de Subsanación
  subsanarDatosCuidador?: string;
  quienRecibeComplementoSubsanacion?: string;
  tipoDocumentoCuidadorSubsanacion?: string;
  numeroDocumentoCuidadorSubsanacion?: string;
  primerNombreCuidadorSubsanacion?: string;
  segundoNombreCuidadorSubsanacion?: string;
  primerApellidoCuidadorSubsanacion?: string;
  segundoApellidoCuidadorSubsanacion?: string;
  telefonoContacto1CuidadorSubsanacion?: string;
  telefonoContacto2CuidadorSubsanacion?: string;
  observacionesSubsanaciones?: string;
  autorizacionEscritaSubsanacion?: string | File;
  subsanarFotoDocumentoIdentidad?: string;
  fotoDocumentoIdentidadParticipante?: string | File;
  fotoDocumentoIdentidadCuidador?: string | File;
  subsanarFotoPersonaPaquete?: string;
  fotografiaPersonaPaquete?: string | File;
  subsanarFirmaPersonaRecibe?: string;
  firmaPersonaRecibe?: string | File;
  tipoSubsanacion1?: string;
  tipoSubsanacion2?: string;
  tipoDocumentoSubsanacion?: string;
  numeroDocumentoSubsanacion?: string;
  nombresApellidosSubsanacion?: string;
  observacionesProcesoSubsanacion?: string;
  fechaHoraFinalizacionSubsanacion?: string;

  // Datos tabla/lista (compatibilidad)
  documento?: string;
  participante?: string;
  municipio?: string;
  periodo?: string;
  recibe?: string;
  estadoSubsanacion?: string;

  createdAt?: string;
  updatedAt?: string;
}

@Component({
  standalone: true,
  selector: 'app-legalization-rectification-details',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatCardModule,
    MatChipsModule,
    MatExpansionModule,
    LegalizationRectificationTraceabilityComponent,
    LegalizationRectificationDetailsHeaderComponent
  ],
  templateUrl: './legalization-rectification-details.component.html',
  styleUrl: './legalization-rectification-details.component.scss'
})
export class LegalizationRectificationDetailsComponent implements OnChanges, OnDestroy, OnInit {
  @Input() rectification: ExtendedLegalizationRectification | null = null;
  @Output() edit = new EventEmitter<ExtendedLegalizationRectification>();
  @Output() back = new EventEmitter<void>();

  currentView: 'details' | 'traceability' = 'details';

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadRectificationFromRoute();
  }

  ngOnChanges(changes: SimpleChanges): void {}

  ngOnDestroy(): void {}

  loadRectificationFromRoute(): void {
    let rectificationData: ExtendedLegalizationRectification | null = null;

    try {
      const stored = localStorage.getItem('selectedRectification');
      if (stored) {
        rectificationData = JSON.parse(stored) as ExtendedLegalizationRectification;
        localStorage.removeItem('selectedRectification');
      }
    } catch {
      // ignore
    }

    if (!rectificationData) {
      try {
        const historyState = history.state;
        if (historyState?.rectification) {
          rectificationData = historyState.rectification as ExtendedLegalizationRectification;
        }
      } catch {
        // ignore
      }
    }

    if (!rectificationData) {
      const rectificationId = this.route?.snapshot?.paramMap?.get('id');
      if (rectificationId) {
        rectificationData = {
          id: rectificationId,
          regionResponsable: 'Región 1',
          municipioResponsable: 'Municipio 1',
          nombresApellidosEntrega: 'Juan Carlos Pérez García',
          tipoDocumentoEntrega: 'CC',
          numeroDocumentoEntrega: '123456789',
          tipoDocumentoParticipante: 'CC',
          numeroDocumentoParticipante: '12345678',
          primerNombreParticipante: 'Ana María',
          segundoNombreParticipante: 'Patricia',
          primerApellidoParticipante: 'González',
          segundoApellidoParticipante: 'López',
          generoParticipante: 'Femenino',
          regionParticipante: 'Región 1',
          municipioParticipante: 'Municipio 1',
          telefonoContactoBeneficiario: '3001234567',
          telefonoActualBeneficiario: '3001234567',
          direccionUbicacionBeneficiario: 'Calle Principal 123',
          fechaEntrega: '2024-01-15',
          periodo: 'Enero 2024',
          recibe: 'Padre',
          estadoSubsanacion: 'Pendiente',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        } as ExtendedLegalizationRectification;
      }
    }

    this.rectification = rectificationData;
  }

  onBack(): void {
    this.back.emit();
    this.router.navigate(['/legalization-rectification']);
  }

  onViewChange(view: string): void {
    this.currentView = view as 'details' | 'traceability';
  }

  onEdit(): void {
    if (this.rectification) {
      this.edit.emit(this.rectification);
      this.router.navigate(['/legalization-rectification/edit', this.rectification.id], {
        state: { item: this.rectification }
      });
    }
  }

  getFullParticipantName(): string {
    if (!this.rectification) return 'N/A';

    if (this.rectification.participante) return this.rectification.participante;

    const firstName = this.rectification.primerNombreParticipante || '';
    const secondName = this.rectification.segundoNombreParticipante || '';
    const firstLast = this.rectification.primerApellidoParticipante || '';
    const secondLast = this.rectification.segundoApellidoParticipante || '';

    return `${firstName} ${secondName} ${firstLast} ${secondLast}`.trim() || 'N/A';
  }

  formatDate(dateString?: string): string {
    if (!dateString) return 'No disponible';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Fecha inválida';
    }
  }

  formatPhone(phone?: string): string {
    if (!phone) return 'No registrado';
    return phone;
  }

  formatFileName(file?: string | File): string {
    if (!file) return 'No adjuntado';
    if (typeof file === 'string') {
      return file.split('/').pop() || file;
    }
    return file.name;
  }

  formatCoordinates(): string {
    if (!this.rectification) return 'No disponible';
    const lat = this.rectification.ubicacionLatitud;
    const lng = this.rectification.ubicacionLongitud;
    if (lat !== undefined && lng !== undefined) {
      return `${lat}, ${lng}`;
    }
    return 'No disponible';
  }
}
