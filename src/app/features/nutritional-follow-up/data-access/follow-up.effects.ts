import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, switchMap, catchError, tap } from 'rxjs/operators';
import { FollowUpService } from './follow-up.service';
import * as fromActions from './follow-up.actions';

@Injectable()
export class FollowUpEffects {
  constructor(
    private readonly actions$: Actions,
    private readonly followUpService: FollowUpService
  ) {}

  // Cargar expediente evolutivo
  cargarExpediente$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fromActions.cargarExpediente),
      switchMap(({ casoId }) =>
        this.followUpService.obtenerExpedienteEvolutivo(casoId).pipe(
          map((response) =>
            fromActions.cargarExpedienteExito({ expediente: response.data })
          ),
          catchError((error) =>
            of(fromActions.cargarExpedienteError({ error: error.message }))
          )
        )
      )
    )
  );

  // Cargar muro de seguimientos
  cargarMuro$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fromActions.cargarMuro),
      switchMap(({ casoId, params }) =>
        this.followUpService.listarSeguimientos(casoId, params).pipe(
          map((response) =>
            fromActions.cargarMuroExito({
              seguimientos: response.data.items,
              nextCursor: response.data.nextCursor,
              hasMore: response.data.hasMore,
            })
          ),
          catchError((error) =>
            of(fromActions.cargarMuroError({ error: error.message }))
          )
        )
      )
    )
  );

  // Crear seguimiento
  crearSeguimiento$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fromActions.crearSeguimiento),
      switchMap(({ casoId, dto }) =>
        this.followUpService.crearSeguimiento(casoId, dto).pipe(
          map((response) =>
            fromActions.crearSeguimientoExito({
              seguimiento: response.data,
            })
          ),
          catchError((error) =>
            of(fromActions.crearSeguimientoError({ error: error.message }))
          )
        )
      )
    )
  );

  // Cambiar estado
  cambiarEstado$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fromActions.cambiarEstado),
      switchMap(({ casoId, payload }) =>
        this.followUpService.cambiarEstado(casoId, payload).pipe(
          map((response) =>
            fromActions.cambiarEstadoExito({ resultado: response.data })
          ),
          catchError((error) =>
            of(fromActions.cambiarEstadoError({ error: error.message }))
          )
        )
      )
    )
  );

  // Limpiar draft tras crear seguimiento exitoso
  limpiarDraftTrasCreacion$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(fromActions.crearSeguimientoExito),
        tap(() => {
          // El draft se limpia en el componente con el casoId correspondiente
        })
      ),
    { dispatch: false }
  );
}
