import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { MnaExpedienteService, CalculatedMetrics, FollowupPaginationResult } from './mna-expediente.service';
import { environment } from '../../../../environments/environment';

describe('MnaExpedienteService', () => {
  let service: MnaExpedienteService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        MnaExpedienteService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(MnaExpedienteService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getExpediente', () => {
    it('should return MNA expediente data', (done) => {
      const mnaId = 'test-mna-id';
      const tenantId = 'tenant-1';
      const token = 'test-token';

      service.getExpediente(mnaId, tenantId, token).subscribe((data) => {
        expect(data.mna.id).toBe(mnaId);
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/v1/mna/${mnaId}/expediente`);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${token}`);
      expect(req.request.headers.get('X-Tenant-ID')).toBe(tenantId);

      req.flush({
        mna: { id: mnaId, score_total: 26 },
        patient: { nombre: 'Juan', apellido: 'Pérez' },
      });
    });
  });

  describe('getMetrics', () => {
    it('should return calculated WHO metrics', (done) => {
      const mnaId = 'test-mna-id';
      const tenantId = 'tenant-1';
      const token = 'test-token';

      service.getMetrics(mnaId, tenantId, token).subscribe((metrics) => {
        expect(metrics.riesgo_sarcopenia_calculado).toBeDefined();
        expect(metrics.porcentaje_ingesta_icdi).toBeTypeOf('number');
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/v1/mna/${mnaId}/metrics`);
      expect(req.request.method).toBe('GET');

      req.flush({
        riesgo_sarcopenia_calculado: 'Sin Riesgo',
        riesgo_sarcopenia_color: 'verde',
        porcentaje_ingesta_icdi: 89,
        clasificacion_ingesta: 'Ingesta Adecuada',
        clasificacion_ingesta_color: 'verde',
      });
    });
  });

  describe('getAuditTrail', () => {
    it('should return audit trail entries', (done) => {
      const mnaId = 'test-mna-id';
      const tenantId = 'tenant-1';
      const token = 'test-token';

      service.getAuditTrail(mnaId, tenantId, token).subscribe((entries) => {
        expect(Array.isArray(entries)).toBe(true);
        expect(entries.length).toBe(1);
        expect(entries[0].campo_modificado).toBe('score_total');
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/v1/mna/${mnaId}/audit-trail`);
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
    });
  });

  describe('getFollowups', () => {
    it('should return paginated followups', (done) => {
      const mnaId = 'test-mna-id';
      const tenantId = 'tenant-1';
      const token = 'test-token';
      const page = 1;
      const limit = 10;

      service.getFollowups(mnaId, tenantId, token, page, limit).subscribe((result) => {
        expect(result.followups.length).toBe(1);
        expect(result.total).toBe(5);
        expect(result.hasMore).toBe(true);
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/v1/mna/${mnaId}/followups?page=${page}&limit=${limit}`);
      expect(req.request.method).toBe('GET');

      req.flush({
        followups: [{ id: 'fu-1', seg_tipo_comentario: 'Nota Clínica', seg_comentario_texto: 'Test', created_at: new Date() }],
        total: 5,
        page: 1,
        limit: 10,
        hasMore: true,
      });
    });
  });

  describe('createFollowup', () => {
    it('should create followup with multipart form data', (done) => {
      const mnaId = 'test-mna-id';
      const tenantId = 'tenant-1';
      const token = 'test-token';
      const tipo = 'Nota Clínica';
      const comentario = 'Comentario de prueba con más de 15 caracteres';

      service.createFollowup(mnaId, tenantId, token, tipo as any, comentario).subscribe((entry) => {
        expect(entry.id).toBeDefined();
        expect(entry.seg_tipo_comentario).toBe(tipo);
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/v1/mna/${mnaId}/followups`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body instanceof FormData).toBe(true);

      const formData = req.request.body as FormData;
      expect(formData.get('seg_tipo_comentario')).toBe(tipo);
      expect(formData.get('seg_comentario_texto')).toBe(comentario);

      req.flush({
        id: 'new-followup-id',
        seg_tipo_comentario: tipo,
        seg_comentario_texto: comentario,
        created_at: new Date(),
      });
    });
  });

  describe('getDownloadUrl', () => {
    it('should return presigned download URL', (done) => {
      const mnaId = 'test-mna-id';
      const followupId = 'followup-123';
      const tenantId = 'tenant-1';
      const token = 'test-token';

      service.getDownloadUrl(mnaId, followupId, tenantId, token).subscribe((result) => {
        expect(result.url).toContain('s3.amazonaws.com');
        expect(result.expires_in).toBe(180);
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/v1/mna/${mnaId}/followups/${followupId}/download`);
      expect(req.request.method).toBe('GET');

      req.flush({
        url: 'https://s3.amazonaws.com/bucket/file.pdf?expires=180',
        expires_in: 180,
      });
    });
  });
});
