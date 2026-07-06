import '@angular/compiler';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideStore, provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ElsaFormPageComponent } from './elsa-form-page.component';
import { elsaReducer } from '../../data-access/elsa.reducer';
import { ElsaEffects } from '../../data-access/elsa.effects';
import { CreateELSAFormDto } from '../../data-access/elsa.contracts';

describe('ElsaFormPageComponent (logic-only)', () => {
  let component: ElsaFormPageComponent;
  let fixture: ComponentFixture<ElsaFormPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, ElsaFormPageComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideStore(),
        provideState('elsa', elsaReducer),
        provideEffects([ElsaEffects]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ElsaFormPageComponent);
    component = fixture.componentInstance;
    component.ngOnInit();
  });

  afterEach(() => component.ngOnDestroy());

  it('inicializa form con todos los controles necesarios', () => {
    expect(component.form).toBeTruthy();
    expect(component.form.get('patient_id')).toBeTruthy();
    expect(component.form.get('patientDocument')).toBeTruthy();
    expect(component.form.get('evaluation_date')).toBeTruthy();
    expect(component.form.get('alim_fruits_days')).toBeTruthy();
    expect(component.form.get('af_vigorous_days')).toBeTruthy();
    expect(component.form.get('tobacco_current')).toBeTruthy();
    expect(component.form.get('alcohol_frequency')).toBeTruthy();
  });

  it('controles requridos arrancan invalid → form invalid', () => {
    expect(component.form.invalid).toBe(true);
  });

  it('submitForm no llama crearELSA cuando form inválido', () => {
    const spy = jest.spyOn(component.elsa, 'crearELSA');
    component.submitForm();
    expect(spy).not.toHaveBeenCalled();
  });

  it('submitForm marca all touched cuando llamado con form inválido', () => {
    component.submitForm();
    expect(component.form.get('patient_id')?.touched).toBe(true);
    expect(component.form.get('alim_fruits_days')?.touched).toBe(true);
    expect(component.form.get('tobacco_current')?.touched).toBe(true);
  });

  it('submitForm calls crearELSA cuando form válido, isSubmitting=false', () => {
    fillValidForm(component);
    // força condición falsa para isSubmitting
    (component as any).isSubmitting = false;
    const spy = jest.spyOn(component.elsa, 'crearELSA');
    component.submitForm();
    expect(spy).toHaveBeenCalledTimes(1);
    const dtoArg = spy.mock.calls[0][0] as CreateELSAFormDto;
    expect(dtoArg.patient_id).toBe('p1');
    expect(dtoArg.idempotency_key).toBeTruthy();
  });

  it('submitForm no llama crearELSA cuando isSubmitting=true (debounce)', () => {
    fillValidForm(component);
    (component as any).isSubmitting = true;
    const spy = jest.spyOn(component.elsa, 'crearELSA');
    component.submitForm();
    expect(spy).not.toHaveBeenCalled();
  });

  it('draft se restaura desde sessionStorage (EE-02)', () => {
    const draft = { patient_id: 'p-from-draft', evaluation_date: '2026-01-01' };
    sessionStorage.setItem('elsa_draft_v1', JSON.stringify(draft));
    component.ngOnInit();
    expect(component.form.get('patient_id')?.value).toBe('p-from-draft');
    expect(component.form.get('evaluation_date')?.value).toBe('2026-01-01');
    sessionStorage.removeItem('elsa_draft_v1');
  });

  it('sessionStorage inválido se ignora y limpia (defensive)', () => {
    sessionStorage.setItem('elsa_draft_v1', '{malformed json');
    expect(() => component.ngOnInit()).not.toThrow();
    expect(component.form.get('patient_id')?.value).toBe(null);
  });
});

function fillValidForm(component: ElsaFormPageComponent): void {
  component.form.patchValue({
    patient_id: 'p1',
    evaluation_date: '2026-07-03',
    alim_fruits_days: 5,
    alim_vegetables_days: 7,
    alim_salt_added: false,
    af_vigorous_days: 3,
    af_moderate_days: 2,
    af_sedentary_min: 480,
    tobacco_current: false,
    alcohol_frequency: 0,
  });
  // Habilitar controles condiionales (disabled por defecto)
  component.form.get('alim_fruits_portions')?.enable();
  component.form.get('alim_vegetables_portions')?.enable();
  component.form.get('alim_fruits_portions')?.setValue(2);
  component.form.get('alim_vegetables_portions')?.setValue(3);
}