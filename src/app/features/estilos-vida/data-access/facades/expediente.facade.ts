import { Injectable, signal, computed, inject } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MnaExpedienteService, MnaExpedienteData, CalculatedMetrics, AuditTrailEntry, FollowupEntry, FollowupPaginationResult } from '../services/mna-expediente.service';
import { JwtService } from '../../../../core/services/jwt.service';
import { environment } from '../../../../../environments/environment';

export type TabType = 'tab1' | 'tab2' | 'tab3' | 'tab4';

@Injectable({
  providedIn: 'root',
})
export class ExpedienteFacade {
  private mnaService = inject(MnaExpedienteService);
  private jwtService = inject(JwtService);

  // Signals de estado
  private mnaDataSignal = signal<MnaExpedienteData | null>(null);
  private metricsSignal = signal<CalculatedMetrics | null>(null);
  private auditTrailSignal = signal<AuditTrailEntry[]>([]);
  private followupsSignal = signal<FollowupEntry[]>([]);
  private paginationSignal = signal<{ total: number; page: number; limit: number; hasMore: boolean }>({
    total: 0,
    page: 1,
    limit: 10,
    hasMore: false,
  });
  private loadingSignal = signal<Record<TabType, boolean>>({
    tab1: false,
    tab2: false,
    tab3: false,
    tab4: false,
  });
  private errorSignal = signal<string | null>(null);

  // Computed signals para cada tab
  readonly mnaData = this.mnaDataSignal;
  readonly metrics = this.metricsSignal;
  readonly auditTrail = this.auditTrailSignal;
  readonly followups = this.followupsSignal;
  readonly pagination = this.paginationSignal;
  readonly loading = this.loadingSignal;
  readonly error = this.errorSignal;

  /**
   * Cargar datos del Tab 1 (expendiente + patient)
   * Los datos se cachean — no se re-solicitan al cambiar de tab
   */
  async loadExpediente(mnaId: string): Promise<void> {
    this.setLoading('tab1', true);
    this.clearError();

    try {
      const tenantId = this.jwtService.getTenantId() || environment.defaultTenantId;
      const token = this.jwtService.getToken();

      if (!token) {
        throw new Error('No authentication token found');
      }

      const data = await this.mnaService.getExpediente(mnaId, tenantId, token).toPromise();
      this.mnaDataSignal.set(data ?? null);
    } catch (err: any) {
      this.errorSignal.set(err?.message || 'Error al cargar expediente');
    } finally {
      this.setLoading('tab1', false);
    }
  }

  /**
   * Calcular métricas WHO (Tab 2 - Diagnóstico)
   * On-demand, no se cachea automáticamente
   */
  async loadMetrics(mnaId: string): Promise<void> {
    this.setLoading('tab2', true);
    this.clearError();

    try {
      const tenantId = this.jwtService.getTenantId() || environment.defaultTenantId;
      const token = this.jwtService.getToken();

      if (!token) {
        throw new Error('No authentication token found');
      }

      const metrics = await this.mnaService.getMetrics(mnaId, tenantId, token).toPromise();
      this.metricsSignal.set(metrics ?? null);
    } catch (err: any) {
      this.errorSignal.set(err?.message || 'Error al calcular métricas');
    } finally {
      this.setLoading('tab2', false);
    }
  }

  /**
   * Cargar audit trail (Tab 3 - Trazabilidad)
   */
  async loadAuditTrail(mnaId: string): Promise<void> {
    this.setLoading('tab3', true);
    this.clearError();

    try {
      const tenantId = this.jwtService.getTenantId() || environment.defaultTenantId;
      const token = this.jwtService.getToken();

      if (!token) {
        throw new Error('No authentication token found');
      }

      const trail = await this.mnaService.getAuditTrail(mnaId, tenantId, token).toPromise();
      this.auditTrailSignal.set(trail ?? []);
    } catch (err: any) {
      this.errorSignal.set(err?.message || 'Error al cargar trazabilidad');
    } finally {
      this.setLoading('tab3', false);
    }
  }

  /**
   * Cargar seguimientos paginados (Tab 4 - Seguimiento)
   */
  async loadFollowups(mnaId: string, page: number = 1, limit: number = 10): Promise<void> {
    this.setLoading('tab4', true);
    this.clearError();

    try {
      const tenantId = this.jwtService.getTenantId() || environment.defaultTenantId;
      const token = this.jwtService.getToken();

      if (!token) {
        throw new Error('No authentication token found');
      }

      const result = await this.mnaService.getFollowups(mnaId, tenantId, token, page, limit).toPromise();
      
      if (page === 1) {
        this.followupsSignal.set(result?.followups ?? []);
      } else {
        this.followupsSignal.set([...this.followupsSignal(), ...(result?.followups ?? [])]);
      }
      
      this.paginationSignal.set({
        total: result?.total ?? 0,
        page: result?.page ?? 1,
        limit: result?.limit ?? 10,
        hasMore: result?.hasMore ?? false,
      });
    } catch (err: any) {
      this.errorSignal.set(err?.message || 'Error al cargar seguimientos');
    } finally {
      this.setLoading('tab4', false);
    }
  }

  /**
   * Crear nuevo seguimiento (Tab 4)
   */
  async createFollowup(
    mnaId: string,
    tipo: 'Nota Clínica' | 'Plan de Intervención' | 'Alerta Médica' | 'Observación Nutricional' | 'Interconsulta',
    comentario: string,
    file?: File,
  ): Promise<FollowupEntry> {
    this.clearError();

    try {
      const tenantId = this.jwtService.getTenantId() || environment.defaultTenantId;
      const token = this.jwtService.getToken();

      if (!token) {
        throw new Error('No authentication token found');
      }

      const entry = await this.mnaService.createFollowup(mnaId, tenantId, token, tipo, comentario, file).toPromise();
      
      // Refrescar lista
      const currentFollowups = this.followupsSignal();
      this.followupsSignal.set([entry!, ...currentFollowups]);
      
      return entry;
    } catch (err: any) {
      this.errorSignal.set(err?.message || 'Error al guardar seguimiento');
      throw err;
    }
  }

  /**
   * Cargar más seguimientos (infinite scroll)
   */
  async loadMoreFollowups(mnaId: string): Promise<void> {
    const currentPagination = this.paginationSignal();
    if (!currentPagination.hasMore) return;

    await this.loadFollowups(mnaId, currentPagination.page + 1, currentPagination.limit);
  }

  /**
   * Limpiar todo el estado
   */
  clear(): void {
    this.mnaDataSignal.set(null);
    this.metricsSignal.set(null);
    this.auditTrailSignal.set([]);
    this.followupsSignal.set([]);
    this.paginationSignal.set({ total: 0, page: 1, limit: 10, hasMore: false });
    this.errorSignal.set(null);
  }

  private setLoading(tab: TabType, value: boolean): void {
    const current = this.loadingSignal();
    this.loadingSignal.set({ ...current, [tab]: value });
  }

  private clearError(): void {
    this.errorSignal.set(null);
  }
}
