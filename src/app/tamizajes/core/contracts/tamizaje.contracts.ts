export type Sexo = 'M' | 'F';
export type TallaMedicion = 'L' | 'H';
export type ClasificacionPT = 'SEVERA' | 'MODERADA' | 'EUTROFICO';
export type EdemaBilateral = 0 | 1 | 2 | 3;
export type EstadoCaso = 'ACTIVO' | 'RECUPERADO' | 'CERRADO';
export type FuenteDato = 'WEB' | 'MOVIL' | 'API';

export interface CreateTamizajeDto {
  fechaTamizaje: string;
  pesoKg: number;
  tallaCm: number;
  tallaMedicion: TallaMedicion;
  perimetroBraquialCm?: number | null;
  edemaBilateral: EdemaBilateral;
  confirmacionBiv?: boolean;
  presentaSignosVitales?: boolean;
  fuenteDato?: FuenteDato;
}

export interface UpdateTamizajeDto extends Partial<CreateTamizajeDto> {
  motivoEdicion?: string;
}

export interface Tamizaje {
  id: string;
  casoId: string;
  menorId: string;
  fechaTamizaje: string;
  pesoKg: number;
  tallaCm: number;
  tallaCmAjustada: number;
  tallaMedicion: TallaMedicion;
  perimetroBraquialCm: number | null;
  edemaBilateral: EdemaBilateral;
  edadDias: number;
  sexoSnapshot: Sexo;
  zScorePt: number;
  zScorePe: number;
  zScoreTe: number;
  clasificacionPt: ClasificacionPT;
  criterioRecuperacionCumplido: boolean;
  bivFlag: boolean;
  motivoEdicion: string | null;
  presentaSignosVitales: boolean | null;
  fuenteDato: FuenteDato;
  createdAt: string;
  updatedAt: string;
}

export interface TamizajePunto {
  fecha: string;
  zScorePt: number;
  clasificacionPt: ClasificacionPT;
  pesoKg: number;
  tallaCm: number;
}

export interface MenorHeader {
  menorId: string;
  nombre: string;
  fechaNacimiento: string;
  edadActualMeses: number;
  sexo: Sexo;
  estadoCaso: EstadoCaso;
}

export interface ExpedienteData {
  menor: MenorHeader;
  serie: TamizajePunto[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp?: string;
}

export type CreateTamizajeResponse = ApiResponse<Tamizaje> & { sugerenciaRecuperacion: boolean };
export type UpdateTamizajeResponse = ApiResponse<Tamizaje> & { curvaRecalculada: TamizajePunto[] };
