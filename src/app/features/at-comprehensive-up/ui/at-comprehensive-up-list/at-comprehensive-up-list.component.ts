import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface AtComprehensiveUp {
  id: number;
  codigoUP: string;
  responsable: string;
  tipoUP: string;
  municipio: string;
  fechaATI: string;
  numeroATI: string;
  estadoUP: string;
}

@Component({
  selector: 'app-at-comprehensive-up-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatInputModule, MatButtonModule, MatIconModule, MatSelectModule, MatDividerModule, FormsModule],
  templateUrl: './at-comprehensive-up-list.component.html',
  styleUrl: './at-comprehensive-up-list.component.scss'
})
export class AtComprehensiveUpListComponent {
  displayedColumns: string[] = ['codigoUP', 'responsable', 'tipoUP', 'municipio', 'fechaATI', 'numeroATI', 'estadoUP', 'actions'];

  items: AtComprehensiveUp[] = [
    { id: 1, codigoUP: 'UP001', responsable: 'Juan Pérez', tipoUP: 'Agropecuaria', municipio: 'Medellín', fechaATI: '2024-01-15', numeroATI: 'ATI001', estadoUP: 'Activa' },
    { id: 2, codigoUP: 'UP002', responsable: 'María Rodríguez', tipoUP: 'Industrial', municipio: 'Envigado', fechaATI: '2024-01-20', numeroATI: 'ATI002', estadoUP: 'Inactiva' },
    { id: 3, codigoUP: 'UP003', responsable: 'Pedro Martínez', tipoUP: 'Comercial', municipio: 'Itagüí', fechaATI: '2024-01-25', numeroATI: 'ATI003', estadoUP: 'Activa' },
    { id: 4, codigoUP: 'UP004', responsable: 'Ana López', tipoUP: 'Agropecuaria', municipio: 'Bello', fechaATI: '2024-02-01', numeroATI: 'ATI004', estadoUP: 'Inactiva' },
    { id: 5, codigoUP: 'UP005', responsable: 'Luis García', tipoUP: 'Industrial', municipio: 'Caldas', fechaATI: '2024-02-05', numeroATI: 'ATI005', estadoUP: 'Activa' },
    { id: 6, codigoUP: 'UP006', responsable: 'Carmen Díaz', tipoUP: 'Comercial', municipio: 'La Estrella', fechaATI: '2024-02-10', numeroATI: 'ATI006', estadoUP: 'Inactiva' },
    { id: 7, codigoUP: 'UP007', responsable: 'Roberto Vega', tipoUP: 'Agropecuaria', municipio: 'Sabaneta', fechaATI: '2024-02-15', numeroATI: 'ATI007', estadoUP: 'Activa' },
    { id: 8, codigoUP: 'UP008', responsable: 'Isabel Ramírez', tipoUP: 'Industrial', municipio: 'Copacabana', fechaATI: '2024-02-20', numeroATI: 'ATI008', estadoUP: 'Inactiva' },
  ];

  filteredItems: AtComprehensiveUp[] = [...this.items];

  searchTerm: string = '';
  selectedCategory: string = 'ALL';

  constructor(private router: Router) {}

  filterItems() {
    this.filteredItems = this.items.filter(item => {
      const matchesSearch = item.codigoUP.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                            item.responsable.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                            item.municipio.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                            item.tipoUP.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesCategory = this.selectedCategory === 'ALL' || item.estadoUP === this.selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }

  clearSearch() {
    this.searchTerm = '';
    this.filterItems();
  }

  editItem(item: AtComprehensiveUp) {
    this.router.navigate(['/at-comprehensive-up/edit', item.id], {
      state: { item }
    });
  }

  viewItem(item: AtComprehensiveUp) {
    try {
      localStorage.setItem('selectedAtComprehensiveUp', JSON.stringify(item));
    } catch {
      // ignore
    }

    this.router.navigate(['/at-comprehensive-up/details', item.id], {
      state: { atComprehensiveUp: item }
    });
  }

  deleteItem(item: AtComprehensiveUp) {
    if (confirm(`¿Está seguro de eliminar el registro de "${item.responsable}"?`)) {
      this.items = this.items.filter(i => i.id !== item.id);
      this.filterItems();
    }
  }
}
