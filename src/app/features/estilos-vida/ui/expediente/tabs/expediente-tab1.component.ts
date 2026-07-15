import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MnaData, PatientData } from '../../../data-access/services/mna-expediente.service';

@Component({
  selector: 'app-expediente-tab1',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="tab1-container" data-testid="mna-tab1-form">
      <!-- Sección: Datos del Paciente -->
      <div class="info-section">
        <div class="section-header">
          <div class="section-icon">
            <mat-icon>person</mat-icon>
          </div>
          <div class="section-title">
            <h4>Datos del Paciente</h4>
          </div>
        </div>
        <div class="section-content" data-testid="patient-info">
          @if (patientData) {
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Nombre:</span>
                <span class="info-value">{{ patientData.nombre }} {{ patientData.apellido }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Documento:</span>
                <span class="info-value">{{ patientData.documento }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Fecha de Nacimiento:</span>
                <span class="info-value">{{ patientData.fecha_nacimiento | date:'dd/MM/yyyy' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Municipio:</span>
                <span class="info-value">{{ patientData.municipio_id }}</span>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Sección: Evaluación MNA -->
      <div class="info-section">
        <div class="section-header">
          <div class="section-icon">
            <mat-icon>assessment</mat-icon>
          </div>
          <div class="section-title">
            <h4>Evaluación MNA</h4>
          </div>
        </div>
        <div class="section-content" data-testid="mna-data">
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Score Cribaje:</span>
              <span class="info-value" [class]="getScoreClass(mnaData.score_cribaje)">
                {{ mnaData.score_cribaje }}
              </span>
            </div>
            <div class="info-item">
              <span class="info-label">Score Total:</span>
              <span class="info-value" [class]="getScoreClass(mnaData.score_total)">
                {{ mnaData.score_total }}
              </span>
            </div>
            <div class="info-item">
              <span class="info-label">Clasificación:</span>
              <span class="info-value classification-badge" [class]="'classification-' + mnaData.classification">
                {{ getClassificationLabel(mnaData.classification) }}
              </span>
            </div>
            <div class="info-item">
              <span class="info-label">Estado:</span>
              <span class="info-value">{{ mnaData.status === 'finalized' ? 'Finalizado' : 'Borrador' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Creado:</span>
              <span class="info-value">{{ mnaData.created_at | date:'dd/MM/yyyy HH:mm' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Aviso de solo lectura -->
      <div class="readonly-notice" data-testid="mna-field-readonly">
        <mat-icon>info</mat-icon>
        <p>Este expediente está en modo solo lectura. Los campos no pueden ser modificados.</p>
      </div>
    </div>
  `,
  styles: [`
    .tab1-container {
      padding: 0;
    }

    .info-section {
      margin-bottom: 20px;

      &:last-child {
        margin-bottom: 0;
      }

      .section-header {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 0 10px 12px;
        background-color: var(--white);
        border-radius: 8px 8px 0 0;
        border-bottom: 1px solid var(--gray-primary);

        .section-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background-color: var(--blue-primary);
          flex-shrink: 0;

          mat-icon {
            font-size: 24px;
            color: var(--white);
          }
        }

        .section-title {
          flex: 1;

          h4 {
            font-size: 16px;
            font-weight: 600;
            color: var(--strong-blue-primary);
            line-height: 1.3;
            margin: 0;
          }
        }
      }

      .section-content {
        padding: 16px 20px;
        background-color: var(--white);
        border-radius: 0 0 8px 8px;
      }

      .info-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 12px;

        .info-item {
          display: flex;
          justify-content: left;
          padding: 8px 12px;
          border-bottom: 1.5px solid var(--gray-secondary);

          &.full-width {
            grid-column: 1 / -1;
          }

          .info-label {
            font-weight: 500;
            color: var(--strong-blue-primary);
            font-size: 12px;
            margin-right: 12px;
            min-width: 140px;
          }

          .info-value {
            font-weight: 400;
            color: var(--strong-gray-primary);
            font-size: 12px;
            text-align: left;
            word-break: break-word;
          }
        }
      }
    }

    .classification-badge {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 11px;
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
      display: flex;
      align-items: center;
      gap: 12px;
      background: #fff8e1;
      border-left: 4px solid var(--warning);
      padding: 12px 16px;
      margin-top: 20px;
      border-radius: 4px;

      mat-icon {
        color: var(--warning);
        font-size: 20px;
        width: 20px;
        height: 20px;
      }

      p {
        margin: 0;
        color: var(--strong-gray-primary);
        font-size: 13px;
      }
    }

    @media (max-width: 768px) {
      .info-section {
        .section-header {
          padding: 0 8px 10px;

          .section-icon {
            width: 36px;
            height: 36px;

            mat-icon {
              font-size: 20px;
            }
          }

          .section-title h4 {
            font-size: 14px;
          }
        }

        .section-content {
          padding: 12px 16px;
        }

        .info-grid {
          grid-template-columns: 1fr;
        }
      }

      .readonly-notice {
        padding: 10px 12px;

        p {
          font-size: 12px;
        }
      }
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
