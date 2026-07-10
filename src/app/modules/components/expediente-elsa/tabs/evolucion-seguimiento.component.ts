import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ListaSeguimientosResponseDto } from '../../../models';

@Component({
  selector: 'app-evolucion-seguimiento',
  template: `
    <div class="evolucion-container">
      <div class="seguimientos-list">
        <h3>Historial de Seguimientos</h3>
        <div
          *ngFor="let seg of seguimientos.seguimientos; let i = index"
          class="seguimiento-item"
          [attr.data-testid]="'seguimiento-item-' + seg.id"
        >
          <div class="seguimiento-header">
            <span class="usuario">{{ seg.usuario.nombre }}</span>
            <span class="fecha">{{ seg.fecha_creacion | date: 'dd/MM/yyyy HH:mm' }}</span>
            <span class="tipo-nota" [ngClass]="'tipo-' + seg.tipo_nota">{{ seg.tipo_nota }}</span>
          </div>
          <div class="seguimiento-comentario" [attr.data-testid]="'seguimiento-comentario-' + seg.id">
            {{ seg.comentario }}
          </div>
          <div class="seguimiento-footer">
            <span *ngIf="seg.es_inmutable" class="immutable-badge">✓ Registro Inmutable</span>
            <a
              *ngIf="seg.adjunto_url"
              [href]="seg.adjunto_url"
              target="_blank"
              class="btn-descargar"
              [attr.data-testid]="'btn-descargar-' + seg.id"
            >
              📎 Descargar Adjunto
            </a>
          </div>
          <div data-testid="no-edit-delete-button" style="display: none"></div>
        </div>
      </div>

      <div class="formulario-section">
        <h3>Agregar Nuevo Seguimiento</h3>
        <app-formulario-seguimiento
          [elsa_id]="elsa_id"
          (onSaved)="onSeguimientoSaved.emit()"
        ></app-formulario-seguimiento>
      </div>
    </div>
  `,
  styles: [
    `
      .evolucion-container {
        padding: 20px;
      }
      .seguimientos-list {
        margin-bottom: 30px;
      }
      .seguimiento-item {
        padding: 20px;
        margin-bottom: 20px;
        border: 1px solid #ddd;
        border-radius: 8px;
        background-color: #fafafa;
      }
      .seguimiento-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
      }
      .usuario {
        font-weight: bold;
        color: #1976d2;
      }
      .fecha {
        font-size: 12px;
        color: #666;
      }
      .tipo-nota {
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: bold;
      }
      .tipo-Nota {
        background-color: #e1f5fe;
        color: #01579b;
      }
      .tipo-Recomendación {
        background-color: #fff3e0;
        color: #e65100;
      }
      .tipo-Anexo {
        background-color: #f3e5f5;
        color: #4a148c;
      }
      .seguimiento-comentario {
        padding: 15px;
        background-color: white;
        border-radius: 4px;
        margin: 10px 0;
        line-height: 1.6;
      }
      .seguimiento-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 10px;
        font-size: 12px;
      }
      .immutable-badge {
        color: #4caf50;
        font-weight: bold;
      }
      .btn-descargar {
        color: #1976d2;
        text-decoration: none;
        font-weight: bold;
      }
      .btn-descargar:hover {
        text-decoration: underline;
      }
      .formulario-section {
        border-top: 2px solid #ddd;
        padding-top: 30px;
      }
    `,
  ],
})
export class EvolucionSeguimientoComponent {
  @Input() seguimientos: ListaSeguimientosResponseDto;
  @Input() elsa_id: string;
  @Output() onSeguimientoSaved = new EventEmitter<void>();
}
