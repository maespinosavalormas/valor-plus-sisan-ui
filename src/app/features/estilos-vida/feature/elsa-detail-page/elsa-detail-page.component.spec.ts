import '@angular/compiler';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { provideStore, provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { ElsaDetailPageComponent } from './elsa-detail-page.component';
import { elsaReducer } from '../../data-access/elsa.reducer';
import { ElsaEffects } from '../../data-access/elsa.effects';

describe('ElsaDetailPageComponent', () => {
  let component: ElsaDetailPageComponent;
  let fixture: ComponentFixture<ElsaDetailPageComponent>;
  let paramMap: any;

  beforeEach(async () => {
    paramMap = of({ get: (k: string) => (k === 'id' ? 'e1' : null) } as any);
    await TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, ElsaDetailPageComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { paramMap } },
        provideStore(),
        provideState('elsa', elsaReducer),
        provideEffects([ElsaEffects]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ElsaDetailPageComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    if (component) component.ngOnDestroy();
  });

  it('instancia correctamente', () => {
    expect(component).toBeTruthy();
    expect(component.facade).toBeTruthy();
  });

  it('ngOnInit dispara cargarELSA con id del paramMap', (done) => {
    const spy = jest.spyOn(component.facade, 'cargarELSA');
    component.ngOnInit();
    paramMap.subscribe({
      next: () => {
        expect(spy).toHaveBeenCalled();
        done();
      },
    });
  });
});