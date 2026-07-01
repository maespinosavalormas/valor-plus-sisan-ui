import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';

/**
 * Composer de notas evolutivas
 * CA-03: Mínimo 10 caracteres
 * EE-04: Draft en IndexedDB si expira JWT
 * EE-03: Conserva texto en pérdida de red
 */
@Component({
  selector: 'app-follow-up-composer',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <mat-card class="composer-card" data-testid="follow-up-composer">
      <mat-card-header>
        <mat-icon mat-card-avatar>edit_note</mat-icon>
        <mat-card-title>Nueva Nota Evolutiva</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Contenido de la nota</mat-label>
          <textarea
            matInput
            [(ngModel)]="texto"
            rows="4"
            placeholder="Ingrese la nota evolutiva (mínimo 10 caracteres)..."
            [disabled]="disabled || guardando"
            (input)="onInput()"
            data-testid="composer-textarea">
          </textarea>
          <mat-hint align="end">{{ texto.length }} caracteres (mín. 10)</mat-hint>
          <mat-error *ngIf="texto.length > 0 && texto.length < 10" data-testid="composer-error-minlength">
            La nota debe tener al menos 10 caracteres (CA-03)
          </mat-error>
        </mat-form-field>

        <!-- Estado de draft guardado -->
        <div class="draft-status" *ngIf="draftGuardado" data-testid="composer-draft-status">
          <mat-icon color="primary">save</mat-icon>
          <span>Borrador guardado {{ draftFecha | date:'shortTime' }}</span>
        </div>

        <!-- Indicador offline -->
        <div class="offline-warning" *ngIf="!online" data-testid="composer-offline-warning">
          <mat-icon color="warn">cloud_off</mat-icon>
          <span>Sin conexión. El borrador se conserva localmente (EE-03).</span>
        </div>
      </mat-card-content>
      <mat-card-actions align="end">
        <button
          mat-button
          (click)="limpiar()"
          [disabled]="guardando || !texto"
          data-testid="composer-clear-btn">
          Limpiar
        </button>
        <button
          mat-raised-button
          color="primary"
          (click)="enviar()"
          [disabled]="disabled || guardando || texto.length < 10"
          class="submit-btn"
          data-testid="composer-submit-btn">
          <mat-progress-spinner
            *ngIf="guardando"
            diameter="20"
            mode="indeterminate"
            data-testid="composer-submit-spinner">
          </mat-progress-spinner>
          <span *ngIf="!guardando">Guardar Nota</span>
        </button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [`
    .composer-card {
      margin-bottom: 16px;
    }
    .full-width {
      width: 100%;
    }
    .draft-status {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 8px;
      color: #1976d2;
      font-size: 0.9em;
    }
    .offline-warning {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 8px;
      color: #f44336;
      font-size: 0.9em;
    }
    .submit-btn {
      min-width: 140px;
    }
    mat-card-actions {
      padding: 8px 16px 16px;
    }
  `],
})
export class FollowUpComposerComponent implements OnInit, OnDestroy {
  @Input() casoId!: string;
  @Input() disabled = false;
  @Input() guardando = false;

  @Output() enviarNota = new EventEmitter<string>();
  @Output() draftChange = new EventEmitter<{ casoId: string; texto: string }>();

  texto = '';
  online = navigator.onLine;
  draftGuardado = false;
  draftFecha: Date | null = null;

  private input$ = new Subject<string>();
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    // EE-04: Auto-guardar draft con debounce
    this.input$
      .pipe(
        debounceTime(2000), // 2 segundos sin escribir
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe((texto) => {
        if (texto.length >= 10) {
          this.guardarDraft(texto);
        }
      });

    // Escuchar cambios de conectividad
    window.addEventListener('online', () => (this.online = true));
    window.addEventListener('offline', () => (this.online = false));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onInput(): void {
    this.input$.next(this.texto);
  }

  guardarDraft(texto: string): void {
    // EE-04: Persistir en IndexedDB
    this.draftChange.emit({ casoId: this.casoId, texto });
    this.draftGuardado = true;
    this.draftFecha = new Date();
  }

  enviar(): void {
    if (this.texto.length >= 10) {
      this.enviarNota.emit(this.texto);
      this.texto = '';
      this.draftGuardado = false;
      this.draftFecha = null;
    }
  }

  limpiar(): void {
    this.texto = '';
    this.draftGuardado = false;
    this.draftFecha = null;
  }

  // EE-03: Método para restaurar draft tras pérdida de red
  restaurarDraft(textoGuardado: string): void {
    this.texto = textoGuardado;
    this.draftGuardado = true;
    this.draftFecha = new Date();
  }
}
