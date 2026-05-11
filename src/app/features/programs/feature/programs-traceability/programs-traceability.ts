import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatExpansionModule } from '@angular/material/expansion';
import { ProgramHeaderComponent } from '../../ui/program-details-header/program-details-header';

export interface TraceabilityRecord {
  id: string;
  timestamp: Date;
  entityType: 'program' | 'task';
  entityId: string;
  entityName: string;
  action: 'created' | 'updated' | 'deleted' | 'status_changed' | 'assigned' | 'completed';
  description: string;
  user: string;
  changes?: Record<string, { old: any; new: any }>;
}

@Component({
  selector: 'app-programs-traceability',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatTooltipModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatExpansionModule,
    ProgramHeaderComponent
  ],
  templateUrl: './programs-traceability.html',
  styleUrl: './programs-traceability.scss'
})
export class ProgramsTraceabilityComponent implements OnInit {
  @Input() programId: string = '';
  program: any = null;
  
  traceabilityRecords: TraceabilityRecord[] = [];
  displayedColumns: string[] = ['timestamp', 'entityType', 'entityName', 'action', 'user', 'description'];
  filteredRecords: TraceabilityRecord[] = [];
  
  // Filters
  selectedEntityType: string = 'all';
  selectedAction: string = 'all';
  searchTerm: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const programId = this.route.snapshot.paramMap.get('id');
    this.programId = programId || '';
    this.loadProgram(programId);
    this.loadTraceabilityData();
  }

  loadProgram(id: string | null): void {
    if (id) {
      // Mock: datos de ejemplo
      this.program = {
        id: id,
        name: 'Programa de Nutrición Infantil',
        description: 'Programa integral de nutrición infantil enfocado en la prevención y tratamiento de la desnutrición en niños menores de 5 años en comunidades vulnerables.',
        status: 'ACTIVE',
        applications: 45,
        effectivenessRate: 78,
        startDate: '2024-01-01',
        endDate: '2024-12-31'
      };
    }
  }

  goBack(): void {
    this.router.navigate(['/programs']);
  }

  onViewChange(view: 'info' | 'tasks' | 'traceability' | 'schedule'): void {
    if (this.program) {
      switch (view) {
        case 'info':
          this.router.navigate(['/programs', this.program.id]);
          break;
        case 'tasks':
          this.router.navigate(['/programs', this.program.id, 'tasks']);
          break;
        case 'schedule':
          this.router.navigate(['/programs', this.program.id, 'schedule']);
          break;
        case 'traceability':
          // Ya estamos en la vista de trazabilidad
          break;
      }
    }
  }

  loadTraceabilityData(): void {
    // Mock data for demonstration - replace with actual API call
    this.traceabilityRecords = [
      {
        id: '1',
        timestamp: new Date('2024-01-15T10:30:00'),
        entityType: 'program',
        entityId: this.programId,
        entityName: 'Programa de Desarrollo Web',
        action: 'created',
        description: 'Programa creado inicialmente',
        user: 'Juan Pérez'
      },
      {
        id: '2',
        timestamp: new Date('2024-01-16T14:20:00'),
        entityType: 'task',
        entityId: 'task-1',
        entityName: 'Configurar entorno de desarrollo',
        action: 'created',
        description: 'Tarea creada dentro del programa',
        user: 'María García'
      },
      {
        id: '3',
        timestamp: new Date('2024-01-17T09:15:00'),
        entityType: 'task',
        entityId: 'task-1',
        entityName: 'Configurar entorno de desarrollo',
        action: 'status_changed',
        description: 'Estado cambiado de "Pendiente" a "En Progreso"',
        user: 'Carlos López',
        changes: {
          status: { old: 'Pendiente', new: 'En Progreso' }
        }
      },
      {
        id: '4',
        timestamp: new Date('2024-01-18T16:45:00'),
        entityType: 'program',
        entityId: this.programId,
        entityName: 'Programa de Desarrollo Web',
        action: 'updated',
        description: 'Descripción del programa actualizada',
        user: 'Ana Martínez',
        changes: {
          description: { old: 'Descripción anterior', new: 'Nueva descripción actualizada' }
        }
      },
      {
        id: '5',
        timestamp: new Date('2024-01-19T11:30:00'),
        entityType: 'task',
        entityId: 'task-1',
        entityName: 'Configurar entorno de desarrollo',
        action: 'completed',
        description: 'Tarea marcada como completada',
        user: 'Carlos López'
      }
    ];

    this.filteredRecords = [...this.traceabilityRecords];
  }

  applyFilters(): void {
    this.filteredRecords = this.traceabilityRecords.filter(record => {
      const matchesEntityType = this.selectedEntityType === 'all' || record.entityType === this.selectedEntityType;
      const matchesAction = this.selectedAction === 'all' || record.action === this.selectedAction;
      const matchesSearch = this.searchTerm === '' || 
        record.entityName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        record.description.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        record.user.toLowerCase().includes(this.searchTerm.toLowerCase());

      return matchesEntityType && matchesAction && matchesSearch;
    });
  }

  getActionIcon(action: string): string {
    switch (action) {
      case 'created': return 'add_circle';
      case 'updated': return 'edit';
      case 'deleted': return 'delete';
      case 'status_changed': return 'sync';
      case 'assigned': return 'person_add';
      case 'completed': return 'check_circle';
      default: return 'info';
    }
  }

  getActionLabel(action: string): string {
    switch (action) {
      case 'created': return 'Creado';
      case 'updated': return 'Actualizado';
      case 'deleted': return 'Eliminado';
      case 'status_changed': return 'Cambio de Estado';
      case 'assigned': return 'Asignado';
      case 'completed': return 'Completado';
      default: return 'Desconocido';
    }
  }

  getEntityTypeLabel(entityType: string): string {
    switch (entityType) {
      case 'program': return 'Programa';
      case 'task': return 'Tarea';
      default: return entityType;
    }
  }

  onEntityTypeFilterChange(value: string): void {
    this.selectedEntityType = value;
    this.applyFilters();
  }

  onActionFilterChange(value: string): void {
    this.selectedAction = value;
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
    this.selectedEntityType = 'all';
    this.selectedAction = 'all';
    this.searchTerm = '';
    this.applyFilters();
  }

  getActionText(action: string): string {
    switch (action) {
      case 'created':
        return 'Creado';
      case 'updated':
        return 'Actualizado';
      case 'deleted':
        return 'Eliminado';
      case 'status_changed':
        return 'Cambio de Estado';
      case 'assigned':
        return 'Asignado';
      case 'completed':
        return 'Completado';
      default:
        return action;
    }
  }
}
