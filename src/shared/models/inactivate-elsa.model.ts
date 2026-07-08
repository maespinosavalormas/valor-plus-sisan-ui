export interface InactivateElsaDTO {
  motivo_inactivacion: string;
  totp_token: string;
}

export interface InactivateElsaResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    patientId: number;
    isDeleted: boolean;
    motivoInactivacion: string;
    fechaInactivacion: Date;
  };
  error?: string;
}

export interface ElsaFormularioSoftDelete {
  id: string;
  patientId: number;
  isDeleted: boolean;
  motivoInactivacion: string | null;
  fechaInactivacion: Date | null;
}
