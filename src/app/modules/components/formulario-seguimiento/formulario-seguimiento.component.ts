import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ExpedienteService } from '../../services/expediente.service';

@Component({
  selector: 'app-formulario-seguimiento',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <form [formGroup]="formulario" (ngSubmit)="onGuardar()" class="formulario-seguimiento">
      <div class="form-group">
        <label for="comentario">Comentario o Recomendación</label>
        <textarea
          id="comentario"
          formControlName="comentario"
          (input)="onComentarioChange()"
          placeholder="Ingrese su comentario (mínimo 15 caracteres)..."
          rows="5"
          data-testid="input-comentario"
        ></textarea>
        <div class="char-counter">
          {{ (formulario.get('comentario')?.value || '').trim().length }} caracteres
          <span *ngIf="comentarioError" class="error-message" data-testid="msg-error-comentario">
            {{ comentarioError }}
          </span>
        </div>
      </div>

      <div class="form-group">
        <label for="tipo_nota">Tipo de Nota</label>
        <select id="tipo_nota" formControlName="tipo_nota" data-testid="select-tipo-nota">
          <option value="Nota">Nota Clínica</option>
          <option value="Recomendación">Recomendación</option>
          <option value="Anexo">Anexo (requiere archivo)</option>
        </select>
      </div>

      <div class="form-group">
        <label for="archivo">Adjuntar Archivo (PDF, JPG, PNG - máx 5MB)</label>
        <input
          #fileInput
          type="file"
          id="archivo"
          (change)="onFileSelected()"
          accept=".pdf,.jpg,.png,.jpeg"
          data-testid="input-archivo"
        />
        <span *ngIf="archivoError" class="error-message" data-testid="msg-error-archivo">
          {{ archivoError }}
        </span>
        <span *ngIf="archivoSeleccionado" class="success-message">
          ✓ {{ archivoSeleccionado?.name }}
        </span>
      </div>

      <div class="form-actions">
        <button
          type="submit"
          [disabled]="!formulario.valid || isLoading"
          class="btn-guardar"
          data-testid="btn-guardar-seguimiento"
        >
          <span *ngIf="!isLoading">Guardar Seguimiento</span>
          <span *ngIf="isLoading">Guardando...</span>
        </button>
      </div>
    </form>
  `,
  styles: [
    `
      .formulario-seguimiento {
        padding: 20px;
        background-color: #f9f9f9;
        border-radius: 8px;
      }
      .form-group {
        margin-bottom: 20px;
      }
      label {
        display: block;
        font-weight: bold;
        margin-bottom: 8px;
      }
      textarea,
      select,
      input[type='file'] {
        width: 100%;
        padding: 10px;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-family: inherit;
      }
      textarea:focus,
      select:focus,
      input[type='file']:focus {
        outline: none;
        border-color: #1976d2;
        box-shadow: 0 0 5px rgba(25, 118, 210, 0.3);
      }
      .char-counter {
        font-size: 12px;
        color: #666;
        margin-top: 5px;
      }
      .error-message {
        color: #f44336;
        font-size: 12px;
        margin-left: 5px;
        font-weight: bold;
      }
      .success-message {
        color: #4caf50;
        font-size: 12px;
        margin-left: 5px;
        font-weight: bold;
      }
      .form-actions {
        display: flex;
        gap: 10px;
      }
      .btn-guardar {
        padding: 12px 24px;
        background-color: #1976d2;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-weight: bold;
        transition: background-color 0.3s;
      }
      .btn-guardar:hover:not(:disabled) {
        background-color: #1565c0;
      }
      .btn-guardar:disabled {
        background-color: #ccc;
        cursor: not-allowed;
      }
    `,
  ],
})
export class FormularioSeguimientoComponent {
  @Input() elsa_id!: string;
  @Output() onSaved = new EventEmitter<void>();
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  formulario: FormGroup;
  comentarioError: string | null = null;
  archivoError: string | null = null;
  archivoSeleccionado: File | null = null;
  isLoading = false;

  private readonly MIN_COMENTARIO_LENGTH = 15;
  private readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private readonly ALLOWED_MIMES = ['application/pdf', 'image/jpeg', 'image/png'];

  constructor(
    private fb: FormBuilder,
    private expediente_svc: ExpedienteService,
  ) {
    this.formulario = this.fb.group({
      comentario: ['', [Validators.required]],
      tipo_nota: ['Nota', Validators.required],
    });
  }

  onComentarioChange(): void {
    const comentario = this.formulario.get('comentario')?.value || '';
    const trimmed = comentario.trim();

    if (trimmed.length < this.MIN_COMENTARIO_LENGTH) {
      this.comentarioError = `El comentario debe tener mínimo ${this.MIN_COMENTARIO_LENGTH} caracteres`;
      this.formulario.get('comentario')?.setErrors({ minLength: true });
    } else {
      this.comentarioError = null;
      this.formulario.get('comentario')?.setErrors(null);
    }

    // Validar que Anexo requiere archivo
    if (this.formulario.get('tipo_nota')?.value === 'Anexo' && !this.archivoSeleccionado) {
      this.formulario.get('comentario')?.setErrors({ ...this.formulario.get('comentario')?.errors, anexoRequiresFile: true });
    }
  }

  onFileSelected(): void {
    const files = this.fileInput?.nativeElement.files;
    if (!files || files.length === 0) {
      this.archivoSeleccionado = null;
      this.archivoError = null;
      return;
    }

    const file = files[0];

    // Validación de tamaño
    if (file.size > this.MAX_FILE_SIZE) {
      this.archivoError = 'El archivo excede el límite máximo de 5MB';
      this.archivoSeleccionado = null;
      return;
    }

    // Validación de tipo (frontend, no es suficiente pero es UX)
    if (!this.ALLOWED_MIMES.includes(file.type)) {
      this.archivoError = 'Formato no permitido. Use PDF, JPG o PNG.';
      this.archivoSeleccionado = null;
      return;
    }

    this.archivoError = null;
    this.archivoSeleccionado = file;
  }

  onGuardar(): void {
    if (!this.formulario.valid) {
      return;
    }

    const tipoNota = this.formulario.get('tipo_nota')?.value;
    if (tipoNota === 'Anexo' && !this.archivoSeleccionado) {
      this.archivoError = 'Anexo requiere un archivo adjunto';
      return;
    }

    this.isLoading = true;

    const formData = new FormData();
    formData.append('comentario', (this.formulario.get('comentario')?.value || '').trim());
    formData.append('tipo_nota', tipoNota);
    if (this.archivoSeleccionado) {
      formData.append('archivo', this.archivoSeleccionado);
    }

    this.expediente_svc.createSeguimiento(this.elsa_id, formData).subscribe({
      next: () => {
        this.isLoading = false;
        this.formulario.reset({ tipo_nota: 'Nota' });
        this.archivoSeleccionado = null;
        if (this.fileInput) {
          this.fileInput.nativeElement.value = '';
        }
        this.onSaved.emit();
      },
      error: (err) => {
        this.isLoading = false;
        const errorMsg = err.error?.message || err.message || 'Error guardando seguimiento';
        alert(`Error: ${errorMsg}`);
      },
    });
  }
}
