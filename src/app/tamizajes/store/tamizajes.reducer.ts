import { createReducer, on } from '@ngrx/store';
import * as TamizajesActions from './tamizajes.actions';
import { initialTamizajesState } from './tamizajes.state';

export const tamizajesReducer = createReducer(
  initialTamizajesState,
  on(TamizajesActions.loadExpediente, (state) => ({
    ...state,
    loading: true,
    error: null,
    notFound: false,
  })),
  on(TamizajesActions.loadExpedienteSuccess, (state, { expediente, tamizajes }) => ({
    ...state,
    loading: false,
    expediente,
    tamizajes,
    serie: expediente.serie,
    error: null,
    notFound: false,
  })),
  on(TamizajesActions.loadExpedienteFailure, (state, { error, notFound }) => ({
    ...state,
    loading: false,
    error,
    notFound: !!notFound,
    expediente: null,
  })),
  on(TamizajesActions.createTamizaje, (state) => ({
    ...state,
    saving: true,
    error: null,
  })),
  on(TamizajesActions.createTamizajeSuccess, (state, { tamizaje, sugerenciaRecuperacion, serie }) => ({
    ...state,
    saving: false,
    tamizajes: [...state.tamizajes, tamizaje].sort(
      (a, b) => new Date(a.fechaTamizaje).getTime() - new Date(b.fechaTamizaje).getTime()
    ),
    serie,
    sugerenciaRecuperacion,
    editingTamizaje: null,
  })),
  on(TamizajesActions.createTamizajeFailure, (state, { error }) => ({
    ...state,
    saving: false,
    error,
  })),
  on(TamizajesActions.updateTamizaje, (state) => ({
    ...state,
    saving: true,
    error: null,
  })),
  on(TamizajesActions.updateTamizajeSuccess, (state, { tamizaje, curvaRecalculada }) => ({
    ...state,
    saving: false,
    tamizajes: state.tamizajes
      .map((t) => (t.id === tamizaje.id ? tamizaje : t))
      .sort((a, b) => new Date(a.fechaTamizaje).getTime() - new Date(b.fechaTamizaje).getTime()),
    serie: curvaRecalculada,
    editingTamizaje: null,
  })),
  on(TamizajesActions.updateTamizajeFailure, (state, { error }) => ({
    ...state,
    saving: false,
    error,
  })),
  on(TamizajesActions.setEditingTamizaje, (state, { tamizaje }) => ({
    ...state,
    editingTamizaje: tamizaje,
  })),
  on(TamizajesActions.clearTamizajesError, (state) => ({
    ...state,
    error: null,
  }))
);
