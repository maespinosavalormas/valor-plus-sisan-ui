import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { ActivatedRoute, Router } from '@angular/router';
import { AtComprehensiveUpTraceabilityComponent } from '../at-comprehensive-up-traceability/at-comprehensive-up-traceability.component';
import { AtComprehensiveUpDetailsHeaderComponent } from '../../ui/at-comprehensive-up-details-header/at-comprehensive-up-details-header';

interface ProductoProducidoItem {
  seleccioneProducto?: string;
  cualProducto?: string;
  kilosProducidos?: string | number;
  listaProductosTotal?: string;
  productosCheck?: boolean;
  sumaKilosProducidos?: string | number;
  fotoSeguimiento?: string | File;
  kilosAutoconsumo?: string | number;
  kilosPAE?: string | number;
  kilosTrueque?: string | number;
  kilosVentaDirecta?: string | number;
  kilosDonacion?: string | number;
  kilosHoteles?: string | number;
  kilosRestaurantes?: string | number;
  kilosCafeteria?: string | number;
  sumaTodosDestinos?: string | number;
  totalProducidoMenosDestinos?: string | number;
  totalDestinosKg?: string;
  diferenciaProduccion?: string;
}

interface ExtendedAtComprehensiveUp {
  id?: string | number;

  // SECCION 1
  codigoUnidadProductiva?: string;
  nombreCompletoBeneficiario?: string;
  tipoUnidadProductiva?: string;
  noSeEncuentraCaracterizado?: string;

  // SECCION 2
  nombreResponsable?: string;
  tipoDocumentoResponsable?: string;
  numeroDocumentoResponsable?: string;
  telefonoContactoResponsable?: string;
  convenio?: string;
  region?: string;
  municipio?: string;
  zona?: string;
  tipoBarrioVereda?: string;
  nombreBarrio?: string;
  vereda?: string;
  direccionUbicacion?: string;

  // SECCION 3
  numeroDocumentoFuncionario?: string;
  nombreFuncionario?: string;
  funcionFuncionario?: string;
  fechaAsistenciaTecnica?: string;
  numeroAsistenciaTecnica?: string;

  // SECCION 4
  latitud?: string;
  longitud?: string;
  faseProcesoProduccion?: string;

  // SECCION 5
  productosProducidos?: ProductoProducidoItem[];

  // SECCION 6
  mostrarSituacionPrevia?: string;
  situacionEncontrada?: string;
  mostrarRecomendacionPrevia?: string;
  recomendacionesTecnicas?: string;
  fotografiaInterior?: string | File;
  unidadProductivaImplementada?: string;
  unidadProductivaActiva?: string;

  // SECCION 7
  fechaHoraFinalizacion?: string;
  consentimientoDatosPersonales?: string;
  consentimientoImagenesAudios?: string;
  firmaRepresentante?: string | File;
  anoRealizacionEncuesta?: string | number;
}

@Component({
  selector: 'app-at-comprehensive-up-details',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatCardModule,
    MatChipsModule,
    MatExpansionModule,
    AtComprehensiveUpTraceabilityComponent,
    AtComprehensiveUpDetailsHeaderComponent
  ],
  templateUrl: './at-comprehensive-up-details.component.html',
  styleUrl: './at-comprehensive-up-details.component.scss'
})
export class AtComprehensiveUpDetailsComponent implements OnInit, OnChanges, OnDestroy {
  @Input() atComprehensiveUp: ExtendedAtComprehensiveUp | null = null;
  @Output() edit = new EventEmitter<ExtendedAtComprehensiveUp>();
  @Output() back = new EventEmitter<void>();

  currentView: 'details' | 'traceability' = 'details';

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadFromRoute();
  }

  ngOnChanges(changes: SimpleChanges): void {}

  ngOnDestroy(): void {}

  loadFromRoute(): void {
    let data: ExtendedAtComprehensiveUp | null = null;

    try {
      const stored = localStorage.getItem('selectedAtComprehensiveUp');
      if (stored) {
        data = JSON.parse(stored) as ExtendedAtComprehensiveUp;
        localStorage.removeItem('selectedAtComprehensiveUp');
      }
    } catch {
      // ignore
    }

    if (!data) {
      try {
        const historyState = history.state;
        if (historyState?.atComprehensiveUp) {
          data = historyState.atComprehensiveUp as ExtendedAtComprehensiveUp;
        }
      } catch {
        // ignore
      }
    }

    if (!data) {
      const id = this.route?.snapshot?.paramMap?.get('id');
      if (id) {
        data = { id } as ExtendedAtComprehensiveUp;
      }
    }

    this.atComprehensiveUp = data;
  }

  onBack(): void {
    this.back.emit();
    this.router.navigate(['/at-comprehensive-up']);
  }

  onViewChange(view: string): void {
    this.currentView = view as 'details' | 'traceability';
  }

  onEdit(): void {
    if (this.atComprehensiveUp) {
      this.edit.emit(this.atComprehensiveUp);
      this.router.navigate(['/at-comprehensive-up/edit', this.atComprehensiveUp.id], {
        state: { item: this.atComprehensiveUp }
      });
    }
  }

  formatFileName(file?: string | File): string {
    if (!file) return 'No adjuntado';
    if (typeof file === 'string') {
      return file.split('/').pop() || file;
    }
    return file.name;
  }
}
