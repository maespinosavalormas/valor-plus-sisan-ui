import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { NutritionRisk, PhysicalActivityRisk, AlcoholRisk, PatientResponse } from '../data-access/elsa.contracts';

@Component({
  selector: 'app-elsa-resumen',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  template: `
    <section class="elsa-resumen" data-testid="elsa-resumen-section">
      <h2 class="elsa-resumen__title">Resumen</h2>

      <div *ngIf="patient" class="elsa-resumen__patient" data-testid="resumen-patient">
        <mat-icon>person</mat-icon>
        <span>{{ patient.fullName }}</span>
        <span class="elsa-resumen__doc">{{ patient.document }}</span>
      </div>

      <div class="elsa-resumen__cards">
        <mat-card class="elsa-resumen__card" data-testid="resumen-nutrition">
          <mat-card-header>
            <mat-icon mat-card-avatar>restaurant</mat-icon>
            <mat-card-title>Alimentación</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <p *ngIf="nutrition; else noNutrition" data-testid="resumen-nutrition-value">
              {{ nutrition.total }} porciones/día — {{ nutrition.label }}
            </p>
            <ng-template #noNutrition>
              <p class="elsa-resumen__empty">Complete la sección de alimentación</p>
            </ng-template>
          </mat-card-content>
        </mat-card>

        <mat-card class="elsa-resumen__card" data-testid="resumen-physical-activity">
          <mat-card-header>
            <mat-icon mat-card-avatar>fitness_center</mat-icon>
            <mat-card-title>Actividad Física</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <p *ngIf="physicalActivity; else noActivity" data-testid="resumen-activity-value">
              {{ physicalActivity.mets }} METs — {{ physicalActivity.label }}
            </p>
            <ng-template #noActivity>
              <p class="elsa-resumen__empty">Complete la sección de actividad física</p>
            </ng-template>
          </mat-card-content>
        </mat-card>

        <mat-card class="elsa-resumen__card" data-testid="resumen-alcohol">
          <mat-card-header>
            <mat-icon mat-card-avatar>local_bar</mat-icon>
            <mat-card-title>Alcohol</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <p *ngIf="alcohol; else noAlcohol" data-testid="resumen-alcohol-value">
              {{ alcohol.score }} puntos — {{ alcohol.label }}
            </p>
            <ng-template #noAlcohol>
              <p class="elsa-resumen__empty">Complete la sección de alcohol</p>
            </ng-template>
          </mat-card-content>
        </mat-card>
      </div>
    </section>
  `,
  styles: [`
    .elsa-resumen { display: flex; flex-direction: column; gap: 16px; }
    .elsa-resumen__title { margin: 0; font-size: 1.25rem; }
    .elsa-resumen__patient { display: flex; align-items: center; gap: 12px; padding: 12px; background: rgba(0,0,0,0.04); border-radius: 8px; }
    .elsa-resumen__doc { color: rgba(0,0,0,0.6); }
    .elsa-resumen__cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; }
    .elsa-resumen__empty { color: rgba(0,0,0,0.54); font-style: italic; }
  `],
})
export class ElsaResumenComponent {
  @Input() nutrition: NutritionRisk | null = null;
  @Input() physicalActivity: PhysicalActivityRisk | null = null;
  @Input() alcohol: AlcoholRisk | null = null;
  @Input() patient: PatientResponse | null = null;
}
