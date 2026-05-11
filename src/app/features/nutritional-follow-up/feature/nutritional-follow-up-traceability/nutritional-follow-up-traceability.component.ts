import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

export interface NutritionalFollowUpActivityItem {
  accion: string;
  fecha: string;
  usuario: string;
  descripcion: string;
  tipo: 'creacion' | 'actualizacion' | 'contacto' | 'seguimiento' | 'autorizacion';
}

@Component({
  selector: 'app-nutritional-follow-up-traceability',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './nutritional-follow-up-traceability.component.html',
  styleUrls: ['./nutritional-follow-up-traceability.component.scss'],
})
export class NutritionalFollowUpTraceabilityComponent implements OnInit, OnChanges {
  @Input() followUp: any = null;
  @Output() back = new EventEmitter<void>();

  selectedTab: number = 0;
  activityData: NutritionalFollowUpActivityItem[] = [];
  filteredActivityData: NutritionalFollowUpActivityItem[] = [];

  selectedTipo: string = 'all';
  searchTerm: string = '';

  ngOnInit(): void {
    this.loadActivityData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['followUp'] && this.followUp) {
      this.loadActivityData();
    }
  }

  loadActivityData(): void {
    this.activityData = [
      {
        accion: 'Creación de seguimiento nutricional',
        fecha: '15/01/2024 09:30:00',
        usuario: 'Usuario Sistema',
        descripcion: 'Se creó el registro de seguimiento nutricional.',
        tipo: 'creacion',
      },
      {
        accion: 'Actualización de datos',
        fecha: '16/01/2024 11:10:00',
        usuario: 'Usuario Sistema',
        descripcion: 'Se actualizaron datos del participante.',
        tipo: 'actualizacion',
      },
      {
        accion: 'Seguimiento',
        fecha: '17/01/2024 14:45:00',
        usuario: 'Usuario Sistema',
        descripcion: 'Se registró actividad de seguimiento.',
        tipo: 'seguimiento',
      },
    ];

    this.applyFilters();
  }

  onSearchChange(value: string): void {
    this.searchTerm = value;
    this.applyFilters();
  }

  onTipoChange(value: NutritionalFollowUpActivityItem['tipo']): void {
    this.selectedTipo = value;
    this.applyFilters();
  }

  getAvailableTipos(): NutritionalFollowUpActivityItem['tipo'][] {
    return ['creacion', 'actualizacion', 'contacto', 'seguimiento', 'autorizacion'];
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

  clearSearch(): void {
    this.searchTerm = '';
    this.applyFilters();
  }

  getTipoLabel(tipo: NutritionalFollowUpActivityItem['tipo']): string {
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
        return 'Actividad';
    }
  }

  getTipoClass(tipo: NutritionalFollowUpActivityItem['tipo']): string {
    return `tipo-${tipo}`;
  }

  onBack(): void {
    this.back.emit();
  }
}
