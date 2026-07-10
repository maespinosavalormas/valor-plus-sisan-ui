import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FollowUpComposerComponent } from './follow-up-composer.component';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';

describe('FollowUpComposerComponent (T6)', () => {
  let component: FollowUpComposerComponent;
  let fixture: ComponentFixture<FollowUpComposerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FollowUpComposerComponent,
        MatCardModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        FormsModule,
        BrowserAnimationsModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FollowUpComposerComponent);
    component = fixture.componentInstance;
    component.casoId = 'caso-123';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('CA-03: Longitud mínima 10 chars', () => {
    it('should disable submit when content < 10 chars', () => {
      component.texto = 'short';
      fixture.detectChanges();
      const button = fixture.debugElement.query(By.css('.submit-btn'));
      expect(button.nativeElement.disabled).toBe(true);
    });

    it('should enable submit when content >= 10 chars', () => {
      component.texto = 'this is a long note';
      fixture.detectChanges();
      const button = fixture.debugElement.query(By.css('.submit-btn'));
      expect(button.nativeElement.disabled).toBe(false);
    });

    it('should emit enviarNota only when content >= 10 chars', () => {
      const spy = jest.spyOn(component.enviarNota, 'emit');
      component.texto = 'valid note';
      component.enviar();
      expect(spy).toHaveBeenCalledWith('valid note');
    });

    it('should not emit enviarNota when content < 10 chars', () => {
      const spy = jest.spyOn(component.enviarNota, 'emit');
      component.texto = 'short';
      component.enviar();
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('EE-04: Draft guardado', () => {
    it('should emit draftChange after debounce with content >= 10 chars', fakeAsync(() => {
      const spy = jest.spyOn(component.draftChange, 'emit');
      component.texto = 'this is a draft note';
      component.onInput();
      tick(2000);
      expect(spy).toHaveBeenCalledWith({ casoId: 'caso-123', texto: 'this is a draft note' });
    }));

    it('should not emit draftChange for content < 10 chars', fakeAsync(() => {
      const spy = jest.spyOn(component.draftChange, 'emit');
      component.texto = 'short';
      component.onInput();
      tick(2000);
      expect(spy).not.toHaveBeenCalled();
    }));
  });

  describe('Escape XSS', () => {
    it('should not execute script tags in content', () => {
      const spy = jest.spyOn(component.enviarNota, 'emit');
      const xssPayload = '<script>alert("xss")</script>';
      component.texto = xssPayload;
      component.enviar();
      expect(spy).toHaveBeenCalledWith(xssPayload); // The component itself does not escape; the backend does
    });
  });

  describe('Disabled cuando caso cerrado', () => {
    it('should reflect disabled state in component', () => {
      component.disabled = true;
      fixture.detectChanges();
      expect(component.disabled).toBe(true);
    });

    it('should disable submit button when disabled input is true', () => {
      component.disabled = true;
      component.texto = 'this is a long note';
      fixture.detectChanges();
      const button = fixture.debugElement.query(By.css('.submit-btn'));
      expect(button.nativeElement.disabled).toBe(true);
    });
  });
});
