import '@angular/compiler';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ElsaTabacoSectionComponent } from './elsa-tabaco-section.component';

describe('ElsaTabacoSectionComponent (CA-03, CA-04, CA-09)', () => {
  let component: ElsaTabacoSectionComponent;
  let form: FormGroup;
  const fb = new FormBuilder();

  function setup(patientAge: number | null = 30): void {
    form = fb.group({
      tobacco_current: [null as boolean | null, Validators.required],
      tobacco_start_age: [{ value: null, disabled: true }],
      tobacco_cigs_day: [{ value: null, disabled: true }],
    });
    component = new ElsaTabacoSectionComponent();
    component.form = form;
    component.patientAge = patientAge;
    component.ngOnInit();
  }

  afterEach(() => component.ngOnDestroy());

  it('CA-03: tobacco_current=true habilita + required', () => {
    setup();
    form.get('tobacco_current')!.setValue(true);
    expect(form.get('tobacco_start_age')!.enabled).toBe(true);
    expect(form.get('tobacco_cigs_day')!.enabled).toBe(true);
    expect(form.get('tobacco_start_age')!.hasValidator(Validators.required)).toBe(true);
  });

  it('CA-04: tobacco_current=false deshabilita + null', () => {
    setup();
    form.get('tobacco_current')!.setValue(true);
    form.get('tobacco_start_age')!.setValue(20);
    form.get('tobacco_cigs_day')!.setValue(10);

    form.get('tobacco_current')!.setValue(false);
    expect(form.get('tobacco_start_age')!.enabled).toBe(false);
    expect(form.get('tobacco_cigs_day')!.enabled).toBe(false);
    expect(form.get('tobacco_start_age')!.value).toBeNull();
    expect(form.get('tobacco_cigs_day')!.value).toBeNull();
  });

  it('CA-09: startAge > patientAge → ageError seteado', () => {
    setup(30);
    form.get('tobacco_current')!.setValue(true);
    form.get('tobacco_start_age')!.setValue(40);
    form.get('tobacco_start_age')!.markAsDirty();
    form.get('tobacco_start_age')!.updateValueAndValidity({ emitEvent: true });
    component.validateAge();
    expect(component.ageError()).toContain('edad del paciente');
  });

  it('CA-09: startAge=5 → inválido', () => {
    setup(30);
    form.get('tobacco_current')!.setValue(true);
    form.get('tobacco_start_age')!.setValue(5);
    component.validateAge();
    expect(component.ageError()).toContain('mayor a 5');
  });

  it('sectionValid false si current=null', () => {
    setup();
    expect(component.sectionValid()).toBe(false);
  });

  it('sectionValid true si current=false', () => {
    setup();
    form.get('tobacco_current')!.setValue(false);
    expect(component.sectionValid()).toBe(true);
  });

  it('sectionValid true si current=true y age/cigs válidos', () => {
    setup(30);
    form.get('tobacco_current')!.setValue(true);
    form.get('tobacco_start_age')!.setValue(18);
    form.get('tobacco_cigs_day')!.setValue(5);
    form.get('tobacco_start_age')!.markAsDirty();
    form.get('tobacco_cigs_day')!.markAsDirty();
    form.get('tobacco_start_age')!.updateValueAndValidity({ emitEvent: true });
    component.validateAge();
    expect(component.sectionValid()).toBe(true);
  });
});
