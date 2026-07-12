import '@angular/compiler';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BehaviorSubject } from 'rxjs';
import { ElsaListPageComponent } from './elsa-list-page.component';
import { ElsaFacade } from '../../data-access/facade/elsa.facade';
import { ElsaListItem, PaginationMeta } from '../../data-access/elsa.contracts';

class FacadeStub {
  list$ = new BehaviorSubject<ElsaListItem[]>([]);
  listMeta$ = new BehaviorSubject<PaginationMeta | null>(null);
  listLoading$ = new BehaviorSubject<boolean>(false);
  listError$ = new BehaviorSubject<string | null>(null);
  cargarLista = jest.fn();
}

describe('ElsaListPageComponent (HU-003 Consultar)', () => {
  let fixture: ComponentFixture<ElsaListPageComponent>;
  let component: ElsaListPageComponent;
  let facade: FacadeStub;
  let router: { navigate: jest.Mock };

  beforeEach(async () => {
    facade = new FacadeStub();
    router = { navigate: jest.fn() };
    await TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, ElsaListPageComponent],
      providers: [
        { provide: ElsaFacade, useValue: facade },
        { provide: Router, useValue: router },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(ElsaListPageComponent);
    component = fixture.componentInstance;
  });

  it('carga la lista inicial en ngOnInit con page=1', () => {
    fixture.detectChanges();
    expect(facade.cargarLista).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, pageSize: 20 }),
    );
  });

  it('renderiza el data-testid elsa-list-page', () => {
    fixture.detectChanges();
    const el = fixture.nativeElement.querySelector('[data-testid="elsa-list-page"]');
    expect(el).toBeTruthy();
  });

  it('aplica filtros con debounce y reinicia a page=1', fakeAsync(() => {
    fixture.detectChanges();
    facade.cargarLista.mockClear();
    component.patientIdCtrl.setValue('12345678');
    component.riskAlimCtrl.setValue('ALTO');
    tick(400);
    expect(facade.cargarLista).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, patientId: '12345678', riskAlim: 'ALTO' }),
    );
  }));

  it('paginación dispara cargarLista con page+1 y pageSize', () => {
    fixture.detectChanges();
    facade.cargarLista.mockClear();
    component.onPage({ pageIndex: 2, pageSize: 50, length: 200 });
    expect(facade.cargarLista).toHaveBeenCalledWith(
      expect.objectContaining({ page: 3, pageSize: 50 }),
    );
  });

  it('ordenamiento mapea columna y dirección al contrato', () => {
    fixture.detectChanges();
    facade.cargarLista.mockClear();
    component.onSort({ active: 'evaluationDate', direction: 'asc' });
    expect(facade.cargarLista).toHaveBeenCalledWith(
      expect.objectContaining({ sortBy: 'EVALUATION_DATE', sortDir: 'ASC' }),
    );
  });

  it('navega al detalle al hacer click en una fila', () => {
    fixture.detectChanges();
    component.goToDetail('elsa-99');
    expect(router.navigate).toHaveBeenCalledWith(['/estilos-vida', 'elsa-99']);
  });

  it('navega a nuevo cuestionario', () => {
    fixture.detectChanges();
    component.goToNew();
    expect(router.navigate).toHaveBeenCalledWith(['/estilos-vida', 'nuevo']);
  });

  it('retry reintenta con la última query', () => {
    fixture.detectChanges();
    facade.cargarLista.mockClear();
    component.retry();
    expect(facade.cargarLista).toHaveBeenCalledTimes(1);
  });

  it('muestra estado de error cuando listError$ emite', () => {
    facade.listError$.next('No se pudo cargar el listado de ELSA');
    fixture.detectChanges();
    const el = fixture.nativeElement.querySelector('[data-testid="elsa-list-error"]');
    expect(el).toBeTruthy();
  });

  it('muestra estado vacío cuando no hay resultados', () => {
    facade.list$.next([]);
    fixture.detectChanges();
    const el = fixture.nativeElement.querySelector('[data-testid="elsa-list-empty"]');
    expect(el).toBeTruthy();
  });
});
