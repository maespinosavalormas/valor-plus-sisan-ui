import { Component, Input } from '@angular/core';
import { TrazabilidadResponseDto } from '../../../models';

@Component({
  selector: 'app-trazabilidad',
  template: `
    <div class="trazabilidad-container">
      <div *ngIf="trazabilidad.mensaje_expediente_sin_cambios" class="no-changes-message">
        {{ trazabilidad.mensaje_expediente_sin_cambios }}
      </div>

      <div class="timeline" *ngIf="trazabilidad.timeline && trazabilidad.timeline.length > 0">
        <div *ngFor="let item of trazabilidad.timeline; let i = index" class="timeline-item" [attr.data-testid]="'timeline-item-' + i">
          <div class="timeline-date">
            {{ item.fecha_cambio | date: 'dd/MM/yyyy HH:mm' }}
          </div>
          <div class="timeline-user">
            {{ item.usuario.nombre }}
          </div>
          <div class="timeline-delta" [attr.data-testid]="'delta-text-' + i">
            {{ item.texto_delta }}
          </div>
          <div *ngIf="item.motivo_edicion" class="timeline-motivo">
            Motivo: {{ item.motivo_edicion }}
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .trazabilidad-container {
        padding: 20px;
      }
      .no-changes-message {
        background-color: #e3f2fd;
        padding: 20px;
        border-left: 4px solid #2196f3;
        border-radius: 4px;
      }
      .timeline {
        position: relative;
        padding-left: 30px;
      }
      .timeline-item {
        padding: 20px;
        margin-bottom: 20px;
        border-left: 3px solid #2196f3;
        background-color: #f5f5f5;
        border-radius: 4px;
      }
      .timeline-date {
        font-weight: bold;
        color: #1976d2;
        margin-bottom: 5px;
      }
      .timeline-user {
        font-size: 14px;
        color: #666;
        margin-bottom: 10px;
      }
      .timeline-delta {
        font-size: 15px;
        margin-bottom: 10px;
        padding: 10px;
        background-color: white;
        border-radius: 4px;
      }
      .timeline-motivo {
        font-size: 13px;
        color: #888;
        font-style: italic;
      }
    `,
  ],
})
export class TrazabilidadComponent {
  @Input() trazabilidad: TrazabilidadResponseDto;
}
