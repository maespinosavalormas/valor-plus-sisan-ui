import { createFeatureSelector, createSelector } from '@ngrx/store';
import { TamizajesState } from './tamizajes.state';

export const selectTamizajesState = createFeatureSelector<TamizajesState>('tamizajes');

export const selectExpediente = createSelector(selectTamizajesState, (s) => s.expediente);
export const selectMenor = createSelector(selectExpediente, (e) => e?.menor ?? null);
export const selectSerie = createSelector(selectTamizajesState, (s) => s.serie);
export const selectTamizajes = createSelector(selectTamizajesState, (s) => s.tamizajes);
export const selectTamizajesLoading = createSelector(selectTamizajesState, (s) => s.loading);
export const selectTamizajesSaving = createSelector(selectTamizajesState, (s) => s.saving);
export const selectTamizajesError = createSelector(selectTamizajesState, (s) => s.error);
export const selectTamizajesNotFound = createSelector(selectTamizajesState, (s) => s.notFound);
export const selectEditingTamizaje = createSelector(selectTamizajesState, (s) => s.editingTamizaje);
export const selectSugerenciaRecuperacion = createSelector(
  selectTamizajesState,
  (s) => s.sugerenciaRecuperacion
);
export const selectCasoRecuperado = createSelector(
  selectMenor,
  (menor) => menor?.estadoCaso === 'RECUPERADO'
);
