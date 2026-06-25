import {
  ExpedienteData,
  Tamizaje,
  TamizajePunto,
} from '../core/contracts/tamizaje.contracts';

export interface TamizajesState {
  expediente: ExpedienteData | null;
  tamizajes: Tamizaje[];
  serie: TamizajePunto[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  notFound: boolean;
  editingTamizaje: Tamizaje | null;
  sugerenciaRecuperacion: boolean;
}

export const initialTamizajesState: TamizajesState = {
  expediente: null,
  tamizajes: [],
  serie: [],
  loading: false,
  saving: false,
  error: null,
  notFound: false,
  editingTamizaje: null,
  sugerenciaRecuperacion: false,
};
