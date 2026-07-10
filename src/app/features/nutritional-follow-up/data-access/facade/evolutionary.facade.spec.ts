import '@angular/compiler';
import { createMockStore, MockStore } from '@ngrx/store/testing';
import { EvolutionaryFacade } from './evolutionary.facade';
import { FollowUpService } from '../follow-up.service';
import { initialState } from '../follow-up.reducer';
import { ExpedienteEvolutivo, CambioEstadoPayload } from '../follow-up.contracts';
import * as fromActions from '../follow-up.actions';
import { of } from 'rxjs';
import { take } from 'rxjs/operators';

describe('EvolutionaryFacade (T7)', () => {
  let facade: EvolutionaryFacade;
  let store: MockStore;
  let mockService: any;

  beforeEach(() => {
    mockService = {
      obtenerUrlDescarga: jest.fn(),
    };

    store = createMockStore({
      initialState: { followUp: initialState },
    });

    facade = new EvolutionaryFacade(store, mockService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    store.resetSelectors();
  });

  it('should be created', () => {
    expect(facade).toBeTruthy();
  });

  describe('loadEvolutionaryRecord', () => {
    it('should load expediente into store', (done) => {
      const expediente: ExpedienteEvolutivo = {
        casoId: '123',
        diasEnPrograma: 15,
        sparklineData: [],
        seguimientos: [],
        estadoActual: 'ACTIVO',
      };

      store.setState({
        followUp: {
          ...initialState,
          expediente,
        },
      });

      facade.expediente$.pipe(take(1)).subscribe((exp) => {
        expect(exp).toEqual(expediente);
        done();
      });
    });
  });

  describe('Selectors integration', () => {
    it('should expose loading$', (done) => {
      facade.loading$.pipe(take(1)).subscribe((loading) => {
        expect(typeof loading).toBe('boolean');
        done();
      });
    });

    it('should expose readOnly$ when estado is not ACTIVO', (done) => {
      store.setState({
        followUp: {
          ...initialState,
          expediente: {
            casoId: '123',
            diasEnPrograma: 0,
            sparklineData: [],
            seguimientos: [],
            estadoActual: 'FALLECIDO',
          },
        },
      });
      facade.readOnly$.pipe(take(1)).subscribe((readOnly) => {
        expect(readOnly).toBe(true);
        done();
      });
    });

    it('should expose puedeCambiarEstado$ when estado is ACTIVO', (done) => {
      store.setState({
        followUp: {
          ...initialState,
          expediente: {
            casoId: '123',
            diasEnPrograma: 0,
            sparklineData: [],
            seguimientos: [],
            estadoActual: 'ACTIVO',
          },
        },
      });
      facade.puedeCambiarEstado$.pipe(take(1)).subscribe((puede) => {
        expect(puede).toBe(true);
        done();
      });
    });
  });

  describe('loadEvolutionaryRecord', () => {
    it('should dispatch cargarExpediente action', () => {
      const spy = jest.spyOn(store, 'dispatch');
      facade.loadEvolutionaryRecord('123');
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: '[Follow Up] Cargar Expediente',
          casoId: '123',
        })
      );
    });
  });

  describe('loadMuro', () => {
    it('should dispatch cargarMuro without tipo', () => {
      const spy = jest.spyOn(store, 'dispatch');
      facade.loadMuro('123');
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: '[Follow Up] Cargar Muro',
          casoId: '123',
        })
      );
    });

    it('should dispatch cargarMuro with tipo', () => {
      const spy = jest.spyOn(store, 'dispatch');
      facade.loadMuro('123', 'MEDICA');
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: '[Follow Up] Cargar Muro',
          casoId: '123',
          params: { tipo: 'MEDICA' },
        })
      );
    });
  });

  describe('filterByTipo', () => {
    it('should dispatch filtrarPorTipo action', () => {
      const spy = jest.spyOn(store, 'dispatch');
      facade.filterByTipo('MEDICA');
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: '[Follow Up] Filtrar Por Tipo',
          tipo: 'MEDICA',
        })
      );
    });
  });

  describe('selectSeguimiento', () => {
    it('should dispatch seleccionarSeguimiento action', () => {
      const spy = jest.spyOn(store, 'dispatch');
      const seguimiento = { uuid: 's1', casoId: '123', tipo: 'MEDICA' as const, texto: 'Test', autor: { id: 'a1', nombre: 'Dr', cargo: 'Médico' }, fechaHora: '2024-01-01T00:00:00Z', createdAt: '2024-01-01T00:00:00Z' };
      facade.selectSeguimiento(seguimiento);
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: '[Follow Up] Seleccionar Seguimiento',
          seguimiento,
        })
      );
    });
  });

  describe('loadDraft', () => {
    it('should dispatch cargarDraft action', () => {
      const spy = jest.spyOn(store, 'dispatch');
      facade.loadDraft('123');
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: '[Follow Up] Cargar Draft',
          casoId: '123',
        })
      );
    });
  });

  describe('clearError', () => {
    it('should dispatch limpiarError action', () => {
      const spy = jest.spyOn(store, 'dispatch');
      facade.clearError();
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: '[Follow Up] Limpiar Error',
        })
      );
    });
  });

  describe('createFollowUp', () => {
    it('should dispatch crearSeguimiento action', () => {
      const spy = jest.spyOn(store, 'dispatch');
      const dto = { tipo: 'MEDICA' as const, texto: 'Test note' };
      facade.createFollowUp('123', dto);
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: '[Follow Up] Crear Seguimiento',
          casoId: '123',
          dto,
        })
      );
    });
  });

  describe('changeStatus', () => {
    it('should dispatch cambiarEstado action', () => {
      const spy = jest.spyOn(store, 'dispatch');
      const payload: CambioEstadoPayload = { nuevoEstado: 'RECUPERADO', motivoCambio: 'Mejoría' };
      facade.changeStatus('123', payload);
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: '[Follow Up] Cambiar Estado',
          casoId: '123',
          payload,
        })
      );
    });
  });

  describe('loadNextPage', () => {
    it('should dispatch cargarMasMuro action', () => {
      const spy = jest.spyOn(store, 'dispatch');
      facade.loadNextPage('123', 'cursor-abc');
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: '[Follow Up] Cargar Más Muro',
          casoId: '123',
          cursor: 'cursor-abc',
        })
      );
    });
  });

  describe('downloadEvidence', () => {
    it('should open window with presigned URL', (done) => {
      const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null);
      mockService.obtenerUrlDescarga.mockReturnValue(
        of({ data: { url: 'https://presigned.url/file', expiraEnSegundos: 300 } })
      );

      facade.downloadEvidence('123', 'uuid-123').subscribe({
        next: () => {
          expect(openSpy).toHaveBeenCalledWith('https://presigned.url/file', '_blank');
          openSpy.mockRestore();
          done();
        },
      });
    });

    it('should error when URL is missing', (done) => {
      mockService.obtenerUrlDescarga.mockReturnValue(
        of({ data: { url: '', expiraEnSegundos: 300 } })
      );

      facade.downloadEvidence('123', 'uuid-123').subscribe({
        next: () => fail('should have errored'),
        error: (err) => {
          expect(err.message).toBe('URL de descarga no disponible');
          done();
        },
      });
    });
  });

  describe('Draft actions', () => {
    it('should dispatch guardarDraft', () => {
      const spy = jest.spyOn(store, 'dispatch');
      facade.saveDraft('123', 'draft content');
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: '[Follow Up] Guardar Draft',
          casoId: '123',
          texto: 'draft content',
        })
      );
    });

    it('should dispatch limpiarDraft', () => {
      const spy = jest.spyOn(store, 'dispatch');
      facade.clearDraft('123');
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: '[Follow Up] Limpiar Draft',
          casoId: '123',
        })
      );
    });
  });
});
