import { Component, Input, ChangeDetectionStrategy, OnInit, ViewChild, ElementRef, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import {
  FollowupEntry,
  FollowupTipo,
} from '../../../data-access/services/mna-expediente.service';
import { ExpedienteFacade } from '../../../data-access/facades/expediente.facade';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-seguimiento-tab',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="tab4-container">
      <h3>Muro de Seguimiento</h3>

      <!-- Formulario de creación -->
      <div class="followup-form" data-testid="followup-form">
        <div class="form-group">
          <label for="tipo">Tipo de seguimiento:</label>
          <select id="tipo" [(ngModel)]="formTipo" data-testid="followup-type-select">
            <option value="">Seleccionar...</option>
            <option *ngFor="let t of followupTipos" [value]="t">{{ t }}</option>
          </select>
        </div>

        <div class="form-group">
          <label for="comentario">Comentario:</label>
          <textarea
            id="comentario"
            [(ngModel)]="formComentario"
            rows="4"
            placeholder="Mínimo 15 caracteres..."
            data-testid="followup-comment-input"
            (input)="onCommentChange($event)"
          ></textarea>
          <div class="char-counter" data-testid="followup-char-counter" aria-live="polite">
            {{ commentLength() }} / 2000
          </div>
        </div>

          <div class="form-group">
            <label>Archivo adjunto (opcional):</label>
            <div
              class="dropzone"
              [class.dragover]="isDragOver()"
              (dragover)="onDragOver($event)"
              (dragleave)="onDragLeave($event)"
              (drop)="onDrop($event)"
              data-testid="followup-file-dropzone"
            >
              @if (selectedFile()) {
                <div class="file-selected">
                  <span>{{ selectedFile()!.name }}</span>
                  <button type="button" (click)="clearFile()">×</button>
                </div>
              } @else {
                <p>Arrastra un archivo aquí o haz clic para seleccionar</p>
                <p class="file-hints">PDF, PNG, JPG, DOC, DOCX — Máx. 5MB</p>
              }
              <input
                type="file"
                (change)="onFileSelected($event)"
                accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                hidden
                #fileInput
              />
            </div>
          </div>

          <button
            type="button"
            (click)="onSubmit()"
            [disabled]="!canSave()"
            data-testid="followup-save-button"
          >
            Guardar Seguimiento
          </button>
      </div>

      <!-- Lista de seguimientos -->
      <div class="followup-list" data-testid="followup-list">
        @for (item of followups(); track item.id) {
          <div
            class="followup-item"
            [class.alerta-medica]="item.seg_tipo_comentario === 'Alerta Médica'"
            [attr.data-testid]="'followup-item-' + item.id"
          >
            <div class="followup-header">
              <span class="followup-tipo">{{ item.seg_tipo_comentario }}</span>
              <span class="followup-date">{{ item.created_at | date:'dd/MM/yyyy HH:mm' }}</span>
            </div>
            <p class="followup-comment">{{ item.seg_comentario_texto }}</p>
            @if (item.seg_archivo_url && item.seg_archivo_nombre) {
              <a
                href="javascript:void(0)"
                (click)="downloadFile(item)"
                class="attachment-link"
                data-testid="followup-attachment"
              >
                📎 {{ item.seg_archivo_nombre }}
              </a>
            }
          </div>
        }

        @if (loading().tab4) {
          <div class="loading-more">Cargando más seguimientos...</div>
        }

        @if (!hasMore() && followups().length > 0) {
          <div class="end-of-list">No hay más seguimientos</div>
        }
      </div>
    </div>
  `,
  styles: [`
    .tab4-container {
      padding: 0.5rem;
    }

    h3 {
      color: #333;
      border-bottom: 2px solid #1976d2;
      padding-bottom: 0.5rem;
      margin-bottom: 1.5rem;
    }

    /* Form */
    .followup-form {
      background: #f8f9fa;
      padding: 1.5rem;
      border-radius: 8px;
      margin-bottom: 1.5rem;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: #555;
    }

    select, textarea {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 0.9rem;
      box-sizing: border-box;
    }

    textarea {
      resize: vertical;
      min-height: 80px;
    }

    .char-counter {
      text-align: right;
      font-size: 0.8rem;
      color: #999;
      margin-top: 0.25rem;
    }

    /* Dropzone */
    .dropzone {
      border: 2px dashed #ddd;
      border-radius: 6px;
      padding: 1.5rem;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s;
    }

    .dropzone.dragover {
      border-color: #1976d2;
      background: #e3f2fd;
    }

    .file-hints {
      font-size: 0.8rem;
      color: #999;
      margin-top: 0.5rem;
    }

    .file-selected {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #e8f5e9;
      padding: 0.75rem;
      border-radius: 4px;
    }

    .file-selected button {
      background: none;
      border: none;
      font-size: 1.2rem;
      cursor: pointer;
      color: #c62828;
    }

    button[type="submit"] {
      background: #1976d2;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
      width: 100%;
      margin-top: 1rem;
    }

    button[type="submit"]:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    /* Followup List */
    .followup-list {
      max-height: 600px;
      overflow-y: auto;
    }

    .followup-item {
      background: #fff;
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      padding: 1rem;
      margin-bottom: 0.75rem;
    }

    .followup-item--alerta-medica {
      background: #fee;
      border-left: 4px solid #e44141;
    }

    .followup-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .followup-tipo {
      font-weight: 600;
      color: #1976d2;
      font-size: 0.9rem;
    }

    .followup-date {
      font-size: 0.8rem;
      color: #999;
    }

    .followup-comment {
      margin: 0.5rem 0;
      color: #333;
      font-size: 0.9rem;
    }

    .attachment-link {
      display: inline-block;
      margin-top: 0.5rem;
      color: #1976d2;
      text-decoration: none;
      font-size: 0.85rem;
    }

    .attachment-link:hover {
      text-decoration: underline;
    }

    .loading-more, .end-of-list {
      text-align: center;
      padding: 1rem;
      color: #999;
      font-size: 0.85rem;
    }
  `],
})
export class SeguimientoTabComponent implements OnInit {
  @Input() mnaId!: string;
  @ViewChild('fileInput') fileInput!: ElementRef;

  readonly facade = inject(ExpedienteFacade);

  private destroy$ = new Subject<void>();

  followupTipos: FollowupTipo[] = [
    'Nota Clínica',
    'Plan de Intervención',
    'Alerta Médica',
    'Observación Nutricional',
    'Interconsulta',
  ];

  // Signals
  followups = this.facade.followups;
  loading = this.facade.loading;
  error = this.facade.error;
  hasMore = computed(() => this.facade.pagination().hasMore);
  commentLength = signal(0);
  selectedFile = signal<File | null>(null);
  isDragOver = signal(false);

  // Form state
  formTipo = '';
  formComentario = '';

  ngOnInit(): void {
    this.facade.loadFollowups(this.mnaId)
;
  }

  onCommentChange(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.commentLength.set(target.value.length);
  }

  canSave(): boolean {
    return this.formComentario.trim().length >= 15 && this.formComentario.trim().length <= 2000 && !!this.formTipo;
  }

  async onSubmit(): Promise<void> {
    if (!this.canSave()) return;

    try {
      await this.facade.createFollowup(
        this.mnaId,
        this.formTipo as FollowupTipo,
        this.formComentario,
        this.selectedFile() ?? undefined,
      );

      // Reset form
      this.formTipo = '';
      this.formComentario = '';
      this.commentLength.set(0);
      this.clearFile();
    } catch (err: any) {
      console.error('Error saving followup:', err);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0]) {
      this.validateFile(input.files[0]);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(false);
    if (event.dataTransfer?.files?.[0]) {
      this.validateFile(event.dataTransfer.files[0]);
    }
  }

  private validateFile(file: File): void {
    // Validate extension
    const allowedExtensions = ['.pdf', '.png', '.jpg', '.jpeg', '.doc', '.docx'];
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();

    if (!allowedExtensions.includes(ext)) {
      alert('Formato no soportado');
      return;
    }

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('El archivo supera el límite de 5 MB');
      return;
    }

    this.selectedFile.set(file);
  }

  clearFile(): void {
    this.selectedFile.set(null);
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  async downloadFile(item: FollowupEntry): Promise<void> {
    if (item.seg_archivo_uuid) {
      try {
        const result = await this.facade['mnaService']
          .getDownloadUrl(this.mnaId, item.id, '', '')
          ;
        window.open(result?.url ?? ''), '_blank');
      } catch {
        // Fallback: abrir URL directa si existe
        if (item.seg_archivo_url) {
          window.open(item.seg_archivo_url, '_blank');
        }
      }
    } else if (item.seg_archivo_url) {
      window.open(item.seg_archivo_url, '_blank');
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
