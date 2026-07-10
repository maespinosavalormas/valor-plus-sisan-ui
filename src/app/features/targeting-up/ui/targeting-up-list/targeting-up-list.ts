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

interface TargetingUp {
  id: number;
  tipoUP: string;
  documento: string;
  responsable: string;
  municipio: string;
  tipoConvenio: string;
  areaDisponible: string;
  telefono: string;
}

@Component({
  selector: 'app-targeting-up-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatInputModule, MatButtonModule, MatIconModule, MatSelectModule, MatDividerModule, FormsModule],
  templateUrl: './targeting-up-list.html',
  styleUrl: './targeting-up-list.scss'
})
export class TargetingUpListComponent {
  displayedColumns: string[] = ['tipoUP', 'documento', 'responsable', 'municipio', 'tipoConvenio', 'areaDisponible', 'telefono', 'actions'];

  items: TargetingUp[] = [
    { id: 1, tipoUP: 'Agropecuaria', documento: '123456789', responsable: 'Juan Pérez López', municipio: 'Medellín', tipoConvenio: 'Convenio A', areaDisponible: '500', telefono: '3001234567' },
    { id: 2, tipoUP: 'Industrial', documento: '987654321', responsable: 'María Rodríguez', municipio: 'Envigado', tipoConvenio: 'Convenio B', areaDisponible: '300', telefono: '3019876543' },
    { id: 3, tipoUP: 'Comercial', documento: '456789123', responsable: 'Pedro Martínez', municipio: 'Itagüí', tipoConvenio: 'Convenio C', areaDisponible: '200', telefono: '3024567890' },
    { id: 4, tipoUP: 'Agropecuaria', documento: '789123456', responsable: 'Ana López', municipio: 'Bello', tipoConvenio: 'Convenio A', areaDisponible: '400', telefono: '3037891234' },
    { id: 5, tipoUP: 'Industrial', documento: '321654987', responsable: 'Luis García', municipio: 'Caldas', tipoConvenio: 'Convenio B', areaDisponible: '600', telefono: '3043216549' },
    { id: 6, tipoUP: 'Comercial', documento: '654987321', responsable: 'Carmen Díaz', municipio: 'La Estrella', tipoConvenio: 'Convenio C', areaDisponible: '350', telefono: '3056549873' },
    { id: 7, tipoUP: 'Agropecuaria', documento: '159753456', responsable: 'Roberto Vega', municipio: 'Sabaneta', tipoConvenio: 'Convenio A', areaDisponible: '450', telefono: '3061597534' },
    { id: 8, tipoUP: 'Industrial', documento: '852963741', responsable: 'Isabel Ramírez', municipio: 'Copacabana', tipoConvenio: 'Convenio B', areaDisponible: '250', telefono: '3078529637' },
  ];

  filteredItems: TargetingUp[] = [...this.items];

  searchTerm: string = '';
  selectedCategory: string = 'ALL';

  constructor(private router: Router) {}

  filterItems() {
    this.filteredItems = this.items.filter(item => {
      const matchesSearch = item.documento.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                            item.responsable.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                            item.municipio.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                            item.tipoUP.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesCategory = this.selectedCategory === 'ALL' || item.tipoConvenio === this.selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }

  clearSearch() {
    this.searchTerm = '';
    this.filterItems();
  }

  editItem(item: TargetingUp) {
    this.router.navigate(['/targeting-up/edit', item.id], {
      state: { item }
    });
  }

  viewItem(item: TargetingUp) {
    try {
      localStorage.setItem('selectedTargetingUp', JSON.stringify(item));
    } catch {
      // ignore
    }

    this.router.navigate(['/targeting-up/details', item.id], {
      state: { targetingUp: item }
    });
  }

  deleteItem(item: TargetingUp) {
    if (confirm(`¿Está seguro de eliminar el registro de "${item.responsable}"?`)) {
      this.items = this.items.filter(i => i.id !== item.id);
      this.filterItems();
    }
  }
}
