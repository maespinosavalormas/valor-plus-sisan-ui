import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MnaData, PatientData } from '../../../data-access/services/mna-expediente.service';

@Component({
  selector: 'app-expediente-tab1',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="tab1-container" data-testid="mna-tab1-form">
      <h3>Datos del Paciente</h3>
      <div class="patient-info" data-testid="patient-info">
        @if (patientData) {
          <div class="info-row">
            <span class="label">Nombre:</span>
            <span class="value">{{ patientData.nombre }} {{ patientData.apellido }}</span>
          </div>
          <div class="info-row">
            <span class="label">Documento:</span>
            <span class="value">{{ patientData.documento }}</span>
          </div>
          <div class="info-row">
            <span class="label">Fecha de Nacimiento:</span>
            <span class="value">{{ patientData.fecha_nacimiento | date:'dd/MM/yyyy' }}</span>
          </div>
          <div class="info-row">
            <span class="label">Municipio:</span>
            <span class="value">{{ patientData.municipio_id }}</span>
          </div>
        }
      </div>

      <h3>Evaluación MNA</h3>
      <div class="mna-data" data-testid="mna-data">
        <div class="info-row">
          <span class="label">Score Cribaje:</span>
          <span class="value" [class]="getScoreClass(mnaData.score_cribaje)">
            {{ mnaData.score_cribaje }}
          </span>
        </div>
        <div class="info-row">
          <span class="label">Score Total:</span>
          <span class="value" [class]="getScoreClass(mnaData.score_total)">
            {{ mnaData.score_total }}
          </span>
        </div>
        <div class="info-row">
          <span class="label">Clasificación:</span>
          <span class="value classification-badge" [class]="'classification-' + mnaData.classification">
            {{ getClassificationLabel(mnaData.classification) }}
          </span>
        </div>
        <div class="info-row">
          <span class="label">Estado:</span>
          <span class="value">{{ mnaData.status === 'finalized' ? 'Finalizado' : 'Borrador' }}</span>
        </div>
        <div class="info-row">
          <span class="label">Creado:</span>
          <span class="value">{{ mnaData.created_at | date:'dd/MM/yyyy HH:mm' }}</span>
        </div>
      </div>

      <!-- Campos disabled para read-only -->
      <div class="readonly-notice" data-testid="mna-field-readonly">
        <p>⚠️ Este expediente está en modo solo lectura. Los campos no pueden ser modificados.</p>
      </div>
    </div>
  `,
  styles: [`
    .tab1-container {
      padding: 0.5rem;
    }

    h3 {
      color: #333;
      border-bottom: 2px solid #1976d2;
      padding-bottom: 0.5rem;
      margin-bottom: 1rem;
    }

    .patient-info, .mna-data {
      background: #f8f9fa;
      border-radius: 6px;
      padding: 1rem;
      margin-bottom: 1rem;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 0;
      border-bottom: 1px solid #e0e0e0;
    }

    .info-row:last-child {
      border-bottom: none;
    }

    .label {
      font-weight: 600;
      color: #555;
    }

    .value {
      color: #333;
    }

    .classification-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.85rem;
      font-weight: 600;
    }

    .classification-NORMAL {
      background: #e8f5e9;
      color: #2e7d32;
    }

    .classification-RISK {
      background: #fff3e0;
      color: #ef6c00;
    }

    .classification-MALNUTRITION {
      background: #ffebee;
      color: #c62828;
    }

    .readonly-notice {
      background: #fff8e1;
      border-left: 4px solid #ffc107;
      padding: 0.75rem;
      margin-top: 1rem;
      border-radius: 4px;
    }

    .readonly-notice p {
      margin: 0;
      color: #666;
      font-size: 0.9rem;
    }
  `],
})
export class ExpedienteTab1Component {
  @Input() mnaData!: MnaData;
  @Input() patientData?: PatientData;

  getScoreClass(score: number): string {
    if (score >= 24) return 'score-normal';
    if (score >= 17) return 'score-risk';
    return 'score-malnutrition';
  }

  getClassificationLabel(classification: string): string {
    switch (classification) {
      case 'NORMAL':
        return 'Estado nutricional normal';
      case 'RISK':
        return 'Riesgo de malnutrición';
      case 'MALNUTRITION':
        return 'Malnutrición';
      default:
        return 'Desconocido';
    }
  }
}
