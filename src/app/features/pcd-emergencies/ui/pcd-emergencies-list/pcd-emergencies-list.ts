import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pcd-emergencies-list',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatTableModule, MatInputModule, MatSelectModule, MatDividerModule, FormsModule],
  templateUrl: './pcd-emergencies-list.html',
  styleUrl: './pcd-emergencies-list.scss'
})
export class PcdEmergenciesListComponent {
  displayedColumns: string[] = ['documento', 'beneficiario', 'municipio', 'telefono', 'cuidador', 'actions'];
  selectedCategory: string = 'ALL';
  searchTerm: string = '';

  constructor(private router: Router) {}

  pcdBeneficiaries = [
    {
      id: 1,
      documento: 'CC 12345678',
      beneficiario: 'María González Pérez',
      municipio: 'Medellín',
      telefono: '3001234567',
      contacto: 'madre',
      cuidador: 'Ana González'
    },
    {
      id: 2,
      documento: 'TI 87654321',
      beneficiario: 'Carlos Rodríguez López',
      municipio: 'Envigado',
      telefono: '3017654321',
      contacto: 'padre',
      cuidador: 'Luis Rodríguez'
    },
    {
      id: 3,
      documento: 'CC 11223344',
      beneficiario: 'Sofía Martínez García',
      municipio: 'Itagüí',
      telefono: '3029876543',
      contacto: 'abuela',
      cuidador: 'Carmen Martínez'
    },
    {
      id: 4,
      documento: 'TI 44332211',
      beneficiario: 'Juan Sánchez Morales',
      municipio: 'Bello',
      telefono: '3034567890',
      contacto: 'tío',
      cuidador: 'Pedro Sánchez'
    },
    {
      id: 5,
      documento: 'CC 55667788',
      beneficiario: 'Isabella Torres Ramírez',
      municipio: 'Caldas',
      telefono: '3045678901',
      contacto: 'madre',
      cuidador: 'Patricia Torres'
    }
  ];

  get filteredItems() {
    let filtered = this.pcdBeneficiaries;
    if (this.searchTerm) {
      filtered = filtered.filter(item =>
        item.beneficiario.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        item.documento.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        item.municipio.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        item.cuidador.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
    return filtered;
  }

  filterItems() {
    // Filter logic handled by getter
  }

  clearSearch() {
    this.searchTerm = '';
  }

  editItem(item: any): void {
    console.log('Edit PCD beneficiary:', item);
    // Navigate to edit form with data
    this.router.navigate(['/pcd-emergencies/edit', item.id], {
      state: { item: item }
    });
  }

  viewItem(item: any): void {
    console.log('View PCD emergency details:', item);
    // Navigate to details view with data
    this.router.navigate(['/pcd-emergencies/details', item.id], {
      state: { emergency: item }
    });
    // Also store in localStorage for fallback
    localStorage.setItem('selectedEmergency', JSON.stringify(item));
  }

  deleteItem(item: any): void {
    console.log('Delete PCD beneficiary:', item);
  }
}
