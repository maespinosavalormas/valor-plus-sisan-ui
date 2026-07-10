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

interface LegalizationSupplies {
  id: number;
  codigoUP: string;
  responsable: string;
  tipoUP: string;
  municipio: string;
  tipoEntrega: string;
  fechaEntrega: string;
  entregadoPor: string;
}

@Component({
  selector: 'app-legalization-supplies-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatInputModule, MatButtonModule, MatIconModule, MatSelectModule, MatDividerModule, FormsModule],
  templateUrl: './legalization-supplies-list.component.html',
  styleUrl: './legalization-supplies-list.component.scss'
})
export class LegalizationSuppliesListComponent {
  displayedColumns: string[] = ['codigoUP', 'responsable', 'tipoUP', 'municipio', 'tipoEntrega', 'fechaEntrega', 'entregadoPor', 'actions'];

  items: LegalizationSupplies[] = [
    { id: 1, codigoUP: 'UP001', responsable: 'Juan Pérez', tipoUP: 'Agropecuaria', municipio: 'Medellín', tipoEntrega: 'Directa', fechaEntrega: '2024-01-15', entregadoPor: 'Ana Gómez' },
    { id: 2, codigoUP: 'UP002', responsable: 'María Rodríguez', tipoUP: 'Industrial', municipio: 'Envigado', tipoEntrega: 'Indirecta', fechaEntrega: '2024-01-20', entregadoPor: 'Carlos Ruiz' },
    { id: 3, codigoUP: 'UP003', responsable: 'Pedro Martínez', tipoUP: 'Comercial', municipio: 'Itagüí', tipoEntrega: 'Directa', fechaEntrega: '2024-01-25', entregadoPor: 'Laura Sánchez' },
    { id: 4, codigoUP: 'UP004', responsable: 'Ana López', tipoUP: 'Agropecuaria', municipio: 'Bello', tipoEntrega: 'Indirecta', fechaEntrega: '2024-02-01', entregadoPor: 'José Fernández' },
    { id: 5, codigoUP: 'UP005', responsable: 'Luis García', tipoUP: 'Industrial', municipio: 'Caldas', tipoEntrega: 'Directa', fechaEntrega: '2024-02-05', entregadoPor: 'Sofia Morales' },
    { id: 6, codigoUP: 'UP006', responsable: 'Carmen Díaz', tipoUP: 'Comercial', municipio: 'La Estrella', tipoEntrega: 'Indirecta', fechaEntrega: '2024-02-10', entregadoPor: 'Miguel Torres' },
    { id: 7, codigoUP: 'UP007', responsable: 'Roberto Vega', tipoUP: 'Agropecuaria', municipio: 'Sabaneta', tipoEntrega: 'Directa', fechaEntrega: '2024-02-15', entregadoPor: 'Elena Castro' },
    { id: 8, codigoUP: 'UP008', responsable: 'Isabel Ramírez', tipoUP: 'Industrial', municipio: 'Copacabana', tipoEntrega: 'Indirecta', fechaEntrega: '2024-02-20', entregadoPor: 'Diego Herrera' },
  ];

  filteredItems: LegalizationSupplies[] = [...this.items];

  searchTerm: string = '';
  selectedCategory: string = 'ALL';

  constructor(private router: Router) {}

  filterItems() {
    this.filteredItems = this.items.filter(item => {
      const matchesSearch = item.codigoUP.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                            item.responsable.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                            item.municipio.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                            item.tipoUP.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesCategory = this.selectedCategory === 'ALL' || item.tipoEntrega === this.selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }

  clearSearch() {
    this.searchTerm = '';
    this.filterItems();
  }

  editItem(item: LegalizationSupplies) {
    this.router.navigate(['/legalization-supplies/edit', item.id], {
      state: { item }
    });
  }

  viewItem(item: LegalizationSupplies) {
    try {
      localStorage.setItem('selectedLegalizationSupplies', JSON.stringify(item));
    } catch {
      // ignore
    }

    this.router.navigate(['/legalization-supplies/details', item.id], {
      state: { item },
    });
  }

  deleteItem(item: LegalizationSupplies) {
    if (confirm(`¿Está seguro de eliminar el registro de "${item.responsable}"?`)) {
      this.items = this.items.filter(i => i.id !== item.id);
      this.filterItems();
    }
  }
}
