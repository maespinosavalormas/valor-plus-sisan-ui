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

interface LegalizationRectification {
  id: number;
  documento: string;
  participante: string;
  municipio: string;
  fechaEntrega: string;
  periodo: string;
  recibe: string;
  estadoSubsanacion: string;
}

@Component({
  selector: 'app-legalization-rectification-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatInputModule, MatButtonModule, MatIconModule, MatSelectModule, MatDividerModule, FormsModule],
  templateUrl: './legalization-rectification-list.html',
  styleUrl: './legalization-rectification-list.scss'
})
export class LegalizationRectificationListComponent {
  displayedColumns: string[] = ['documento', 'participante', 'municipio', 'fechaEntrega', 'periodo', 'recibe', 'estadoSubsanacion', 'actions'];

  items: LegalizationRectification[] = [
    { id: 1, documento: '123456789', participante: 'Juan Pérez López', municipio: 'Medellín', fechaEntrega: '2024-01-15', periodo: 'Enero 2024', recibe: 'Padre', estadoSubsanacion: 'Pendiente' },
    { id: 2, documento: '987654321', participante: 'María Rodríguez', municipio: 'Envigado', fechaEntrega: '2024-01-20', periodo: 'Enero 2024', recibe: 'Madre', estadoSubsanacion: 'Aprobado' },
    { id: 3, documento: '456789123', participante: 'Pedro Martínez', municipio: 'Itagüí', fechaEntrega: '2024-01-25', periodo: 'Enero 2024', recibe: 'Tutor', estadoSubsanacion: 'Rechazado' },
    { id: 4, documento: '789123456', participante: 'Ana López', municipio: 'Bello', fechaEntrega: '2024-02-01', periodo: 'Febrero 2024', recibe: 'Abuela', estadoSubsanacion: 'En Proceso' },
    { id: 5, documento: '321654987', participante: 'Luis García', municipio: 'Caldas', fechaEntrega: '2024-02-05', periodo: 'Febrero 2024', recibe: 'Padre', estadoSubsanacion: 'Pendiente' },
    { id: 6, documento: '654987321', participante: 'Carmen Díaz', municipio: 'La Estrella', fechaEntrega: '2024-02-10', periodo: 'Febrero 2024', recibe: 'Madre', estadoSubsanacion: 'Aprobado' },
    { id: 7, documento: '159753456', participante: 'Roberto Vega', municipio: 'Sabaneta', fechaEntrega: '2024-02-15', periodo: 'Febrero 2024', recibe: 'Tutor', estadoSubsanacion: 'En Proceso' },
    { id: 8, documento: '852963741', participante: 'Isabel Ramírez', municipio: 'Copacabana', fechaEntrega: '2024-02-20', periodo: 'Febrero 2024', recibe: 'Abuelo', estadoSubsanacion: 'Pendiente' },
  ];

  filteredItems: LegalizationRectification[] = [...this.items];

  searchTerm: string = '';
  selectedCategory: string = 'ALL';

  constructor(private router: Router) {}

  filterItems() {
    this.filteredItems = this.items.filter(item => {
      const matchesSearch = item.documento.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                            item.participante.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                            item.municipio.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesCategory = this.selectedCategory === 'ALL' || item.periodo === this.selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }

  clearSearch() {
    this.searchTerm = '';
    this.filterItems();
  }

  editItem(item: LegalizationRectification) {
    this.router.navigate(['/legalization-rectification/edit', item.id], {
      state: { item }
    });
  }

  viewItem(item: LegalizationRectification): void {
    this.router.navigate(['/legalization-rectification/details', item.id], {
      state: { rectification: item }
    });
    localStorage.setItem('selectedRectification', JSON.stringify(item));
  }

  deleteItem(item: LegalizationRectification) {
    if (confirm(`¿Está seguro de eliminar el registro de "${item.participante}"?`)) {
      this.items = this.items.filter(i => i.id !== item.id);
      this.filterItems();
    }
  }
}
