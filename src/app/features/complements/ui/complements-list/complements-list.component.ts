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

interface Complement {
  id: number;
  documento: string;
  nombre: string;
  municipio: string;
  telefono: string;
  fechaEntrega: string;
  recibe: string;
}

@Component({
  selector: 'app-complements-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatInputModule, MatButtonModule, MatIconModule, MatSelectModule, MatDividerModule, FormsModule],
  templateUrl: './complements-list.component.html',
  styleUrl: './complements-list.component.scss'
})
export class ComplementsListComponent {
  displayedColumns: string[] = ['documento', 'nombre', 'municipio', 'telefono', 'fechaEntrega', 'recibe', 'actions'];

  items: Complement[] = [
    { id: 1, documento: '123456789', nombre: 'Juan Pérez', municipio: 'Medellín', telefono: '3001234567', fechaEntrega: '2024-01-15', recibe: 'María Gómez' },
    { id: 2, documento: '987654321', nombre: 'María Rodríguez', municipio: 'Envigado', telefono: '3019876543', fechaEntrega: '2024-01-20', recibe: 'Carlos Ruiz' },
    { id: 3, documento: '456789123', nombre: 'Pedro Martínez', municipio: 'Itagüí', telefono: '3024567890', fechaEntrega: '2024-01-25', recibe: 'Laura Sánchez' },
    { id: 4, documento: '789123456', nombre: 'Ana López', municipio: 'Bello', telefono: '3037891234', fechaEntrega: '2024-02-01', recibe: 'José Fernández' },
    { id: 5, documento: '321654987', nombre: 'Luis García', municipio: 'Caldas', telefono: '3043216549', fechaEntrega: '2024-02-05', recibe: 'Sofia Morales' },
    { id: 6, documento: '654987321', nombre: 'Carmen Díaz', municipio: 'La Estrella', telefono: '3056549873', fechaEntrega: '2024-02-10', recibe: 'Miguel Torres' },
    { id: 7, documento: '159753456', nombre: 'Roberto Vega', municipio: 'Sabaneta', telefono: '3061597534', fechaEntrega: '2024-02-15', recibe: 'Elena Castro' },
    { id: 8, documento: '852963741', nombre: 'Isabel Ramírez', municipio: 'Copacabana', telefono: '3078529637', fechaEntrega: '2024-02-20', recibe: 'Diego Herrera' },
  ];

  filteredItems: Complement[] = [...this.items];

  searchTerm: string = '';
  selectedCategory: string = 'ALL';

  constructor(private router: Router) {}

  filterItems() {
    this.filteredItems = this.items.filter(item => {
      const matchesSearch = item.documento.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                            item.nombre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                            item.municipio.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesCategory = this.selectedCategory === 'ALL' || item.municipio === this.selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }

  clearSearch() {
    this.searchTerm = '';
    this.filterItems();
  }

  viewItem(item: Complement) {
    localStorage.setItem('selectedComplement', JSON.stringify(item));
    this.router.navigate(['/complements/details', item.id], {
      state: { item }
    });
  }

  editItem(item: Complement) {
    this.router.navigate(['/complements/edit', item.id], {
      state: { item }
    });
  }

  deleteItem(item: Complement) {
    if (confirm(`¿Está seguro de eliminar el registro de "${item.nombre}"?`)) {
      this.items = this.items.filter(i => i.id !== item.id);
      this.filterItems();
    }
  }
}
