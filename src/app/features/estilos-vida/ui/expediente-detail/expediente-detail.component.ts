import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ExpedienteDetail } from '../../domain/models/expediente.model';

@Component({
  selector: 'app-expediente-detail',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatGridListModule, MatTooltipModule],
  template: `
    <mat-card class="detail-card" *ngIf="expediente">
      <!-- IREV Indicator -->
      <mat-card class="irev-card" [style.border-left]="'5px solid ' + expediente.irev.color">
        <mat-card-title>Índice de Riesgo Cardiovascular (IREV)</mat-card-title>
        <div class="irev-content">
          <div class="irev-value" [style.color]="expediente.irev.color">{{ expediente.irev.value }}</div>
          <div class="irev-label">{{ expediente.irev.label }}</div>
        </div>
      </mat-card>

      <!-- Form Details Grid -->
      <mat-card class="form-details-card">
        <mat-card-title>Datos del Formulario ELSA</mat-card-title>
        <div class="details-grid">
          <div class="detail-item">
            <span class="label">Paciente ID:</span>
            <span class="value">{{ expediente.form.patientId }}</span>
          </div>

          <div class="detail-item">
            <span class="label">Tenant:</span>
            <span class="value">{{ expediente.form.tenantId }}</span>
          </div>

          <div class="detail-item">
            <span class="label">Tabaco Actual:</span>
            <span class="value" [class.yes]="expediente.form.tabacoActual">
              {{ expediente.form.tabacoActual ? 'Sí' : 'No' }}
            </span>
          </div>

          <div class="detail-item">
            <span class="label">Alimentos (Porciones):</span>
            <span class="value">{{ expediente.form.alimentoTotalPorciones }}</span>
          </div>

          <div class="detail-item">
            <span class="label">Actividad Física (MET·min):</span>
            <span class="value">{{ expediente.form.afMetsTotales }}</span>
          </div>

          <div class="detail-item">
            <span class="label">Alcohol Score:</span>
            <span class="value">{{ expediente.form.alcoholScore }}</span>
          </div>

          <div class="detail-item">
            <span class="label">Fecha Creación:</span>
            <span class="value">{{ expediente.form.createdAt | date: 'medium' }}</span>
          </div>

          <div class="detail-item">
            <span class="label">Estado:</span>
            <span class="value" [class.active]="expediente.form.isActive">
              {{ expediente.form.isActive ? 'Activo' : 'Inactivo' }}
            </span>
          </div>
        </div>
      </mat-card>
    </mat-card>
  `,
  styles: [
    `
      .detail-card {
        padding: 2rem;
      }

      .irev-card {
        margin-bottom: 2rem;
        background: linear-gradient(135deg, #f5f5f5 0%, #fafafa 100%);
      }

      .irev-content {
        display: flex;
        align-items: center;
        gap: 1.5rem;
        margin-top: 1rem;
      }

      .irev-value {
        font-size: 3rem;
        font-weight: bold;
      }

      .irev-label {
        font-size: 1rem;
        color: #666;
      }

      .form-details-card {
        margin-bottom: 2rem;
      }

      .details-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1.5rem;
        margin-top: 1rem;
      }

      .detail-item {
        display: flex;
        flex-direction: column;
        padding: 1rem;
        background-color: #f9f9f9;
        border-radius: 4px;
      }

      .label {
        font-weight: 600;
        color: #333;
        margin-bottom: 0.5rem;
        font-size: 0.9rem;
      }

      .value {
        color: #666;
        font-size: 1rem;
      }

      .value.yes {
        color: #4caf50;
        font-weight: 500;
      }

      .value.active {
        color: #2196f3;
        font-weight: 500;
      }
    `,
  ],
})
export class ExpedienteDetailComponent {
  @Input() expediente!: ExpedienteDetail;
}
