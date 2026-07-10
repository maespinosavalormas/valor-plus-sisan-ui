import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { TraceabilityListComponent, TraceabilityRecord } from '../../ui/traceability-list/traceability-list.component';

@Component({
  selector: 'app-traceability-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    TraceabilityListComponent
  ],
  templateUrl: './traceability-page.html',
  styleUrl: './traceability-page.scss'
})
export class TraceabilityPageComponent implements OnInit {
  traceabilityRecords: TraceabilityRecord[] = [];
  displayedColumns: string[] = ['timestamp', 'entityType', 'entityName', 'action', 'user', 'description'];
  filteredRecords: TraceabilityRecord[] = [];
  
  // Filters
  selectedEntityType: string = 'all';
  selectedAction: string = 'all';
  searchTerm: string = '';

  ngOnInit(): void {
    this.loadTraceabilityData();
  }

  loadTraceabilityData(): void {
    // Mock data for demonstration - replace with actual API call
    this.traceabilityRecords = [
      {
        id: '1',
        timestamp: new Date('2024-01-15T10:30:00'),
        entityType: 'case',
        entityId: 'prog-1',
        entityName: 'Caso de Desnutrición Adolecente',
        action: 'created',
        description: 'Creado inicialmente',
        user: 'Juan Pérez'
      },
      {
        id: '2',
        timestamp: new Date('2024-01-16T14:20:00'),
        entityType: 'case',
        entityId: 'task-1',
        entityName: 'Caso de Desnutrición Infantil',
        action: 'created',
        description: 'Asignado Recientemente',
        user: 'María García'
      },
      {
        id: '3',
        timestamp: new Date('2024-01-17T09:15:00'),
        entityType: 'case',
        entityId: 'case-1',
        entityName: 'Caso de Desnutrición Infantil',
        action: 'updated',
        description: 'Información del caso actualizada',
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

  onRecordClick(record: TraceabilityRecord): void {
    console.log('Record clicked:', record);
    // Aquí puedes navegar a detalles o mostrar información adicional
  }
}
