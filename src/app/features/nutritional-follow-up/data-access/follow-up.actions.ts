import { createAction, props } from '@ngrx/store';
import {
  SeguimientoEvolutivo,
  ExpedienteEvolutivo,
  CambioEstadoPayload,
  CrearSeguimientoDto,
  MuroQueryParams,
} from './follow-up.contracts';

// ========== EXPEDIENTE EVOLUTIVO ==========
export const cargarExpediente = createAction(
  '[Follow Up] Cargar Expediente',
  props<{ casoId: string }>()
);

export const cargarExpedienteExito = createAction(
  '[Follow Up] Cargar Expediente Éxito',
  props<{ expediente: ExpedienteEvolutivo }>()
);

export const cargarExpedienteError = createAction(
  '[Follow Up] Cargar Expediente Error',
  props<{ error: string }>()
);

// ========== MURO DE SEGUIMIENTOS ==========
export const cargarMuro = createAction(
  '[Follow Up] Cargar Muro',
  props<{ casoId: string; params?: MuroQueryParams }>()
);

export const cargarMuroExito = createAction(
  '[Follow Up] Cargar Muro Éxito',
  props<{ seguimientos: SeguimientoEvolutivo[]; nextCursor: string | null; hasMore: boolean }>()
);

export const cargarMuroError = createAction(
  '[Follow Up] Cargar Muro Error',
  props<{ error: string }>()
);

export const cargarMasMuro = createAction(
  '[Follow Up] Cargar Más Muro',
  props<{ casoId: string; cursor: string }>()
);

// ========== CREAR SEGUIMIENTO ==========
export const crearSeguimiento = createAction(
  '[Follow Up] Crear Seguimiento',
  props<{ casoId: string; dto: CrearSeguimientoDto }>()
);

export const crearSeguimientoExito = createAction(
  '[Follow Up] Crear Seguimiento Éxito',
  props<{ seguimiento: SeguimientoEvolutivo }>()
);

export const crearSeguimientoError = createAction(
  '[Follow Up] Crear Seguimiento Error',
  props<{ error: string }>()
);

// ========== CAMBIO DE ESTADO ==========
export const cambiarEstado = createAction(
  '[Follow Up] Cambiar Estado',
  props<{ casoId: string; payload: CambioEstadoPayload }>()
);

export const cambiarEstadoExito = createAction(
  '[Follow Up] Cambiar Estado Éxito',
  props<{ resultado: any }>()
);

export const cambiarEstadoError = createAction(
  '[Follow Up] Cambiar Estado Error',
  props<{ error: string }>()
);

// ========== DRAFT LOCAL (EE-04) ==========
export const guardarDraft = createAction(
  '[Follow Up] Guardar Draft',
  props<{ casoId: string; contenido: string; timestamp: number }>()
);

export const cargarDraft = createAction(
  '[Follow Up] Cargar Draft',
  props<{ casoId: string }>()
);

export const limpiarDraft = createAction(
  '[Follow Up] Limpiar Draft',
  props<{ casoId: string }>()
);

// ========== SELECCIÓN Y UI ==========
export const seleccionarSeguimiento = createAction(
  '[Follow Up] Seleccionar Seguimiento',
  props<{ seguimiento: SeguimientoEvolutivo | null }>()
);

export const filtrarPorTipo = createAction(
  '[Follow Up] Filtrar Por Tipo',
  props<{ tipo: string | null }>()
);

export const limpiarError = createAction(
  '[Follow Up] Limpiar Error'
);
