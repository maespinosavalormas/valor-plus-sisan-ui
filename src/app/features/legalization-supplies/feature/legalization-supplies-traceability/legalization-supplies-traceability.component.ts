import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

interface LegalizationSuppliesActivityItem {
  accion: string;
  fecha: string;
  usuario: string;
  descripcion: string;
  tipo: 'creacion' | 'actualizacion' | 'contacto' | 'seguimiento' | 'autorizacion';
}

@Component({
  selector: 'app-legalization-supplies-traceability',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './legalization-supplies-traceability.component.html',
  styleUrl: './legalization-supplies-traceability.component.scss',
})
export class LegalizationSuppliesTraceabilityComponent implements OnInit {
  @Input() legalization: any = null;
  @Output() back = new EventEmitter<void>();

  searchTerm: string = '';
  selectedTipo: LegalizationSuppliesActivityItem['tipo'] | 'all' = 'all';

  activityData: LegalizationSuppliesActivityItem[] = [];
  filteredActivityData: LegalizationSuppliesActivityItem[] = [];

  ngOnInit(): void {
    this.activityData = [
      {
        accion: 'Creación de legalización',
        fecha: '15/01/2024 10:30:00',
        usuario: 'Usuario Sistema',
        descripcion: 'Se creó el registro de legalización de insumos UP.',
        tipo: 'creacion',
      },
      {
        accion: 'Actualización de legalización',
        fecha: '17/01/2024 14:45:00',
        usuario: 'Usuario Sistema',
        descripcion: 'Se actualizó información del registro.',
        tipo: 'actualizacion',
      },
    ];

    this.applyFilters();
  }

  onSearchChange(value: string): void {
    this.searchTerm = value;
    this.applyFilters();
  }

  onTipoChange(value: LegalizationSuppliesActivityItem['tipo'] | 'all'): void {
    this.selectedTipo = value;
    this.applyFilters();
  }

  getAvailableTipos(): LegalizationSuppliesActivityItem['tipo'][] {
    return ['creacion', 'actualizacion', 'contacto', 'seguimiento', 'autorizacion'];
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.applyFilters();
  }

  applyFilters(): void {
    const term = (this.searchTerm || '').toLowerCase();

    this.filteredActivityData = this.activityData.filter((item) => {
      const matchesTipo = this.selectedTipo === 'all' || item.tipo === this.selectedTipo;
      const matchesSearch =
        !term ||
        item.accion.toLowerCase().includes(term) ||
        item.usuario.toLowerCase().includes(term) ||
        item.descripcion.toLowerCase().includes(term) ||
        item.fecha.toLowerCase().includes(term);

      return matchesTipo && matchesSearch;
    });
  }

  getTipoLabel(tipo: LegalizationSuppliesActivityItem['tipo']): string {
    switch (tipo) {
      case 'creacion':
        return 'Creación';
      case 'actualizacion':
        return 'Actualización';
      case 'contacto':
        return 'Contacto';
      case 'seguimiento':
        return 'Seguimiento';
      case 'autorizacion':
        return 'Autorización';
      default:
        return tipo;
    }
  }

  trackByActivity(index: number): number {
    return index;
  }
}
