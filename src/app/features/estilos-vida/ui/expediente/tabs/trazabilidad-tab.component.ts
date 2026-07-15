import { Component, Input, ChangeDetectionSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { signal } from '@angular/core';
import { AuditTrailEntry } from '../../../data-access/services/mna-expediente.service';

@Component({
  selector: 'app-trazabilidad-tab',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="tab3-container" data-testid="audit-timeline">
      <h3>Trazabilidad de Cambios</h3>

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
                <div class="timeline-user">Por: {{ entry.usuario_modificador }}</div>
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
                    <strong>Justificación:</strong> {{ entry.justificacion }}
                  </div>
                }
              </div>
            </div>
          }
        </div>
      } @else {
        <div class="empty-state" data-testid="audit-empty-state">
          <p>Este registro se encuentra en su estado original. No hay cambios registrados.</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .tab3-container {
      padding: 0.5rem;
    }

    h3 {
      color: #333;
      border-bottom: 2px solid #1976d2;
      padding-bottom: 0.5rem;
      margin-bottom: 1.5rem;
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
      background: #e0e0e0;
    }

    .timeline-item {
      position: relative;
      margin-bottom: 1.5rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid #f0f0f0;
    }

    .timeline-item:last-child {
      border-bottom: none;
    }

    .timeline-dot {
      position: absolute;
      left: -2rem;
      top: 0.25rem;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: #1976d2;
      border: 3px solid #fff;
      box-shadow: 0 0 0 2px #1976d2;
    }

    .timeline-content {
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 6px;
    }

    .timeline-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .field-name {
      font-weight: 600;
      color: #1976d2;
      text-transform: capitalize;
    }

    .timeline-date {
      font-size: 0.8rem;
      color: #999;
    }

    .timeline-user {
      font-size: 0.85rem;
      color: #666;
      margin-bottom: 0.75rem;
    }

    .timeline-values {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
    }

    .value-change {
      padding: 0.5rem;
      background: #fff;
      border-radius: 4px;
      font-size: 0.9rem;
    }

    .value-change .label {
      display: block;
      font-size: 0.75rem;
      color: #999;
      text-transform: uppercase;
    }

    .value-change .original {
      color: #c62828;
      text-decoration: line-through;
    }

    .value-change .new-value {
      color: #2e7d32;
      font-weight: 600;
    }

    .justification {
      font-size: 0.85rem;
      color: #555;
      padding: 0.5rem;
      background: #fff8e1;
      border-radius: 4px;
      border-left: 3px solid #ffc107;
    }

    .empty-state {
      text-align: center;
      padding: 3rem;
      color: #999;
      font-style: italic;
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
