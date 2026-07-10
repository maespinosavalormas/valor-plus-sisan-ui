import {
  selectTamizajesState,
  selectExpediente,
  selectMenor,
  selectSerie,
  selectTamizajes,
  selectTamizajesLoading,
  selectTamizajesSaving,
  selectTamizajesError,
  selectTamizajesNotFound,
  selectEditingTamizaje,
  selectSugerenciaRecuperacion,
  selectCasoRecuperado,
} from './tamizajes.selectors';
import { TamizajesState } from './tamizajes.state';

const state: { tamizajes: TamizajesState } = {
  tamizajes: {
    expediente: {
      menor: {
        menorId: 'm1',
        nombre: 'Ana',
        fechaNacimiento: '2020-01-01',
        edadActualMeses: 24,
        sexo: 'F',
        estadoCaso: 'RECUPERADO',
      },
      serie: [{ fechaTamizaje: '2024-01-01', zScorePt: -1 }],
    },
    tamizajes: [],
    serie: [],
    loading: true,
    saving: false,
    error: 'x',
    notFound: false,
    editingTamizaje: null,
    sugerenciaRecuperacion: true,
  },
};

describe('tamizajes selectors', () => {
  it('selectTamizajesState', () => {
    expect(selectTamizajesState(state)).toBe(state.tamizajes);
  });

  it('selectExpediente y selectMenor', () => {
    expect(selectExpediente(state)?.menor.nombre).toBe('Ana');
    expect(selectMenor(state)?.estadoCaso).toBe('RECUPERADO');
  });

  it('flags y colecciones', () => {
    expect(selectSerie(state)).toEqual([]);
    expect(selectTamizajes(state)).toEqual([]);
    expect(selectTamizajesLoading(state)).toBe(true);
    expect(selectTamizajesSaving(state)).toBe(false);
    expect(selectTamizajesError(state)).toBe('x');
    expect(selectTamizajesNotFound(state)).toBe(false);
    expect(selectEditingTamizaje(state)).toBeNull();
    expect(selectSugerenciaRecuperacion(state)).toBe(true);
  });

  it('selectCasoRecuperado', () => {
    expect(selectCasoRecuperado(state)).toBe(true);
  });
});
