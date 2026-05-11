import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

import { ComplementsTraceabilityComponent } from '../complements-traceability/complements-traceability.component';
import { ComplementsDetailsHeaderComponent } from '../../ui/complements-details-header/complements-details-header';

interface ComplementItem {
  id?: string | number;

  // SECCION 1: Responsable de la entrega
  region?: string;
  municipio?: string;
  nombresApellidosEntrega?: string;
  tipoDocumentoEntrega?: string;
  numeroDocumentoEntrega?: string;

  // SECCION 2: Tipo de población - Participante 1
  tipoPoblacionParticipante?: string;
  numeroDocumentoParticipante?: string;
  tipoDocumentoParticipanteInfo?: string;
  primerNombreParticipante?: string;
  segundoNombreParticipante?: string;
  primerApellidoParticipante?: string;
  segundoApellidoParticipante?: string;
  edadParticipante?: string;
  generoParticipante?: string;
  regionParticipante?: string;
  municipioParticipante?: string;
  telefonoContactoBeneficiario?: string;
  numeroTelefonicoActual?: string;
  direccionUbicacion?: string;

  // Participante 2
  numeroDocumentoParticipante2?: string;
  tipoDocumentoParticipanteInfo2?: string;
  primerNombreParticipante2?: string;
  segundoNombreParticipante2?: string;
  primerApellidoParticipante2?: string;
  segundoApellidoParticipante2?: string;
  generoParticipante2?: string;
  regionParticipante2?: string;
  municipioParticipante2?: string;
  telefonoContactoBeneficiario2?: string;
  numeroTelefonicoActual2?: string;
  direccionUbicacion2?: string;

  // SECCION 3: Entrega del complemento
  fechaEntrega?: string;
  periodoEntrega?: string;
  municipioEntrega?: string;
  lugarEncuentro?: string;
  grupo?: string;
  quienRecibeComplemento?: string;

  // Cuidador 1
  tipoDocumentoCuidador?: string;
  numeroDocumentoCuidador?: string;
  primerNombreCuidador?: string;
  segundoNombreCuidador?: string;
  primerApellidoCuidador?: string;
  segundoApellidoCuidador?: string;
  numeroTelefonicoContacto1?: string;
  numeroTelefonicoContacto2?: string;
  tipoParticipante?: string;

  // Cuidador 2
  tipoDocumentoCuidador2?: string;
  numeroDocumentoCuidador2?: string;
  primerNombreCuidador2?: string;
  segundoNombreCuidador2?: string;
  primerApellidoCuidador2?: string;
  segundoApellidoCuidador2?: string;
  numeroTelefonicoContacto12?: string;
  numeroTelefonicoContacto22?: string;

  // Cuidador 3
  tipoDocumentoCuidador3?: string;
  numeroDocumentoCuidador3?: string;
  primerNombreCuidador3?: string;
  segundoNombreCuidador3?: string;
  primerApellidoCuidador3?: string;
  segundoApellidoCuidador3?: string;
  numeroTelefonicoContacto13?: string;
  numeroTelefonicoContacto23?: string;

  // SECCION 4: Consentimiento informado
  adjuntarAutorizacion?: string;
  latitud?: string;
  longitud?: string;
  consentimientoDatosPersonales?: string;
  consentimientoImagenesAudios?: string;
  fotografiaDocumentoIdentidadParticipante?: string;
  fotografiaDocumentoIdentidadCuidador?: string;
  fotografiaPersonaRecibe?: string;
  tipoRegistro?: string;
  firmaPersonaRecibe?: string;
  fotografiaPlanillaFirma?: string;
}

@Component({
  selector: 'app-complements-details',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    ComplementsDetailsHeaderComponent,
    ComplementsTraceabilityComponent,
  ],
  templateUrl: './complements-details.component.html',
  styleUrl: './complements-details.component.scss',
})
export class ComplementsDetailsComponent implements OnInit {
  @Input() complement: ComplementItem | null = null;
  @Output() edit = new EventEmitter<ComplementItem>();
  @Output() back = new EventEmitter<void>();

  currentView: 'details' | 'traceability' = 'details';

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.loadComplementFromRoute();
  }

  loadComplementFromRoute(): void {
    let item: ComplementItem | null = null;

    try {
      const stored = localStorage.getItem('selectedComplement');
      if (stored) {
        item = JSON.parse(stored) as ComplementItem;
        localStorage.removeItem('selectedComplement');
      }
    } catch {
      // ignore
    }

    if (!item) {
      try {
        if (history.state?.item) {
          const listItem = history.state.item as any;
          // Map from Complements list interface to ComplementItem details interface
          item = {
            id: listItem.id,
            numeroDocumentoParticipante: listItem.documento,
            primerNombreParticipante: listItem.nombre.split(' ')[0] || '',
            primerApellidoParticipante: listItem.nombre.split(' ')[1] || '',
            municipioParticipante: listItem.municipio,
            telefonoContactoBeneficiario: listItem.telefono,
            fechaEntrega: listItem.fechaEntrega,
            quienRecibeComplemento: listItem.recibe,
            // Add default values for other required fields
            region: 'N/A',
            nombresApellidosEntrega: 'N/A',
            tipoDocumentoEntrega: 'CC',
            numeroDocumentoEntrega: 'N/A',
            tipoPoblacionParticipante: 'N/A',
            tipoDocumentoParticipanteInfo: 'CC',
            segundoNombreParticipante: '',
            segundoApellidoParticipante: '',
            edadParticipante: 'N/A',
            generoParticipante: 'N/A',
            regionParticipante: 'N/A',
            numeroTelefonicoActual: 'N/A',
            direccionUbicacion: 'N/A',
            periodoEntrega: 'N/A',
            municipioEntrega: listItem.municipio,
            lugarEncuentro: 'N/A',
            grupo: 'N/A',
            tipoDocumentoCuidador: 'CC',
            numeroDocumentoCuidador: 'N/A',
            primerNombreCuidador: 'N/A',
            segundoNombreCuidador: '',
            primerApellidoCuidador: 'N/A',
            segundoApellidoCuidador: '',
            numeroTelefonicoContacto1: 'N/A',
            numeroTelefonicoContacto2: 'N/A',
            tipoParticipante: 'N/A',
            adjuntarAutorizacion: 'N/A',
            latitud: 'N/A',
            longitud: 'N/A',
            consentimientoDatosPersonales: 'N/A',
            consentimientoImagenesAudios: 'N/A',
            fotografiaDocumentoIdentidadParticipante: 'N/A',
            fotografiaDocumentoIdentidadCuidador: 'N/A',
            fotografiaPersonaRecibe: 'N/A',
            tipoRegistro: 'N/A',
            firmaPersonaRecibe: 'N/A',
            fotografiaPlanillaFirma: 'N/A',
          };
        }
      } catch {
        // ignore
      }
    }

    // Fallback: ensure we always have some data
    if (!item) {
      item = {
        id: 'fallback',
        numeroDocumentoParticipante: '000000000',
        primerNombreParticipante: 'Datos no disponibles',
        primerApellidoParticipante: '',
        municipioParticipante: 'N/A',
        telefonoContactoBeneficiario: 'N/A',
        fechaEntrega: 'N/A',
        quienRecibeComplemento: 'N/A',
        region: 'N/A',
        nombresApellidosEntrega: 'N/A',
        tipoDocumentoEntrega: 'CC',
        numeroDocumentoEntrega: 'N/A',
        tipoPoblacionParticipante: 'N/A',
        tipoDocumentoParticipanteInfo: 'CC',
        segundoNombreParticipante: '',
        segundoApellidoParticipante: '',
        edadParticipante: 'N/A',
        generoParticipante: 'N/A',
        regionParticipante: 'N/A',
        numeroTelefonicoActual: 'N/A',
        direccionUbicacion: 'N/A',
        periodoEntrega: 'N/A',
        municipioEntrega: 'N/A',
        lugarEncuentro: 'N/A',
        grupo: 'N/A',
        tipoDocumentoCuidador: 'CC',
        numeroDocumentoCuidador: 'N/A',
        primerNombreCuidador: 'N/A',
        segundoNombreCuidador: '',
        primerApellidoCuidador: 'N/A',
        segundoApellidoCuidador: '',
        numeroTelefonicoContacto1: 'N/A',
        numeroTelefonicoContacto2: 'N/A',
        tipoParticipante: 'N/A',
        adjuntarAutorizacion: 'N/A',
        latitud: 'N/A',
        longitud: 'N/A',
        consentimientoDatosPersonales: 'N/A',
        consentimientoImagenesAudios: 'N/A',
        fotografiaDocumentoIdentidadParticipante: 'N/A',
        fotografiaDocumentoIdentidadCuidador: 'N/A',
        fotografiaPersonaRecibe: 'N/A',
        tipoRegistro: 'N/A',
        firmaPersonaRecibe: 'N/A',
        fotografiaPlanillaFirma: 'N/A',
      };
    }

    this.complement = item;
  }

  onBack(): void {
    this.back.emit();
  }

  onViewChange(view: 'details' | 'traceability'): void {
    this.currentView = view;
  }

  onEdit(): void {
    if (this.complement) {
      this.edit.emit(this.complement);
    }
  }

  getParticipantFullName(participant: number = 1): string {
    if (!this.complement) return 'N/A';
    
    const prefix = participant === 2 ? '2' : participant === 3 ? '3' : '';
    const primerNombre = this.complement[`primerNombreParticipante${prefix}` as keyof ComplementItem] || '';
    const primerApellido = this.complement[`primerApellidoParticipante${prefix}` as keyof ComplementItem] || '';
    
    return `${primerNombre} ${primerApellido}`.trim() || 'N/A';
  }

  getCaregiverFullName(caregiver: number = 1): string {
    if (!this.complement) return 'N/A';
    
    const prefix = caregiver === 2 ? '2' : caregiver === 3 ? '3' : '';
    const primerNombre = this.complement[`primerNombreCuidador${prefix}` as keyof ComplementItem] || '';
    const primerApellido = this.complement[`primerApellidoCuidador${prefix}` as keyof ComplementItem] || '';
    
    return `${primerNombre} ${primerApellido}`.trim() || 'N/A';
  }

  getCoordinates(): string {
    if (!this.complement) return 'N/A';
    
    const lat = this.complement.latitud;
    const lng = this.complement.longitud;
    
    if (lat && lng) {
      return `${lat}, ${lng}`;
    }
    
    return 'N/A';
  }
}
