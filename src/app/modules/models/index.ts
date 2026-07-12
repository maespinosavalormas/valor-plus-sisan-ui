// Stub models for HU-004 compilation
export interface ExpedienteDetailDto {
  id: string;
  elsa_id: string;
  calculos?: CalculosOMS;
  [key: string]: any;
}

export interface CalculosOMS {
  color: string;
  [key: string]: any;
}

export interface TrazabilidadResponseDto {
  id: string;
  cambios: any[];
  [key: string]: any;
}

export interface ListaSeguimientosResponseDto {
  id: string;
  seguimientos: any[];
  [key: string]: any;
}

export interface SeguimientoResponseDto {
  id: string;
  tipo_nota: string;
  [key: string]: any;
}
