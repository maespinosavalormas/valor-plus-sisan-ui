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

interface CharacterizationUp {
  id: number;
  codigoUP: string;
  tipoUP: string;
  responsable: string;
  municipio: string;
  convenio: string;
  areaDisponible: string;
  anioEncuesta: string;
}

@Component({
  selector: 'app-characterization-up-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatInputModule, MatButtonModule, MatIconModule, MatSelectModule, MatDividerModule, FormsModule],
  templateUrl: './characterization-up-list.component.html',
  styleUrl: './characterization-up-list.component.scss'
})
export class CharacterizationUpListComponent {
  displayedColumns: string[] = ['codigoUP', 'tipoUP', 'responsable', 'municipio', 'convenio', 'areaDisponible', 'anioEncuesta', 'actions'];

  items: CharacterizationUp[] = [
    { id: 1, codigoUP: 'UP001', tipoUP: 'Agropecuaria', responsable: 'Juan Pérez', municipio: 'Medellín', convenio: 'Convenio A', areaDisponible: '500', anioEncuesta: '2023' },
    { id: 2, codigoUP: 'UP002', tipoUP: 'Industrial', responsable: 'María Rodríguez', municipio: 'Envigado', convenio: 'Convenio B', areaDisponible: '300', anioEncuesta: '2023' },
    { id: 3, codigoUP: 'UP003', tipoUP: 'Comercial', responsable: 'Pedro Martínez', municipio: 'Itagüí', convenio: 'Convenio C', areaDisponible: '200', anioEncuesta: '2023' },
    { id: 4, codigoUP: 'UP004', tipoUP: 'Agropecuaria', responsable: 'Ana López', municipio: 'Bello', convenio: 'Convenio A', areaDisponible: '400', anioEncuesta: '2024' },
    { id: 5, codigoUP: 'UP005', tipoUP: 'Industrial', responsable: 'Luis García', municipio: 'Caldas', convenio: 'Convenio B', areaDisponible: '600', anioEncuesta: '2024' },
    { id: 6, codigoUP: 'UP006', tipoUP: 'Comercial', responsable: 'Carmen Díaz', municipio: 'La Estrella', convenio: 'Convenio C', areaDisponible: '350', anioEncuesta: '2024' },
    { id: 7, codigoUP: 'UP007', tipoUP: 'Agropecuaria', responsable: 'Roberto Vega', municipio: 'Sabaneta', convenio: 'Convenio A', areaDisponible: '450', anioEncuesta: '2024' },
    { id: 8, codigoUP: 'UP008', tipoUP: 'Industrial', responsable: 'Isabel Ramírez', municipio: 'Copacabana', convenio: 'Convenio B', areaDisponible: '250', anioEncuesta: '2024' },
  ];

  filteredItems: CharacterizationUp[] = [...this.items];

  searchTerm: string = '';
  selectedCategory: string = 'ALL';

  constructor(private router: Router) {}

  filterItems() {
    this.filteredItems = this.items.filter(item => {
      const matchesSearch = item.codigoUP.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                            item.responsable.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                            item.municipio.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                            item.tipoUP.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesCategory = this.selectedCategory === 'ALL' || item.convenio === this.selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }

  clearSearch() {
    this.searchTerm = '';
    this.filterItems();
  }

  editItem(item: CharacterizationUp) {
    this.router.navigate(['/characterization-up/edit', item.id], {
      state: { item }
    });
  }

  viewItem(item: CharacterizationUp) {
    try {
      localStorage.setItem('selectedCharacterizationUp', JSON.stringify(item));
    } catch {
      // ignore
    }

    this.router.navigate(['/characterization-up/details', item.id], {
      state: { characterizationUp: item }
    });
  }

  deleteItem(item: CharacterizationUp) {
    if (confirm(`¿Está seguro de eliminar el registro de "${item.responsable}"?`)) {
      this.items = this.items.filter(i => i.id !== item.id);
      this.filterItems();
    }
  }
}
