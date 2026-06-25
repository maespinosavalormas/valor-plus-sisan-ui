import { tamizajesReducer } from './tamizajes.reducer';
import { initialTamizajesState } from './tamizajes.state';
import * as TamizajesActions from './tamizajes.actions';

const tamizaje = {
  id: 't1',
  casoId: '1',
  menorId: 'm1',
  fechaTamizaje: '2024-01-01',
  pesoKg: 8,
  tallaCm: 70,
  tallaCmAjustada: 70,
  tallaMedicion: 'L' as const,
  perimetroBraquialCm: 11,
  edemaBilateral: 0 as const,
  edadDias: 500,
  sexoSnapshot: 'M' as const,
  zScorePt: -1,
  zScorePe: -1,
  zScoreTe: -1,
  clasificacionPt: 'MODERADA' as const,
  criterioRecuperacionCumplido: false,
  bivFlag: false,
  motivoEdicion: null,
  presentaSignosVitales: null,
  fuenteDato: 'WEB' as const,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

describe('tamizajesReducer', () => {
  it('loadExpediente pone loading=true', () => {
    const state = tamizajesReducer(
      initialTamizajesState,
      TamizajesActions.loadExpediente({ casoId: '1' }),
    );
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('loadExpedienteSuccess guarda expediente y tamizajes', () => {
    const expediente = {
      menor: {
        menorId: 'm1',
        nombre: 'A',
        fechaNacimiento: '2020-01-01',
        edadActualMeses: 24,
        sexo: 'M' as const,
        estadoCaso: 'ACTIVO' as const,
      },
      serie: [],
    };
    const state = tamizajesReducer(
      initialTamizajesState,
      TamizajesActions.loadExpedienteSuccess({ expediente, tamizajes: [tamizaje] }),
    );
    expect(state.loading).toBe(false);
    expect(state.tamizajes).toHaveLength(1);
  });

  it('createTamizajeSuccess ordena por fecha', () => {
    const t2 = { ...tamizaje, id: 't2', fechaTamizaje: '2024-06-01' };
    const state = tamizajesReducer(
      { ...initialTamizajesState, tamizajes: [t2] },
      TamizajesActions.createTamizajeSuccess({
        tamizaje,
        sugerenciaRecuperacion: false,
        serie: [],
      }),
    );
    expect(state.tamizajes[0].id).toBe('t1');
    expect(state.tamizajes[1].id).toBe('t2');
  });

  it('updateTamizajeSuccess reemplaza tamizaje y serie', () => {
    const updated = { ...tamizaje, pesoKg: 9 };
    const state = tamizajesReducer(
      { ...initialTamizajesState, tamizajes: [tamizaje] },
      TamizajesActions.updateTamizajeSuccess({
        tamizaje: updated,
        curvaRecalculada: [{
          fecha: '2024-01-01',
          zScorePt: -0.5,
          clasificacionPt: 'MODERADA',
          pesoKg: 9,
          tallaCm: 70,
        }],
      }),
    );
    expect(state.tamizajes[0].pesoKg).toBe(9);
    expect(state.serie).toHaveLength(1);
  });

  it('loadExpedienteFailure marca notFound', () => {
    const state = tamizajesReducer(
      initialTamizajesState,
      TamizajesActions.loadExpedienteFailure({ error: '404', notFound: true }),
    );
    expect(state.notFound).toBe(true);
    expect(state.expediente).toBeNull();
  });

  it('createTamizaje y failures', () => {
    let state = tamizajesReducer(
      initialTamizajesState,
      TamizajesActions.createTamizaje({ casoId: '1', dto: {} as never }),
    );
    expect(state.saving).toBe(true);
    state = tamizajesReducer(
      state,
      TamizajesActions.createTamizajeFailure({ error: 'err' }),
    );
    expect(state.saving).toBe(false);
    expect(state.error).toBe('err');
  });

  it('updateTamizaje pone saving=true', () => {
    const state = tamizajesReducer(
      initialTamizajesState,
      TamizajesActions.updateTamizaje({ id: 't1', dto: {} as never }),
    );
    expect(state.saving).toBe(true);
  });

  it('updateTamizajeFailure resetea saving', () => {
    const state = tamizajesReducer(
      { ...initialTamizajesState, saving: true },
      TamizajesActions.updateTamizajeFailure({ error: 'x' }),
    );
    expect(state.saving).toBe(false);
  });

  it('setEditingTamizaje y clearTamizajesError', () => {
    let state = tamizajesReducer(
      initialTamizajesState,
      TamizajesActions.setEditingTamizaje({ tamizaje }),
    );
    expect(state.editingTamizaje?.id).toBe('t1');
    state = tamizajesReducer(
      { ...state, error: 'err' },
      TamizajesActions.clearTamizajesError(),
    );
    expect(state.error).toBeNull();
  });
});
