import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ElsaState } from './elsa.state';

export const selectElsaState = createFeatureSelector<ElsaState>('elsa');

export const selectPatient = createSelector(selectElsaState, (s) => s.patient);
export const selectDraft = createSelector(selectElsaState, (s) => s.draft);
export const selectResponse = createSelector(selectElsaState, (s) => s.response);
export const selectSearchLoading = createSelector(selectElsaState, (s) => s.searchLoading);
export const selectCreateLoading = createSelector(selectElsaState, (s) => s.createLoading);
export const selectDetailLoading = createSelector(selectElsaState, (s) => s.detailLoading);
export const selectSearchError = createSelector(selectElsaState, (s) => s.searchError);
export const selectCreateError = createSelector(selectElsaState, (s) => s.createError);
export const selectDetailError = createSelector(selectElsaState, (s) => s.detailError);

// HU-003: Consultar ELSA (list)
export const selectList = createSelector(selectElsaState, (s) => s.list);
export const selectListMeta = createSelector(selectElsaState, (s) => s.listMeta);
export const selectListQuery = createSelector(selectElsaState, (s) => s.listQuery);
export const selectListLoading = createSelector(selectElsaState, (s) => s.listLoading);
export const selectListError = createSelector(selectElsaState, (s) => s.listError);