import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { ReplaySubject, of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { TamizajesEffects } from './tamizajes.effects';
import { TamizajeService } from '../services/tamizaje.service';
import * as TamizajesActions from './tamizajes.actions';

describe('TamizajesEffects', () => {
  let actions$: ReplaySubject<unknown>;
  let effects: TamizajesEffects;
  let tamizajeService: jest.Mocked<
    Pick<TamizajeService, 'obtenerExpediente' | 'listarPorCaso' | 'crear' | 'actualizar'>
  >;

  beforeEach(() => {
    actions$ = new ReplaySubject(1);
    tamizajeService = {
      obtenerExpediente: jest.fn(),
      listarPorCaso: jest.fn(),
      crear: jest.fn(),
      actualizar: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        TamizajesEffects,
        provideMockActions(() => actions$),
        { provide: TamizajeService, useValue: tamizajeService },
      ],
    });

    effects = TestBed.inject(TamizajesEffects);
  });

  it('loadExpediente$ should dispatch success on happy path', (done) => {
    const expediente = {
      data: {
        menor: {
          menorId: '1',
          nombre: 'A',
          fechaNacimiento: '2020-01-01',
          edadActualMeses: 24,
          sexo: 'M' as const,
          estadoCaso: 'ACTIVO' as const,
        },
        serie: [],
      },
    };
    const tamizajes = { data: [] };

    tamizajeService.obtenerExpediente.mockReturnValue(of(expediente));
    tamizajeService.listarPorCaso.mockReturnValue(of(tamizajes));

    actions$.next(TamizajesActions.loadExpediente({ casoId: '1' }));

    effects.loadExpediente$.subscribe((action) => {
      expect(action).toEqual(
        TamizajesActions.loadExpedienteSuccess({
          expediente: expediente.data,
          tamizajes: [],
        })
      );
      done();
    });
  });

  it('loadExpediente$ should dispatch failure on 404', (done) => {
    const err = new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
    tamizajeService.obtenerExpediente.mockReturnValue(throwError(() => err));
    tamizajeService.listarPorCaso.mockReturnValue(of({ data: [] }));

    actions$.next(TamizajesActions.loadExpediente({ casoId: '999' }));

    effects.loadExpediente$.subscribe((action) => {
      expect(action.type).toBe('[Tamizajes] Load Expediente Failure');
      expect((action as ReturnType<typeof TamizajesActions.loadExpedienteFailure>).notFound).toBe(true);
      done();
    });
  });

  it('createTamizaje$ success dispatches success + reload', (done) => {
    const tamizaje = { id: 't1', casoId: '1' } as never;
    tamizajeService.crear = jest.fn().mockReturnValue(
      of({ data: tamizaje, sugerenciaRecuperacion: true }),
    );
    const emitted: unknown[] = [];
    effects.createTamizaje$.subscribe((action) => {
      emitted.push(action);
      if (emitted.length === 2) {
        expect(emitted[0]).toEqual(
          TamizajesActions.createTamizajeSuccess({
            tamizaje,
            sugerenciaRecuperacion: true,
            serie: [],
          }),
        );
        expect(emitted[1]).toEqual(TamizajesActions.loadExpediente({ casoId: '1' }));
        done();
      }
    });
    actions$.next(TamizajesActions.createTamizaje({ casoId: '1', dto: {} as never }));
  });

  it('updateTamizaje$ failure dispatches failure', (done) => {
    tamizajeService.actualizar = jest.fn().mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 409, error: { message: 'dup' } })),
    );
    actions$.next(TamizajesActions.updateTamizaje({ id: 't1', dto: {} as never }));
    effects.updateTamizaje$.subscribe((action) => {
      expect(action.type).toBe('[Tamizajes] Update Tamizaje Failure');
      done();
    });
  });
});
