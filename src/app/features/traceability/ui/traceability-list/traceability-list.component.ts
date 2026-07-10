import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';

export interface TraceabilityRecord {
  id: string;
  timestamp: Date;
  entityType: 'program' | 'task' | 'case' | 'user';
  entityId: string;
  entityName: string;
  action: 'created' | 'updated' | 'deleted' | 'status_changed' | 'assigned' | 'completed';
  description: string;
  user: string;
  changes?: Record<string, { old: any; new: any }>;
}

@Component({
  selector: 'app-traceability-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule
  ],
  templateUrl: './traceability-list.html',
  styleUrl: './traceability-list.scss'
})
export class TraceabilityListComponent {
  @Input() records: TraceabilityRecord[] = [];
  @Input() totalCount: number = 0;
  @Output() recordClick = new EventEmitter<TraceabilityRecord>();

  displayedColumns: string[] = ['action', 'timestamp', 'entityType', 'entityName', 'user', 'description'];

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
      case 'case': return 'Caso';
      case 'user': return 'Usuario';
      default: return entityType;
    }
  }

  getEntityTypeClass(entityType: string): string {
    return `entity-type-${entityType}`;
  }

  onRecordClick(record: TraceabilityRecord): void {
    this.recordClick.emit(record);
  }
}
