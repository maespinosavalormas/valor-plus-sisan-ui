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

interface Psychosocial {
  id: number;
  documento: string;
  nombre: string;
  edad: number;
  municipio: string;
  acudiente: string;
  telefono: string;
  fechaRegistro: string;
}

@Component({
  selector: 'app-psychosocial-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatInputModule, MatButtonModule, MatIconModule, MatSelectModule, MatDividerModule, FormsModule],
  templateUrl: './psychosocial-list.component.html',
  styleUrl: './psychosocial-list.component.scss'
})
export class PsychosocialListComponent {
  displayedColumns: string[] = ['documento', 'nombre', 'edad', 'municipio', 'acudiente', 'telefono', 'fechaRegistro', 'actions'];

  items: Psychosocial[] = [
    { id: 1, documento: '123456789', nombre: 'Juan Pérez', edad: 8, municipio: 'Medellín', acudiente: 'María Pérez', telefono: '3001234567', fechaRegistro: '2024-01-15' },
    { id: 2, documento: '987654321', nombre: 'María Rodríguez', edad: 7, municipio: 'Envigado', acudiente: 'Carlos Rodríguez', telefono: '3019876543', fechaRegistro: '2024-01-20' },
    { id: 3, documento: '456789123', nombre: 'Pedro Martínez', edad: 6, municipio: 'Itagüí', acudiente: 'Laura Martínez', telefono: '3024567890', fechaRegistro: '2024-01-25' },
    { id: 4, documento: '789123456', nombre: 'Ana López', edad: 9, municipio: 'Bello', acudiente: 'José López', telefono: '3037891234', fechaRegistro: '2024-02-01' },
    { id: 5, documento: '321654987', nombre: 'Luis García', edad: 5, municipio: 'Caldas', acudiente: 'Sofia García', telefono: '3043216549', fechaRegistro: '2024-02-05' },
    { id: 6, documento: '654987321', nombre: 'Carmen Díaz', edad: 10, municipio: 'La Estrella', acudiente: 'Miguel Díaz', telefono: '3056549873', fechaRegistro: '2024-02-10' },
    { id: 7, documento: '159753456', nombre: 'Roberto Vega', edad: 4, municipio: 'Sabaneta', acudiente: 'Elena Vega', telefono: '3061597534', fechaRegistro: '2024-02-15' },
    { id: 8, documento: '852963741', nombre: 'Isabel Ramírez', edad: 11, municipio: 'Copacabana', acudiente: 'Diego Ramírez', telefono: '3078529637', fechaRegistro: '2024-02-20' },
  ];

  filteredItems: Psychosocial[] = [...this.items];

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

  editItem(item: Psychosocial) {
    this.router.navigate(['/psychosocial/edit', item.id], {
      state: { item }
    });
  }

  viewItem(item: Psychosocial) {
    console.log('👁️ Viewing item:', item);
    this.router.navigate(['/psychosocial/details', item.id], {
      state: { item }
    });
  }

  deleteItem(item: Psychosocial) {
    if (confirm(`¿Está seguro de eliminar el registro de "${item.nombre}"?`)) {
      this.items = this.items.filter(i => i.id !== item.id);
      this.filterItems();
    }
  }
}
