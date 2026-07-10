import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ElsaService } from './elsa.service';
import { environment } from '../../../../environments/environment';
import { CreateELSAFormDto } from './elsa.contracts';

describe('ElsaService', () => {
  let service: ElsaService;
  let httpMock: HttpTestingController;

  const apiUrl = `${environment.apiUrl}/estilos-vida`;
  const pacientesUrl = `${environment.apiUrl}/pacientes`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ElsaService],
    });
    service = TestBed.inject(ElsaService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('searchPatients', () => {
    it('should call GET /pacientes/search with document and status=ACTIVO', () => {
      const document = '12345678';
      const mockResponse = {
        data: [
          { id: 'p1', document, fullName: 'Ana López', sex: 'F' as const, birthDate: '1996-01-01', age: 30, status: 'ACTIVO' as const },
        ],
        status: 200,
      };

      service.searchPatients(document).subscribe((res) => {
        expect(res.data.length).toBe(1);
        expect(res.data[0].document).toBe(document);
      });

      const req = httpMock.expectOne(
        (r) => r.url === `${pacientesUrl}/search` && r.params.get('document') === document && r.params.get('status') === 'ACTIVO',
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('createELSA', () => {
    it('should POST to /estilos-vida/elsa with idempotency key', () => {
      const dto: CreateELSAFormDto = {
        patient_id: 'p1',
        evaluation_date: '2026-07-03',
        alim_fruits_days: 5,
        alim_fruits_portions: 2,
        alim_vegetables_days: 7,
        alim_vegetables_portions: 3,
        alim_salt_added: false,
        af_vigorous_days: 3,
        af_vigorous_min: 60,
        af_moderate_days: 2,
        af_moderate_min: 30,
        af_sedentary_min: 120,
        tobacco_current: false,
        tobacco_start_age: null,
        tobacco_cigs_day: null,
        alcohol_frequency: 2,
        alcohol_quantity: 1,
        alcohol_binge: 0,
      };

      const mockResponse = {
        data: {
          id: 'e1',
          patient_id: dto.patient_id,
          evaluation_date: dto.evaluation_date,
          alim_total_portions_day: 3,
          af_mets_total: 1680,
          alcohol_audit_score: 3,
          risk_profile: {
            nutrition: { classification: 'RISK' as const, label: 'Bajo consumo', threshold: '< 5', total: 3 },
            physical_activity: { classification: 'MODERADO' as const, label: 'Moderado', mets: 1680, range: '600-3000' },
            alcohol: { classification: 'RISK' as const, label: 'Riesgo', threshold: 'Mujer >=3', score: 3 },
          },
          created_at: '2026-07-03T14:30:00Z',
          created_by_username: 'user@test.com',
        },
        status: 201,
      };

      service.createELSA(dto).subscribe((res) => {
        expect(res.data.id).toBe('e1');
        expect(res.status).toBe(201);
      });

      const req = httpMock.expectOne(`${apiUrl}/elsa`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body.idempotency_key).toBeDefined();
      req.flush(mockResponse);
    });
  });

  describe('getELSA', () => {
    it('should GET /estilos-vida/elsa/:id', () => {
      const id = 'e1';
      service.getELSA(id).subscribe((res) => {
        expect(res.data.id).toBe(id);
      });

      const req = httpMock.expectOne(`${apiUrl}/elsa/${id}`);
      expect(req.request.method).toBe('GET');
      req.flush({
        data: {
          id,
          patient_id: 'p1',
          evaluation_date: '2026-07-03',
          alim_total_portions_day: 3,
          af_mets_total: 1680,
          alcohol_audit_score: 3,
          risk_profile: {
            nutrition: { classification: 'RISK', label: 'Bajo consumo', threshold: '< 5', total: 3 },
            physical_activity: { classification: 'MODERADO', label: 'Moderado', mets: 1680, range: '600-3000' },
            alcohol: { classification: 'RISK', label: 'Riesgo', threshold: 'Mujer >=3', score: 3 },
          },
          created_at: '2026-07-03T14:30:00Z',
          created_by_username: 'user@test.com',
        },
        status: 200,
      });
    });
  });
});
