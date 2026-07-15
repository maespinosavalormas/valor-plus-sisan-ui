import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
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
  imports: [CommonModule, RouterModule, ExpedienteTab1Component, DiagnosticoTabComponent, TrazabilidadTabComponent, SeguimientoTabComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="expediente-container" data-testid="mna-tab1-form">
      <!-- Header -->
      <div class="expediente-header">
        <h2>Expediente Nutricional MNA</h2>
        @if (mnaData()) {
          <span class="patient-name">{{ mnaData()?.patient?.nombre }} {{ mnaData()?.patient?.apellido }}</span>
        }
      </div>

      <!-- Loading indicator -->
      @if (loading().tab1) {
        <div class="loading-overlay">
          <p>Cargando expediente...</p>
        </div>
      }

      <!-- Error message -->
      @if (error()) {
        <div class="error-banner" data-testid="expediente-error">
          <p>{{ error() }}</p>
          <button (click)="facade.clear()">Reintentar</button>
        </div>
      }

      <!-- Tab Navigation -->
      <nav class="tab-navigation" role="tablist">
        <button
          role="tab"
          [attr.aria-selected]="activeTab === 'tab1'"
          [class.active]="activeTab === 'tab1'"
          (click)="switchTab('tab1')"
          data-testid="tab-1"
        >
          Solo Lectura
        </button>
        <button
          role="tab"
          [attr.aria-selected]="activeTab === 'tab2'"
          [class.active]="activeTab === 'tab2'"
          (click)="switchTab('tab2')"
          data-testid="tab-2"
        >
          Diagnóstico
        </button>
        <button
          role="tab"
          [attr.aria-selected]="activeTab === 'tab3'"
          [class.active]="activeTab === 'tab3'"
          (click)="switchTab('tab3')"
          data-testid="tab-3"
        >
          Trazabilidad
        </button>
        <button
          role="tab"
          [attr.aria-selected]="activeTab === 'tab4'"
          [class.active]="activeTab === 'tab4'"
          (click)="switchTab('tab4')"
          data-testid="tab-4"
        >
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
              <p>Cargando métricas...</p>
            } @else if (metrics()) {
              <app-diagnostico-tab [metrics]="metrics()!"></app-diagnostico-tab>
            }
          </div>
        }

        <!-- Tab 3: Trazabilidad - Audit Trail Timeline -->
        @if (activeTab === 'tab3') {
          <div class="tab-panel" data-testid="tab-3-content">
            @if (loading().tab3) {
              <p>Cargando trazabilidad...</p>
            } @else if (auditTrail().length > 0) {
              <app-trazabilidad-tab [entries]="auditTrail()"></app-trazabilidad-tab>
            } @else {
              <div class="empty-state" data-testid="audit-empty-state">
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
      max-width: 1200px;
      margin: 0 auto;
      padding: 1rem;
    }

    .expediente-container {
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .expediente-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #e0e0e0;
      background: #f8f9fa;
    }

    .expediente-header h2 {
      margin: 0;
      font-size: 1.25rem;
      color: #333;
    }

    .patient-name {
      font-size: 0.9rem;
      color: #666;
    }

    .loading-overlay {
      text-align: center;
      padding: 2rem;
      color: #666;
    }

    .error-banner {
      background: #fee;
      border-left: 4px solid #e44141;
      padding: 1rem;
      margin: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .error-banner button {
      background: #e44141;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
    }

    .tab-navigation {
      display: flex;
      border-bottom: 2px solid #e0e0e0;
      padding: 0 1rem;
    }

    .tab-navigation button {
      background: none;
      border: none;
      padding: 1rem 1.5rem;
      cursor: pointer;
      font-size: 0.9rem;
      color: #666;
      border-bottom: 3px solid transparent;
      transition: all 0.2s;
    }

    .tab-navigation button:hover {
      color: #1976d2;
    }

    .tab-navigation button.active {
      color: #1976d2;
      border-bottom-color: #1976d2;
      font-weight: 600;
    }

    .tab-content {
      padding: 1.5rem;
      min-height: 400px;
    }

    .tab-panel {
      width: 100%;
    }

    .empty-state {
      text-align: center;
      padding: 3rem;
      color: #999;
      font-style: italic;
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
