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
import { CharacterizationUpTraceabilityComponent } from '../characterization-up-traceability/characterization-up-traceability.component';
import { CharacterizationUpDetailsHeaderComponent } from '../../ui/characterization-up-details-header/characterization-up-details-header';

interface GrupoFamiliarIntegrante {
  parentescoFamiliar?: string;
  tipoDocumentoIdentidad?: string;
  numeroDocumentoIdentidad?: string;
  primerNombre?: string;
  segundoNombre?: string;
  primerApellido?: string;
  segundoApellido?: string;
  fechaNacimiento?: string;
  edad?: string;
  sexo?: string;
  participaProgramaPrimeraInfancia?: string;
  cualProgramaPrimeraInfancia?: string;
  cualOtroPrograma?: string;
}

interface UnidadProductivaParticipante {
  tipoDocumentoParticipante?: string;
  numeroDocumentoParticipante?: string;
  primerNombreParticipante?: string;
  segundoNombreParticipante?: string;
  primerApellidoParticipante?: string;
  segundoApellidoParticipante?: string;
  fechaNacimientoParticipante?: string;
  edadParticipante?: string;
  sexoParticipante?: string;
  telefonoContactoParticipante?: string;
}

interface ExtendedCharacterizationUp {
  id?: string;

  // SECCION 1: Información General
  codigoUnidadProductiva?: string;
  tipoUnidadProductiva?: string;
  nombreRepresentanteUnidad?: string;
  convenio?: string;
  funcionarioVisita?: string;
  latitud?: string;
  longitud?: string;
  region?: string;
  municipio?: string;
  zona?: string;
  tipoBarrioVereda?: string;
  nombreBarrio?: string;
  vereda?: string;
  direccionUbicacion?: string;
  telefonoContacto?: string;
  tipoEncuesta?: string;
  victimaConflicto?: string;
  numeroRUV?: string;

  // SECCION 2: Representante UP
  tipoDocumentoResponsable?: string;
  numeroDocumentoResponsable?: string;
  primerNombreResponsable?: string;
  segundoNombreResponsable?: string;
  primerApellidoResponsable?: string;
  segundoApellidoResponsable?: string;
  fechaNacimientoResponsable?: string;
  edadResponsable?: string;
  sexoResponsable?: string;
  estadoCivilResponsable?: string;
  grupoEtnicoResponsable?: string;
  gruposVulnerablesResponsable?: string;
  ocupacionResponsable?: string;
  cualOcupacionResponsable?: string;
  actividadLaboralResponsable?: string;
  nombreIEResponsable?: string;
  codigoDaneResponsable?: string;
  areaDisponibleResponsable?: string;
  numeroMiembrosAsociacion?: string;
  numeroEstudiantesParticipantes?: string;
  numeroEstudiantesPrimaria?: string;
  numeroEstudiantesSecundaria?: string;
  experienciaAlimentosFrescos?: string;
  nombreAsociacion?: string;
  codigoNitAsociacion?: string;
  telefonoContactoRepresentante?: string;
  correoContactoRepresentante?: string;
  areaDisponibleAsociacion?: string;

  // SECCION 3: CARAC GRU FAM
  integrantesGrupoFamiliar?: GrupoFamiliarIntegrante[];

  // SECCION 4: CARAC GRUP UPC
  numeroMiembrosParticipantesAsociacion?: string;
  participantesUnidadProductiva?: UnidadProductivaParticipante[];

  // SECCION 5: Residuos
  experienciaProduccionAlimentos?: string;
  utilizaSemillasNativas?: string;
  otrosProcesosProduccionAgricola?: string;
  cualesOtrosProcesosProduccion?: string;
  realizaComercializacion?: string;
  dondeComercializacion?: string;
  registradaCompan?: string;
  participadoCompan?: string;
  separacionResiduosHogar?: string;
  separacionResiduosEducativo?: string;
  estrategiasAprovechamientoResiduos?: string;
  cuentaCompostera?: string;
  destinoProduccionInstitucion?: string;

  // SECCION 6: Consentimiento informado
  fechaHoraFinalizacion?: string;
  consentimientoDatosPersonales?: string;
  consentimientoImagenesAudios?: string;
  firmaRepresentante?: string | File;
  anoRealizacionEncuesta?: string;
}

@Component({
  selector: 'app-characterization-up-details',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatCardModule,
    MatChipsModule,
    MatExpansionModule,
    CharacterizationUpTraceabilityComponent,
    CharacterizationUpDetailsHeaderComponent
  ],
  templateUrl: './characterization-up-details.component.html',
  styleUrl: './characterization-up-details.component.scss'
})
export class CharacterizationUpDetailsComponent implements OnChanges, OnDestroy, OnInit {
  @Input() characterizationUp: ExtendedCharacterizationUp | null = null;
  @Output() edit = new EventEmitter<ExtendedCharacterizationUp>();
  @Output() back = new EventEmitter<void>();

  currentView: 'details' | 'traceability' = 'details';

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadFromRoute();
  }

  ngOnChanges(changes: SimpleChanges): void {}

  ngOnDestroy(): void {}

  loadFromRoute(): void {
    let data: ExtendedCharacterizationUp | null = null;

    try {
      const stored = localStorage.getItem('selectedCharacterizationUp');
      if (stored) {
        data = JSON.parse(stored) as ExtendedCharacterizationUp;
        localStorage.removeItem('selectedCharacterizationUp');
      }
    } catch {
      // ignore
    }

    if (!data) {
      try {
        const historyState = history.state;
        if (historyState?.characterizationUp) {
          data = historyState.characterizationUp as ExtendedCharacterizationUp;
        }
      } catch {
        // ignore
      }
    }

    if (!data) {
      const id = this.route?.snapshot?.paramMap?.get('id');
      if (id) {
        data = { id } as ExtendedCharacterizationUp;
      }
    }

    this.characterizationUp = data;
  }

  onBack(): void {
    this.back.emit();
    this.router.navigate(['/characterization-up']);
  }

  onViewChange(view: string): void {
    this.currentView = view as 'details' | 'traceability';
  }

  onEdit(): void {
    if (this.characterizationUp) {
      this.edit.emit(this.characterizationUp);
      this.router.navigate(['/characterization-up/edit', this.characterizationUp.id], {
        state: { item: this.characterizationUp }
      });
    }
  }

  formatFileName(file?: string | File): string {
    if (!file) return 'No adjuntado';
    if (typeof file === 'string') {
      return file.split('/').pop() || file;
    }
    return file.name;
  }

  getFullName(p?: { primerNombre?: string; segundoNombre?: string; primerApellido?: string; segundoApellido?: string }): string {
    if (!p) return 'N/A';
    const first = p.primerNombre || '';
    const second = p.segundoNombre || '';
    const last = p.primerApellido || '';
    const last2 = p.segundoApellido || '';
    return `${first} ${second} ${last} ${last2}`.trim() || 'N/A';
  }

  getIntegranteFullName(i?: GrupoFamiliarIntegrante): string {
    if (!i) return 'N/A';
    return this.getFullName({
      primerNombre: i.primerNombre,
      segundoNombre: i.segundoNombre,
      primerApellido: i.primerApellido,
      segundoApellido: i.segundoApellido
    });
  }

  getParticipanteFullName(p?: UnidadProductivaParticipante): string {
    if (!p) return 'N/A';
    const first = p.primerNombreParticipante || '';
    const second = p.segundoNombreParticipante || '';
    const last = p.primerApellidoParticipante || '';
    const last2 = p.segundoApellidoParticipante || '';
    return `${first} ${second} ${last} ${last2}`.trim() || 'N/A';
  }

  formatCoordinates(): string {
    if (!this.characterizationUp) return 'N/A';
    const lat = this.characterizationUp.latitud || 'N/A';
    const lng = this.characterizationUp.longitud || 'N/A';
    return `Latitud: ${lat}, Longitud: ${lng}`;
  }
}
