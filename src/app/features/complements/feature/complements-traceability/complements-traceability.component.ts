import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

interface ComplementActivityItem {
  accion: string;
  fecha: string;
  usuario: string;
  descripcion: string;
  tipo: 'creacion' | 'actualizacion' | 'entrega' | 'recepcion' | 'autorizacion';
}

@Component({
  selector: 'app-complements-traceability',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './complements-traceability.component.html',
  styleUrl: './complements-traceability.component.scss',
})
export class ComplementsTraceabilityComponent implements OnInit {
  @Input() complement: any = null;
  @Output() back = new EventEmitter<void>();

  searchTerm: string = '';
  selectedTipo: ComplementActivityItem['tipo'] | 'all' = 'all';

  activityData: ComplementActivityItem[] = [];
  filteredActivityData: ComplementActivityItem[] = [];

  ngOnInit(): void {
    this.activityData = [
      {
        accion: 'Creación de registro de complemento',
        fecha: '15/01/2024 10:30:00',
        usuario: 'Usuario Sistema',
        descripcion: 'Se creó el registro de entrega de complemento alimentario.',
        tipo: 'creacion',
      },
      {
        accion: 'Entrega de complemento',
        fecha: '17/01/2024 14:45:00',
        usuario: 'Personal Entrega',
        descripcion: 'Se realizó la entrega del complemento al beneficiario.',
        tipo: 'entrega',
      },
      {
        accion: 'Recepción confirmada',
        fecha: '17/01/2024 15:00:00',
        usuario: 'Beneficiario',
        descripcion: 'El beneficiario confirmó la recepción del complemento.',
        tipo: 'recepcion',
      },
    ];

    this.applyFilters();
  }

  onSearchChange(value: string): void {
    this.searchTerm = value;
    this.applyFilters();
  }

  onTipoChange(value: ComplementActivityItem['tipo'] | 'all'): void {
    this.selectedTipo = value;
    this.applyFilters();
  }

  getAvailableTipos(): ComplementActivityItem['tipo'][] {
    return ['creacion', 'actualizacion', 'entrega', 'recepcion', 'autorizacion'];
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

  getTipoLabel(tipo: ComplementActivityItem['tipo']): string {
    switch (tipo) {
      case 'creacion':
        return 'Creación';
      case 'actualizacion':
        return 'Actualización';
      case 'entrega':
        return 'Entrega';
      case 'recepcion':
        return 'Recepción';
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
