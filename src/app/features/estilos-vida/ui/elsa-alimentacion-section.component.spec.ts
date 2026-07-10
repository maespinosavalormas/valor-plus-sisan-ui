import '@angular/compiler';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ElsaAlimentacionSectionComponent } from './elsa-alimentacion-section.component';

describe('ElsaAlimentacionSectionComponent', () => {
  let component: ElsaAlimentacionSectionComponent;
  let form: FormGroup;
  const fb = new FormBuilder();

  function setup(): void {
    form = fb.group({
      alim_fruits_days: [null as number | null, [Validators.required, Validators.min(0), Validators.max(7)]],
      alim_fruits_portions: [{ value: null, disabled: true }],
      alim_vegetables_days: [null as number | null, [Validators.required, Validators.min(0), Validators.max(7)]],
      alim_vegetables_portions: [{ value: null, disabled: true }],
      alim_salt_added: [false, Validators.required],
    });
    component = new ElsaAlimentacionSectionComponent();
    component.form = form;
    component.ngOnInit();
  }

  afterEach(() => component.ngOnDestroy());

  it('CA-12: 7 días × 3 porciones → preview=3 RISK', () => {
    setup();
    form.get('alim_fruits_days')!.setValue(7);
    form.get('alim_fruits_portions')!.enable();
    form.get('alim_fruits_portions')!.setValue(3);
    form.get('alim_vegetables_days')!.setValue(0);

    component.refreshPreview();
    expect(component.preview?.total).toBe(3);
    expect(component.preview?.classification).toBe('RISK');
  });

  it('cuando fruits_days=0 → portions se deshabilita y sectionValid() OK', () => {
    setup();
    form.get('alim_fruits_days')!.setValue(0);
    form.get('alim_vegetables_days')!.setValue(3);
    form.get('alim_vegetables_portions')!.enable();
    form.get('alim_vegetables_portions')!.setValue(2);
    form.get('alim_salt_added')!.setValue(true);
    expect(form.get('alim_fruits_portions')!.disabled).toBe(true);
    expect(component.sectionValid()).toBe(true);
  });

  it('sectionValid false cuando required vacíos', () => {
    setup();
    expect(component.sectionValid()).toBe(false);
  });

  it('preview null cuando days null inicial', () => {
    setup();
    expect(component.preview).toBeNull();
  });

  it('onBlur marca touched', () => {
    setup();
    form.get('alim_fruits_days')!.setValue(8);
    component.onBlur('alim_fruits_days');
    expect(form.get('alim_fruits_days')!.touched).toBe(true);
  });
});
