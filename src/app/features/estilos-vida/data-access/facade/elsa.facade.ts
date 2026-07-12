import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import * as fromSelectors from '../elsa.selectors';
import * as fromActions from '../elsa.actions';
import { ElsaState } from '../elsa.state';
import {
  CreateELSAFormDto,
  ELSAFormResponse,
  ElsaListItem,
  ElsaListQuery,
  PaginationMeta,
  PatientResponse,
} from '../elsa.contracts';

@Injectable({ providedIn: 'root' })
export class ElsaFacade {
  patient$: Observable<PatientResponse | null> = this.store.select(fromSelectors.selectPatient);
  draft$: Observable<Partial<CreateELSAFormDto> | null> = this.store.select(
    fromSelectors.selectDraft,
  );
  response$: Observable<ELSAFormResponse | null> = this.store.select(fromSelectors.selectResponse);
  searchLoading$: Observable<boolean> = this.store.select(fromSelectors.selectSearchLoading);
  createLoading$: Observable<boolean> = this.store.select(fromSelectors.selectCreateLoading);
  detailLoading$: Observable<boolean> = this.store.select(fromSelectors.selectDetailLoading);
  searchError$: Observable<string | null> = this.store.select(fromSelectors.selectSearchError);
  createError$: Observable<string | null> = this.store.select(fromSelectors.selectCreateError);
  detailError$: Observable<string | null> = this.store.select(fromSelectors.selectDetailError);
  list$: Observable<ElsaListItem[]> = this.store.select(fromSelectors.selectList);
  listMeta$: Observable<PaginationMeta | null> = this.store.select(fromSelectors.selectListMeta);
  listQuery$: Observable<ElsaListQuery> = this.store.select(fromSelectors.selectListQuery);
  listLoading$: Observable<boolean> = this.store.select(fromSelectors.selectListLoading);
  listError$: Observable<string | null> = this.store.select(fromSelectors.selectListError);

  constructor(private readonly store: Store<{ elsa: ElsaState }>) {}

  buscarPaciente(document: string): void {
    this.store.dispatch(fromActions.buscarPaciente({ document }));
  }
  actualizarDraft(draft: Partial<CreateELSAFormDto>): void {
    this.store.dispatch(fromActions.actualizarDraft({ draft }));
  }
  restaurarDraft(draft: Partial<CreateELSAFormDto>): void {
    this.store.dispatch(fromActions.restaurarDraft({ draft }));
  }
  limpiarDraft(): void {
    this.store.dispatch(fromActions.limpiarDraft());
  }
  crearELSA(dto: CreateELSAFormDto): void {
    this.store.dispatch(fromActions.crearELSA({ dto }));
  }
  cargarELSA(id: string): void {
    this.store.dispatch(fromActions.cargarELSA({ id }));
  }
  cargarLista(query: ElsaListQuery): void {
    this.store.dispatch(fromActions.cargarListaELSA({ query }));
  }
  limpiarEstado(): void {
    this.store.dispatch(fromActions.limpiarEstado());
  }
}