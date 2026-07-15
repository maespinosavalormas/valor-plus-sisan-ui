import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ExpedienteFacade } from '../../data-access/facades/expediente.facade';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ExpedienteTab1Component } from './tabs/expediente-tab1.component';
import { DiagnosticoTabComponent } from './tabs/diagnostico-tab.component';
import { TrazabilidadTabComponent } from './tabs/trazabilidad-tab.component';
import { SeguimientoTabComponent } from './tabs/seguimiento-tab.component';

export type TabType = 'tab1' | 'tab2' | 'tab3' | 'tab4';

@Component({
  selector: 'app-mna-expediente',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    ExpedienteTab1Component,
    DiagnosticoTabComponent,
    TrazabilidadTabComponent,
    SeguimientoTabComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="expediente-container" data-testid="mna-tab1-form">
      <!-- Header -->
      <div class="expediente-header">
        <div class="header-title">
          <mat-icon>assignment</mat-icon>
          <h2>Expediente Nutricional MNA</h2>
        </div>
        @if (mnaData()) {
          <span class="patient-name">{{ mnaData()?.patient?.nombre }} {{ mnaData()?.patient?.apellido }}</span>
        }
      </div>

      <!-- Loading indicator -->
      @if (loading().tab1) {
        <div class="loading-overlay">
          <mat-icon class="spin">hourglass_empty</mat-icon>
          <p>Cargando expediente...</p>
        </div>
      }

      <!-- Error message -->
      @if (error()) {
        <div class="error-banner" data-testid="expediente-error">
          <mat-icon>error</mat-icon>
          <p>{{ error() }}</p>
          <button mat-raised-button color="warn" (click)="facade.clear()">Reintentar</button>
        </div>
      }

      <!-- Tab Navigation -->
      <nav class="tab-navigation" role="tablist">
        <button
          mat-button
          role="tab"
          [attr.aria-selected]="activeTab === 'tab1'"
          [class.active]="activeTab === 'tab1'"
          (click)="switchTab('tab1')"
          data-testid="tab-1"
        >
          <mat-icon>visibility</mat-icon>
          Solo Lectura
        </button>
        <button
          mat-button
          role="tab"
          [attr.aria-selected]="activeTab === 'tab2'"
          [class.active]="activeTab === 'tab2'"
          (click)="switchTab('tab2')"
          data-testid="tab-2"
        >
          <mat-icon>analytics</mat-icon>
          Diagnóstico
        </button>
        <button
          mat-button
          role="tab"
          [attr.aria-selected]="activeTab === 'tab3'"
          [class.active]="activeTab === 'tab3'"
          (click)="switchTab('tab3')"
          data-testid="tab-3"
        >
          <mat-icon>history</mat-icon>
          Trazabilidad
        </button>
        <button
          mat-button
          role="tab"
          [attr.aria-selected]="activeTab === 'tab4'"
          [class.active]="activeTab === 'tab4'"
          (click)="switchTab('tab4')"
          data-testid="tab-4"
        >
          <mat-icon>chat</mat-icon>
          Seguimiento
        </button>
      </nav>

      <!-- Tab Content -->
      <div class="tab-content">
        <!-- Tab 1: Solo Lectura - Datos MNA + Patient -->
        @if (activeTab === 'tab1') {
          <div class="tab-panel" data-testid="tab-1-content">
            @if (mnaData()) {
              <app-expediente-tab1 [mnaData]="mnaData()!.mna" [patientData]="mnaData()?.patient"></app-expediente-tab1>
            }
          </div>
        }

        <!-- Tab 2: Diagnóstico - Métricas WHO -->
        @if (activeTab === 'tab2') {
          <div class="tab-panel" data-testid="tab-2-content">
            @if (loading().tab2) {
              <div class="loading-overlay">
                <mat-icon class="spin">hourglass_empty</mat-icon>
                <p>Cargando métricas...</p>
              </div>
            } @else if (metrics()) {
              <app-diagnostico-tab [metrics]="metrics()!"></app-diagnostico-tab>
            }
          </div>
        }

        <!-- Tab 3: Trazabilidad - Audit Trail Timeline -->
        @if (activeTab === 'tab3') {
          <div class="tab-panel" data-testid="tab-3-content">
            @if (loading().tab3) {
              <div class="loading-overlay">
                <mat-icon class="spin">hourglass_empty</mat-icon>
                <p>Cargando trazabilidad...</p>
              </div>
            } @else if (auditTrail().length > 0) {
              <app-trazabilidad-tab [entries]="auditTrail()"></app-trazabilidad-tab>
            } @else {
              <div class="empty-state" data-testid="audit-empty-state">
                <mat-icon>check_circle</mat-icon>
                <p>Este registro se encuentra en su estado original. No hay cambios registrados.</p>
              </div>
            }
          </div>
        }

        <!-- Tab 4: Seguimiento - Muro de Seguimiento -->
        @if (activeTab === 'tab4') {
          <div class="tab-panel" data-testid="tab-4-content">
            <app-seguimiento-tab [mnaId]="mnaId()" (followupCreated)="onFollowupCreated()"></app-seguimiento-tab>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      max-width: 1300px;
      margin: 0 auto;
      padding: 14px;
    }

    .expediente-container {
      background: var(--white);
      border-radius: 8px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
      min-height: 75vh;
      overflow: hidden;
    }

    .expediente-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
      border-bottom: 1px solid var(--gray-secondary);
      background: var(--background-pages);

      .header-title {
        display: flex;
        align-items: center;
        gap: 12px;

        mat-icon {
          color: var(--blue-primary);
          font-size: 24px;
          width: 24px;
          height: 24px;
        }

        h2 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: var(--strong-blue-primary);
        }
      }

      .patient-name {
        font-size: 14px;
        color: var(--strong-gray-primary);
        font-weight: 500;
      }
    }

    .loading-overlay {
      text-align: center;
      padding: 3rem;
      color: var(--strong-gray-primary);

      mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        color: var(--blue-primary);
        margin-bottom: 1rem;
      }

      p {
        margin: 0;
        font-size: 14px;
      }
    }

    .spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .error-banner {
      background: #fee;
      border-left: 4px solid var(--warning);
      padding: 16px 24px;
      margin: 16px 24px;
      display: flex;
      align-items: center;
      gap: 12px;
      border-radius: 4px;

      mat-icon {
        color: var(--warning);
        font-size: 24px;
        width: 24px;
        height: 24px;
      }

      p {
        flex: 1;
        margin: 0;
        color: var(--strong-gray-primary);
        font-size: 14px;
      }
    }

    .tab-navigation {
      display: flex;
      border-bottom: 2px solid var(--gray-secondary);
      padding: 0 24px;
      background: var(--white);

      button {
        background: none;
        border: none;
        padding: 16px 24px;
        cursor: pointer;
        font-size: 14px;
        color: var(--strong-gray-primary);
        border-bottom: 3px solid transparent;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        gap: 8px;

        mat-icon {
          font-size: 18px;
          width: 18px;
          height: 18px;
        }

        &:hover {
          color: var(--blue-primary);
        }

        &.active {
          color: var(--blue-primary);
          border-bottom-color: var(--blue-primary);
          font-weight: 600;
        }
      }
    }

    .tab-content {
      padding: 24px;
      min-height: 400px;
      max-height: calc(85vh - 200px);
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

    .tab-panel {
      width: 100%;
    }

    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      color: var(--strong-gray-primary);

      mat-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        color: var(--blue-primary);
        margin-bottom: 1rem;
        opacity: 0.6;
      }

      p {
        margin: 0;
        font-size: 14px;
        font-style: italic;
      }
    }

    @media (max-width: 768px) {
      :host {
        padding: 8px;
      }

      .expediente-header {
        flex-direction: column;
        gap: 8px;
        padding: 12px 16px;

        .header-title {
          h2 {
            font-size: 16px;
          }
        }

        .patient-name {
          font-size: 12px;
        }
      }

      .tab-navigation {
        padding: 0 8px;
        overflow-x: auto;

        button {
          padding: 12px 16px;
          font-size: 12px;
          white-space: nowrap;

          mat-icon {
            font-size: 16px;
            width: 16px;
            height: 16px;
          }
        }
      }

      .tab-content {
        padding: 16px;
      }

      .error-banner {
        margin: 12px 16px;
        padding: 12px 16px;
      }
    }
  `],
})
export class MnaExpedienteComponent implements OnInit, OnDestroy {
  readonly facade = inject(ExpedienteFacade);
  private route = inject(ActivatedRoute);

  private destroy$ = new Subject<void>();

  mnaId = signal<string>('');
  activeTab: TabType = 'tab1';

  // Expose signals for template
  readonly mnaData = this.facade.mnaData;
  readonly metrics = this.facade.metrics;
  readonly auditTrail = this.facade.auditTrail;
  readonly loading = this.facade.loading;
  readonly error = this.facade.error;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.mnaId.set(id);
      this.loadInitialData();
    }
  }

  private loadInitialData(): void {
    // Cargar Tab 1 inmediatamente (datos principales)
    this.facade.loadExpediente(this.mnaId()).catch(console.error);
  }

  switchTab(tab: TabType): void {
    if (this.activeTab === tab) return;
    this.activeTab = tab;

    // Lazy load para cada tab
    switch (tab) {
      case 'tab1':
        // Ya cargado inicialmente
        break;
      case 'tab2':
        if (!this.facade.metrics()) {
          this.facade.loadMetrics(this.mnaId()).catch(console.error);
        }
        break;
      case 'tab3':
        if (this.facade.auditTrail().length === 0) {
          this.facade.loadAuditTrail(this.mnaId()).catch(console.error);
        }
        break;
      case 'tab4':
        this.facade.loadFollowups(this.mnaId()).catch(console.error);
        break;
    }
  }

  onFollowupCreated(): void {
    // Refrescar lista de followups después de crear uno nuevo
    this.facade.loadFollowups(this.mnaId(), 1, 10).catch(console.error);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
