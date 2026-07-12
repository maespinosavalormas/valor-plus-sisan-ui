import {
  PatientResponse,
  CreateELSAFormDto,
  ELSAFormResponse,
  ElsaListItem,
  ElsaListQuery,
  PaginationMeta,
} from './elsa.contracts';

export const initialListQuery: ElsaListQuery = {
  page: 1,
  pageSize: 20,
  sortBy: 'CREATED_AT',
  sortDir: 'DESC',
};

export interface ElsaState {
  patient: PatientResponse | null;
  draft: Partial<CreateELSAFormDto> | null;
  response: ELSAFormResponse | null;
  list: ElsaListItem[];
  listMeta: PaginationMeta | null;
  listQuery: ElsaListQuery;
  searchLoading: boolean;
  createLoading: boolean;
  detailLoading: boolean;
  listLoading: boolean;
  searchError: string | null;
  createError: string | null;
  detailError: string | null;
  listError: string | null;
}

export const initialState: ElsaState = {
  patient: null,
  draft: null,
  response: null,
  list: [],
  listMeta: null,
  listQuery: initialListQuery,
  searchLoading: false,
  createLoading: false,
  detailLoading: false,
  listLoading: false,
  searchError: null,
  createError: null,
  detailError: null,
  listError: null,
};