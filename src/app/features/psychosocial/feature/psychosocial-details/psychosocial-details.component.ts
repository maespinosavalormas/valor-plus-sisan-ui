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

import { PsychosocialTraceabilityComponent } from '../psychosocial-traceability/psychosocial-traceability.component';
import { PsychosocialDetailsHeaderComponent } from '../../ui/psychosocial-details-header/psychosocial-details-header';

interface PsychosocialItem {
  id?: string | number;

  // SECCION 1: Datos Generales
  numeroIdentificacionNino?: string;
  tipoIdentificacionNino?: string;
  semana?: string;
  fechaNacimientoNino?: string;
  nombresNino?: string;
  genero?: string;
  direccionResidencia?: string;
  telefono?: string;
  telefono2?: string;
  municipio?: string;
  subregion?: string;
  zonaResidencia?: string;
  barrioVereda?: string;
  pertenecePoblacionIndigena?: string;
  puebloIndigena?: string;
  otroPueblo?: string;
  comunidad?: string;
  otraComunidad?: string;
  latitud?: string;
  longitud?: string;
  coordendaX?: string;
  coordendaY?: string;

  // SECCION 2: Datos de Asistencia Social
  etnia?: string;
  grupoPoblacional?: string;
  cualOtroGrupoPoblacional?: string;
  tieneDiscapacidad?: string;
  discapacidadCertificada?: string;
  tipoDiscapacidad?: string;
  recibeAtencionNutricional?: string;
  cualPrograma?: string;
  cualOtroPrograma?: string;
  regimenSalud?: string;

  // SECCION 3: Datos del hogar y el acudiente
  tipoIdentificacionAcudiente?: string;
  numeroIdentificacionAcudiente?: string;
  primerNombreAcudiente?: string;
  segundoNombreAcudiente?: string;
  primerApellidoAcudiente?: string;
  segundoApellidoAcudiente?: string;
  sexoAcudiente?: string;
  parentesco?: string;
  gradoEscolaridad?: string;
  ocupacionPrincipal?: string;
  cuidadorTieneDiscapacidad?: string;
  tipoDiscapacidadCuidador?: string;
  numeroPersonasHogar?: string;
  numeroNinosMenores5?: string;
  ingresosMensuales?: string;
  hogarEnergiaElectrica?: string;
  hogarAguaPotable?: string;
  servicioSanitario?: string;
  eliminacionBasuras?: string;
  combustibleCocinar?: string;
  evolucionPsicosocial?: string;

  // SECCION 4: Compromisos familiares
  compromisosFamiliares?: string;
  consentimientoDatos?: string;
  consentimientoImagenes?: string;
  firmaCuidador?: string;
}

@Component({
  selector: 'app-psychosocial-details',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    PsychosocialDetailsHeaderComponent,
    PsychosocialTraceabilityComponent,
  ],
  templateUrl: './psychosocial-details.component.html',
  styleUrl: './psychosocial-details.component.scss',
})
export class PsychosocialDetailsComponent implements OnInit {
  @Input() psychosocial: PsychosocialItem | null = null;
  @Output() edit = new EventEmitter<PsychosocialItem>();
  @Output() back = new EventEmitter<void>();

  currentView: 'details' | 'traceability' = 'details';

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.loadPsychosocialFromRoute();
  }

  loadPsychosocialFromRoute(): void {
    console.log('🔍 Loading psychosocial data...');
    let item: PsychosocialItem | null = null;

    try {
      const stored = localStorage.getItem('selectedPsychosocial');
      if (stored) {
        item = JSON.parse(stored) as PsychosocialItem;
        localStorage.removeItem('selectedPsychosocial');
        console.log('📦 Loaded from localStorage:', item);
      }
    } catch {
      // ignore
    }

    if (!item) {
      try {
        if (history.state?.item) {
          const listItem = history.state.item as any;
          console.log('📋 Received from history.state:', listItem);
          // Map from Psychosocial list interface to PsychosocialItem details interface
          item = {
            id: listItem.id,
            numeroIdentificacionNino: listItem.documento,
            nombresNino: listItem.nombre,
            municipio: listItem.municipio,
            telefono: listItem.telefono,
            // Add default values for other required fields
            tipoIdentificacionNino: 'CC',
            semana: 'Semana 1',
            fechaNacimientoNino: 'N/A',
            genero: 'N/A',
            direccionResidencia: 'N/A',
            telefono2: 'N/A',
            subregion: 'N/A',
            zonaResidencia: 'N/A',
            barrioVereda: 'N/A',
            pertenecePoblacionIndigena: 'N/A',
            puebloIndigena: '',
            comunidad: 'N/A',
            latitud: 'N/A',
            longitud: 'N/A',
            coordendaX: 'N/A',
            coordendaY: 'N/A',
            etnia: 'N/A',
            grupoPoblacional: 'N/A',
            tieneDiscapacidad: 'N/A',
            recibeAtencionNutricional: 'N/A',
            cualPrograma: 'N/A',
            regimenSalud: 'N/A',
            tipoIdentificacionAcudiente: 'CC',
            numeroIdentificacionAcudiente: 'N/A',
            primerNombreAcudiente: listItem.acudiente.split(' ')[0] || 'N/A',
            segundoNombreAcudiente: listItem.acudiente.split(' ')[1] || '',
            primerApellidoAcudiente: listItem.acudiente.split(' ')[2] || 'N/A',
            segundoApellidoAcudiente: listItem.acudiente.split(' ')[3] || '',
            sexoAcudiente: 'N/A',
            parentesco: 'N/A',
            gradoEscolaridad: 'N/A',
            ocupacionPrincipal: 'N/A',
            cuidadorTieneDiscapacidad: 'N/A',
            numeroPersonasHogar: 'N/A',
            numeroNinosMenores5: 'N/A',
            ingresosMensuales: 'N/A',
            hogarEnergiaElectrica: 'N/A',
            hogarAguaPotable: 'N/A',
            servicioSanitario: 'N/A',
            eliminacionBasuras: 'N/A',
            combustibleCocinar: 'N/A',
            evolucionPsicosocial: 'N/A',
            compromisosFamiliares: 'N/A',
            consentimientoDatos: 'N/A',
            consentimientoImagenes: 'N/A',
            firmaCuidador: 'N/A',
          };
          console.log('✅ Mapped to PsychosocialItem:', item);
        }
      } catch {
        // ignore
      }
    }

    if (!item) {
      const id = this.route.snapshot.paramMap.get('id');
      if (id) {
        item = {
          id,
          numeroIdentificacionNino: '123456789',
          tipoIdentificacionNino: 'CC',
          semana: 'Semana 1',
          fechaNacimientoNino: '2016-05-15',
          nombresNino: 'Juan Pérez',
          genero: 'Masculino',
          direccionResidencia: 'Calle Principal 123',
          telefono: '3001234567',
          telefono2: '3012345678',
          municipio: 'Medellín',
          subregion: 'Subregión 1',
          zonaResidencia: 'Zona 1',
          barrioVereda: 'Barrio 1',
          pertenecePoblacionIndigena: 'no',
          puebloIndigena: '',
          comunidad: 'Comunidad 1',
          latitud: '6.25184',
          longitud: '-75.56359',
          coordendaX: '6.25184',
          coordendaY: '-75.56359',
          etnia: 'Etnia 1',
          grupoPoblacional: 'Grupo 1',
          tieneDiscapacidad: 'no',
          recibeAtencionNutricional: 'si',
          cualPrograma: 'Programa 1',
          regimenSalud: 'Régimen 1',
          tipoIdentificacionAcudiente: 'CC',
          numeroIdentificacionAcudiente: '987654321',
          primerNombreAcudiente: 'María',
          segundoNombreAcudiente: 'Elena',
          primerApellidoAcudiente: 'González',
          segundoApellidoAcudiente: 'López',
          sexoAcudiente: 'Femenino',
          parentesco: 'Madre',
          gradoEscolaridad: 'Secundaria',
          ocupacionPrincipal: 'Ocupación 1',
          cuidadorTieneDiscapacidad: 'no',
          numeroPersonasHogar: '4',
          numeroNinosMenores5: '2',
          ingresosMensuales: '1-2 SMMLV',
          hogarEnergiaElectrica: 'si',
          hogarAguaPotable: 'si',
          servicioSanitario: 'Servicio 1',
          eliminacionBasuras: 'Basurero',
          combustibleCocinar: 'Gas',
          evolucionPsicosocial: 'Diagnóstico: Niño con buen desarrollo. Tratamiento: Seguimiento regular. Logros: Mejora en socialización.',
          compromisosFamiliares: 'Asistir a controles mensuales, cumplir con medicamentos, participar en actividades grupales.',
          consentimientoDatos: 'si',
          consentimientoImagenes: 'si',
          firmaCuidador: 'firma-cuidador.pdf',
        };
      }
    }

    // Fallback: ensure we always have some data
    if (!item) {
      console.log('⚠️ Using fallback data - no data found from any source');
      item = {
        id: 'fallback',
        numeroIdentificacionNino: '000000000',
        nombresNino: 'Datos no disponibles',
        municipio: 'N/A',
        telefono: 'N/A',
        tipoIdentificacionNino: 'CC',
        semana: 'Semana 1',
        fechaNacimientoNino: 'N/A',
        genero: 'N/A',
        direccionResidencia: 'N/A',
        telefono2: 'N/A',
        subregion: 'N/A',
        zonaResidencia: 'N/A',
        barrioVereda: 'N/A',
        pertenecePoblacionIndigena: 'N/A',
        puebloIndigena: '',
        comunidad: 'N/A',
        latitud: 'N/A',
        longitud: 'N/A',
        coordendaX: 'N/A',
        coordendaY: 'N/A',
        etnia: 'N/A',
        grupoPoblacional: 'N/A',
        tieneDiscapacidad: 'N/A',
        recibeAtencionNutricional: 'N/A',
        cualPrograma: 'N/A',
        regimenSalud: 'N/A',
        tipoIdentificacionAcudiente: 'CC',
        numeroIdentificacionAcudiente: 'N/A',
        primerNombreAcudiente: 'N/A',
        segundoNombreAcudiente: '',
        primerApellidoAcudiente: 'N/A',
        segundoApellidoAcudiente: '',
        sexoAcudiente: 'N/A',
        parentesco: 'N/A',
        gradoEscolaridad: 'N/A',
        ocupacionPrincipal: 'N/A',
        cuidadorTieneDiscapacidad: 'N/A',
        numeroPersonasHogar: 'N/A',
        numeroNinosMenores5: 'N/A',
        ingresosMensuales: 'N/A',
        hogarEnergiaElectrica: 'N/A',
        hogarAguaPotable: 'N/A',
        servicioSanitario: 'N/A',
        eliminacionBasuras: 'N/A',
        combustibleCocinar: 'N/A',
        evolucionPsicosocial: 'N/A',
        compromisosFamiliares: 'N/A',
        consentimientoDatos: 'N/A',
        consentimientoImagenes: 'N/A',
        firmaCuidador: 'N/A',
      };
    }

    this.psychosocial = item;
    console.log('🎯 Final psychosocial object:', this.psychosocial);
  }

  onBack(): void {
    this.back.emit();
  }

  onViewChange(view: 'details' | 'traceability'): void {
    this.currentView = view;
  }

  onEdit(): void {
    if (this.psychosocial) {
      this.edit.emit(this.psychosocial);
    }
  }

  getFullName(): string {
    if (!this.psychosocial) return 'N/A';
    
    const primerNombre = this.psychosocial.primerNombreAcudiente || '';
    const segundoNombre = this.psychosocial.segundoNombreAcudiente || '';
    const primerApellido = this.psychosocial.primerApellidoAcudiente || '';
    const segundoApellido = this.psychosocial.segundoApellidoAcudiente || '';
    
    return `${primerNombre} ${segundoNombre} ${primerApellido} ${segundoApellido}`.trim() || 'N/A';
  }

  getNinoFullName(): string {
    if (!this.psychosocial) return 'N/A';
    
    return this.psychosocial.nombresNino || 'N/A';
  }

  getCoordinates(): string {
    if (!this.psychosocial) return 'N/A';
    
    const lat = this.psychosocial.latitud || this.psychosocial.coordendaX;
    const lng = this.psychosocial.longitud || this.psychosocial.coordendaY;
    
    if (lat && lng) {
      return `${lat}, ${lng}`;
    }
    
    return 'N/A';
  }
}
