import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ExpedienteFacade } from './expediente.facade';
import { MnaExpedienteService } from '../services/mna-expediente.service';
import { JwtService } from '../../../../core/services/jwt.service';

describe('ExpedienteFacade', () => {
  let facade: ExpedienteFacade;
  let httpMock: HttpTestingController;
  let mockJwtService: jasmine.SpyObj<JwtService>;

  beforeEach(() => {
    const jwtSpy = jasmine.createSpyObj('JwtService', ['getTenantId', 'getToken']);
    jwtSpy.getTenantId.and.returnValue('tenant-1');
    jwtSpy.getToken.and.returnValue('test-token');

    TestBed.configureTestingModule({
      providers: [
        ExpedienteFacade,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: JwtService, useValue: jwtSpy },
      ],
    });

    facade = TestBed.inject(ExpedienteFacade);
    httpMock = TestBed.inject(HttpTestingController);
    mockJwtService = TestBed.inject(JwtService) as any;
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('loadExpediente', () => {
    it('should load MNA expediente data', async () => {
      await facade.loadExpediente('mna-id-123').toPromise();

      const req = httpMock.expectOne(`${environment.apiUrl}/v1/mna/mna-id-123/expediente`);
      expect(req.request.method).toBe('GET');

      req.flush({
        mna: { id: 'mna-id-123', score_total: 26 },
        patient: { nombre: 'Juan', apellido: 'Pérez' },
      });

      expect(facade.mnaData()).toBeTruthy();
      expect(facade.mnaData()!.mna.id).toBe('mna-id-123');
    });

    it('should set loading state during request', async () => {
      await facade.loadExpediente('mna-id-123').toPromise();

      // Loading should be false after completion
      expect(facade.loading().tab1).toBeFalse();
    });

    it('should handle error when API fails', async () => {
      await facade.loadExpediente('invalid-id').toPromise().catch(() => {});

      const req = httpMock.expectOne(`${environment.apiUrl}/v1/mna/invalid-id/expediente`);
      req.error(new ProgressEvent('error'));

      expect(facade.error()).toBeTruthy();
    });
  });

  describe('loadMetrics', () => {
    it('should calculate WHO metrics', async () => {
      await facade.loadMetrics('mna-id-123').toPromise();

      const req = httpMock.expectOne(`${environment.apiUrl}/v1/mna/mna-id-123/metrics`);
      expect(req.request.method).toBe('GET');

      req.flush({
        riesgo_sarcopenia_calculado: 'Sin Riesgo',
        riesgo_sarcopenia_color: 'verde',
        porcentaje_ingesta_icdi: 89,
        clasificacion_ingesta: 'Ingesta Adecuada',
        clasificacion_ingesta_color: 'verde',
      });

      expect(facade.metrics()).toBeTruthy();
      expect(facade.metrics()!.riesgo_sarcopenia_calculado).toBe('Sin Riesgo');
    });
  });

  describe('loadAuditTrail', () => {
    it('should load audit trail entries', async () => {
      await facade.loadAuditTrail('mna-id-123').toPromise();

      const req = httpMock.expectOne(`${environment.apiUrl}/v1/mna/mna-id-123/audit-trail`);
      expect(req.request.method).toBe('GET');

      req.flush([
        {
          id: 'audit-1',
          campo_modificado: 'score_total',
          valor_original: '20',
          valor_nuevo: '24',
          justificacion: 'Reevaluación',
          usuario_modificador: 'user-1',
          created_at: new Date().toISOString(),
        },
      ]);

      expect(facade.auditTrail().length).toBe(1);
    });
  });

  describe('loadFollowups', () => {
    it('should load paginated followups', async () => {
      await facade.loadFollowups('mna-id-123', 1, 10).toPromise();

      const req = httpMock.expectOne(`${environment.apiUrl}/v1/mna/mna-id-123/followups?page=1&limit=10`);
      expect(req.request.method).toBe('GET');

      req.flush({
        followups: [
          { id: 'fu-1', seg_tipo_comentario: 'Nota Clínica', seg_comentario_texto: 'Test', created_at: new Date() },
        ],
        total: 5,
        page: 1,
        limit: 10,
        hasMore: true,
      });

      expect(facade.followups().length).toBe(1);
      expect(facade.pagination().total).toBe(5);
      expect(facade.pagination().hasMore).toBeTrue();
    });
  });

  describe('createFollowup', () => {
    it('should create a new followup and refresh list', async () => {
      await facade.createFollowup('mna-id-123', 'Nota Clínica', 'Comentario de prueba válido aquí');

      const req = httpMock.expectOne(`${environment.apiUrl}/v1/mna/mna-id-123/followups`);
      expect(req.request.method).toBe('POST');

      req.flush({
        id: 'new-fu-id',
        seg_tipo_comentario: 'Nota Clínica',
        seg_comentario_texto: 'Comentario de prueba válido aquí',
        created_at: new Date(),
      });

      expect(facade.followups().length).toBe(1);
      expect(facade.followups()[0].seg_tipo_comentario).toBe('Nota Clínica');
    });
  });

  describe('clear', () => {
    it('should reset all state', () => {
      facade.mnaData.set({ mna: { id: 'test' } as any, patient: undefined });
      facade.metrics.set({} as any);
      facade.auditTrail.set([{ id: 'test' } as any]);
      facade.followups.set([{ id: 'test' } as any]);

      facade.clear();

      expect(facade.mnaData()).toBeNull();
      expect(facade.metrics()).toBeNull();
      expect(facade.auditTrail()).toEqual([]);
      expect(facade.followups()).toEqual([]);
      expect(facade.error()).toBeNull();
    });
  });
});
