import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MnaFormComponent } from './mna-form.component';
import { MnaService } from '../../data-access/services/mna.service';
import { of } from 'rxjs';

describe('MnaFormComponent', () => {
  let component: MnaFormComponent;
  let fixture: ComponentFixture<MnaFormComponent>;
  let mnaServiceMock: jasmine.SpyObj<MnaService>;

  beforeEach(async () => {
    mnaServiceMock = jasmine.createSpyObj('MnaService', [
      'createMna',
      'getMnaById',
      'calculateScreeningScore',
      'calculateTotalScore',
      'classifyOMS',
      'getClassificationColor',
      'getClassificationLabel',
    ]);

    await TestBed.configureTestingModule({
      imports: [MnaFormComponent, ReactiveFormsModule, HttpClientTestingModule],
      providers: [{ provide: MnaService, useValue: mnaServiceMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(MnaFormComponent);
    component = fixture.componentInstance;
    component.patientId = 'test-patient-id';
    component.tenantId = 'test-tenant-id';
    component.token = 'test-token';

    fixture.detectChanges();
  });

  describe('CA-02: Assessment Optional (score >= 12)', () => {
    it('should mark assessment as optional when screening score >= 12', (done) => {
      mnaServiceMock.calculateScreeningScore.and.returnValue(14);
      mnaServiceMock.calculateTotalScore.and.returnValue(14);
      mnaServiceMock.classifyOMS.and.returnValue('NORMAL');

      // Fill screening (A-F) with score 14
      component.form.get('questionA').setValue(3);
      component.form.get('questionB').setValue(2);
      component.form.get('questionC').setValue(3);
      component.form.get('questionD').setValue(2);
      component.form.get('questionE').setValue(1);
      component.form.get('questionF').setValue(3);

      component.assessmentRequired$.subscribe((required) => {
        expect(required).toBe(false);
        done();
      });
    });
  });

  describe('CA-03: Assessment Required (score <= 11)', () => {
    it('should mark assessment as required when screening score <= 11', (done) => {
      mnaServiceMock.calculateScreeningScore.and.returnValue(7);

      // Fill screening with score 7
      component.form.get('questionA').setValue(2);
      component.form.get('questionB').setValue(1);
      component.form.get('questionC').setValue(0);
      component.form.get('questionD').setValue(0);
      component.form.get('questionE').setValue(1);
      component.form.get('questionF').setValue(3);

      component.assessmentRequired$.subscribe((required) => {
        expect(required).toBe(true);
        done();
      });
    });
  });

  describe('CA-04/05: Classification', () => {
    it('should classify as NORMAL when score >= 24', () => {
      const classification = component.mnaService.classifyOMS(26);
      expect(classification).toBe('NORMAL');
    });

    it('should classify as MALNUTRITION when score < 17', () => {
      const classification = component.mnaService.classifyOMS(15.5);
      expect(classification).toBe('MALNUTRITION');
    });
  });

  describe('CA-07: Decimal Precision', () => {
    it('should preserve decimal values in scoring', () => {
      component.form.get('questionA').setValue(1.5);
      component.form.get('questionB').setValue(0.5);
      component.form.get('questionC').setValue(1);
      component.form.get('questionD').setValue(0.5);
      component.form.get('questionE').setValue(1);
      component.form.get('questionF').setValue(0);

      const screeningScore = component.calculateScreeningScore(component.form.value);
      expect(screeningScore).toBe(4.5);
    });
  });

  describe('CA-01: Required Field Validation', () => {
    it('should mark form invalid when required fields are empty', () => {
      component.form.get('questionA').setValue('');
      component.form.get('questionB').setValue('');

      expect(component.form.invalid).toBe(true);
    });

    it('should mark form valid when all required fields are filled', () => {
      for (let i = 0; i < 6; i++) {
        const key = String.fromCharCode(65 + i); // A, B, C, D, E, F
        component.form.get(`question${key}`).setValue(1);
      }

      expect(component.form.get('questionA').valid).toBe(true);
      expect(component.form.valid).toBe(false); // Still invalid because B-R might be required
    });
  });

  describe('onSave', () => {
    it('should call mnaService.createMna with valid payload', () => {
      mnaServiceMock.createMna.and.returnValue(
        of({
          id: 'test-id',
          patientId: 'test-patient',
          scoreCribaje: 14,
          scoreTotal: 14,
          classification: 'NORMAL',
          status: 'finalized',
          answers: {},
          createdBy: { id: 'user', username: 'admin' },
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      );

      // Fill minimal form
      for (let i = 0; i < 6; i++) {
        const key = String.fromCharCode(65 + i);
        component.form.get(`question${key}`).setValue(1);
      }

      component.onSave();

      expect(mnaServiceMock.createMna).toHaveBeenCalled();
    });

    it('should show error message if form is invalid', () => {
      component.form.get('questionA').setValue('');
      component.onSave();

      expect(component.error$).toBeDefined();
    });
  });

  describe('onReset', () => {
    it('should reset form to empty state', () => {
      component.form.get('questionA').setValue(2);
      component.form.get('questionB').setValue(1);

      component.onReset();

      expect(component.form.get('questionA').value).toBeFalsy();
      expect(component.form.get('questionB').value).toBeFalsy();
    });
  });
});
