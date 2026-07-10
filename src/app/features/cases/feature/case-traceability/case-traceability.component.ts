import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, Router } from '@angular/router';

export interface TrazabilidadItem {
  accion: string;
  fecha: string;
  usuario: string;
  descripcion: string;
}

export interface Case {
  upgdCode: string;
}

@Component({
  selector: 'app-case-traceability',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './case-traceability.component.html',
  styleUrls: ['./case-traceability.component.scss']
})
export class CaseTraceabilityComponent implements OnInit {
  @Input() embedded: boolean = false;
  @Input() caseData: Case | null = null;
  @Output() close = new EventEmitter<void>();
  selectedCaseInfo: Case | null = null;
  trazabilidadData: TrazabilidadItem[] = [];
  filteredTrazabilidadData: TrazabilidadItem[] = [];
  caseId: string | null = null;
  
  // Filtros
  selectedAction: string = 'all';
  searchTerm: string = '';
  
  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.caseId = this.route.snapshot.paramMap.get('id');
    this.loadTraceabilityData();
  }

  loadTraceabilityData(): void {
    // Datos de ejemplo de trazabilidad
    this.trazabilidadData = [
      {
        accion: 'Creación del caso',
        fecha: '15/01/2024 09:30:00',
        usuario: 'Juan Pérez',
        descripcion: 'Se creó el expediente inicial con todos los datos del paciente y se asignó categoría de riesgo de desnutrición.'
      },
      {
        accion: 'Actualización de estado',
        fecha: '16/01/2024 14:15:00',
        usuario: 'María González',
        descripcion: 'Se actualizó el estado del paciente a "En tratamiento" y se registraron nuevas mediciones antropométricas.'
      },
      {
        accion: 'Asignación de profesional',
        fecha: '17/01/2024 10:45:00',
        usuario: 'Carlos Rodríguez',
        descripcion: 'Se asignó al Dr. Carlos Rodríguez como profesional responsable del caso y se programó seguimiento.'
      },
      {
        accion: 'Modificación de tratamiento',
        fecha: '18/01/2024 16:20:00',
        usuario: 'Ana Martínez',
        descripcion: 'Se modificó el plan de tratamiento nutricional basado en los resultados de evaluación del día anterior.'
      },
      {
        accion: 'Cierre de seguimiento',
        fecha: '20/01/2024 11:30:00',
        usuario: 'Luis Sánchez',
        descripcion: 'Se completó el ciclo de seguimiento inicial y se dio de alta al paciente con mejoría significativa.'
      }
    ];
    
    this.filteredTrazabilidadData = [...this.trazabilidadData];
  }

  getAvailableActions(): string[] {
    const actions = [...new Set(this.trazabilidadData.map(item => item.accion))];
    return actions.sort();
  }

  onActionChange(value: string): void {
    this.selectedAction = value;
    this.applyFilters();
  }

  onSearchChange(term: string): void {
    this.searchTerm = term.toLowerCase();
    this.applyFilters();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.applyFilters();
  }

  clearFilters(): void {
    this.selectedAction = 'all';
    this.searchTerm = '';
    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredTrazabilidadData = this.trazabilidadData.filter(item => {
      // Filtro por acción
      const actionMatch = this.selectedAction === 'all' || item.accion === this.selectedAction;
      
      // Filtro por búsqueda
      const searchMatch = !this.searchTerm || 
        item.accion.toLowerCase().includes(this.searchTerm) ||
        item.usuario.toLowerCase().includes(this.searchTerm) ||
        item.descripcion.toLowerCase().includes(this.searchTerm);
      
      return actionMatch && searchMatch;
    });
  }

  goBack(): void {
    if (this.embedded) {
      this.close.emit();
    } else {
      this.router.navigate(['/cases', this.caseId]);
    }
  }
}
