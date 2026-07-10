import '@angular/compiler';
import { Subject } from 'rxjs';
import { ElsaFacade } from './elsa.facade';
import * as fromActions from '../elsa.actions';

describe('ElsaFacade', () => {
  let facade: ElsaFacade;
  let mockStore: any;
  let dispatch$: Subject<any>;

  beforeEach(() => {
    dispatch$ = new Subject<any>();
    mockStore = {
      select: jest.fn(() => dispatch$.asObservable()),
      dispatch: jest.fn(),
    };
    facade = new ElsaFacade(mockStore);
  });

  afterEach(() => jest.clearAllMocks());

  it('expone 9 observables desde el store', () => {
    expect(mockStore.select).toHaveBeenCalledTimes(9);
  });

  it('buscarPaciente -> dispatch buscarPaciente', () => {
    facade.buscarPaciente('123');
    expect(mockStore.dispatch).toHaveBeenCalledWith(fromActions.buscarPaciente({ document: '123' }));
  });

  it('actualizarDraft -> dispatch actualizarDraft', () => {
    facade.actualizarDraft({ patient_id: 'p1' });
    expect(mockStore.dispatch).toHaveBeenCalledWith(
      fromActions.actualizarDraft({ draft: { patient_id: 'p1' } }),
    );
  });

  it('restaurarDraft -> dispatch restaurarDraft', () => {
    facade.restaurarDraft({ patient_id: 'p1' });
    expect(mockStore.dispatch).toHaveBeenCalledWith(
      fromActions.restaurarDraft({ draft: { patient_id: 'p1' } }),
    );
  });

  it('limpiarDraft -> dispatch limpiarDraft', () => {
    facade.limpiarDraft();
    expect(mockStore.dispatch).toHaveBeenCalledWith(fromActions.limpiarDraft());
  });

  it('crearELSA -> dispatch crearELSA', () => {
    const dto = { patient_id: 'p1' } as any;
    facade.crearELSA(dto);
    expect(mockStore.dispatch).toHaveBeenCalledWith(fromActions.crearELSA({ dto }));
  });

  it('cargarELSA -> dispatch cargarELSA', () => {
    facade.cargarELSA('r1');
    expect(mockStore.dispatch).toHaveBeenCalledWith(fromActions.cargarELSA({ id: 'r1' }));
  });

  it('limpiarEstado -> dispatch limpiarEstado', () => {
    facade.limpiarEstado();
    expect(mockStore.dispatch).toHaveBeenCalledWith(fromActions.limpiarEstado());
  });
});