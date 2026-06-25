import { TestBed } from '@angular/core/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { TamizajeFacade } from './tamizaje.facade';
import * as TamizajesActions from '../store/tamizajes.actions';

describe('TamizajeFacade', () => {
  let facade: TamizajeFacade;
  let store: MockStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TamizajeFacade, provideMockStore()],
    });
    facade = TestBed.inject(TamizajeFacade);
    store = TestBed.inject(MockStore);
    jest.spyOn(store, 'dispatch');
  });

  it('loadExpediente despacha acción', () => {
    facade.loadExpediente('42');
    expect(store.dispatch).toHaveBeenCalledWith(
      TamizajesActions.loadExpediente({ casoId: '42' }),
    );
  });

  it('createTamizaje y updateTamizaje despachan', () => {
    facade.createTamizaje('1', { pesoKg: 8 } as never);
    facade.updateTamizaje('t1', { pesoKg: 9 } as never);
    expect(store.dispatch).toHaveBeenCalledWith(
      TamizajesActions.createTamizaje({ casoId: '1', dto: { pesoKg: 8 } }),
    );
    expect(store.dispatch).toHaveBeenCalledWith(
      TamizajesActions.updateTamizaje({ id: 't1', dto: { pesoKg: 9 } }),
    );
  });

  it('setEditingTamizaje y clearError', () => {
    facade.setEditingTamizaje(null);
    facade.clearError();
    expect(store.dispatch).toHaveBeenCalledWith(
      TamizajesActions.setEditingTamizaje({ tamizaje: null }),
    );
    expect(store.dispatch).toHaveBeenCalledWith(TamizajesActions.clearTamizajesError());
  });
});
