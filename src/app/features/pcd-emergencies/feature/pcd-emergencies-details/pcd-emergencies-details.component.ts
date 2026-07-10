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
import { ActivatedRoute } from '@angular/router';
import { PcdEmergenciesTraceabilityComponent } from '../pcd-emergencies-traceability/pcd-emergencies-traceability.component';
import { PcdEmergenciesDetailsHeaderComponent } from '../../ui/pcd-emergencies-details-header/pcd-emergencies-details-header';

// Extender la interfaz para incluir propiedades opcionales
interface ExtendedPcdEmergency {
  id?: string;
  // Información funcionario
  regionFuncionario?: string;
  municipioFuncionario?: string;
  nombresApellidosFuncionario?: string;
  tipoDocumentoFuncionario?: string;
  numeroDocumentoFuncionario?: string;
  // Datos del beneficiario
  tipoDocumentoBeneficiario?: string;
  numeroDocumentoBeneficiario?: string;
  primerNombreBeneficiario?: string;
  segundoNombreBeneficiario?: string;
  primerApellidoBeneficiario?: string;
  segundoApellidoBeneficiario?: string;
  genero?: string;
  regionBeneficiario?: string;
  municipioBeneficiario?: string;
  telefonoContactoBeneficiario?: string;
  telefonoActualBeneficiario?: string;
  direccionUbicacion?: string;
  lograContactoTelefonico?: string;
  razonNoContacto?: string;
  viveAunMunicipio?: string;
  conoceMunicipioActual?: string;
  subregionActual?: string;
  municipioActual?: string;
  distanciaResidencia?: string;
  transporteVivienda?: string;
  cuidadorPermanente?: string;
  icbfPaqueteAlimentario?: string;
  // Datos del cuidador
  tipoDocumentoCuidador?: string;
  numeroDocumentoCuidador?: string;
  primerNombreCuidador?: string;
  segundoNombreCuidador?: string;
  primerApellidoCuidador?: string;
  segundoApellidoCuidador?: string;
  telefonoContacto1Cuidador?: string;
  telefonoContacto2Cuidador?: string;
  tipoBarrioVereda?: string;
  nombreBarrio?: string;
  veredaSeleccionada?: string;
  otraVereda?: string;
  direccionResidenciaCuidador?: string;
  // Consentimiento
  autoriza?: string;
  createdAt?: string;
  updatedAt?: string;
}

@Component({
  standalone: true,
  selector: 'app-pcd-emergencies-details',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatCardModule,
    MatChipsModule,
    MatExpansionModule,
    PcdEmergenciesTraceabilityComponent,
    PcdEmergenciesDetailsHeaderComponent
  ],
  templateUrl: './pcd-emergencies-details.component.html',
  styleUrl: './pcd-emergencies-details.component.scss',
})
export class PcdEmergenciesDetailsComponent implements OnChanges, OnDestroy, OnInit {
  @Input() emergency: ExtendedPcdEmergency | null = null;
  @Output() edit = new EventEmitter<ExtendedPcdEmergency>();
  @Output() back = new EventEmitter<void>();

  currentView: 'details' | 'traceability' = 'details';

  constructor(private route: ActivatedRoute) {
    console.log('PcdEmergenciesDetailsComponent constructor');
  }

  ngOnInit(): void {
    console.log('PcdEmergenciesDetailsComponent ngOnInit');
    this.loadEmergencyFromRoute();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Escuchar cambios en la emergencia si es necesario
  }

  ngOnDestroy(): void {
    // Limpieza si es necesaria
  }

  loadEmergencyFromRoute(): void {
    console.log('loadEmergencyFromRoute called');
    
    let emergencyData: ExtendedPcdEmergency | null = null;
    
    // Método 1: Intentar obtener del localStorage
    try {
      const storedEmergency = localStorage.getItem('selectedEmergency');
      console.log('Stored emergency from localStorage:', storedEmergency);
      
      if (storedEmergency) {
        emergencyData = JSON.parse(storedEmergency) as ExtendedPcdEmergency;
        console.log('✅ Using localStorage emergency');
        localStorage.removeItem('selectedEmergency');
      }
    } catch (error) {
      console.warn('❌ Error getting localStorage emergency:', error);
    }
    
    // Método 2: Intentar obtener del history state
    if (!emergencyData) {
      try {
        const historyState = history.state;
        console.log('History state:', historyState);
        
        if (historyState?.emergency) {
          emergencyData = historyState.emergency as ExtendedPcdEmergency;
          console.log('✅ Using history state emergency');
        }
      } catch (error) {
        console.warn('❌ Error getting history state:', error);
      }
    }
    
    // Método 3: Fallback - obtener ID y usar datos de ejemplo
    if (!emergencyData) {
      try {
        const emergencyId = this.route?.snapshot?.paramMap?.get('id');
        console.log('Using fallback for emergencyId:', emergencyId);
        
        if (emergencyId) {
          emergencyData = {
            id: emergencyId,
            regionFuncionario: 'Región 1',
            municipioFuncionario: 'Municipio 1',
            nombresApellidosFuncionario: 'Juan Carlos Pérez García',
            tipoDocumentoFuncionario: 'CC',
            numeroDocumentoFuncionario: '123456789',
            tipoDocumentoBeneficiario: 'CC',
            numeroDocumentoBeneficiario: '12345678',
            primerNombreBeneficiario: 'Ana María',
            segundoNombreBeneficiario: 'Patricia',
            primerApellidoBeneficiario: 'González',
            segundoApellidoBeneficiario: 'López',
            genero: 'Femenino',
            regionBeneficiario: 'Región 1',
            municipioBeneficiario: 'Municipio 1',
            telefonoContactoBeneficiario: '3001234567',
            telefonoActualBeneficiario: '3001234567',
            direccionUbicacion: 'Calle Principal 123',
            lograContactoTelefonico: 'Si',
            viveAunMunicipio: 'Si',
            conoceMunicipioActual: 'Si',
            subregionActual: 'Subregión 1',
            municipioActual: 'Municipio 1',
            distanciaResidencia: '30 minutos o menos',
            transporteVivienda: 'Automovil',
            cuidadorPermanente: 'Si',
            icbfPaqueteAlimentario: 'Si',
            tipoDocumentoCuidador: 'CC',
            numeroDocumentoCuidador: '87654321',
            primerNombreCuidador: 'María',
            segundoNombreCuidador: 'Elena',
            primerApellidoCuidador: 'Rodríguez',
            segundoApellidoCuidador: 'Martínez',
            telefonoContacto1Cuidador: '3019876543',
            telefonoContacto2Cuidador: '3019876544',
            tipoBarrioVereda: 'Barrio',
            nombreBarrio: 'Barrio Central',
            direccionResidenciaCuidador: 'Cra 45 #67-89',
            autoriza: 'Si',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          } as ExtendedPcdEmergency;
          console.log('✅ Using fallback emergency created:', emergencyData);
        }
      } catch (error) {
        console.warn('❌ Error creating fallback emergency:', error);
      }
    }
    
    this.emergency = emergencyData;
    console.log('🎯 Final emergency data:', this.emergency);
    
    if (!this.emergency) {
      console.error('❌ No emergency data could be loaded!');
    }
  }

  onBack(): void {
    this.back.emit();
  }

  onViewChange(view: string): void {
    this.currentView = view as 'details' | 'traceability';
  }

  onEdit(): void {
    if (this.emergency) {
      this.edit.emit(this.emergency as ExtendedPcdEmergency);
    }
  }

  getAuthorizationLabel(autoriza?: string): string {
    return autoriza === 'Si' ? 'Autorizado' : 'No autorizado';
  }

  getAuthorizationClass(autoriza?: string): string {
    return autoriza === 'Si' ? 'auth-authorized' : 'auth-not-authorized';
  }

  getFullBeneficiaryName(): string {
    if (!this.emergency) return 'N/A';
    
    const firstName = this.emergency.primerNombreBeneficiario || '';
    const secondName = this.emergency.segundoNombreBeneficiario || '';
    const firstLast = this.emergency.primerApellidoBeneficiario || '';
    const secondLast = this.emergency.segundoApellidoBeneficiario || '';
    
    return `${firstName} ${secondName} ${firstLast} ${secondLast}`.trim() || 'N/A';
  }

  getFullCuidadorName(): string {
    if (!this.emergency) return 'N/A';
    
    const firstName = this.emergency.primerNombreCuidador || '';
    const secondName = this.emergency.segundoNombreCuidador || '';
    const firstLast = this.emergency.primerApellidoCuidador || '';
    const secondLast = this.emergency.segundoApellidoCuidador || '';
    
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
}
