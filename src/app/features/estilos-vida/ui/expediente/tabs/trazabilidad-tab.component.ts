import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { AuditTrailEntry } from '../../../data-access/services/mna-expediente.service';

@Component({
  selector: 'app-trazabilidad-tab',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="tab3-container" data-testid="audit-timeline">
      <!-- Sección: Trazabilidad de Cambios -->
      <div class="info-section">
        <div class="section-header">
          <div class="section-icon">
            <mat-icon>history</mat-icon>
          </div>
          <div class="section-title">
            <h4>Trazabilidad de Cambios</h4>
          </div>
        </div>
        <div class="section-content">
          @if (entries().length > 0) {
            <div class="timeline">
              @for (entry of entries(); track entry.id) {
                <div class="timeline-item">
                  <div class="timeline-dot"></div>
                  <div class="timeline-content">
                    <div class="timeline-header">
                      <span class="field-name">{{ entry.campo_modificado }}</span>
                      <span class="timeline-date">{{ entry.created_at | date:'dd/MM/yyyy HH:mm' }}</span>
                    </div>
                    <div class="timeline-user">
                      <mat-icon>person</mat-icon>
                      Por: {{ entry.usuario_modificador }}
                    </div>
                    <div class="timeline-values">
                      <div class="value-change">
                        <span class="label">Original:</span>
                        <span class="original">{{ entry.valor_original }}</span>
                      </div>
                      <div class="value-change">
                        <span class="label">Nuevo:</span>
                        <span class="new-value">{{ entry.valor_nuevo }}</span>
                      </div>
                    </div>
                    @if (entry.justificacion) {
                      <div class="justification">
                        <mat-icon>info</mat-icon>
                        <strong>Justificación:</strong> {{ entry.justificacion }}
                      </div>
                    }
                  </div>
                </div>
              }
            </div>
          } @else {
            <div class="empty-state" data-testid="audit-empty-state">
              <mat-icon>check_circle</mat-icon>
              <p>Este registro se encuentra en su estado original. No hay cambios registrados.</p>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tab3-container {
      padding: 0;
    }

    .info-section {
      margin-bottom: 20px;

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
    }

    .timeline {
      position: relative;
      padding-left: 2rem;
    }

    .timeline::before {
      content: '';
      position: absolute;
      left: 8px;
      top: 0;
      bottom: 0;
      width: 2px;
      background: var(--gray-secondary);
    }

    .timeline-item {
      position: relative;
      margin-bottom: 24px;
      padding-bottom: 24px;
      border-bottom: 1px solid var(--gray-secondary);

      &:last-child {
        margin-bottom: 0;
        padding-bottom: 0;
        border-bottom: none;
      }
    }

    .timeline-dot {
      position: absolute;
      left: -2rem;
      top: 4px;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: var(--blue-primary);
      border: 3px solid var(--white);
      box-shadow: 0 0 0 2px var(--blue-primary);
    }

    .timeline-content {
      background: var(--background-pages);
      padding: 16px;
      border-radius: 6px;
    }

    .timeline-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .field-name {
      font-weight: 600;
      color: var(--blue-primary);
      text-transform: capitalize;
      font-size: 14px;
    }

    .timeline-date {
      font-size: 12px;
      color: var(--strong-gray-primary);
    }

    .timeline-user {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: var(--strong-gray-primary);
      margin-bottom: 12px;

      mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }
    }

    .timeline-values {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-bottom: 12px;
    }

    .value-change {
      padding: 8px;
      background: var(--white);
      border-radius: 4px;
      font-size: 13px;

      .label {
        display: block;
        font-size: 11px;
        color: var(--strong-gray-primary);
        text-transform: uppercase;
        margin-bottom: 4px;
      }

      .original {
        color: #c62828;
        text-decoration: line-through;
      }

      .new-value {
        color: #2e7d32;
        font-weight: 600;
      }
    }

    .justification {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      font-size: 13px;
      color: var(--strong-gray-primary);
      padding: 8px 12px;
      background: #fff8e1;
      border-radius: 4px;
      border-left: 3px solid var(--warning);

      mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
        color: var(--warning);
        margin-top: 2px;
      }
    }

    .empty-state {
      text-align: center;
      padding: 3rem 2rem;
      color: var(--strong-gray-primary);

      mat-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        color: var(--blue-primary);
        margin-bottom: 1rem;
        opacity: 0.6;
      }

      p {
        margin: 0;
        font-size: 14px;
        font-style: italic;
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
      }

      .timeline {
        padding-left: 1.5rem;
      }

      .timeline-dot {
        left: -1.5rem;
        width: 16px;
        height: 16px;
      }

      .timeline-content {
        padding: 12px;
      }

      .timeline-values {
        grid-template-columns: 1fr;
      }

      .field-name {
        font-size: 13px;
      }

      .timeline-date {
        font-size: 11px;
      }

      .timeline-user {
        font-size: 12px;
      }

      .value-change {
        font-size: 12px;
        padding: 6px;
      }

      .justification {
        font-size: 12px;
        padding: 6px 10px;
      }

      .empty-state {
        padding: 2rem 1rem;

        mat-icon {
          font-size: 48px;
          width: 48px;
          height: 48px;
        }

        p {
          font-size: 13px;
        }
      }
    }
  `],
})
export class TrazabilidadTabComponent {
  private _entries = signal<AuditTrailEntry[]>([]);
  readonly entries = this._entries;

  @Input() set entries(value: AuditTrailEntry[]) {
    this._entries.set(value ?? []);
  }
}
