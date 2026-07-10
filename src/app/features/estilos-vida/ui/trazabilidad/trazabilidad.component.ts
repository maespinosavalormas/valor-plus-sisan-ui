import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { Trazabilidad } from '../../domain/models/expediente.model';

@Component({
  selector: 'app-trazabilidad',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatProgressSpinnerModule, MatPaginatorModule],
  template: `
    <mat-card class="trazabilidad-card">
      <mat-card-title>Trazabilidad / Historial de Cambios</mat-card-title>

      <div *ngIf="isLoading" class="loading">
        <mat-spinner diameter="40"></mat-spinner>
      </div>

      <div *ngIf="!isLoading && trazabilidad && trazabilidad.timeline.length > 0" class="timeline">
        <div *ngFor="let item of trazabilidad.timeline" class="timeline-item">
          <div class="timeline-marker"></div>
          <div class="timeline-content">
            <div class="timeline-header">
              <span class="field-name">{{ item.fieldName }}</span>
              <span class="changed-at">{{ item.changedAt | date: 'short' }}</span>
            </div>
            <div class="change-values">
              <div class="old-value">
                <span class="label">Anterior:</span>
                <span class="value">{{ item.oldValue }}</span>
              </div>
              <div class="new-value">
                <span class="label">Nuevo:</span>
                <span class="value">{{ item.newValue }}</span>
              </div>
            </div>
            <div class="reason">{{ item.reason }}</div>
            <div class="changed-by">Por: {{ item.changedBy }}</div>
          </div>
        </div>
      </div>

      <div *ngIf="!isLoading && (!trazabilidad || trazabilidad.timeline.length === 0)" class="empty-state">
        No hay cambios registrados aún.
      </div>

      <mat-paginator
        *ngIf="trazabilidad"
        [length]="trazabilidad.meta.total"
        [pageSize]="trazabilidad.meta.pageSize"
        [pageSizeOptions]="[5, 10, 20]"
        (page)="onPageChange($event)"
      ></mat-paginator>
    </mat-card>
  `,
  styles: [
    `
      .trazabilidad-card {
        padding: 2rem;
      }

      .loading {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 200px;
      }

      .timeline {
        position: relative;
        padding: 2rem 0;
      }

      .timeline::before {
        content: '';
        position: absolute;
        left: 20px;
        top: 0;
        bottom: 0;
        width: 2px;
        background: linear-gradient(to bottom, #2196f3, #4caf50);
      }

      .timeline-item {
        position: relative;
        margin-left: 4rem;
        margin-bottom: 2rem;
      }

      .timeline-marker {
        position: absolute;
        left: -3.4rem;
        top: 0.5rem;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: #2196f3;
        border: 3px solid white;
        box-shadow: 0 0 0 3px #2196f3;
      }

      .timeline-content {
        background: #f9f9f9;
        padding: 1.5rem;
        border-radius: 4px;
        border-left: 4px solid #2196f3;
      }

      .timeline-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.5rem;
      }

      .field-name {
        font-weight: 600;
        color: #333;
      }

      .changed-at {
        color: #999;
        font-size: 0.9rem;
      }

      .change-values {
        display: flex;
        gap: 2rem;
        margin: 1rem 0;
        font-size: 0.9rem;
      }

      .old-value,
      .new-value {
        display: flex;
        flex-direction: column;
      }

      .label {
        font-weight: 500;
        color: #666;
      }

      .value {
        color: #333;
        margin-top: 0.25rem;
      }

      .reason {
        font-style: italic;
        color: #666;
        margin: 0.5rem 0;
      }

      .changed-by {
        font-size: 0.85rem;
        color: #999;
        margin-top: 0.5rem;
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
export class TrazabilidadComponent {
  @Input() trazabilidad!: Trazabilidad | null;
  @Input() isLoading = false;
  @Output() pageChange = new EventEmitter<number>();

  onPageChange(event: PageEvent): void {
    this.pageChange.emit(event.pageIndex + 1);
  }
}
