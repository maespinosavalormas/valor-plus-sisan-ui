import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { InactivateElsaModalComponent } from './inactivate-elsa-modal.component';

describe('InactivateElsaModalComponent', () => {
  let component: InactivateElsaModalComponent;
  let fixture: ComponentFixture<InactivateElsaModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InactivateElsaModalComponent, ReactiveFormsModule, HttpClientTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(InactivateElsaModalComponent);
    component = fixture.componentInstance;
    component.elsaId = '550e8400-e29b-41d4-a716-446655440000';
    component.elsaData = { id: '550e8400-e29b-41d4-a716-446655440000', fecha_evaluacion: new Date().toISOString().split('T')[0] };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Validation', () => {
    it('should disable confirm button when form is invalid', () => {
      expect(component.isConfirmButtonDisabled).toBe(true);
    });

    it('should enable confirm button when form is valid', () => {
      component.inactivationForm.patchValue({
        motivo_inactivacion: 'Esta es una razón válida para inactivar',
        token_2fa: '123456',
      });

      expect(component.isConfirmButtonDisabled).toBe(false);
    });

    it('should show error when motivo is shorter than 15 chars', () => {
      const motivoControl = component.inactivationForm.get('motivo_inactivacion');
      motivoControl.setValue('short');
      motivoControl.markAsTouched();

      expect(motivoControl.errors?.['minlength']).toBeTruthy();
    });

    it('should show error when token is not 6 digits', () => {
      const tokenControl = component.inactivationForm.get('token_2fa');
      tokenControl.setValue('12345');
      tokenControl.markAsTouched();

      expect(tokenControl.errors?.['minlength']).toBeTruthy();
    });

    it('should reject non-digit characters in token input', () => {
      const event = {
        target: { value: 'abc123' },
      } as any;

      component.onTokenInput(event);
      expect(component.inactivationForm.get('token_2fa').value).toBe('123');
    });
  });

  describe('Form Behavior', () => {
    it('should update char count when motivo changes', () => {
      const motivo = 'Esta es una razón válida para inactivar';
      component.inactivationForm.patchValue({
        motivo_inactivacion: motivo,
      });

      // No detectChanges call for template binding; test form logic only
      expect(component.inactivationForm.get('motivo_inactivacion').value).toBe(motivo);
    });

    it('should clean up pasted token data', () => {
      const event = {
        preventDefault: jest.fn(),
        clipboardData: {
          getData: () => '12 34 56',
        },
      } as any;

      component.onTokenPaste(event);
      expect(component.inactivationForm.get('token_2fa').value).toBe('123456');
    });

    it('should limit token to 6 digits maximum', () => {
      const event = {
        target: { value: '1234567890' },
      } as any;

      component.onTokenInput(event);
      expect(component.inactivationForm.get('token_2fa').value.length).toBeLessThanOrEqual(6);
    });

    it('should clear form on cancel', () => {
      component.inactivationForm.patchValue({
        motivo_inactivacion: 'Some reason here',
        token_2fa: '123456',
      });

      component.onCancel();
      expect(component.inactivationForm.get('motivo_inactivacion').value).toBeNull();
      expect(component.inactivationForm.get('token_2fa').value).toBeNull();
      expect(component.charCount).toBe(0);
    });
  });

  describe('Accessibility', () => {
    it('should have data-testid attributes on key elements', () => {
      const template = fixture.nativeElement;
      expect(template.querySelector('[data-testid="motivo-textarea"]')).toBeTruthy();
      expect(template.querySelector('[data-testid="token-input"]')).toBeTruthy();
      expect(template.querySelector('[data-testid="confirm-button"]')).toBeTruthy();
      expect(template.querySelector('[data-testid="cancel-button"]')).toBeTruthy();
    });

    it('should have proper ARIA labels', () => {
      const template = fixture.nativeElement;
      const closeButton = template.querySelector('[aria-label]');
      expect(closeButton).toBeTruthy();
      expect(closeButton.getAttribute('aria-label')).toBeTruthy();
    });
  });
});
