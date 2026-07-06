import '@angular/compiler';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ElsaAlcoholSectionComponent } from './elsa-alcohol-section.component';

describe('ElsaAlcoholSectionComponent', () => {
  let component: ElsaAlcoholSectionComponent;
  let form: FormGroup;
  const fb = new FormBuilder();

  function setup(): void {
    form = fb.group({
      alcohol_frequency: [null as number | null, [Validators.required, Validators.min(0), Validators.max(4)]],
      alcohol_quantity: [{ value: 0, disabled: true }],
      alcohol_binge: [{ value: 0, disabled: true }],
    });
    component = new ElsaAlcoholSectionComponent();
    component.form = form;
    component.patientSex = 'F';
    component.ngOnInit();
  }

  afterEach(() => component.ngOnDestroy());

  it('frequency=0 deshabilita quantity/binge y setea 0', () => {
    setup();
    form.get('alcohol_frequency')!.setValue(0);
    expect(form.get('alcohol_quantity')!.disabled).toBe(true);
    expect(form.get('alcohol_binge')!.disabled).toBe(true);
    expect(form.get('alcohol_quantity')!.value).toBe(0);
    expect(form.get('alcohol_binge')!.value).toBe(0);
  });

  it('frequency=2 habilita + required quantity/binge', () => {
    setup();
    form.get('alcohol_frequency')!.setValue(2);
    expect(form.get('alcohol_quantity')!.enabled).toBe(true);
    expect(form.get('alcohol_binge')!.enabled).toBe(true);
    expect(form.get('alcohol_quantity')!.hasValidator(Validators.required)).toBe(true);
  });

  it('AUDIT-C 2+1+0 mujer → RISK (umbral 3)', () => {
    setup();
    form.get('alcohol_frequency')!.setValue(2);
    form.get('alcohol_quantity')!.enable();
    form.get('alcohol_quantity')!.setValue(1);
    form.get('alcohol_binge')!.enable();
    form.get('alcohol_binge')!.setValue(0);
    component.refreshPreview();
    expect(component.preview?.score).toBe(3);
    expect(component.preview?.classification).toBe('RISK');
  });

  it('AUDIT-C 2+1+0 hombre → NO_RISK (umbral 4)', () => {
    setup();
    component.patientSex = 'M';
    form.get('alcohol_frequency')!.setValue(2);
    form.get('alcohol_quantity')!.enable();
    form.get('alcohol_quantity')!.setValue(1);
    form.get('alcohol_binge')!.enable();
    form.get('alcohol_binge')!.setValue(0);
    component.refreshPreview();
    expect(component.preview?.classification).toBe('NO_RISK');
  });

  it('preview null si patientSex es null', () => {
    setup();
    component.patientSex = null;
    form.get('alcohol_frequency')!.setValue(2);
    component.refreshPreview();
    expect(component.preview).toBeNull();
  });

  it('sectionValid true con frequency=0', () => {
    setup();
    form.get('alcohol_frequency')!.setValue(0);
    expect(component.sectionValid()).toBe(true);
  });

  it('sectionValid false cuando required sin valor', () => {
    setup();
    expect(component.sectionValid()).toBe(false);
  });
});
