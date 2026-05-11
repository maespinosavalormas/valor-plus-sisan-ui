import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

import { LegalizationSuppliesTraceabilityComponent } from '../legalization-supplies-traceability/legalization-supplies-traceability.component';
import { LegalizationSuppliesDetailsHeaderComponent } from '../../ui/legalization-supplies-details-header/legalization-supplies-details-header';

interface LegalizationSuppliesItem {
  id?: string | number;

  codigoUnidadProductiva?: string;
  codigoUP?: string;
  nombreBeneficiario?: string;
  tipoUnidadProductiva?: string;
  noCaracterizado?: string;

  nombreResponsable?: string;
  tipoDocumentoResponsable?: string;
  numeroDocumentoResponsable?: string;
  telefonoContacto?: string;
  convenio?: string;
  region?: string;
  municipio?: string;
  zona?: string;
  tipoBarrioVereda?: string;
  nombreBarrio?: string;
  vereda?: string;
  direccionUbicacion?: string;

  numeroDocumentoFuncionario?: string;
  nombresApellidosFuncionario?: string;
  telefonoFuncionario?: string;

  tipoSistemaCondicionesProtegidas?: string;
  fechaEntrega?: string;

  entregasRealizadas?: Array<{
    tipoEntrega?: string;
    tipoEntregaFijo?: string;
    entregaSeleccionada?: string;
    detalleArticulos?: Array<{
      articuloSeleccionado?: string;
      medidas?: string;
      unidadMedida?: string;
      cantidadContratada?: string | number;
      cantidadEntregada?: string | number;
    }>;
  }>;

  evidenciaFotografica?: string;
  utilizaActaFisica?: string;
  actaFisicaEscaneada?: string;

  firmaRepresentante?: string;
  firmaFuncionarioMunicipio?: string;
}

@Component({
  selector: 'app-legalization-supplies-details',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    LegalizationSuppliesDetailsHeaderComponent,
    LegalizationSuppliesTraceabilityComponent,
  ],
  templateUrl: './legalization-supplies-details.component.html',
  styleUrl: './legalization-supplies-details.component.scss',
})
export class LegalizationSuppliesDetailsComponent implements OnInit {
  @Input() legalization: LegalizationSuppliesItem | null = null;
  @Output() edit = new EventEmitter<LegalizationSuppliesItem>();
  @Output() back = new EventEmitter<void>();

  currentView: 'details' | 'traceability' = 'details';

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.loadLegalizationFromRoute();
  }

  loadLegalizationFromRoute(): void {
    let item: LegalizationSuppliesItem | null = null;

    try {
      const stored = localStorage.getItem('selectedLegalizationSupplies');
      if (stored) {
        item = JSON.parse(stored) as LegalizationSuppliesItem;
        localStorage.removeItem('selectedLegalizationSupplies');
      }
    } catch {
      // ignore
    }

    if (!item) {
      try {
        if (history.state?.item) {
          item = history.state.item as LegalizationSuppliesItem;
        }
      } catch {
        // ignore
      }
    }

    if (!item) {
      const id = this.route.snapshot.paramMap.get('id');
      if (id) {
        item = {
          id,
          codigoUnidadProductiva: `UP${id}`,
          nombreBeneficiario: 'Beneficiario de ejemplo',
          tipoUnidadProductiva: 'Familiares',
          noCaracterizado: 'No se encuentra caracterizado',
          nombreResponsable: 'Responsable de ejemplo',
          tipoDocumentoResponsable: 'CC',
          numeroDocumentoResponsable: '123456789',
          telefonoContacto: '3000000000',
          convenio: 'Convenio ejemplo',
          region: 'Antioquia',
          municipio: 'Medellín',
          zona: 'Zona 1',
          tipoBarrioVereda: 'Barrio',
          nombreBarrio: 'Barrio Ejemplo',
          vereda: 'Vereda 1',
          direccionUbicacion: 'Calle 123',
          numeroDocumentoFuncionario: '987654321',
          nombresApellidosFuncionario: 'Funcionario Ejemplo',
          telefonoFuncionario: '3010000000',
          tipoSistemaCondicionesProtegidas: 'Sistema 1',
          fechaEntrega: '2024-01-15',
          entregasRealizadas: [
            {
              tipoEntrega: 'Entrega Tipo 1',
              tipoEntregaFijo: 'Entrega Tipo 1',
              entregaSeleccionada: 'Entrega 1 Seleccionada',
              detalleArticulos: [
                {
                  articuloSeleccionado: 'Artículo 1',
                  medidas: '10x10',
                  unidadMedida: 'Kg',
                  cantidadContratada: 5,
                  cantidadEntregada: 5,
                },
              ],
            },
          ],
          evidenciaFotografica: 'evidencia.pdf',
          utilizaActaFisica: 'si',
          actaFisicaEscaneada: 'acta.pdf',
          firmaRepresentante: 'firma-representante.pdf',
          firmaFuncionarioMunicipio: 'firma-funcionario.pdf',
        };
      }
    }

    this.legalization = item;
  }

  onBack(): void {
    this.back.emit();
  }

  onViewChange(view: 'details' | 'traceability'): void {
    this.currentView = view;
  }

  onEdit(): void {
    if (this.legalization) {
      this.edit.emit(this.legalization);
    }
  }

  getCodigoUP(): string {
    return (
      this.legalization?.codigoUnidadProductiva ||
      this.legalization?.codigoUP ||
      'N/A'
    );
  }

  getEntregasRealizadas(): NonNullable<LegalizationSuppliesItem['entregasRealizadas']> {
    return this.legalization?.entregasRealizadas || [];
  }

  getDetalleArticulos(entregaIndex: number): NonNullable<NonNullable<LegalizationSuppliesItem['entregasRealizadas']>[number]['detalleArticulos']> {
    return this.getEntregasRealizadas()[entregaIndex]?.detalleArticulos || [];
  }
}
