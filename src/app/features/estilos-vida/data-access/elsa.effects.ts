import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import * as fromActions from './elsa.actions';
import { ElsaService } from './elsa.service';

@Injectable()
export class ElsaEffects {
  constructor(
    private readonly actions$: Actions,
    private readonly service: ElsaService,
  ) {}

  buscarPaciente$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fromActions.buscarPaciente),
      switchMap(({ document }) =>
        this.service.searchPatients(document).pipe(
          map((res) =>
            fromActions.buscarPacienteExito({ patient: res.data?.[0] ?? null }),
          ),
          catchError((err) =>
            of(
              fromActions.buscarPacienteError({
                error:
                  err.status === 503
                    ? 'Servicio de pacientes no disponible'
                    : 'Error al buscar paciente',
              }),
            ),
          ),
        ),
      ),
    ),
  );

  crearELSA$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fromActions.crearELSA),
      switchMap(({ dto }) =>
        this.service.createELSA(dto).pipe(
          map((res) => fromActions.crearELSAExito({ response: res.data })),
          catchError((err) =>
            of(
              fromActions.crearELSAError({
                error:
                  err.status === 400
                    ? 'Validación fallida — revise los campos'
                    : err.status === 403
                      ? 'No tiene permisos para crear ELSA'
                      : 'Error inesperado al guardar',
              }),
            ),
          ),
        ),
      ),
    ),
  );

  cargarELSA$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fromActions.cargarELSA),
      switchMap(({ id }) =>
        this.service.getELSA(id).pipe(
          map((res) => fromActions.cargarELSAExito({ response: res.data })),
          catchError((err) =>
            of(fromActions.cargarELSAError({ error: 'No se pudo cargar el ELSA' })),
          ),
        ),
      ),
    ),
  );

  cargarListaELSA$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fromActions.cargarListaELSA),
      switchMap(({ query }) =>
        this.service.listELSA(query).pipe(
          map((response) => fromActions.cargarListaELSAExito({ response })),
          catchError((err) =>
            of(
              fromActions.cargarListaELSAError({
                error:
                  err.status === 403
                    ? 'No tiene permisos para consultar ELSA'
                    : 'No se pudo cargar el listado de ELSA',
              }),
            ),
          ),
        ),
      ),
    ),
  );
}