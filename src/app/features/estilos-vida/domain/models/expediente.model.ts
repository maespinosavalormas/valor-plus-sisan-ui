/**
 * ELSA Expediente Domain Models
 * Modelos de dominio para el expediente clínico ELSA
 */

export enum TipoNotaEnum {
  RECOMENDACION = 'Recomendacion',
  ANEXO = 'Anexo',
  ANOTACION = 'Anotacion',
}

export interface IrevData {
  value: number;
  label: string;
  color: string;
}

export interface FormElsaDetail {
  id: string;
  patientId: number;
  tenantId: string;
  tabacoActual: boolean;
  alimentoTotalPorciones: number;
  afMetsTotales: number;
  alcoholScore: number;
  createdAt: Date;
  isActive: boolean;
}

export interface ExpedienteDetail {
  form: FormElsaDetail;
  irev: IrevData;
}

export interface AuditTrailItem {
  id: string;
  fieldName: string;
  oldValue: any;
  newValue: any;
  changedBy: string;
  changedAt: Date;
  reason: string;
}

export interface Trazabilidad {
  timeline: AuditTrailItem[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    hasMore: boolean;
  };
}

export interface SeguidoAdjunto {
  id: string;
  fileName: string;
  mimeTypeDetected: string;
  fileSizeBytes: number;
  uploadedAt: Date;
}

export interface SeguidoElsaListItem {
  id: string;
  segComentario: string;
  segTipoNota: TipoNotaEnum;
  segUsuarioId: string;
  fileCount: number;
  createdAt: Date;
  adjuntos: SeguidoAdjunto[];
}

export interface ListSeguidos {
  items: SeguidoElsaListItem[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    hasMore: boolean;
  };
}

export interface CreateSeguimientoRequest {
  segComentario: string;
  segTipoNota?: TipoNotaEnum;
}

export interface CreateSeguimientoResponse {
  id: string;
  formElsaId: string;
  segComentario: string;
  segTipoNota: TipoNotaEnum;
  createdAt: Date;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}
