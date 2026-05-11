import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-legalization-packages-traceability',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './legalization-packages-traceability.component.html',
  styleUrl: './legalization-packages-traceability.component.scss'
})
export class LegalizationPackagesTraceabilityComponent implements OnInit {
  @Input() package: any;
  @Output() back = new EventEmitter<void>();

  searchTerm: string = '';
  selectedTipo: string = 'all';
  activityData: any[] = [];
  filteredActivityData: any[] = [];

  ngOnInit() {
    this.loadPackageData();
    this.loadActivityData();
    this.filterActivityData();
  }

  loadPackageData() {
    if (!this.package) {
      const storedPackage = localStorage.getItem('selectedPackage');
      if (storedPackage) {
        this.package = JSON.parse(storedPackage);
      }
    }
  }

  loadActivityData() {
    // Simulate activity data for the package
    const packageId = this.package?.id || 1;
    const participantName = this.package?.participante || 'Participante';
    
    this.activityData = [
      {
        id: 1,
        accion: 'Paquete creado',
        tipo: 'creacion',
        fecha: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES'),
        usuario: 'Ana Gómez',
        descripcion: `Se creó el paquete de legalización para ${participantName} con documento ${this.package?.documento || 'N/A'}`
      },
      {
        id: 2,
        accion: 'Paquete actualizado',
        tipo: 'actualizacion',
        fecha: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES'),
        usuario: 'Carlos Ruiz',
        descripcion: `Se actualizó la información de entrega del paquete ${packageId}`
      },
      {
        id: 3,
        accion: 'Entrega confirmada',
        tipo: 'entrega',
        fecha: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES'),
        usuario: 'Laura Sánchez',
        descripcion: `Se confirmó la entrega del paquete a ${this.package?.recibe || 'N/A'}`
      },
      {
        id: 4,
        accion: 'Seguimiento realizado',
        tipo: 'seguimiento',
        fecha: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES'),
        usuario: 'José Fernández',
        descripcion: `Se realizó seguimiento del estado del paquete ${packageId}`
      },
      {
        id: 5,
        accion: 'Paquete actualizado',
        tipo: 'actualizacion',
        fecha: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES'),
        usuario: 'Sofia Morales',
        descripcion: `Se actualizó la información del período del paquete`
      }
    ];

    this.filteredActivityData = [...this.activityData];
  }

  onSearchChange(value: string) {
    this.searchTerm = value;
    this.filterActivityData();
  }

  onTipoChange(value: string) {
    this.selectedTipo = value;
    this.filterActivityData();
  }

  clearSearch() {
    this.searchTerm = '';
    this.filterActivityData();
  }

  filterActivityData() {
    this.filteredActivityData = this.activityData.filter(item => {
      const matchesSearch = !this.searchTerm || 
        item.accion.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        item.usuario.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        item.descripcion.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesTipo = this.selectedTipo === 'all' || item.tipo === this.selectedTipo;
      
      return matchesSearch && matchesTipo;
    });
  }

  getAvailableTipos(): string[] {
    const tipos = [...new Set(this.activityData.map(item => item.tipo))];
    return tipos.sort();
  }

  getTipoLabel(tipo: string): string {
    const labels: { [key: string]: string } = {
      'creacion': 'Creación',
      'actualizacion': 'Actualización',
      'entrega': 'Entrega',
      'seguimiento': 'Seguimiento'
    };
    return labels[tipo] || tipo;
  }

  trackByActivity(index: number, activity: any): number {
    return activity.id;
  }

  getActivityCount(): number {
    return this.filteredActivityData.length;
  }

  getActivityCountByType(tipo: string): number {
    return this.activityData.filter(item => item.tipo === tipo).length;
  }

  onBack() {
    this.back.emit();
  }
}
