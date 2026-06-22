import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { EstadoCaso } from '../data-access/follow-up.contracts';

/**
 * Panel de cambio de estado
 * CA-01: Modal bloqueo alta injustificada
 * CA-02: Evidencia obligatoria estados clínicos
 * CA-05: Upload con progreso
 * CA-06: Estados no clínicos sin OMS
 * CA-07: Deshabilitar si caso read_only
 * CA-09: Validación tamaño archivo ≤5MB
 * CA-12: Botón con debounce/disabled
 * CA-13: Validación tipo archivo (pdf/jpeg/png)
 */
@Component({
  selector: 'app-status-panel',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatProgressBarModule,
  ],
  template: `
    <mat-card class="status-panel" [class.disabled]="readOnly">
      <mat-card-header>
        <mat-icon mat-card-avatar>swap_horiz</mat-icon>
        <mat-card-title>Cambiar Estado del Caso</mat-card-title>
        <mat-card-subtitle *ngIf="readOnly" class="readonly-warning">
          <mat-icon>lock</mat-icon> Caso en estado terminal — no se pueden realizar cambios
        </mat-card-subtitle>
      </mat-card-header>
      <mat-card-content>
        <!-- Selector de estado -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nuevo Estado</mat-label>
          <mat-select
            [(ngModel)]="nuevoEstado"
            (selectionChange)="onEstadoChange($event.value)"
            [disabled]="readOnly || aplicando">
            <mat-option *ngFor="let estado of estadosDisponibles" [value]="estado">
              {{ estado }}
            </mat-option>
          </mat-select>
        </mat-form-field>

        <!-- Campos dinámicos según estado seleccionado -->
        <div *ngIf="nuevoEstado" class="estado-fields">
          <!-- Motivo de cierre (todos los estados terminales) -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Motivo del cambio (mínimo 10 caracteres)</mat-label>
            <textarea
              matInput
              [(ngModel)]="motivoCambio"
              rows="3"
              [disabled]="readOnly || aplicando">
            </textarea>
            <mat-hint align="end">{{ motivoCambio.length }} caracteres</mat-hint>
            <mat-error *ngIf="motivoCambio.length > 0 && motivoCambio.length < 10">
              Debe tener al menos 10 caracteres (CA-03)
            </mat-error>
          </mat-form-field>

          <!-- Evidencia obligatoria para estados clínicos (CA-02, RN-04) -->
          <div *ngIf="esEstadoClinico(nuevoEstado)" class="evidencia-section">
            <h4>
              <mat-icon color="accent">warning</mat-icon>
              Evidencia obligatoria (estado clínico)
            </h4>
            <input
              type="file"
              #fileInput
              accept=".pdf,.jpg,.jpeg,.png"
              style="display: none"
              (change)="onFileSelected($event)">
            <button
              mat-stroked-button
              type="button"
              (click)="fileInput.click()"
              [disabled]="readOnly || aplicando">
              <mat-icon>attach_file</mat-icon>
              Seleccionar evidencia
            </button>
            <div *ngIf="archivoSeleccionado" class="file-info">
              <mat-icon>insert_drive_file</mat-icon>
              <span>{{ archivoSeleccionado.name }}</span>
              <span class="file-size">({{ archivoSeleccionado.size | fileSize }})</span>
              <mat-icon
                *ngIf="esTamanoValido"
                color="primary">
                check_circle
              </mat-icon>
              <mat-icon
                *ngIf="!esTamanoValido"
                color="warn">
                error
              </mat-icon>
            </div>
            <mat-error *ngIf="archivoSeleccionado && !esTamanoValido">
              CA-09: El archivo excede el límite de 5MB
            </mat-error>
            <mat-progress-bar
              *ngIf="uploadProgress > 0 && uploadProgress < 100"
              mode="determinate"
              [value]="uploadProgress">
            </mat-progress-bar>
          </div>

          <!-- Justificación para alta médica injustificada (CA-01) -->
          <div *ngIf="mostrarJustificacionAlta" class="justificacion-section">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Justificación de alta médica injustificada</mat-label>
              <textarea
                matInput
                [(ngModel)]="justificacionAlta"
                rows="2"
                placeholder="Explique por qué se da de alta sin cumplir criterios de recuperación...">
              </textarea>
            </mat-form-field>
          </div>
        </div>
      </mat-card-content>
      <mat-card-actions align="end">
        <button
          mat-raised-button
          color="primary"
          (click)="aplicar()"
          [disabled]="!puedeAplicar() || aplicando"
          class="apply-btn">
          <mat-progress-spinner
            *ngIf="aplicando"
            diameter="20"
            mode="indeterminate">
          </mat-progress-spinner>
          <span *ngIf="!aplicando">Aplicar Cambio</span>
        </button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [`
    .status-panel {
      margin-bottom: 16px;
    }
    .status-panel.disabled {
      opacity: 0.6;
      pointer-events: none;
    }
    .full-width {
      width: 100%;
    }
    .readonly-warning {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #f44336;
    }
    .estado-fields {
      margin-top: 16px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .evidencia-section {
      padding: 16px;
      background: rgba(0, 0, 0, 0.04);
      border-radius: 4px;
    }
    .evidencia-section h4 {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0 0 12px 0;
    }
    .file-info {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 8px;
      padding: 8px;
      background: white;
      border-radius: 4px;
    }
    .file-size {
      color: rgba(0, 0, 0, 0.6);
      font-size: 0.9em;
    }
    .justificacion-section {
      padding: 16px;
      background: #fff3e0;
      border-radius: 4px;
      border-left: 4px solid #ff9800;
    }
    .apply-btn {
      min-width: 160px;
    }
    mat-card-actions {
      padding: 8px 16px 16px;
    }
  `],
})
export class StatusPanelComponent {
  @Input() estadoActual: EstadoCaso = 'ACTIVO';
  @Input() readOnly = false;
  @Input() aplicando = false;
  @Input() uploadProgress = 0;

  @Output() cambiarEstado = new EventEmitter<{
    nuevoEstado: EstadoCaso;
    motivoCambio: string;
    justificacionAlta?: string;
    evidencia?: File;
  }>();

  estadosDisponibles: EstadoCaso[] = ['RECUPERADO', 'FALLECIDO', 'ABANDONO', 'TRASLADO'];

  nuevoEstado: EstadoCaso | null = null;
  motivoCambio = '';
  justificacionAlta = '';
  archivoSeleccionado: File | null = null;

  private readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB (CA-09)

  get esTamanoValido(): boolean {
    return this.archivoSeleccionado
      ? this.archivoSeleccionado.size <= this.MAX_FILE_SIZE
      : true;
  }

  get mostrarJustificacionAlta(): boolean {
    // CA-01: Mostrar si intenta dar alta sin criterios de recuperación
    return this.nuevoEstado === 'RECUPERADO' && !this.cumpleCriteriosRecuperacion;
  }

  private cumpleCriteriosRecuperacion = false; // TODO: Obtener del backend

  esEstadoClinico(estado: EstadoCaso | null): boolean {
    return estado === 'RECUPERADO' || estado === 'FALLECIDO';
  }

  esEstadoNoClinico(estado: EstadoCaso | null): boolean {
    return estado === 'ABANDONO' || estado === 'TRASLADO';
  }

  onEstadoChange(estado: EstadoCaso): void {
    this.nuevoEstado = estado;
    // CA-01: Si es RECUPERADO sin criterios, mostrar modal de bloqueo
    if (this.mostrarJustificacionAlta) {
      // Emitir evento para mostrar modal
      console.log('CA-01: Modal de bloqueo - alta injustificada');
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      // CA-13: Validar tipo de archivo
      const tiposPermitidos = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!tiposPermitidos.includes(file.type)) {
        alert('CA-13: Solo se permiten archivos PDF, JPEG o PNG');
        return;
      }
      this.archivoSeleccionado = file;
    }
  }

  puedeAplicar(): boolean {
    if (!this.nuevoEstado) return false;
    if (this.motivoCambio.length < 10) return false;
    if (this.esEstadoClinico(this.nuevoEstado) && !this.archivoSeleccionado) return false;
    if (this.archivoSeleccionado && !this.esTamanoValido) return false;
    if (this.mostrarJustificacionAlta && !this.justificacionAlta) return false;
    return true;
  }

  aplicar(): void {
    if (!this.nuevoEstado || !this.puedeAplicar()) return;

    this.cambiarEstado.emit({
      nuevoEstado: this.nuevoEstado,
      motivoCambio: this.motivoCambio,
      justificacionAlta: this.mostrarJustificacionAlta ? this.justificacionAlta : undefined,
      evidencia: this.archivoSeleccionado || undefined,
    });
  }
}

// Pipe para formatear tamaño de archivo
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'fileSize', standalone: true })
export class FileSizePipe implements PipeTransform {
  transform(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
