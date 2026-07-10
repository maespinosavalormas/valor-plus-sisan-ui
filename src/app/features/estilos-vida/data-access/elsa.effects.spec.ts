import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of, throwError } from 'rxjs';
import { ElsaEffects } from './elsa.effects';
import { ElsaService } from './elsa.service';
import * as actions from './elsa.actions';
import { PatientResponse, CreateELSAFormDto, ELSAFormResponse } from './elsa.contracts';

describe('ElsaEffects', () => {
  let actions$: Observable<any>;
  let effects: ElsaEffects;
  let serviceSpy: any;

  const patient: PatientResponse = {
    id: 'p1',
    document: '12345678',
    fullName: 'Ana López',
    sex: 'F',
    birthDate: '1996-01-01',
    age: 30,
    status: 'ACTIVO',
  };

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

  const response: ELSAFormResponse = {
    id: 'e1',
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
  };

  beforeEach(() => {
    serviceSpy = {
      searchPatients: jest.fn(),
      createELSA: jest.fn(),
      getELSA: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        ElsaEffects,
        provideMockActions(() => actions$),
        { provide: ElsaService, useValue: serviceSpy },
      ],
    });

    effects = TestBed.inject(ElsaEffects);
  });

  describe('buscarPaciente$', () => {
    it('should return buscarPacienteExito with first patient on success', (done) => {
      serviceSpy.searchPatients.mockReturnValue(of({ data: [patient], status: 200 }));
      actions$ = of(actions.buscarPaciente({ document: '12345678' }));

      effects.buscarPaciente$.subscribe((result) => {
        expect(result).toEqual(actions.buscarPacienteExito({ patient }));
        done();
      });
    });

    it('should return buscarPacienteError on 503', (done) => {
      serviceSpy.searchPatients.mockReturnValue(throwError(() => ({ status: 503 })));
      actions$ = of(actions.buscarPaciente({ document: '12345678' }));

      effects.buscarPaciente$.subscribe((result) => {
        expect(result).toEqual(actions.buscarPacienteError({ error: 'Servicio de pacientes no disponible' }));
        done();
      });
    });
  });

  describe('crearELSA$', () => {
    it('should return crearELSAExito on success', (done) => {
      serviceSpy.createELSA.mockReturnValue(of({ data: response, status: 201 }));
      actions$ = of(actions.crearELSA({ dto }));

      effects.crearELSA$.subscribe((result) => {
        expect(result).toEqual(actions.crearELSAExito({ response }));
        done();
      });
    });

    it('should return crearELSAError on 403', (done) => {
      serviceSpy.createELSA.mockReturnValue(throwError(() => ({ status: 403 })));
      actions$ = of(actions.crearELSA({ dto }));

      effects.crearELSA$.subscribe((result) => {
        expect(result).toEqual(actions.crearELSAError({ error: 'No tiene permisos para crear ELSA' }));
        done();
      });
    });
  });

  describe('cargarELSA$', () => {
    it('should return cargarELSAExito on success', (done) => {
      serviceSpy.getELSA.mockReturnValue(of({ data: response, status: 200 }));
      actions$ = of(actions.cargarELSA({ id: 'e1' }));

      effects.cargarELSA$.subscribe((result) => {
        expect(result).toEqual(actions.cargarELSAExito({ response }));
        done();
      });
    });
  });
});
