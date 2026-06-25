import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import {
  CreateTamizajeDto,
  MenorHeader,
  Tamizaje,
  TamizajePunto,
  UpdateTamizajeDto,
} from '../core/contracts/tamizaje.contracts';
import * as TamizajesActions from '../store/tamizajes.actions';
import {
  selectCasoRecuperado,
  selectEditingTamizaje,
  selectMenor,
  selectSerie,
  selectSugerenciaRecuperacion,
  selectTamizajes,
  selectTamizajesError,
  selectTamizajesLoading,
  selectTamizajesNotFound,
  selectTamizajesSaving,
} from '../store/tamizajes.selectors';

@Injectable({ providedIn: 'root' })
export class TamizajeFacade {
  private readonly store = inject(Store);

  readonly menor$: Observable<MenorHeader | null> = this.store.select(selectMenor);
  readonly serie$: Observable<TamizajePunto[]> = this.store.select(selectSerie);
  readonly tamizajes$: Observable<Tamizaje[]> = this.store.select(selectTamizajes);
  readonly loading$: Observable<boolean> = this.store.select(selectTamizajesLoading);
  readonly saving$: Observable<boolean> = this.store.select(selectTamizajesSaving);
  readonly error$: Observable<string | null> = this.store.select(selectTamizajesError);
  readonly notFound$: Observable<boolean> = this.store.select(selectTamizajesNotFound);
  readonly editingTamizaje$: Observable<Tamizaje | null> = this.store.select(selectEditingTamizaje);
  readonly sugerenciaRecuperacion$: Observable<boolean> = this.store.select(selectSugerenciaRecuperacion);
  readonly casoRecuperado$: Observable<boolean> = this.store.select(selectCasoRecuperado);

  loadExpediente(casoId: string): void {
    this.store.dispatch(TamizajesActions.loadExpediente({ casoId }));
  }

  createTamizaje(casoId: string, dto: CreateTamizajeDto): void {
    this.store.dispatch(TamizajesActions.createTamizaje({ casoId, dto }));
  }

  updateTamizaje(id: string, dto: UpdateTamizajeDto): void {
    this.store.dispatch(TamizajesActions.updateTamizaje({ id, dto }));
  }

  setEditingTamizaje(tamizaje: Tamizaje | null): void {
    this.store.dispatch(TamizajesActions.setEditingTamizaje({ tamizaje }));
  }

  clearError(): void {
    this.store.dispatch(TamizajesActions.clearTamizajesError());
  }
}
