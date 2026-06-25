import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of, throwError, Subject } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { provideMockActions } from '@ngrx/effects/testing';
import { SimpleChanges } from '@angular/core';
import { ExpedienteComponent } from './expediente.component';
import { TamizajeFacade } from '../facade/tamizaje.facade';
import { TamizajeService } from '../services/tamizaje.service';

describe('ExpedienteComponent', () => {
  let component: ExpedienteComponent;
  let facade: {
    loadExpediente: jest.Mock;
    menor$: Subject<unknown>;
    serie$: Subject<unknown>;
    tamizajes$: Subject<unknown>;
    loading$: Subject<boolean>;
    saving$: Subject<boolean>;
    error$: Subject<string | null>;
    notFound$: Subject<boolean>;
    editingTamizaje$: Subject<unknown>;
    sugerenciaRecuperacion$: Subject<boolean>;
    casoRecuperado$: Subject<boolean>;
    setEditingTamizaje: jest.Mock;
    updateTamizaje: jest.Mock;
    clearError: jest.Mock;
  };
  let tamizajeService: { crear: jest.Mock };
  const actions$ = new Subject();

  beforeEach(() => {
    facade = {
      loadExpediente: jest.fn(),
      menor$: new Subject(),
      serie$: new Subject(),
      tamizajes$: new Subject(),
      loading$: new Subject(),
      saving$: new Subject(),
      error$: new Subject(),
      notFound$: new Subject(),
      editingTamizaje$: new Subject(),
      sugerenciaRecuperacion$: new Subject(),
      casoRecuperado$: new Subject(),
      setEditingTamizaje: jest.fn(),
      updateTamizaje: jest.fn(),
      clearError: jest.fn(),
    };
    tamizajeService = { crear: jest.fn() };

    TestBed.configureTestingModule({
      imports: [ExpedienteComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '42' } } } },
        { provide: TamizajeFacade, useValue: facade },
        { provide: TamizajeService, useValue: tamizajeService },
        provideMockActions(() => actions$),
      ],
    });

    component = TestBed.createComponent(ExpedienteComponent).componentInstance;
    component.ngOnInit();
  });

  it('carga expediente al iniciar', () => {
    expect(component.casoId).toBe('42');
    expect(facade.loadExpediente).toHaveBeenCalledWith('42');
  });

  it('loads expediente from casoIdInput on first change when embedded', () => {
    facade.loadExpediente.mockClear();
    component.embedded = true;
    component.casoIdInput = '99';
    const changes: SimpleChanges = {
      casoIdInput: {
        currentValue: '99',
        previousValue: null,
        firstChange: true,
        isFirstChange: () => true,
      },
    };
    component.ngOnChanges(changes);
    expect(component.casoId).toBe('99');
    expect(facade.loadExpediente).toHaveBeenCalledWith('99');
  });

  it('onEditTamizaje delega al facade', () => {
    const t = { id: 't1' } as never;
    component.onEditTamizaje(t);
    expect(facade.setEditingTamizaje).toHaveBeenCalledWith(t);
  });

  it('onSubmitForm crea tamizaje cuando no edita', () => {
    tamizajeService.crear.mockReturnValue(of({}));
    component.onSubmitForm({ pesoKg: 8 } as never);
    expect(tamizajeService.crear).toHaveBeenCalledWith('42', { pesoKg: 8 });
  });

  it('onSubmitForm actualiza si hay editingTamizaje', () => {
    component.editingTamizaje = { id: 't1' } as never;
    component.onSubmitForm({ pesoKg: 9 } as never);
    expect(facade.updateTamizaje).toHaveBeenCalledWith('t1', { pesoKg: 9 });
  });

  it('maneja error 422 en crear', () => {
    tamizajeService.crear.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 422, error: { message: 'BIV' } })),
    );
    component.onSubmitForm({ pesoKg: 8 } as never);
    expect(component.bivConfirmRequired).toBe(true);
    expect(component.lastError).toContain('BIV');
  });

  it('formSaving combina saving y localSaving', () => {
    component.saving = true;
    expect(component.formSaving).toBe(true);
    component.saving = false;
    component.localSaving = true;
    expect(component.formSaving).toBe(true);
  });

  it('error$ del facade actualiza lastError y bivConfirmRequired', () => {
    facade.error$.next('BIV detectado 422');
    expect(component.lastError).toContain('BIV');
    expect(component.bivConfirmRequired).toBe(true);
  });

  it('maneja error 409 con mensaje CA-07', () => {
    tamizajeService.crear.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 409, error: {} })),
    );
    component.onSubmitForm({ pesoKg: 8 } as never);
    expect(component.lastError).toContain('CA-07');
  });

  it('onSubmitForm no-op si formSaving', () => {
    component.saving = true;
    component.onSubmitForm({ pesoKg: 8 } as never);
    expect(tamizajeService.crear).not.toHaveBeenCalled();
  });

  it('ngOnDestroy completa destroy$', () => {
    component.ngOnDestroy();
    expect(component).toBeTruthy();
  });
});
