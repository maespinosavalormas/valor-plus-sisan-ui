import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

export interface PcdEmergencyActivityItem {
  accion: string;
  fecha: string;
  usuario: string;
  descripcion: string;
  tipo: 'creacion' | 'actualizacion' | 'contacto' | 'seguimiento' | 'autorizacion';
}

@Component({
  selector: 'app-pcd-emergencies-traceability',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  templateUrl: './pcd-emergencies-traceability.component.html',
  styleUrls: ['./pcd-emergencies-traceability.component.scss']
})
export class PcdEmergenciesTraceabilityComponent implements OnInit, OnChanges {
  @Input() emergency: any = null;
  @Output() back = new EventEmitter<void>();
  
  selectedTab: number = 0;
  activityData: PcdEmergencyActivityItem[] = [];
  filteredActivityData: PcdEmergencyActivityItem[] = [];
  
  // Filtros
  selectedTipo: string = 'all';
  searchTerm: string = '';
  
  ngOnInit(): void {
    this.loadActivityData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['emergency'] && this.emergency) {
      this.loadActivityData();
    }
  }

  loadActivityData(): void {
    // Datos de ejemplo de actividad de la emergencia PCD
    this.activityData = [
      {
        accion: 'Creación de emergencia',
        fecha: '15/01/2024 09:30:00',
        usuario: 'Juan Carlos Pérez García',
        descripcion: 'Se creó el registro de emergencia PCD para el beneficiario.',
        tipo: 'creacion'
      },
      {
        accion: 'Intento de contacto telefónico',
        fecha: '15/01/2024 10:15:00',
        usuario: 'Juan Carlos Pérez García',
        descripcion: 'Se realizó contacto telefónico exitoso con el beneficiario.',
        tipo: 'contacto'
      },
      {
        accion: 'Verificación de ubicación',
        fecha: '15/01/2024 11:00:00',
        usuario: 'Juan Carlos Pérez García',
        descripcion: 'Se confirmó la dirección de residencia del beneficiario.',
        tipo: 'seguimiento'
      },
      {
        accion: 'Registro de cuidador',
        fecha: '15/01/2024 14:30:00',
        usuario: 'Juan Carlos Pérez García',
        descripcion: 'Se registró la información del cuidador permanente.',
        tipo: 'actualizacion'
      },
      {
        accion: 'Evaluación de distancia',
        fecha: '16/01/2024 08:45:00',
        usuario: 'María Elena López Martínez',
        descripcion: 'Se evaluó la distancia de residencia para acceso.',
        tipo: 'seguimiento'
      },
      {
        accion: 'Contacto con cuidador',
        fecha: '16/01/2024 10:20:00',
        usuario: 'María Elena López Martínez',
        descripcion: 'Se estableció contacto con el cuidador para coordinar apoyo.',
        tipo: 'contacto'
      },
      {
        accion: 'Actualización de datos',
        fecha: '17/01/2024 09:15:00',
        usuario: 'Carlos Andrés Rodríguez Torres',
        descripcion: 'Se actualizaron los datos de contacto del beneficiario.',
        tipo: 'actualizacion'
      },
      {
        accion: 'Autorización de consentimiento',
        fecha: '17/01/2024 14:45:00',
        usuario: 'Carlos Andrés Rodríguez Torres',
        descripcion: 'Se obtuvo la autorización de consentimiento informado.',
        tipo: 'autorizacion'
      },
      {
        accion: 'Seguimiento de paquete alimentario',
        fecha: '18/01/2024 11:30:00',
        usuario: 'Juan Carlos Pérez García',
        descripcion: 'Se verificó el estado del paquete alimentario ICBF.',
        tipo: 'seguimiento'
      },
      {
        accion: 'Actualización de estado',
        fecha: '19/01/2024 16:20:00',
        usuario: 'María Elena López Martínez',
        descripcion: 'Se actualizó el estado de la emergencia a resuelta.',
        tipo: 'actualizacion'
      }
    ];
    
    this.filteredActivityData = [...this.activityData];
  }

  getAvailableTipos(): string[] {
    const tipos = [...new Set(this.activityData.map(item => item.tipo))];
    return tipos.sort();
  }

  getTipoLabel(tipo: string): string {
    const labels: Record<string, string> = {
      'creacion': 'Creación',
      'actualizacion': 'Actualización',
      'contacto': 'Contacto',
      'seguimiento': 'Seguimiento',
      'autorizacion': 'Autorización'
    };
    return labels[tipo] || tipo;
  }

  getTipoIcon(tipo: string): string {
    const icons: Record<string, string> = {
      'creacion': 'add_circle',
      'actualizacion': 'edit',
      'contacto': 'phone',
      'seguimiento': 'visibility',
      'autorizacion': 'verified_user'
    };
    return icons[tipo] || 'info';
  }

  getTipoColor(tipo: string): string {
    const colors: Record<string, string> = {
      'creacion': '#28a745',
      'actualizacion': '#007bff',
      'contacto': '#17a2b8',
      'seguimiento': '#ffc107',
      'autorizacion': '#6f42c1'
    };
    return colors[tipo] || '#6c757d';
  }

  onTabChange(index: number): void {
    this.selectedTab = index;
  }

  onTipoChange(value: string): void {
    this.selectedTipo = value;
    this.applyFilters();
  }

  onSearchChange(term: string): void {
    this.searchTerm = term.toLowerCase();
    this.applyFilters();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.applyFilters();
  }

  clearFilters(): void {
    this.selectedTipo = 'all';
    this.searchTerm = '';
    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredActivityData = this.activityData.filter(item => {
      // Filtro por tipo
      const tipoMatch = this.selectedTipo === 'all' || item.tipo === this.selectedTipo;
      
      // Filtro por búsqueda
      const searchMatch = !this.searchTerm || 
        item.accion.toLowerCase().includes(this.searchTerm) ||
        item.usuario.toLowerCase().includes(this.searchTerm) ||
        item.descripcion.toLowerCase().includes(this.searchTerm);
      
      return tipoMatch && searchMatch;
    });
  }

  onBack(): void {
    this.back.emit();
  }

  getActivityCount(): number {
    return this.filteredActivityData.length;
  }

  getActivityCountByType(tipo: string): number {
    return this.activityData.filter(item => item.tipo === tipo).length;
  }

  trackByActivity(index: number, activity: PcdEmergencyActivityItem): string {
    return activity.fecha + activity.accion;
  }
}
