import { createAction, props } from '@ngrx/store';
import {
  CreateTamizajeDto,
  ExpedienteData,
  Tamizaje,
  TamizajePunto,
  UpdateTamizajeDto,
} from '../core/contracts/tamizaje.contracts';

export const loadExpediente = createAction(
  '[Tamizajes] Load Expediente',
  props<{ casoId: string }>()
);

export const loadExpedienteSuccess = createAction(
  '[Tamizajes] Load Expediente Success',
  props<{ expediente: ExpedienteData; tamizajes: Tamizaje[] }>()
);

export const loadExpedienteFailure = createAction(
  '[Tamizajes] Load Expediente Failure',
  props<{ error: string; notFound?: boolean }>()
);

export const createTamizaje = createAction(
  '[Tamizajes] Create Tamizaje',
  props<{ casoId: string; dto: CreateTamizajeDto }>()
);

export const createTamizajeSuccess = createAction(
  '[Tamizajes] Create Tamizaje Success',
  props<{ tamizaje: Tamizaje; sugerenciaRecuperacion: boolean; serie: TamizajePunto[] }>()
);

export const createTamizajeFailure = createAction(
  '[Tamizajes] Create Tamizaje Failure',
  props<{ error: string }>()
);

export const updateTamizaje = createAction(
  '[Tamizajes] Update Tamizaje',
  props<{ id: string; dto: UpdateTamizajeDto }>()
);

export const updateTamizajeSuccess = createAction(
  '[Tamizajes] Update Tamizaje Success',
  props<{ tamizaje: Tamizaje; curvaRecalculada: TamizajePunto[] }>()
);

export const updateTamizajeFailure = createAction(
  '[Tamizajes] Update Tamizaje Failure',
  props<{ error: string }>()
);

export const setEditingTamizaje = createAction(
  '[Tamizajes] Set Editing Tamizaje',
  props<{ tamizaje: Tamizaje | null }>()
);

export const clearTamizajesError = createAction('[Tamizajes] Clear Error');
