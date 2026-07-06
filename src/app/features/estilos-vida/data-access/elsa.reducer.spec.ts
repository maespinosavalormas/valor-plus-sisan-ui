import { elsaReducer } from './elsa.reducer';
import { initialState } from './elsa.state';
import * as fromActions from './elsa.actions';
import { PatientResponse, ELSAFormResponse } from './elsa.contracts';

const patient: PatientResponse = {
  id: 'p1',
  document: '123',
  fullName: 'Juan',
  sex: 'M',
  birthDate: '1990-01-01',
  age: 36,
  status: 'ACTIVO',
};

const response: ELSAFormResponse = {
  id: 'e1',
  patient_id: 'p1',
  evaluation_date: '2026-07-03',
  alim_total_portions_day: 3,
  af_mets_total: 1680,
  alcohol_audit_score: 3,
  risk_profile: {
    nutrition: { classification: 'RISK', label: 'test', threshold: '<5' },
    physical_activity: { classification: 'MODERADO', label: 'test', mets: 1680, range: '600-3000' },
    alcohol: { classification: 'RISK', label: 'test', threshold: 'M>=4' },
  },
  created_at: '2026-07-03T14:30:00Z',
  created_by_username: 'test@x.gov.co',
};

describe('elsaReducer', () => {
  it('initial state correcto', () => {
    expect(initialState.patient).toBeNull();
    expect(initialState.searchLoading).toBe(false);
  });

  it('buscarPaciente activa loading y limpia error', () => {
    const state = elsaReducer(
      { ...initialState, searchError: 'prev' },
      fromActions.buscarPaciente({ document: '123' }),
    );
    expect(state.searchLoading).toBe(true);
    expect(state.searchError).toBeNull();
  });

  it('buscarPacienteExito setea patient', () => {
    const state = elsaReducer(initialState, fromActions.buscarPacienteExito({ patient }));
    expect(state.patient).toEqual(patient);
    expect(state.searchLoading).toBe(false);
  });

  it('buscarPacienteExito acepta null', () => {
    const state = elsaReducer(initialState, fromActions.buscarPacienteExito({ patient: null }));
    expect(state.patient).toBeNull();
  });

  it('buscarPacienteError setea error', () => {
    const state = elsaReducer(initialState, fromActions.buscarPacienteError({ error: 'oops' }));
    expect(state.searchError).toBe('oops');
    expect(state.searchLoading).toBe(false);
  });

  it('actualizarDraft mergea draft', () => {
    const state = elsaReducer(
      initialState,
      fromActions.actualizarDraft({ draft: { patient_id: 'p1' } }),
    );
    expect(state.draft).toEqual({ patient_id: 'p1' });
  });

  it('restaurarDraft reemplaza draft', () => {
    const state0 = elsaReducer(initialState, fromActions.actualizarDraft({ draft: { patient_id: 'a' } }));
    const state = elsaReducer(state0, fromActions.restaurarDraft({ draft: { patient_id: 'b' } }));
    expect(state.draft).toEqual({ patient_id: 'b' });
  });

  it('limpiarDraft limpia draft', () => {
    const state0 = elsaReducer(initialState, fromActions.actualizarDraft({ draft: { patient_id: 'a' } }));
    expect(elsaReducer(state0, fromActions.limpiarDraft()).draft).toBeNull();
  });

  it('crearELSA → exito setea response y limpia draft', () => {
    const loading = elsaReducer(initialState, fromActions.crearELSA({ dto: {} as any }));
    expect(loading.createLoading).toBe(true);
    const done = elsaReducer(loading, fromActions.crearELSAExito({ response }));
    expect(done.response).toEqual(response);
    expect(done.createLoading).toBe(false);
    expect(done.draft).toBeNull();
  });

  it('crearELSAError setea error', () => {
    const state = elsaReducer(initialState, fromActions.crearELSAError({ error: 'fail' }));
    expect(state.createError).toBe('fail');
    expect(state.createLoading).toBe(false);
  });

  it('cargarELSA → exito setea response', () => {
    const loading = elsaReducer(initialState, fromActions.cargarELSA({ id: 'e1' }));
    expect(loading.detailLoading).toBe(true);
    const done = elsaReducer(loading, fromActions.cargarELSAExito({ response }));
    expect(done.response).toEqual(response);
    expect(done.detailLoading).toBe(false);
  });

  it('cargarELSAError setea detailError', () => {
    const state = elsaReducer(initialState, fromActions.cargarELSAError({ error: 'nf' }));
    expect(state.detailError).toBe('nf');
  });

  it('limpiarEstado descarta a initialState', () => {
    const dirty = elsaReducer(initialState, fromActions.actualizarDraft({ draft: { x: 1 } as any }));
    expect(elsaReducer(dirty, fromActions.limpiarEstado())).toEqual(initialState);
  });
});