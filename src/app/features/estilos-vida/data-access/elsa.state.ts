import {
  PatientResponse,
  CreateELSAFormDto,
  ELSAFormResponse,
} from './elsa.contracts';

export interface ElsaState {
  patient: PatientResponse | null;
  draft: Partial<CreateELSAFormDto> | null;
  response: ELSAFormResponse | null;
  searchLoading: boolean;
  createLoading: boolean;
  detailLoading: boolean;
  searchError: string | null;
  createError: string | null;
  detailError: string | null;
}

export const initialState: ElsaState = {
  patient: null,
  draft: null,
  response: null,
  searchLoading: false,
  createLoading: false,
  detailLoading: false,
  searchError: null,
  createError: null,
  detailError: null,
};