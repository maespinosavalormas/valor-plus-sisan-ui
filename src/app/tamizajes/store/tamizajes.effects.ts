import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, forkJoin, map, of, switchMap } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { TamizajeService } from '../services/tamizaje.service';
import * as TamizajesActions from './tamizajes.actions';

@Injectable()
export class TamizajesEffects {
  private readonly actions$ = inject(Actions);
  private readonly tamizajeService = inject(TamizajeService);

  loadExpediente$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TamizajesActions.loadExpediente),
      switchMap(({ casoId }) =>
        forkJoin({
          expediente: this.tamizajeService.obtenerExpediente(casoId),
          tamizajes: this.tamizajeService.listarPorCaso(casoId),
        }).pipe(
          map(({ expediente, tamizajes }) =>
            TamizajesActions.loadExpedienteSuccess({
              expediente: expediente.data,
              tamizajes: tamizajes.data,
            })
          ),
          catchError((err: HttpErrorResponse) =>
            of(
              TamizajesActions.loadExpedienteFailure({
                error: extractErrorMessage(err),
                notFound: err.status === 404,
              })
            )
          )
        )
      )
    )
  );

  createTamizaje$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TamizajesActions.createTamizaje),
      switchMap(({ casoId, dto }) =>
        this.tamizajeService.crear(casoId, dto).pipe(
          switchMap((res) =>
            of(
              TamizajesActions.createTamizajeSuccess({
                tamizaje: res.data,
                sugerenciaRecuperacion: res.sugerenciaRecuperacion,
                serie: [],
              }),
              TamizajesActions.loadExpediente({ casoId })
            )
          ),
          catchError((err: HttpErrorResponse) =>
            of(TamizajesActions.createTamizajeFailure({ error: extractErrorMessage(err) }))
          )
        )
      )
    )
  );

  updateTamizaje$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TamizajesActions.updateTamizaje),
      switchMap(({ id, dto }) =>
        this.tamizajeService.actualizar(id, dto).pipe(
          switchMap((res) =>
            of(
              TamizajesActions.updateTamizajeSuccess({
                tamizaje: res.data,
                curvaRecalculada: res.curvaRecalculada,
              }),
              TamizajesActions.loadExpediente({ casoId: res.data.casoId })
            )
          ),
          catchError((err: HttpErrorResponse) =>
            of(TamizajesActions.updateTamizajeFailure({ error: extractErrorMessage(err) }))
          )
        )
      )
    )
  );
}

function extractErrorMessage(err: HttpErrorResponse): string {
  let body: { message?: unknown; error?: { message?: unknown } } | null = err.error;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body) as { message?: unknown; error?: { message?: unknown } };
    } catch {
      return String(body) || err.message || 'Unexpected error';
    }
  }
  const nested = body?.error;
  const raw =
    body?.message ??
    (typeof nested === 'object' && nested !== null && 'message' in nested
      ? (nested as { message?: unknown }).message
      : undefined);
  if (raw) {
    return Array.isArray(raw) ? raw.join(', ') : String(raw);
  }
  if (err.status === 409) {
    return 'Ya existe un tamizaje para este menor en la fecha indicada (CA-07)';
  }
  if (err.status === 422) {
    return 'Valores biológicamente implausibles detectados. Requiere confirmación explícita (CA-09/422)';
  }
  return err.message || 'Unexpected error';
}
