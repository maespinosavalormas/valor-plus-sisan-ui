import '@angular/compiler';
import { Actions } from '@ngrx/effects';
import { Subject, of, throwError } from 'rxjs';
import { FollowUpEffects } from './follow-up.effects';
import { FollowUpService } from './follow-up.service';
import * as fromActions from './follow-up.actions';

describe('FollowUpEffects (T7)', () => {
  let effects: FollowUpEffects;
  let actionsSubject: Subject<any>;
  let mockService: any;

  beforeEach(() => {
    actionsSubject = new Subject<any>();
    mockService = {
      obtenerExpedienteEvolutivo: jest.fn(),
      listarSeguimientos: jest.fn(),
      crearSeguimiento: jest.fn(),
      cambiarEstado: jest.fn(),
    };

    effects = new FollowUpEffects(new Actions(actionsSubject.asObservable()), mockService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    actionsSubject.complete();
  });

  describe('cargarExpediente$', () => {
    it('should dispatch cargarExpedienteExito on success', (done) => {
      const expediente = { casoId: '123', diasEnPrograma: 10, sparklineData: [], seguimientos: [], estadoActual: 'ACTIVO' };
      mockService.obtenerExpedienteEvolutivo.mockReturnValue(of({ data: expediente }));

      effects.cargarExpediente$.subscribe((action) => {
        expect(action).toEqual(fromActions.cargarExpedienteExito({ expediente }));
        done();
      });

      actionsSubject.next(fromActions.cargarExpediente({ casoId: '123' }));
    });

    it('should dispatch cargarExpedienteError on 401', (done) => {
      mockService.obtenerExpedienteEvolutivo.mockReturnValue(throwError(() => new Error('Unauthorized')));

      effects.cargarExpediente$.subscribe((action) => {
        expect(action).toEqual(fromActions.cargarExpedienteError({ error: 'Unauthorized' }));
        done();
      });

      actionsSubject.next(fromActions.cargarExpediente({ casoId: '123' }));
    });

    it('should dispatch cargarExpedienteError on 500', (done) => {
      mockService.obtenerExpedienteEvolutivo.mockReturnValue(throwError(() => new Error('Internal Server Error')));

      effects.cargarExpediente$.subscribe((action) => {
        expect(action).toEqual(fromActions.cargarExpedienteError({ error: 'Internal Server Error' }));
        done();
      });

      actionsSubject.next(fromActions.cargarExpediente({ casoId: '123' }));
    });
  });

  describe('cargarMuro$', () => {
    it('should dispatch cargarMuroExito on success', (done) => {
      const response = { items: [], nextCursor: null, hasMore: false };
      mockService.listarSeguimientos.mockReturnValue(of({ data: response }));

      effects.cargarMuro$.subscribe((action) => {
        expect(action).toEqual(fromActions.cargarMuroExito({ seguimientos: [], nextCursor: null, hasMore: false }));
        done();
      });

      actionsSubject.next(fromActions.cargarMuro({ casoId: '123' }));
    });

    it('should dispatch cargarMuroError on 409', (done) => {
      mockService.listarSeguimientos.mockReturnValue(throwError(() => new Error('Conflict')));

      effects.cargarMuro$.subscribe((action) => {
        expect(action).toEqual(fromActions.cargarMuroError({ error: 'Conflict' }));
        done();
      });

      actionsSubject.next(fromActions.cargarMuro({ casoId: '123' }));
    });
  });

  describe('crearSeguimiento$', () => {
    it('should dispatch crearSeguimientoExito on success', (done) => {
      const seguimiento = { uuid: 's1', casoId: '123', tipo: 'MEDICA', texto: 'Test', autor: { id: 'a1', nombre: 'Dr', cargo: 'Médico' }, fechaHora: new Date().toISOString(), createdAt: new Date().toISOString() };
      mockService.crearSeguimiento.mockReturnValue(of({ data: seguimiento }));

      effects.crearSeguimiento$.subscribe((action) => {
        expect(action).toEqual(fromActions.crearSeguimientoExito({ seguimiento }));
        done();
      });

      actionsSubject.next(fromActions.crearSeguimiento({ casoId: '123', dto: { tipo: 'MEDICA', texto: 'Test' } }));
    });

    it('should dispatch crearSeguimientoError on failure', (done) => {
      mockService.crearSeguimiento.mockReturnValue(throwError(() => new Error('Bad Request')));

      effects.crearSeguimiento$.subscribe((action) => {
        expect(action).toEqual(fromActions.crearSeguimientoError({ error: 'Bad Request' }));
        done();
      });

      actionsSubject.next(fromActions.crearSeguimiento({ casoId: '123', dto: { tipo: 'MEDICA', texto: 'Test' } }));
    });
  });

  describe('cambiarEstado$', () => {
    it('should dispatch cambiarEstadoExito on success', (done) => {
      mockService.cambiarEstado.mockReturnValue(of({ data: { estadoNuevo: 'RECUPERADO' } }));

      effects.cambiarEstado$.subscribe((action) => {
        expect(action).toEqual(fromActions.cambiarEstadoExito({ resultado: { estadoNuevo: 'RECUPERADO' } }));
        done();
      });

      actionsSubject.next(fromActions.cambiarEstado({
        casoId: '123',
        payload: { nuevoEstado: 'RECUPERADO', motivoCambio: 'Mejoría clínica' },
      }));
    });

    it('should dispatch cambiarEstadoError on failure', (done) => {
      mockService.cambiarEstado.mockReturnValue(throwError(() => new Error('Forbidden')));

      effects.cambiarEstado$.subscribe((action) => {
        expect(action).toEqual(fromActions.cambiarEstadoError({ error: 'Forbidden' }));
        done();
      });

      actionsSubject.next(fromActions.cambiarEstado({
        casoId: '123',
        payload: { nuevoEstado: 'RECUPERADO', motivoCambio: 'Mejoría clínica' },
      }));
    });
  });
});
