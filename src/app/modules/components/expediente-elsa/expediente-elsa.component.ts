import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { ExpedienteDetailDto, TrazabilidadResponseDto, ListaSeguimientosResponseDto } from '../../models';
import { ExpedienteService } from '../../services/expediente.service';

@Component({
  selector: 'app-expediente-elsa',
  templateUrl: './expediente-elsa.component.html',
  styleUrls: ['./expediente-elsa.component.scss'],
})
export class ExpedienteElsaComponent implements OnInit {
  elsa_id: string;
  expediente: ExpedienteDetailDto | null = null;
  trazabilidad$: Observable<TrazabilidadResponseDto> | null = null;
  seguimientos$: Observable<ListaSeguimientosResponseDto> | null = null;

  loadingExpediente = true;
  loadingTrazabilidad = false;
  loadingSeguimientos = false;
  errorMessage: string | null = null;

  selectedTab = 0; // 0: Detalle, 1: Cálculos, 2: Trazabilidad, 3: Seguimientos
  reloadSeguimientos$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private expediente_svc: ExpedienteService,
  ) {
    this.elsa_id = this.route.snapshot.paramMap.get('id') || '';
  }

  ngOnInit(): void {
    this.loadExpediente();
  }

  private loadExpediente(): void {
    this.loadingExpediente = true;
    this.expediente_svc.getExpediente(this.elsa_id).subscribe({
      next: (data) => {
        this.expediente = data;
        this.loadingExpediente = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Error cargando expediente';
        this.loadingExpediente = false;
      },
    });
  }

  onTabChange(tab: number): void {
    this.selectedTab = tab;
    if (tab === 2 && !this.trazabilidad$) {
      this.loadTrazabilidad();
    }
    if (tab === 3 && !this.seguimientos$) {
      this.loadSeguimientos();
    }
  }

  private loadTrazabilidad(): void {
    this.loadingTrazabilidad = true;
    this.trazabilidad$ = this.expediente_svc.getTrazabilidad(this.elsa_id);
    this.trazabilidad$.subscribe({
      next: () => (this.loadingTrazabilidad = false),
      error: (err) => {
        this.errorMessage = err.error?.message || 'Error cargando trazabilidad';
        this.loadingTrazabilidad = false;
      },
    });
  }

  private loadSeguimientos(): void {
    this.loadingSeguimientos = true;
    this.reloadSeguimientos$.next();
    this.seguimientos$ = this.expediente_svc.getSeguimientos(this.elsa_id);
    this.seguimientos$.subscribe({
      next: () => (this.loadingSeguimientos = false),
      error: (err) => {
        this.errorMessage = err.error?.message || 'Error cargando seguimientos';
        this.loadingSeguimientos = false;
      },
    });
  }

  onSeguimientoSaved(): void {
    // Recargar seguimientos tras guardar uno nuevo
    this.loadSeguimientos();
  }
}
