import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ElsaFacade } from '../../data-access/facade/elsa.facade';

@Component({
  selector: 'app-elsa-detail-page',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatProgressSpinnerModule],
  template: `
    <section class="elsa-detail" data-testid="elsa-detail-page">
      @if (facade.detailLoading$ | async) {
        <mat-progress-spinner mode="indeterminate" data-testid="elsa-detail-loading" />
      } @else if (facade.detailError$ | async; as error) {
        <p class="error" data-testid="elsa-detail-error">{{ error }}</p>
      } @else if (facade.response$ | async; as response) {
        <mat-card data-testid="elsa-detail-card">
          <mat-card-title>ELSA {{ response.id }}</mat-card-title>
          <mat-card-content>
            <p><strong>Paciente:</strong> {{ response.patient_id }}</p>
            <p><strong>Fecha evaluación:</strong> {{ response.evaluation_date }}</p>
            <p><strong>Porciones/día:</strong> {{ response.alim_total_portions_day }}</p>
            <p><strong>METs totales:</strong> {{ response.af_mets_total }}</p>
            <p><strong>Score AUDIT-C:</strong> {{ response.alcohol_audit_score }}</p>
            <h3>Perfil de riesgo</h3>
            <p>Nutrición: {{ response.risk_profile.nutrition.label }}</p>
            <p>Actividad: {{ response.risk_profile.physical_activity.label }}</p>
            <p>Alcohol: {{ response.risk_profile.alcohol.label }}</p>
            <p class="muted">Creado por {{ response.created_by_username }} el {{ response.created_at }}</p>
          </mat-card-content>
        </mat-card>
      }
    </section>
  `,
  styles: [
    `
      .elsa-detail {
        padding: 1rem;
      }
      .error {
        color: #ff5252;
      }
      .muted {
        color: #757575;
        font-size: 0.875rem;
      }
    `,
  ],
})
export class ElsaDetailPageComponent implements OnInit, OnDestroy {
  readonly facade = inject(ElsaFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.facade.limpiarEstado();
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const id = params.get('id');
      if (id) this.facade.cargarELSA(id);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}