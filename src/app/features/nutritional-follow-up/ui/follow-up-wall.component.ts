import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { SeguimientoEvolutivo, TIPO_ICONOS, TipoSeguimiento } from '../data-access/follow-up.contracts';

@Component({
  selector: 'app-follow-up-wall',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatChipsModule,
    MatButtonModule,
    ScrollingModule,
  ],
  template: `
    <div class="follow-up-wall">
      <!-- Filtros por tipo (CA-08) -->
      <mat-chip-listbox class="filter-chips">
        <mat-chip-option
          *ngFor="let tipo of tiposSeguimiento"
          [selected]="filtroTipo === tipo"
          (click)="filtrar.emit(tipo)">
          <mat-icon>{{ getIcono(tipo) }}</mat-icon>
          {{ tipo }}
        </mat-chip-option>
        <mat-chip-option
          [selected]="!filtroTipo"
          (click)="filtrar.emit(null)">
          Todos
        </mat-chip-option>
      </mat-chip-listbox>

      <!-- Timeline de seguimientos con scroll diferido (EE-09) -->
      <cdk-virtual-scroll-viewport
        itemSize="120"
        class="timeline-viewport"
        (scrolledIndexChange)="onScroll($event)">
        <div
          *cdkVirtualFor="let seguimiento of seguimientos; trackBy: trackByFn"
          class="timeline-item">
          <mat-card [class.selected]="seleccionado?.uuid === seguimiento.uuid">
            <mat-card-header>
              <mat-icon [color]="getColor(seguimiento.tipo)">
                {{ getIcono(seguimiento.tipo) }}
              </mat-icon>
              <mat-card-title-group>
                <mat-card-title>
                  {{ seguimiento.autor.nombre }}
                  <span class="cargo">{{ seguimiento.autor.cargo }}</span>
                </mat-card-title>
                <mat-card-subtitle>
                  {{ seguimiento.fechaHora | date:'medium' }}
                </mat-card-subtitle>
              </mat-card-title-group>
            </mat-card-header>
            <mat-card-content>
              <p class="contenido" [innerHTML]="seguimiento.contenido"></p>
              <mat-chip-set *ngIf="seguimiento.evidenciaUuid">
                <mat-chip>
                  <mat-icon>attach_file</mat-icon>
                  Evidencia adjunta
                </mat-chip>
              </mat-chip-set>
            </mat-card-content>
          </mat-card>
        </div>
      </cdk-virtual-scroll-viewport>

      <!-- Cargar más (keyset pagination EE-09) -->
      <div class="load-more-container" *ngIf="hasMore">
        <button
          mat-stroked-button
          color="primary"
          (click)="cargarMas.emit()"
          [disabled]="loading">
          <mat-icon *ngIf="loading">refresh</mat-icon>
          {{ loading ? 'Cargando...' : 'Cargar más' }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .follow-up-wall {
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    .filter-chips {
      padding: 16px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.12);
    }
    .timeline-viewport {
      flex: 1;
      min-height: 400px;
    }
    .timeline-item {
      padding: 8px 16px;
    }
    .timeline-item mat-card {
      cursor: pointer;
      transition: box-shadow 0.2s;
    }
    .timeline-item mat-card:hover {
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
    .timeline-item mat-card.selected {
      border: 2px solid #1976d2;
    }
    .cargo {
      font-size: 0.85em;
      color: rgba(0, 0, 0, 0.6);
      margin-left: 8px;
    }
    .contenido {
      margin-top: 8px;
      white-space: pre-wrap;
      word-break: break-word;
    }
    .load-more-container {
      padding: 16px;
      text-align: center;
      border-top: 1px solid rgba(0, 0, 0, 0.12);
    }
  `],
})
export class FollowUpWallComponent {
  @Input() seguimientos: SeguimientoEvolutivo[] = [];
  @Input() seleccionado: SeguimientoEvolutivo | null = null;
  @Input() hasMore = false;
  @Input() loading = false;
  @Input() filtroTipo: TipoSeguimiento | null = null;

  @Output() seleccionar = new EventEmitter<SeguimientoEvolutivo>();
  @Output() cargarMas = new EventEmitter<void>();
  @Output() filtrar = new EventEmitter<TipoSeguimiento | null>();

  tiposSeguimiento: TipoSeguimiento[] = [
    'NOTA_EVOLUTIVA',
    'CAMBIO_ESTADO',
    'ALTA_MEDICA',
    'EVIDENCIA',
  ];

  getIcono(tipo: TipoSeguimiento): string {
    return TIPO_ICONOS[tipo]?.icono || 'note';
  }

  getColor(tipo: TipoSeguimiento): string {
    return TIPO_ICONOS[tipo]?.color || 'primary';
  }

  trackByFn(index: number, item: SeguimientoEvolutivo): string {
    return item.uuid;
  }

  onScroll(index: number): void {
    // Infinite scroll trigger para EE-09
    if (this.hasMore && index >= this.seguimientos.length - 5) {
      this.cargarMas.emit();
    }
  }
}
