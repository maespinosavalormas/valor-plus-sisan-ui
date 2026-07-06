import { createAction, props } from '@ngrx/store';
import {
  PatientResponse,
  CreateELSAFormDto,
  ELSAFormResponse,
} from './elsa.contracts';

export const buscarPaciente = createAction(
  '[ELSA] Buscar Paciente',
  props<{ document: string }>(),
);
export const buscarPacienteExito = createAction(
  '[ELSA] Buscar Paciente Exito',
  props<{ patient: PatientResponse | null }>(),
);
export const buscarPacienteError = createAction(
  '[ELSA] Buscar Paciente Error',
  props<{ error: string }>(),
);

export const actualizarDraft = createAction(
  '[ELSA] Actualizar Draft',
  props<{ draft: Partial<CreateELSAFormDto> }>(),
);
export const restaurarDraft = createAction(
  '[ELSA] Restaurar Draft',
  props<{ draft: Partial<CreateELSAFormDto> }>(),
);
export const limpiarDraft = createAction('[ELSA] Limpiar Draft');

export const crearELSA = createAction(
  '[ELSA] Crear ELSA',
  props<{ dto: CreateELSAFormDto }>(),
);
export const crearELSAExito = createAction(
  '[ELSA] Crear ELSA Exito',
  props<{ response: ELSAFormResponse }>(),
);
export const crearELSAError = createAction(
  '[ELSA] Crear ELSA Error',
  props<{ error: string }>(),
);

export const cargarELSA = createAction('[ELSA] Cargar ELSA', props<{ id: string }>());
export const cargarELSAExito = createAction(
  '[ELSA] Cargar ELSA Exito',
  props<{ response: ELSAFormResponse }>(),
);
export const cargarELSAError = createAction(
  '[ELSA] Cargar ELSA Error',
  props<{ error: string }>(),
);

export const limpiarEstado = createAction('[ELSA] Limpiar Estado');