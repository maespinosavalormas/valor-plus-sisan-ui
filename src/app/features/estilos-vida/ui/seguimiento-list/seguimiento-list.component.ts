import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ListSeguidos, TipoNotaEnum } from '../../domain/models/expediente.model';

@Component({
  selector: 'app-seguimiento-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
  ],
  template: `
    <mat-card class="seguimiento-card">
      <mat-card-title>Seguimientos y Anotaciones</mat-card-title>

      <!-- Formulario de Creación -->
      <div class="create-form">
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <mat-form-field appearance="fill" class="full-width">
            <mat-label>Comentario (mínimo 15 caracteres)</mat-label>
            <textarea
              matInput
              formControlName="segComentario"
              rows="4"
              placeholder="Escriba su seguimiento o recomendación..."
            ></textarea>
            <mat-error *ngIf="form.get('segComentario')?.hasError('required')">
              El comentario es requerido
            </mat-error>
            <mat-error *ngIf="form.get('segComentario')?.hasError('minlength')">
              Mínimo 15 caracteres
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="fill" class="type-field">
            <mat-label>Tipo de Nota</mat-label>
            <mat-select formControlName="segTipoNota">
              <mat-option [value]="TipoNotaEnum.RECOMENDACION">Recomendación</mat-option>
              <mat-option [value]="TipoNotaEnum.ANOTACION">Anotación</mat-option>
              <mat-option [value]="TipoNotaEnum.ANEXO">Anexo</mat-option>
            </mat-select>
          </mat-form-field>

          <div class="form-actions">
            <button
              mat-raised-button
              color="primary"
              type="submit"
              [disabled]="!form.valid || isLoading"
            >
              <mat-icon>add</mat-icon>
              Crear Seguimiento
            </button>
          </div>
        </form>
      </div>

      <!-- Lista de Seguimientos -->
      <div *ngIf="isLoading" class="loading">
        <mat-spinner diameter="40"></mat-spinner>
      </div>

      <div *ngIf="!isLoading && seguimientos && seguimientos.items.length > 0" class="seguimientos-list">
        <mat-card *ngFor="let seguimiento of seguimientos.items" class="seguimiento-item">
          <mat-card-header>
            <div class="header-info">
              <mat-chip-set>
                <mat-chip [color]="getTipoColor(seguimiento.segTipoNota)" selected>
                  {{ seguimiento.segTipoNota }}
                </mat-chip>
              </mat-chip-set>
              <span class="created-at">{{ seguimiento.createdAt | date: 'short' }}</span>
            </div>
          </mat-card-header>

          <mat-card-content>
            <p class="comentario">{{ seguimiento.segComentario }}</p>

            <div class="adjuntos" *ngIf="seguimiento.fileCount > 0">
              <mat-icon>attachment</mat-icon>
              <span>{{ seguimiento.fileCount }} archivo(s) adjunto(s)</span>
            </div>
          </mat-card-content>

          <mat-card-actions>
            <button
              mat-button
              color="accent"
              *ngFor="let adjunto of seguimiento.adjuntos"
              (click)="onDownloadAdjunto(adjunto.id)"
            >
              <mat-icon>download</mat-icon>
              {{ adjunto.fileName }}
            </button>
          </mat-card-actions>
        </mat-card>
      </div>

      <div *ngIf="!isLoading && (!seguimientos || seguimientos.items.length === 0)" class="empty-state">
        No hay seguimientos registrados aún.
      </div>

      <mat-paginator
        *ngIf="seguimientos"
        [length]="seguimientos.meta.total"
        [pageSize]="seguimientos.meta.pageSize"
        [pageSizeOptions]="[5, 10, 20]"
        (page)="onPageChange($event)"
      ></mat-paginator>
    </mat-card>
  `,
  styles: [
    `
      .seguimiento-card {
        padding: 2rem;
      }

      .create-form {
        margin-bottom: 2rem;
        padding: 1.5rem;
        background-color: #f9f9f9;
        border-radius: 4px;
      }

      form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .full-width {
        width: 100%;
      }

      .type-field {
        width: 200px;
      }

      .form-actions {
        display: flex;
        gap: 1rem;
      }

      .loading {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 200px;
      }

      .seguimientos-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        margin: 2rem 0;
      }

      .seguimiento-item {
        border-left: 4px solid #2196f3;
      }

      .header-info {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
      }

      .created-at {
        color: #999;
        font-size: 0.9rem;
      }

      .comentario {
        margin: 1rem 0;
        line-height: 1.6;
        color: #333;
      }

      .adjuntos {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem;
        background-color: #f0f0f0;
        border-radius: 4px;
        font-size: 0.9rem;
        color: #666;
      }

      .empty-state {
        padding: 2rem;
        text-align: center;
        color: #999;
      }

      mat-paginator {
        margin-top: 1rem;
      }
    `,
  ],
})
export class SeguimientoListComponent {
  @Input() elsaId!: string;
  @Input() seguimientos!: ListSeguidos | null;
  @Input() isLoading = false;
  @Output() createSeguimiento = new EventEmitter<{ comentario: string; file?: File }>();
  @Output() pageChange = new EventEmitter<number>();

  form!: FormGroup;
  TipoNotaEnum = TipoNotaEnum;

  constructor(private readonly fb: FormBuilder) {
    this.form = this.fb.group({
      segComentario: ['', [Validators.required, Validators.minLength(15), Validators.maxLength(2000)]],
      segTipoNota: [TipoNotaEnum.RECOMENDACION],
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.createSeguimiento.emit({
        comentario: this.form.get('segComentario')?.value,
      });
      this.form.reset({ segTipoNota: TipoNotaEnum.RECOMENDACION });
    }
  }

  onPageChange(event: PageEvent): void {
    this.pageChange.emit(event.pageIndex + 1);
  }

  onDownloadAdjunto(adjId: string): void {
    console.log('Download adjunto:', adjId);
    // TODO: Implementar descarga de adjunto
  }

  getTipoColor(tipo: string): 'primary' | 'accent' | 'warn' {
    switch (tipo) {
      case TipoNotaEnum.RECOMENDACION:
        return 'primary';
      case TipoNotaEnum.ANOTACION:
        return 'accent';
      case TipoNotaEnum.ANEXO:
        return 'warn';
      default:
        return 'primary';
    }
  }
}
