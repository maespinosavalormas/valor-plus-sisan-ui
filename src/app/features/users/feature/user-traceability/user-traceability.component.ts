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
import { User } from '../../../../common/models/user.model';

export interface UserActivityItem {
  accion: string;
  fecha: string;
  usuario: string;
  descripcion: string;
  tipo: 'creacion' | 'actualizacion' | 'estado';
}

@Component({
  selector: 'app-user-traceability',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatTabsModule
  ],
  templateUrl: './user-traceability.component.html',
  styleUrls: ['./user-traceability.component.scss']
})
export class UserTraceabilityComponent implements OnInit, OnChanges {
  @Input() user: User | null = null;
  @Output() back = new EventEmitter<void>();
  
  selectedTab: number = 0;
  activityData: UserActivityItem[] = [];
  filteredActivityData: UserActivityItem[] = [];
  
  // Filtros
  selectedTipo: string = 'all';
  searchTerm: string = '';
  
  ngOnInit(): void {
    this.loadActivityData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['user'] && this.user) {
      this.loadActivityData();
    }
  }

  loadActivityData(): void {
    // Datos de ejemplo de actividad del usuario
    this.activityData = [
      {
        accion: 'Creación de cuenta',
        fecha: '15/01/2024 09:30:00',
        usuario: 'Sistema',
        descripcion: 'Se creó la cuenta de usuario con rol asignado.',
        tipo: 'creacion'
      },
      {
        accion: 'Actualización de perfil',
        fecha: '16/01/2024 14:15:00',
        usuario: 'Juan Pérez',
        descripcion: 'El usuario actualizó su información personal y foto de perfil.',
        tipo: 'actualizacion'
      },
      {
        accion: 'Cambio de contraseña',
        fecha: '17/01/2024 10:45:00',
        usuario: 'Juan Pérez',
        descripcion: 'Se realizó cambio de contraseña por motivos de seguridad.',
        tipo: 'actualizacion'
      },
      {
        accion: 'Inicio de sesión',
        fecha: '18/01/2024 08:30:00',
        usuario: 'Juan Pérez',
        descripcion: 'Inicio de sesión desde dirección IP 192.168.1.100.',
        tipo: 'actualizacion'
      },
      {
        accion: 'Modificación de roles',
        fecha: '19/01/2024 16:20:00',
        usuario: 'Administrador',
        descripcion: 'Se asignaron nuevos permisos de acceso al usuario.',
        tipo: 'actualizacion'
      },
      {
        accion: 'Actualización de estado',
        fecha: '20/01/2024 11:30:00',
        usuario: 'Juan Pérez',
        descripcion: 'Se cambió el estado del usuario a activo/inactivo.',
        tipo: 'estado'
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
      'estado': 'Estado'
    };
    return labels[tipo] || tipo;
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
}
