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
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

export interface AtComprehensiveUpActivityItem {
  accion: string;
  fecha: string;
  usuario: string;
  descripcion: string;
  tipo: 'creacion' | 'actualizacion' | 'seguimiento';
}

@Component({
  selector: 'app-at-comprehensive-up-traceability',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  templateUrl: './at-comprehensive-up-traceability.component.html',
  styleUrls: ['./at-comprehensive-up-traceability.component.scss']
})
export class AtComprehensiveUpTraceabilityComponent implements OnInit, OnChanges {
  @Input() atComprehensiveUp: any = null;
  @Output() back = new EventEmitter<void>();

  activityData: AtComprehensiveUpActivityItem[] = [];
  filteredActivityData: AtComprehensiveUpActivityItem[] = [];

  selectedTipo: string = 'all';
  searchTerm: string = '';

  ngOnInit(): void {
    this.loadActivityData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['atComprehensiveUp'] && this.atComprehensiveUp) {
      this.loadActivityData();
    }
  }

  loadActivityData(): void {
    this.activityData = [
      {
        accion: 'Creación AT Integral UP',
        fecha: '15/01/2024 09:30:00',
        usuario: 'Sistema',
        descripcion: 'Se creó el registro de AT Integral UP.',
        tipo: 'creacion'
      },
      {
        accion: 'Actualización de datos',
        fecha: '16/01/2024 10:20:00',
        usuario: 'Usuario',
        descripcion: 'Se actualizaron datos del registro AT Integral UP.',
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
      creacion: 'Creación',
      actualizacion: 'Actualización',
      seguimiento: 'Seguimiento'
    };
    return labels[tipo] || tipo;
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
      const tipoMatch = this.selectedTipo === 'all' || item.tipo === this.selectedTipo;
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

  trackByActivity(index: number, activity: AtComprehensiveUpActivityItem): string {
    return activity.fecha + activity.accion;
  }
}
