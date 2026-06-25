import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import {
  CreateTamizajeDto,
  CreateTamizajeResponse,
  ExpedienteData,
  Tamizaje,
  UpdateTamizajeDto,
  UpdateTamizajeResponse,
} from '../core/contracts/tamizaje.contracts';

@Injectable({ providedIn: 'root' })
export class TamizajeService {
  constructor(private readonly api: ApiService) {}

  listarPorCaso(casoId: string): Observable<{ data: Tamizaje[] }> {
    return this.api.get<{ data: Tamizaje[] }>(`/casos/${casoId}/tamizajes`);
  }

  obtenerExpediente(casoId: string): Observable<{ data: ExpedienteData }> {
    return this.api.get<{ data: ExpedienteData }>(`/casos/${casoId}/expediente`);
  }

  crear(casoId: string, dto: CreateTamizajeDto): Observable<CreateTamizajeResponse> {
    return this.api.post<CreateTamizajeResponse>(`/casos/${casoId}/tamizajes`, dto);
  }

  actualizar(id: string, dto: UpdateTamizajeDto): Observable<UpdateTamizajeResponse> {
    return this.api.put<UpdateTamizajeResponse>(`/tamizajes/${id}`, dto);
  }
}
