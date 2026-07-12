import '@angular/compiler';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { Observable, ReplaySubject, of, throwError } from 'rxjs';
import { Action } from '@ngrx/store';
import { ElsaService } from './elsa.service';
import { ElsaEffects } from './elsa.effects';
import { ElsaFacade } from './facade/elsa.facade';
import { elsaReducer } from './elsa.reducer';
import { initialState } from './elsa.state';
import * as fromActions from './elsa.actions';
import * as fromSelectors from './elsa.selectors';
import { environment } from '../../../../environments/environment';
import { ElsaListQuery, ElsaListResponse } from './elsa.contracts';

const apiUrl = `${environment.apiUrl}/estilos-vida`;

const QUERY: ElsaListQuery = {
  page: 2,
  pageSize: 20,
  patientId: '12345678',
  riskAlim: 'ALTO',
  sortBy: 'EVALUATION_DATE',
  sortDir: 'ASC',
};

const RESPONSE: ElsaListResponse = {
  data: [
    {
      id: 'e1',
      patientId: '12345678',
      evaluationDate: '2026-07-01T00:00:00Z',
      riskNutrition: 'ALTO',
      riskPhysicalActivity: 'MEDIO',
      riskAlcohol: 'BAJO',
      metsScore: 2.5,
      nutritionScore: 18,
      alcoholScore: 5,
      createdAt: '2026-07-01T00:00:00Z',
      createdByUsername: 'clinician@org',
    },
  ],
  meta: { page: 2, pageSize: 20, total: 40, totalPages: 2 },
};

describe('ElsaService.listELSA (HU-003)', () => {
  let service: ElsaService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ElsaService],
    });
    service = TestBed.inject(ElsaService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('GET /estilos-vida/elsa con page, pageSize, filtros y orden', () => {
    service.listELSA(QUERY).subscribe((res) => {
      expect(res.data.length).toBe(1);
      expect(res.meta.total).toBe(40);
    });
    const req = httpMock.expectOne(
      (r) =>
        r.url === `${apiUrl}/elsa` &&
        r.params.get('page') === '2' &&
        r.params.get('pageSize') === '20' &&
        r.params.get('patientId') === '12345678' &&
        r.params.get('riskAlim') === 'ALTO' &&
        r.params.get('sortBy') === 'EVALUATION_DATE' &&
        r.params.get('sortDir') === 'ASC',
    );
    expect(req.request.method).toBe('GET');
    req.flush(RESPONSE);
  });

  it('omite parámetros opcionales vacíos', () => {
    service.listELSA({ page: 1, pageSize: 10 }).subscribe();
    const req = httpMock.expectOne(
      (r) => r.url === `${apiUrl}/elsa` && !r.params.has('patientId') && !r.params.has('riskAlim'),
    );
    req.flush(RESPONSE);
  });
});

describe('elsaReducer — lista (HU-003)', () => {
  it('cargarListaELSA: listLoading=true, guarda query', () => {
    const state = elsaReducer(initialState, fromActions.cargarListaELSA({ query: QUERY }));
    expect(state.listLoading).toBe(true);
    expect(state.listError).toBeNull();
    expect(state.listQuery).toEqual(QUERY);
  });

  it('cargarListaELSAExito: guarda list + meta, listLoading=false', () => {
    const loading = elsaReducer(initialState, fromActions.cargarListaELSA({ query: QUERY }));
    const state = elsaReducer(loading, fromActions.cargarListaELSAExito({ response: RESPONSE }));
    expect(state.list.length).toBe(1);
    expect(state.listMeta?.total).toBe(40);
    expect(state.listLoading).toBe(false);
  });

  it('cargarListaELSAError: guarda error', () => {
    const state = elsaReducer(
      initialState,
      fromActions.cargarListaELSAError({ error: 'boom' }),
    );
    expect(state.listError).toBe('boom');
    expect(state.listLoading).toBe(false);
  });
});

describe('selectores lista (HU-003)', () => {
  const full = {
    ...initialState,
    list: RESPONSE.data,
    listMeta: RESPONSE.meta,
    listQuery: QUERY,
    listLoading: true,
    listError: 'x',
  };
  it('selectList / selectListMeta / selectListQuery / selectListLoading / selectListError', () => {
    expect(fromSelectors.selectList.projector(full)).toEqual(RESPONSE.data);
    expect(fromSelectors.selectListMeta.projector(full)).toEqual(RESPONSE.meta);
    expect(fromSelectors.selectListQuery.projector(full)).toEqual(QUERY);
    expect(fromSelectors.selectListLoading.projector(full)).toBe(true);
    expect(fromSelectors.selectListError.projector(full)).toBe('x');
  });
});

describe('ElsaEffects.cargarListaELSA$ (HU-003)', () => {
  let actions$: ReplaySubject<Action>;
  let effects: ElsaEffects;
  const serviceMock = { listELSA: jest.fn() } as unknown as ElsaService;

  function setup(): void {
    TestBed.configureTestingModule({
      providers: [
        ElsaEffects,
        provideMockActions(() => actions$ as unknown as Observable<Action>),
        { provide: ElsaService, useValue: serviceMock },
      ],
    });
    effects = TestBed.inject(ElsaEffects);
  }

  beforeEach(() => {
    actions$ = new ReplaySubject<Action>(1);
    (serviceMock.listELSA as jest.Mock).mockReset();
  });

  it('mapea a cargarListaELSAExito en éxito', (done) => {
    (serviceMock.listELSA as jest.Mock).mockReturnValue(of(RESPONSE));
    setup();
    effects.cargarListaELSA$.subscribe((action) => {
      expect(action).toEqual(fromActions.cargarListaELSAExito({ response: RESPONSE }));
      done();
    });
    actions$.next(fromActions.cargarListaELSA({ query: QUERY }));
  });

  it('mapea a cargarListaELSAError con 403', (done) => {
    (serviceMock.listELSA as jest.Mock).mockReturnValue(throwError(() => ({ status: 403 })));
    setup();
    effects.cargarListaELSA$.subscribe((action) => {
      expect(action.type).toBe(fromActions.cargarListaELSAError.type);
      expect((action as any).error).toContain('permisos');
      done();
    });
    actions$.next(fromActions.cargarListaELSA({ query: QUERY }));
  });
});

describe('ElsaFacade.cargarLista (HU-003)', () => {
  let facade: ElsaFacade;
  let store: MockStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ElsaFacade, provideMockStore({ initialState: { elsa: initialState } })],
    });
    facade = TestBed.inject(ElsaFacade);
    store = TestBed.inject(MockStore);
  });

  it('despacha cargarListaELSA', () => {
    const spy = jest.spyOn(store, 'dispatch');
    facade.cargarLista(QUERY);
    expect(spy).toHaveBeenCalledWith(fromActions.cargarListaELSA({ query: QUERY }));
  });
});
