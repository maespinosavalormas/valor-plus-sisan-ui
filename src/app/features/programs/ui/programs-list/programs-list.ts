import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';

@Component({
  selector: 'app-programs-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule
  ],
  templateUrl: './programs-list.html',
  styleUrl: './programs-list.scss'
})
export class ProgramsListComponent {
  @Input() programs: any[] = [];
  @Output() edit = new EventEmitter<any>();
  @Output() toggleStatus = new EventEmitter<any>();

  searchTerm: string = '';
  selectedStatus: string = '';

  constructor(private router: Router) {}

  get filteredPrograms(): any[] {
    let filtered = this.programs;

    // Filtrar por término de búsqueda
    if (this.searchTerm) {
      filtered = filtered.filter(program => 
        program.name?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        program.description?.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    // Filtrar por estado
    if (this.selectedStatus) {
      filtered = filtered.filter(program => program.status === this.selectedStatus);
    }

    return filtered;
  }

  filterPrograms(): void {
    // El getter filteredPrograms maneja el filtrado automáticamente
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.filterPrograms();
  }

  viewProgramDetails(program: any): void {
    // Navegar a la página de detalles del programa
    this.router.navigate(['/programs', program.id]);
  }

  getStatusClass(status: string): string {
    switch(status) {
      case 'ACTIVE':
        return 'status-active';
      case 'COMPLETED':
        return 'status-completed';
      case 'CANCELLED':
        return 'status-cancelled';
      default:
        return 'status-active';
    }
  }

  getStatusLabel(status: string): string {
    switch(status) {
      case 'ACTIVE':
        return 'Activo';
      case 'COMPLETED':
        return 'Finalizado';
      case 'CANCELLED':
        return 'Cancelado';
      default:
        return 'Activo';
    }
  }

  onEdit(program: any): void {
    this.edit.emit(program);
  }

  onToggleStatus(program: any): void {
    this.toggleStatus.emit(program);
  }
}
