import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatusPanelComponent } from './status-panel.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';

describe('StatusPanelComponent (T6)', () => {
  let component: StatusPanelComponent;
  let fixture: ComponentFixture<StatusPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        StatusPanelComponent,
        MatDialogModule,
        MatCardModule,
        MatSelectModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatProgressBarModule,
        FormsModule,
        BrowserAnimationsModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StatusPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('CA-09: Upload validación', () => {
    it('should accept valid file types (pdf, jpeg, png)', () => {
      const validFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      const event = { target: { files: [validFile] } } as unknown as Event;
      component.onFileSelected(event);
      expect(component.archivoSeleccionado).toBe(validFile);
    });

    it('should reject invalid file types', () => {
      const spy = jest.spyOn(window, 'alert').mockImplementation(() => {});
      const invalidFile = new File(['content'], 'test.exe', { type: 'application/x-msdownload' });
      const event = { target: { files: [invalidFile] } } as unknown as Event;
      component.onFileSelected(event);
      expect(component.archivoSeleccionado).toBeNull();
      expect(spy).toHaveBeenCalledWith('CA-13: Solo se permiten archivos PDF, JPEG o PNG');
      spy.mockRestore();
    });

    it('should reject files exceeding 5MB', () => {
      const largeFile = new File(['x'], 'large.pdf', { type: 'application/pdf' });
      Object.defineProperty(largeFile, 'size', { value: 6 * 1024 * 1024 });
      const event = { target: { files: [largeFile] } } as unknown as Event;
      component.onFileSelected(event);
      expect(component.esTamanoValido).toBe(false);
    });

    it('should accept files within 5MB limit', () => {
      const smallFile = new File(['x'], 'small.pdf', { type: 'application/pdf' });
      Object.defineProperty(smallFile, 'size', { value: 2 * 1024 * 1024 });
      const event = { target: { files: [smallFile] } } as unknown as Event;
      component.onFileSelected(event);
      expect(component.esTamanoValido).toBe(true);
    });
  });

  describe('CA-12: Debounce / disabled', () => {
    it('should disable apply button when readOnly', () => {
      component.readOnly = true;
      fixture.detectChanges();
      const button = fixture.debugElement.query(By.css('.apply-btn'));
      expect(button.nativeElement.disabled).toBe(true);
    });

    it('should disable apply button when aplicando', () => {
      component.aplicando = true;
      fixture.detectChanges();
      const button = fixture.debugElement.query(By.css('.apply-btn'));
      expect(button.nativeElement.disabled).toBe(true);
    });
  });

  describe('CA-01: Bloqueo alta injustificada', () => {
    it('should show justificacion when RECUPERADO without criterios', () => {
      component.nuevoEstado = 'RECUPERADO';
      (component as any).cumpleCriteriosRecuperacion = false;
      fixture.detectChanges();
      expect(component.mostrarJustificacionAlta).toBe(true);
    });

    it('should hide justificacion when RECUPERADO with criterios', () => {
      component.nuevoEstado = 'RECUPERADO';
      (component as any).cumpleCriteriosRecuperacion = true;
      fixture.detectChanges();
      expect(component.mostrarJustificacionAlta).toBe(false);
    });
  });

  describe('Estado selector', () => {
    it('should list all terminal states', () => {
      expect(component.estadosDisponibles).toEqual(['RECUPERADO', 'FALLECIDO', 'ABANDONO', 'TRASLADO']);
    });

    it('should identify clinical states', () => {
      expect(component.esEstadoClinico('RECUPERADO')).toBe(true);
      expect(component.esEstadoClinico('FALLECIDO')).toBe(true);
      expect(component.esEstadoClinico('ABANDONO')).toBe(false);
    });
  });
});
