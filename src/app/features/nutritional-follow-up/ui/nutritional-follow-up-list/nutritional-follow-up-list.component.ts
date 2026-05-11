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

interface NutritionalFollowUp {
  id: number;
  documento: string;
  nombre: string;
  edad: number;
  municipio: string;
  fechaValoracion: string;
  estadoNutricional: string;
  tipoRegistro: string;
}

@Component({
  selector: 'app-nutritional-follow-up-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatInputModule, MatButtonModule, MatIconModule, MatSelectModule, MatDividerModule, FormsModule],
  templateUrl: './nutritional-follow-up-list.component.html',
  styleUrl: './nutritional-follow-up-list.component.scss'
})
export class NutritionalFollowUpListComponent {
  displayedColumns: string[] = ['documento', 'nombre', 'edad', 'municipio', 'fechaValoracion', 'estadoNutricional', 'tipoRegistro', 'actions'];

  items: NutritionalFollowUp[] = [
    { id: 1, documento: '123456789', nombre: 'Juan Pérez', edad: 5, municipio: 'Medellín', fechaValoracion: '2024-01-15', estadoNutricional: 'Normal', tipoRegistro: 'Nuevo' },
    { id: 2, documento: '987654321', nombre: 'María Rodríguez', edad: 7, municipio: 'Envigado', fechaValoracion: '2024-01-20', estadoNutricional: 'Desnutrición', tipoRegistro: 'SIVIGILA' },
    { id: 3, documento: '456789123', nombre: 'Pedro Martínez', edad: 6, municipio: 'Itagüí', fechaValoracion: '2024-01-25', estadoNutricional: 'Normal', tipoRegistro: 'Nuevo' },
    { id: 4, documento: '789123456', nombre: 'Ana López', edad: 8, municipio: 'Bello', fechaValoracion: '2024-02-01', estadoNutricional: 'Sobrepeso', tipoRegistro: 'SIVIGILA' },
    { id: 5, documento: '321654987', nombre: 'Luis García', edad: 4, municipio: 'Caldas', fechaValoracion: '2024-02-05', estadoNutricional: 'Desnutrición', tipoRegistro: 'Nuevo' },
    { id: 6, documento: '654987321', nombre: 'Carmen Díaz', edad: 9, municipio: 'La Estrella', fechaValoracion: '2024-02-10', estadoNutricional: 'Normal', tipoRegistro: 'SIVIGILA' },
    { id: 7, documento: '159753456', nombre: 'Roberto Vega', edad: 3, municipio: 'Sabaneta', fechaValoracion: '2024-02-15', estadoNutricional: 'Bajo peso', tipoRegistro: 'Nuevo' },
    { id: 8, documento: '852963741', nombre: 'Isabel Ramírez', edad: 10, municipio: 'Copacabana', fechaValoracion: '2024-02-20', estadoNutricional: 'Normal', tipoRegistro: 'SIVIGILA' },
  ];

  filteredItems: NutritionalFollowUp[] = [...this.items];

  searchTerm: string = '';
  selectedCategory: string = 'ALL';

  constructor(private router: Router) {}

  filterItems() {
    this.filteredItems = this.items.filter(item => {
      const matchesSearch = item.documento.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                            item.nombre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                            item.municipio.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesCategory = this.selectedCategory === 'ALL' || item.tipoRegistro === this.selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }

  clearSearch() {
    this.searchTerm = '';
    this.filterItems();
  }

  editItem(item: NutritionalFollowUp) {
    this.router.navigate(['/nutritional-follow-up/edit', item.id], {
      state: { item }
    });
  }

  viewItem(item: NutritionalFollowUp): void {
    this.router.navigate(['/nutritional-follow-up/details', item.id], {
      state: { item },
    });

    localStorage.setItem('selectedNutritionalFollowUp', JSON.stringify(item));
  }

  deleteItem(item: NutritionalFollowUp) {
    if (confirm(`¿Está seguro de eliminar el registro de "${item.nombre}"?`)) {
      this.items = this.items.filter(i => i.id !== item.id);
      this.filterItems();
    }
  }
}
