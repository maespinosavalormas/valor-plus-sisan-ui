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

export interface LegalizationRectificationActivityItem {
  accion: string;
  fecha: string;
  usuario: string;
  descripcion: string;
  tipo: 'creacion' | 'actualizacion' | 'contacto' | 'seguimiento' | 'autorizacion';
}

@Component({
  selector: 'app-legalization-rectification-traceability',
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
  templateUrl: './legalization-rectification-traceability.component.html',
  styleUrls: ['./legalization-rectification-traceability.component.scss']
})
export class LegalizationRectificationTraceabilityComponent implements OnInit, OnChanges {
  @Input() rectification: any = null;
  @Output() back = new EventEmitter<void>();

  selectedTab: number = 0;
  activityData: LegalizationRectificationActivityItem[] = [];
  filteredActivityData: LegalizationRectificationActivityItem[] = [];

  selectedTipo: string = 'all';
  searchTerm: string = '';

  ngOnInit(): void {
    this.loadActivityData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['rectification'] && this.rectification) {
      this.loadActivityData();
    }
  }

  loadActivityData(): void {
    this.activityData = [
      {
        accion: 'Creación de subsanación',
        fecha: '15/01/2024 09:30:00',
        usuario: 'Juan Carlos Pérez García',
        descripcion: 'Se creó el registro de subsanación de legalización.',
        tipo: 'creacion'
      },
      {
        accion: 'Actualización de datos',
        fecha: '16/01/2024 10:15:00',
        usuario: 'María Elena López Martínez',
        descripcion: 'Se actualizaron datos del participante y entrega.',
        tipo: 'actualizacion'
      },
      {
        accion: 'Validación de soportes',
        fecha: '17/01/2024 11:00:00',
        usuario: 'Carlos Andrés Rodríguez Torres',
        descripcion: 'Se validaron documentos y evidencias adjuntas.',
        tipo: 'seguimiento'
      },
      {
        accion: 'Autorización de subsanación',
        fecha: '18/01/2024 14:45:00',
        usuario: 'Carlos Andrés Rodríguez Torres',
        descripcion: 'Se autorizó el proceso de subsanación.',
        tipo: 'autorizacion'
      }
    ];

    this.filteredActivityData = [...this.activityData];
  }

  getAvailableTipos(): string[] {
    const tipos = [...new Set(this.activityData.map((item) => item.tipo))];
    return tipos.sort();
  }

  getTipoLabel(tipo: string): string {
    const labels: Record<string, string> = {
      creacion: 'Creación',
      actualizacion: 'Actualización',
      contacto: 'Contacto',
      seguimiento: 'Seguimiento',
      autorizacion: 'Autorización'
    };
    return labels[tipo] || tipo;
  }

  getTipoIcon(tipo: string): string {
    const icons: Record<string, string> = {
      creacion: 'add_circle',
      actualizacion: 'edit',
      contacto: 'phone',
      seguimiento: 'visibility',
      autorizacion: 'verified_user'
    };
    return icons[tipo] || 'info';
  }

  getTipoColor(tipo: string): string {
    const colors: Record<string, string> = {
      creacion: '#28a745',
      actualizacion: '#007bff',
      contacto: '#17a2b8',
      seguimiento: '#ffc107',
      autorizacion: '#6f42c1'
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
    this.filteredActivityData = this.activityData.filter((item) => {
      const tipoMatch = this.selectedTipo === 'all' || item.tipo === this.selectedTipo;

      const searchMatch =
        !this.searchTerm ||
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
    return this.activityData.filter((item) => item.tipo === tipo).length;
  }

  trackByActivity(index: number, activity: LegalizationRectificationActivityItem): string {
    return activity.fecha + activity.accion;
  }
}
