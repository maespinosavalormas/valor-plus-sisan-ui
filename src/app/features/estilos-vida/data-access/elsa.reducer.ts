import { createReducer, on } from '@ngrx/store';
import * as fromActions from './elsa.actions';
import { ElsaState, initialState } from './elsa.state';

export const elsaReducer = createReducer(
  initialState,

  // Búsqueda paciente
  on(fromActions.buscarPaciente, (state) => ({
    ...state,
    searchLoading: true,
    searchError: null,
  })),
  on(fromActions.buscarPacienteExito, (state, { patient }) => ({
    ...state,
    patient,
    searchLoading: false,
  })),
  on(fromActions.buscarPacienteError, (state, { error }) => ({
    ...state,
    searchLoading: false,
    searchError: error,
  })),

  // Draft (EE-02)
  on(fromActions.actualizarDraft, (state, { draft }) => ({
    ...state,
    draft: { ...state.draft, ...draft },
  })),
  on(fromActions.restaurarDraft, (state, { draft }) => ({
    ...state,
    draft,
  })),
  on(fromActions.limpiarDraft, (state) => ({ ...state, draft: null })),

  // Crear
  on(fromActions.crearELSA, (state) => ({
    ...state,
    createLoading: true,
    createError: null,
  })),
  on(fromActions.crearELSAExito, (state, { response }) => ({
    ...state,
    response,
    createLoading: false,
    draft: null,
  })),
  on(fromActions.crearELSAError, (state, { error }) => ({
    ...state,
    createLoading: false,
    createError: error,
  })),

  // Cargar detalle
  on(fromActions.cargarELSA, (state) => ({
    ...state,
    detailLoading: true,
    detailError: null,
  })),
  on(fromActions.cargarELSAExito, (state, { response }) => ({
    ...state,
    response,
    detailLoading: false,
  })),
  on(fromActions.cargarELSAError, (state, { error }) => ({
    ...state,
    detailLoading: false,
    detailError: error,
  })),

  // Cargar lista (HU-003)
  on(fromActions.cargarListaELSA, (state, { query }) => ({
    ...state,
    listLoading: true,
    listError: null,
    listQuery: query,
  })),
  on(fromActions.cargarListaELSAExito, (state, { response }) => ({
    ...state,
    list: response.data,
    listMeta: response.meta,
    listLoading: false,
  })),
  on(fromActions.cargarListaELSAError, (state, { error }) => ({
    ...state,
    listLoading: false,
    listError: error,
  })),

  on(fromActions.limpiarEstado, () => initialState),
);