import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Tamizaje } from '../core/contracts/tamizaje.contracts';

@Component({
  selector: 'app-historial-table',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule],
  templateUrl: './historial-table.component.html',
  styleUrl: './historial-table.component.scss',
})
export class HistorialTableComponent {
  @Input() tamizajes: Tamizaje[] = [];
  @Output() edit = new EventEmitter<Tamizaje>();

  displayedColumns = ['fecha', 'peso', 'talla', 'pb', 'zPt', 'clasificacion', 'acciones'];

  isPbBajo(pb: number | null): boolean {
    return pb !== null && pb < 11.5;
  }

  onEdit(row: Tamizaje): void {
    this.edit.emit(row);
  }
}
