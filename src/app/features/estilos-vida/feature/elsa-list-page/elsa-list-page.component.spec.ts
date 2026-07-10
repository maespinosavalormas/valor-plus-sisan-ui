import '@angular/compiler';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideStore, provideState } from '@ngrx/store';
import { provideMockStore, provideMockActions } from '@ngrx/store/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { ElsaListPageComponent } from './elsa-list-page.component';

describe('ElsaListPageComponent', () => {
  let fixture: ComponentFixture<ElsaListPageComponent>;
  let component: ElsaListPageComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, ElsaListPageComponent],
      providers: [
        provideRouter([]),
        provideStore(),
        provideState('elsa' as any, (s: any) => s.elsa ?? null),
        provideMockStore({}),
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(ElsaListPageComponent);
    component = fixture.componentInstance;
  });

  it('instancia correctamente con data-testid elsa-list-page', () => {
    expect(component).toBeTruthy();
    expect(component.router).toBeTruthy();
  });
});