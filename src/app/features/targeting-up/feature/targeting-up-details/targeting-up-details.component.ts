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
import { TargetingUpTraceabilityComponent } from '../targeting-up-traceability/targeting-up-traceability.component';
import { TargetingUpDetailsHeaderComponent } from '../../ui/targeting-up-details-header/targeting-up-details-header';

interface ExtendedTargetingUp {
  id?: string;

  // SECCION 1: InformacionTecnico
  regionTecnico?: string;
  municipioTecnico?: string;
  nombreTecnicoMunicipio?: string;
  tipoDocumentoTecnicoMunicipio?: string;
  numeroDocumentoTecnicoMunicipio?: string;
  tipoUnidadProductiva?: string;
  puebloIndigena?: string;
  otroPueblo?: string;
  comunidad?: string;
  otraComunidad?: string;

  // SECCION 2: UnidadesproductivasFamiliares
  tipoDocumentoRepresentanteFamiliar?: string;
  numeroDocumentoRepresentanteFamiliar?: string;
  primerNombreRepresentanteFamiliar?: string;
  segundoNombreRepresentanteFamiliar?: string;
  primerApellidoRepresentanteFamiliar?: string;
  segundoApellidoRepresentanteFamiliar?: string;
  telefonoContactoFamiliar?: string;
  clasificacionSisben?: string;
  menores18Familiar?: string;
  mayores18Familiar?: string;
  areaDisponibleFamiliar?: string;
  tipoDocumentoPosesionFamiliar?: string;
  documentoPosesionFamiliar?: string | File;
  tipoBarrioVeredaFamiliar?: string;
  nombreBarrioFamiliar?: string;
  veredaFamiliar?: string;
  otraVeredaFamiliar?: string;
  tipoConvenioFamiliar?: string;
  numeroConvenioFamiliar?: string;

  // SECCION 3: UnidadesproductivasEscolares
  nombreInstitucionEducativa?: string;
  codigoDaneInstitucion?: string;
  tipoDocumentoDocenteEscolar?: string;
  numeroDocumentoDocenteEscolar?: string;
  primerNombreDocenteEscolar?: string;
  segundoNombreDocenteEscolar?: string;
  primerApellidoDocenteEscolar?: string;
  segundoApellidoDocenteEscolar?: string;
  telefonoContactoEscolar?: string;
  tipoDocumentoPosesionEscolar?: string;
  documentoPosesionEscolar?: string | File;
  anexoListadoEstudiantes?: string | File;
  tipoBarrioVeredaEscolar?: string;
  nombreBarrioEscolar?: string;
  veredaEscolar?: string;
  otraVeredaEscolar?: string;
  tipoConvenioEscolar?: string;
  numeroConvenioEscolar?: string;

  // SECCION 4: UnidadesproductivasComunitarias
  nombreAsociacion?: string;
  codigoNitAsociacion?: string;
  tipoDocumentoRepresentanteComunitaria?: string;
  numeroDocumentoRepresentanteComunitaria?: string;
  primerNombreRepresentanteComunitaria?: string;
  segundoNombreRepresentanteComunitaria?: string;
  primerApellidoRepresentanteComunitaria?: string;
  segundoApellidoRepresentanteComunitaria?: string;
  telefonoContactoComunitaria?: string;
  tipoDocumentoPosesionComunitaria?: string;
  documentoPosesionComunitaria?: string | File;
  certificadoRepresentacionComunitaria?: string | File;
  tipoBarrioVeredaComunitaria?: string;
  nombreBarrioComunitaria?: string;
  veredaComunitaria?: string;
  otraVeredaComunitaria?: string;
  tipoConvenioComunitaria?: string;
  numeroConvenioComunitaria?: string;

  // SECCION 5: UnidadesproductivasFamiliaresind
  tipoDocumentoRepresentanteIndigena?: string;
  numeroDocumentoRepresentanteIndigena?: string;
  primerNombreRepresentanteIndigena?: string;
  segundoNombreRepresentanteIndigena?: string;
  primerApellidoRepresentanteIndigena?: string;
  segundoApellidoRepresentanteIndigena?: string;
  fechaNacimientoIndigena?: string;
  edadIndigena?: string;
  generoIndigena?: string;
  telefonoContactoIndigena?: string;
  menores18Indigena?: string;
  menores5Indigena?: string;
  programaPrimeraInfancia?: string;
  cualPrograma?: string;
  entre6y17Indigena?: string;
  mayores18Indigena?: string;
  areaDisponibleIndigena?: string;
  tipoBarrioVeredaIndigena?: string;
  nombreBarrioIndigena?: string;
  veredaIndigena?: string;
  otraVeredaIndigena?: string;
  tipoConvenioIndigena?: string;
  numeroConvenioIndigena?: string;

  createdAt?: string;
  updatedAt?: string;
}

@Component({
  selector: 'app-targeting-up-details',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatCardModule,
    MatChipsModule,
    MatExpansionModule,
    TargetingUpTraceabilityComponent,
    TargetingUpDetailsHeaderComponent
  ],
  templateUrl: './targeting-up-details.component.html',
  styleUrl: './targeting-up-details.component.scss'
})
export class TargetingUpDetailsComponent implements OnChanges, OnDestroy, OnInit {
  @Input() targetingUp: ExtendedTargetingUp | null = null;
  @Output() edit = new EventEmitter<ExtendedTargetingUp>();
  @Output() back = new EventEmitter<void>();

  currentView: 'details' | 'traceability' = 'details';

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadTargetingUpFromRoute();
  }

  ngOnChanges(changes: SimpleChanges): void {}

  ngOnDestroy(): void {}

  loadTargetingUpFromRoute(): void {
    let targetingUpData: ExtendedTargetingUp | null = null;

    try {
      const stored = localStorage.getItem('selectedTargetingUp');
      if (stored) {
        targetingUpData = JSON.parse(stored) as ExtendedTargetingUp;
        localStorage.removeItem('selectedTargetingUp');
      }
    } catch {
      // ignore
    }

    if (!targetingUpData) {
      try {
        const historyState = history.state;
        if (historyState?.targetingUp) {
          targetingUpData = historyState.targetingUp as ExtendedTargetingUp;
        }
      } catch {
        // ignore
      }
    }

    if (!targetingUpData) {
      const id = this.route?.snapshot?.paramMap?.get('id');
      if (id) {
        targetingUpData = { id } as ExtendedTargetingUp;
      }
    }

    this.targetingUp = targetingUpData;
  }

  onBack(): void {
    this.back.emit();
    this.router.navigate(['/targeting-up']);
  }

  onViewChange(view: string): void {
    this.currentView = view as 'details' | 'traceability';
  }

  onEdit(): void {
    if (this.targetingUp) {
      this.edit.emit(this.targetingUp);
      this.router.navigate(['/targeting-up/edit', this.targetingUp.id], {
        state: { item: this.targetingUp }
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
}
