/**
 * Contratos HU-015 — Seguimiento Evolutivo
 * Copia literal del CONTRATO §3 de sisan-seguimiento-evolutivo
 */

export interface SeguimientoEvolutivo {
  uuid: string;
  casoId: string;
  tipo: TipoSeguimiento;
  texto: string;
  textoEscapado: boolean;
  autor: AutorSnapshot;
  fechaHora: string; // ISO 8601
  evidenciaUuid?: string;
  estadoCasoSnapshot?: EstadoCaso;
  createdAt: string;
}

export type TipoSeguimiento =
  | 'MEDICA'
  | 'NUTRICIONAL'
  | 'SOCIAL';

export interface AutorSnapshot {
  id: string;
  nombre: string;
  cargo: string;
  registroProfesional?: string;
}

export type EstadoCaso =
  | 'ACTIVO'
  | 'RECUPERADO'
  | 'FALLECIDO'
  | 'ABANDONO'
  | 'TRASLADO';

export interface CambioEstadoPayload {
  nuevoEstado: EstadoCaso;
  motivoCambio: string;
  justificacionAltaInjustificada?: string; // CA-01
  evidencia?: File; // CA-02, CA-09
}

export interface ExpedienteEvolutivo {
  casoId: string;
  diasEnPrograma: number; // CA-04
  sparklineData: SparklinePoint[]; // CA-10
  seguimientos: SeguimientoEvolutivo[];
  estadoActual: EstadoCaso;
}

export interface SparklinePoint {
  fecha: string;
  zScorePesoTalla: number;
  deltaZ: number; // ΔZ de alto contraste
}

// API Responses
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    timestamp: string;
    [key: string]: any;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

// DTOs para envío
export interface CrearSeguimientoDto {
  tipo: TipoSeguimiento;
  texto: string;
  estadoCasoSnapshot?: EstadoCaso;
}

// Muro timeline (EE-09)
export interface MuroQueryParams {
  cursor?: string;
  limit?: number; // default 20, max 50
  tipo?: TipoSeguimiento;
}

// Iconos y colores por tipo (CA-08)
export const TIPO_ICONOS: Record<TipoSeguimiento, { icono: string; color: string }> = {
  MEDICA: { icono: 'description', color: 'primary' },
  NUTRICIONAL: { icono: 'restaurant', color: 'success' },
  SOCIAL: { icono: 'people', color: 'accent' },
};
