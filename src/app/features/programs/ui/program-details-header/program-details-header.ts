import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-program-header',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './program-details-header.html',
  styleUrl: './program-details-header.scss'
})
export class ProgramHeaderComponent {
  @Input() program: any = null;
  @Input() showBackButton: boolean = true;
  @Input() activeView: 'info' | 'tasks' | 'traceability' | 'schedule' = 'info';
  @Output() backClicked = new EventEmitter<void>();
  @Output() viewChanged = new EventEmitter<'info' | 'tasks' | 'traceability' | 'schedule'>();

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

  onBackClick(): void {
    this.backClicked.emit();
  }

  onViewChange(view: 'info' | 'tasks' | 'traceability' | 'schedule'): void {
    this.viewChanged.emit(view);
  }
}
