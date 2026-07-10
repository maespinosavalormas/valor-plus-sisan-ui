import { createFeatureSelector, createSelector } from '@ngrx/store';
import { FollowUpState } from './follow-up.reducer';
import { TIPO_ICONOS } from './follow-up.contracts';

export const selectFollowUpState = createFeatureSelector<FollowUpState>('followUp');

// ========== EXPEDIENTE ==========
export const selectExpediente = createSelector(
  selectFollowUpState,
  (state) => state.expediente
);

export const selectDiasEnPrograma = createSelector(
  selectExpediente,
  (expediente) => expediente?.diasEnPrograma ?? 0
);

export const selectSparklineData = createSelector(
  selectExpediente,
  (expediente) => expediente?.sparklineData ?? []
);

export const selectEstadoActual = createSelector(
  selectExpediente,
  (expediente) => expediente?.estadoActual ?? 'ACTIVO'
);

// ========== MURO ==========
export const selectSeguimientos = createSelector(
  selectFollowUpState,
  (state) => state.seguimientos
);

export const selectSeguimientosFiltrados = createSelector(
  selectSeguimientos,
  selectFollowUpState,
  (seguimientos, state) => {
    if (!state.filtroTipo) return seguimientos;
    return seguimientos.filter((s) => s.tipo === state.filtroTipo);
  }
);

export const selectMuroHasMore = createSelector(
  selectFollowUpState,
  (state) => state.muroHasMore
);

export const selectMuroNextCursor = createSelector(
  selectFollowUpState,
  (state) => state.muroNextCursor
);

// Seguimientos con metadata UI (icono, color) — CA-08
export const selectSeguimientosConUi = createSelector(
  selectSeguimientosFiltrados,
  (seguimientos) =>
    seguimientos.map((s) => ({
      ...s,
      ui: TIPO_ICONOS[s.tipo],
    }))
);

// ========== DRAFT ==========
export const selectDrafts = createSelector(
  selectFollowUpState,
  (state) => state.drafts
);

export const selectDraftPorCasoId = (casoId: string) =>
  createSelector(selectDrafts, (drafts) => drafts[casoId]);

// ========== ESTADO ==========
export const selectFollowUpLoading = createSelector(
  selectFollowUpState,
  (state) => state.loading
);

export const selectFollowUpCreating = createSelector(
  selectFollowUpState,
  (state) => state.creating
);

export const selectChangingStatus = createSelector(
  selectFollowUpState,
  (state) => state.changingStatus
);

export const selectFollowUpError = createSelector(
  selectFollowUpState,
  (state) => state.error
);

// ========== SELECCIÓN ==========
export const selectSeguimientoSeleccionado = createSelector(
  selectFollowUpState,
  (state) => state.seguimientoSeleccionado
);

// ========== DERIVADOS ==========
// Verificar si caso está read_only (CA-07)
export const selectCasoEsReadOnly = createSelector(
  selectEstadoActual,
  (estado) => estado !== 'ACTIVO'
);

// Verificar si se puede cambiar estado
export const selectPuedeCambiarEstado = createSelector(
  selectEstadoActual,
  (estado) => estado === 'ACTIVO'
);
