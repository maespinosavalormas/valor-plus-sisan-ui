import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TamizajeFormComponent } from './tamizaje-form.component';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';

describe('TamizajeFormComponent', () => {
  let component: TamizajeFormComponent;
  let fixture: ComponentFixture<TamizajeFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TamizajeFormComponent, NoopAnimationsModule],
      providers: [
        {
          provide: MatDialog,
          useValue: { open: () => ({ afterClosed: () => of(false) }) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TamizajeFormComponent);
    component = fixture.componentInstance;
    component.casoId = '1';
    component.menor = {
      menorId: 'm1',
      nombre: 'Test Menor',
      fechaNacimiento: '2024-01-01',
      edadActualMeses: 12,
      sexo: 'M',
      estadoCaso: 'ACTIVO',
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not throw when editingTamizaje is set before ngOnInit (regression)', () => {
    const freshFixture = TestBed.createComponent(TamizajeFormComponent);
    const freshComponent = freshFixture.componentInstance;
    freshComponent.editingTamizaje = {
      id: 't1',
      fechaTamizaje: '2024-01-01',
      pesoKg: 8,
      tallaCm: 70,
      tallaMedicion: 'L',
      edemaBilateral: 0,
    } as never;
    expect(() => freshFixture.detectChanges()).not.toThrow();
  });

  it('should show talla warning when <24m and standing measurement (CA-01)', () => {
    component.menor = { ...component.menor!, edadActualMeses: 18 };
    component.form.patchValue({ tallaMedicion: 'H' });
    component['updateTallaWarning']();
    expect(component.showTallaWarning).toBe(true);
  });

  it('should disable PB when age outside 6-59 months (CA-14)', () => {
    component.menor = { ...component.menor!, edadActualMeses: 61 };
    component['updatePbState']();
    expect(component.pbOptional).toBe(true);
    expect(component.form.get('perimetroBraquialCm')?.disabled).toBe(true);
  });

  it('should strip non-numeric characters from peso input (CA-13)', () => {
    const input = document.createElement('input');
    input.value = '12abc';
    const event = { target: input } as unknown as Event;
    component.onNumericInput(event, 'pesoKg');
    expect(input.value).toBe('12');
  });

  it('onSubmit emite dto en modo crear', () => {
    const spy = jest.fn();
    component.submitForm.subscribe(spy);
    component.form.patchValue({
      fechaTamizaje: '2024-06-01',
      pesoKg: '8.5',
      tallaCm: '72',
      tallaMedicion: 'L',
      edemaBilateral: 0,
    });
    component.onSubmit();
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({ pesoKg: 8.5, tallaCm: 72, fuenteDato: 'WEB' }),
    );
  });

  it('motivoRequired true cuando cambia peso en edición (CA-05)', () => {
    component.editingTamizaje = {
      id: 't1',
      fechaTamizaje: '2024-01-01',
      pesoKg: 8,
      tallaCm: 70,
      tallaMedicion: 'L',
      edemaBilateral: 0,
    } as never;
    component.ngOnChanges({
      editingTamizaje: {
        currentValue: component.editingTamizaje,
        previousValue: null,
        firstChange: true,
        isFirstChange: () => true,
      },
    });
    component.form.patchValue({ pesoKg: '9', tallaCm: '70' });
    expect(component.motivoRequired).toBe(true);
  });

  it('onSubmit bloquea si form invalido', () => {
    const spy = jest.fn();
    component.submitForm.subscribe(spy);
    component.form.patchValue({ pesoKg: '', tallaCm: '' });
    component.onSubmit();
    expect(spy).not.toHaveBeenCalled();
  });

  it('onSubmit emite updateDto en modo edición', () => {
    const spy = jest.fn();
    component.submitForm.subscribe(spy);
    component.editingTamizaje = {
      id: 't1',
      fechaTamizaje: '2024-01-01',
      pesoKg: 8,
      tallaCm: 70,
      tallaMedicion: 'L',
      edemaBilateral: 0,
    } as never;
    component.ngOnChanges({
      editingTamizaje: {
        currentValue: component.editingTamizaje,
        previousValue: null,
        firstChange: true,
        isFirstChange: () => true,
      },
    });
    component.form.patchValue({
      pesoKg: '8',
      tallaCm: '70',
      motivoEdicion: 'corrección',
    });
    component.onSubmit();
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({ motivoEdicion: 'corrección' }),
    );
  });
});
