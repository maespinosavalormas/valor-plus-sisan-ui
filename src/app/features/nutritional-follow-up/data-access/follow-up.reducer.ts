import { createReducer, on } from '@ngrx/store';
import * as fromActions from './follow-up.actions';
import {
  SeguimientoEvolutivo,
  ExpedienteEvolutivo,
  EstadoCaso,
} from './follow-up.contracts';

export interface FollowUpState {
  expediente: ExpedienteEvolutivo | null;
  seguimientos: SeguimientoEvolutivo[];
  seguimientoSeleccionado: SeguimientoEvolutivo | null;
  muroNextCursor: string | null;
  muroHasMore: boolean;
  filtroTipo: string | null;
  drafts: Record<string, { texto: string; timestamp: number }>; // EE-04
  loading: boolean;
  creating: boolean;
  changingStatus: boolean;
  error: string | null;
}

export const initialState: FollowUpState = {
  expediente: null,
  seguimientos: [],
  seguimientoSeleccionado: null,
  muroNextCursor: null,
  muroHasMore: false,
  filtroTipo: null,
  drafts: {},
  loading: false,
  creating: false,
  changingStatus: false,
  error: null,
};

export const followUpReducer = createReducer(
  initialState,

  // Cargar expediente
  on(fromActions.cargarExpediente, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(fromActions.cargarExpedienteExito, (state, { expediente }) => ({
    ...state,
    expediente,
    loading: false,
    error: null,
  })),
  on(fromActions.cargarExpedienteError, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Cargar muro
  on(fromActions.cargarMuro, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(fromActions.cargarMuroExito, (state, { seguimientos, nextCursor, hasMore }) => ({
    ...state,
    seguimientos,
    muroNextCursor: nextCursor,
    muroHasMore: hasMore,
    loading: false,
    error: null,
  })),
  on(fromActions.cargarMuroError, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Cargar más muro (append)
  on(fromActions.cargarMasMuro, (state) => ({
    ...state,
    loading: true,
  })),

  // Crear seguimiento
  on(fromActions.crearSeguimiento, (state) => ({
    ...state,
    creating: true,
    error: null,
  })),
  on(fromActions.crearSeguimientoExito, (state, { seguimiento }) => ({
    ...state,
    seguimientos: [seguimiento, ...state.seguimientos],
    creating: false,
    error: null,
  })),
  on(fromActions.crearSeguimientoError, (state, { error }) => ({
    ...state,
    creating: false,
    error,
  })),

  // Cambiar estado
  on(fromActions.cambiarEstado, (state) => ({
    ...state,
    changingStatus: true,
    error: null,
  })),
  on(fromActions.cambiarEstadoExito, (state, { resultado }) => ({
    ...state,
    changingStatus: false,
    expediente: state.expediente
      ? { ...state.expediente, estadoActual: resultado.estadoNuevo as EstadoCaso }
      : null,
    error: null,
  })),
  on(fromActions.cambiarEstadoError, (state, { error }) => ({
    ...state,
    changingStatus: false,
    error,
  })),

  // Draft local (EE-04)
  on(fromActions.guardarDraft, (state, { casoId, texto, timestamp }) => ({
    ...state,
    drafts: {
      ...state.drafts,
      [casoId]: { texto, timestamp },
    },
  })),
  on(fromActions.cargarDraft, (state, { casoId }) => ({
    ...state,
    // El draft se carga en el componente usando el selector
  })),
  on(fromActions.limpiarDraft, (state, { casoId }) => {
    const { [casoId]: _, ...restDrafts } = state.drafts;
    return {
      ...state,
      drafts: restDrafts,
    };
  }),

  // UI
  on(fromActions.seleccionarSeguimiento, (state, { seguimiento }) => ({
    ...state,
    seguimientoSeleccionado: seguimiento,
  })),
  on(fromActions.filtrarPorTipo, (state, { tipo }) => ({
    ...state,
    filtroTipo: tipo,
  })),
  on(fromActions.limpiarError, (state) => ({
    ...state,
    error: null,
  }))
);
