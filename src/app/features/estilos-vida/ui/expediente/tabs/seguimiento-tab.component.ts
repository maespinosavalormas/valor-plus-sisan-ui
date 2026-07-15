import { Component, Input, ChangeDetectionStrategy, OnInit, ViewChild, ElementRef, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
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
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="tab4-container">
      <!-- Sección: Formulario de Seguimiento -->
      <div class="info-section">
        <div class="section-header">
          <div class="section-icon">
            <mat-icon>add_comment</mat-icon>
          </div>
          <div class="section-title">
            <h4>Nuevo Seguimiento</h4>
          </div>
        </div>
        <div class="section-content followup-form" data-testid="followup-form">
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
              (click)="fileInput.click()"
              data-testid="followup-file-dropzone"
            >
              @if (selectedFile()) {
                <div class="file-selected">
                  <mat-icon>attach_file</mat-icon>
                  <span>{{ selectedFile()!.name }}</span>
                  <button mat-icon-button (click)="clearFile(); $event.stopPropagation()">
                    <mat-icon>close</mat-icon>
                  </button>
                </div>
              } @else {
                <mat-icon>cloud_upload</mat-icon>
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
            mat-raised-button
            color="primary"
            (click)="onSubmit()"
            [disabled]="!canSave()"
            data-testid="followup-save-button"
          >
            <mat-icon>save</mat-icon>
            Guardar Seguimiento
          </button>
        </div>
      </div>

      <!-- Sección: Lista de Seguimientos -->
      <div class="info-section">
        <div class="section-header">
          <div class="section-icon">
            <mat-icon>chat</mat-icon>
          </div>
          <div class="section-title">
            <h4>Historial de Seguimientos</h4>
          </div>
        </div>
        <div class="section-content followup-list" data-testid="followup-list">
          @for (item of followups(); track item.id) {
            <div
              class="followup-item"
              [class.alerta-medica]="item.seg_tipo_comentario === 'Alerta Médica'"
              [attr.data-testid]="'followup-item-' + item.id"
            >
              <div class="followup-header">
                <span class="followup-tipo">
                  <mat-icon>label</mat-icon>
                  {{ item.seg_tipo_comentario }}
                </span>
                <span class="followup-date">
                  <mat-icon>schedule</mat-icon>
                  {{ item.created_at | date:'dd/MM/yyyy HH:mm' }}
                </span>
              </div>
              <p class="followup-comment">{{ item.seg_comentario_texto }}</p>
              @if (item.seg_archivo_url && item.seg_archivo_nombre) {
                <a
                  href="javascript:void(0)"
                  (click)="downloadFile(item)"
                  class="attachment-link"
                  data-testid="followup-attachment"
                >
                  <mat-icon>attach_file</mat-icon>
                  {{ item.seg_archivo_nombre }}
                </a>
              }
            </div>
          }

          @if (loading().tab4) {
            <div class="loading-more">
              <mat-icon class="spin">hourglass_empty</mat-icon>
              Cargando más seguimientos...
            </div>
          }

          @if (!hasMore() && followups().length > 0) {
            <div class="end-of-list">
              <mat-icon>check_circle</mat-icon>
              No hay más seguimientos
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tab4-container {
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
    }

    /* Form */
    .followup-form {
      background: var(--background-pages);
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 24px;
    }

    .form-group {
      margin-bottom: 16px;

      label {
        display: block;
        margin-bottom: 8px;
        font-weight: 500;
        color: var(--strong-blue-primary);
        font-size: 13px;
      }

      select, textarea {
        width: 100%;
        padding: 10px 12px;
        border: 1px solid var(--gray-secondary);
        border-radius: 4px;
        font-size: 13px;
        box-sizing: border-box;
        background: var(--white);
        color: var(--strong-blue-primary);

        &:focus {
          outline: none;
          border-color: var(--blue-primary);
        }
      }

      textarea {
        resize: vertical;
        min-height: 80px;
      }
    }

    .char-counter {
      text-align: right;
      font-size: 11px;
      color: var(--strong-gray-primary);
      margin-top: 4px;
    }

    /* Dropzone */
    .dropzone {
      border: 2px dashed var(--gray-secondary);
      border-radius: 6px;
      padding: 24px;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s;
      background: var(--white);

      &:hover {
        border-color: var(--blue-primary);
        background: var(--blue-tertiary);
      }

      &.dragover {
        border-color: var(--blue-primary);
        background: var(--blue-tertiary);
      }

      mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        color: var(--gray-primary);
        margin-bottom: 8px;
      }

      p {
        margin: 4px 0;
        font-size: 13px;
        color: var(--strong-gray-primary);
      }

      .file-hints {
        font-size: 11px;
        color: var(--gray-primary);
        margin-top: 8px;
      }
    }

    .file-selected {
      display: flex;
      align-items: center;
      gap: 12px;
      background: #e8f5e9;
      padding: 12px;
      border-radius: 4px;

      mat-icon {
        color: #2e7d32;
        font-size: 20px;
        width: 20px;
        height: 20px;
      }

      span {
        flex: 1;
        color: #2e7d32;
        font-size: 13px;
      }

      button {
        color: #c62828;
      }
    }

    button[mat-raised-button] {
      width: 100%;
      margin-top: 16px;

      mat-icon {
        margin-right: 8px;
      }
    }

    /* Followup List */
    .followup-list {
      max-height: 600px;
      overflow-y: auto;

      &::-webkit-scrollbar {
        width: 8px;
      }

      &::-webkit-scrollbar-track {
        background: var(--background-pages);
        border-radius: 4px;
      }

      &::-webkit-scrollbar-thumb {
        background: var(--gray-primary);
        border-radius: 4px;

        &:hover {
          background: var(--strong-gray-primary);
        }
      }
    }

    .followup-item {
      background: var(--white);
      border: 1px solid var(--gray-secondary);
      border-radius: 6px;
      padding: 16px;
      margin-bottom: 12px;

      &:last-child {
        margin-bottom: 0;
      }
    }

    .followup-item--alerta-medica {
      background: #fee;
      border-left: 4px solid var(--warning);
    }

    .followup-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .followup-tipo {
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 600;
      color: var(--blue-primary);
      font-size: 13px;

      mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }
    }

    .followup-date {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 11px;
      color: var(--strong-gray-primary);

      mat-icon {
        font-size: 14px;
        width: 14px;
        height: 14px;
      }
    }

    .followup-comment {
      margin: 8px 0;
      color: var(--strong-blue-primary);
      font-size: 13px;
      line-height: 1.5;
    }

    .attachment-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      margin-top: 8px;
      color: var(--blue-primary);
      text-decoration: none;
      font-size: 12px;

      mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }

      &:hover {
        text-decoration: underline;
      }
    }

    .loading-more, .end-of-list {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 16px;
      color: var(--strong-gray-primary);
      font-size: 13px;

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
    }

    .spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
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

      .followup-form {
        padding: 12px;
      }

      .form-group {
        label {
          font-size: 12px;
        }

        select, textarea {
          font-size: 12px;
          padding: 8px 10px;
        }
      }

      .dropzone {
        padding: 16px;

        mat-icon {
          font-size: 36px;
          width: 36px;
          height: 36px;
        }

        p {
          font-size: 12px;
        }
      }

      .followup-item {
        padding: 12px;
      }

      .followup-tipo {
        font-size: 12px;
      }

      .followup-date {
        font-size: 10px;
      }

      .followup-comment {
        font-size: 12px;
      }

      .attachment-link {
        font-size: 11px;
      }
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
