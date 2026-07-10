import '@angular/compiler';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ElsaActividadFisicaSectionComponent } from './elsa-actividad-fisica-section.component';

describe('ElsaActividadFisicaSectionComponent (CA-15)', () => {
  let component: ElsaActividadFisicaSectionComponent;
  let form: FormGroup;
  const fb = new FormBuilder();

  function setup(): void {
    form = fb.group({
      af_vigorous_days: [null as number | null, [Validators.required, Validators.min(0), Validators.max(7)]],
      af_vigorous_min: [{ value: null, disabled: true }],
      af_moderate_days: [null as number | null, [Validators.required, Validators.min(0), Validators.max(7)]],
      af_moderate_min: [{ value: null, disabled: true }],
      af_sedentary_min: [null as number | null, [Validators.required, Validators.min(0), Validators.max(1440)]],
    });
    component = new ElsaActividadFisicaSectionComponent();
    component.form = form;
    component.ngOnInit();
  }

  afterEach(() => component.ngOnDestroy());

  it('CA-15: suma > 1440 → timeSum error en af_sedentary_min', () => {
    setup();
    form.get('af_vigorous_days')!.setValue(3);
    form.get('af_vigorous_min')!.enable();
    form.get('af_vigorous_min')!.setValue(500);
    form.get('af_moderate_days')!.setValue(2);
    form.get('af_moderate_min')!.enable();
    form.get('af_moderate_min')!.setValue(500);
    form.get('af_sedentary_min')!.setValue(500); // 1500 > 1440
    component.refreshPreview();
    expect(form.get('af_sedentary_min')!.hasError('timeSum')).toBe(true);
  });

  it('CA-15: suma ≤ 1440 → sin timeSum', () => {
    setup();
    form.get('af_vigorous_days')!.setValue(1);
    form.get('af_vigorous_min')!.enable();
    form.get('af_vigorous_min')!.setValue(400);
    form.get('af_moderate_days')!.setValue(1);
    form.get('af_moderate_min')!.enable();
    form.get('af_moderate_min')!.setValue(400);
    form.get('af_sedentary_min')!.setValue(400); // 1200 ≤ 1440
    component.refreshPreview();
    expect(form.get('af_sedentary_min')!.hasError('timeSum')).toBe(false);
  });

  it('preview null cuando af_vigorous_days null', () => {
    setup();
    expect(component.preview).toBeNull();
  });

  it('METs preview=1680 con SPEC example (3×60×8 + 2×30×4)', () => {
    setup();
    form.get('af_vigorous_days')!.setValue(3);
    form.get('af_vigorous_min')!.enable();
    form.get('af_vigorous_min')!.setValue(60);
    form.get('af_moderate_days')!.setValue(2);
    form.get('af_moderate_min')!.enable();
    form.get('af_moderate_min')!.setValue(30);
    component.refreshPreview();
    expect(component.preview?.mets).toBe(1680);
    expect(component.preview?.classification).toBe('MODERADO');
  });

  it('vigorosa days=0 deshabilita minutos', () => {
    setup();
    form.get('af_vigorous_days')!.setValue(0);
    expect(form.get('af_vigorous_min')!.disabled).toBe(true);
  });

  it('sectionValid false cuando required vacíos', () => {
    setup();
    expect(component.sectionValid()).toBe(false);
  });
});
