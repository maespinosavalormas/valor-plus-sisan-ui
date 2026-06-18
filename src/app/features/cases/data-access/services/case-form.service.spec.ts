import { CaseFormService, CaseData } from './case-form.service';
import { of } from 'rxjs';

describe('CaseFormService', () => {
  let service: CaseFormService;

  beforeEach(() => {
    service = new CaseFormService();
  });

  afterEach(() => {
    service.clearEditing();
    service.clearCreatedCase();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('editCase', () => {
    it('should set editing case', () => {
      const mockCase = { id: 1, name: 'Test Case' };
      service.editCase(mockCase as any);

      expect(service.getCurrentEditingCase()).toEqual(mockCase);
    });
  });

  describe('saveCreatedCase', () => {
    it('should save created case', () => {
      const mockCaseData: CaseData = { id: 1, name: 'Test Case' };
      service.saveCreatedCase(mockCaseData);

      expect(service.getCurrentCreatedCase()).toEqual(mockCaseData);
    });
  });

  describe('clearEditing', () => {
    it('should clear editing case', () => {
      const mockCase = { id: 1, name: 'Test Case' };
      service.editCase(mockCase as any);
      service.clearEditing();

      expect(service.getCurrentEditingCase()).toBeNull();
    });
  });

  describe('clearCreatedCase', () => {
    it('should clear created case', () => {
      const mockCaseData: CaseData = { id: 1, name: 'Test Case' };
      service.saveCreatedCase(mockCaseData);
      service.clearCreatedCase();

      expect(service.getCurrentCreatedCase()).toBeNull();
    });
  });

  describe('getEditingCase', () => {
    it('should return observable of editing case', (done) => {
      const mockCase = { id: 1, name: 'Test Case' };
      service.editCase(mockCase as any);

      service.getEditingCase().subscribe((caseData) => {
        expect(caseData).toEqual(mockCase);
        done();
      });
    });

    it('should return null when no editing case', (done) => {
      service.getEditingCase().subscribe((caseData) => {
        expect(caseData).toBeNull();
        done();
      });
    });
  });

  describe('getCreatedCase', () => {
    it('should return observable of created case', (done) => {
      const mockCaseData: CaseData = { id: 1, name: 'Test Case' };
      service.saveCreatedCase(mockCaseData);

      service.getCreatedCase().subscribe((caseData) => {
        expect(caseData).toEqual(mockCaseData);
        done();
      });
    });

    it('should return null when no created case', (done) => {
      service.getCreatedCase().subscribe((caseData) => {
        expect(caseData).toBeNull();
        done();
      });
    });
  });

  describe('getCurrentEditingCase', () => {
    it('should return current editing case', () => {
      const mockCase = { id: 1, name: 'Test Case' };
      service.editCase(mockCase as any);

      const result = service.getCurrentEditingCase();

      expect(result).toEqual(mockCase);
    });

    it('should return null when no editing case', () => {
      const result = service.getCurrentEditingCase();

      expect(result).toBeNull();
    });
  });

  describe('getCurrentCreatedCase', () => {
    it('should return current created case', () => {
      const mockCaseData: CaseData = { id: 1, name: 'Test Case' };
      service.saveCreatedCase(mockCaseData);

      const result = service.getCurrentCreatedCase();

      expect(result).toEqual(mockCaseData);
    });

    it('should return null when no created case', () => {
      const result = service.getCurrentCreatedCase();

      expect(result).toBeNull();
    });
  });

  describe('getCurrentCreatedCaseAsJson', () => {
    it('should return JSON string of created case', () => {
      const mockCaseData: CaseData = { id: 1, name: 'Test Case' };
      service.saveCreatedCase(mockCaseData);

      const result = service.getCurrentCreatedCaseAsJson();

      expect(result).toBe(JSON.stringify(mockCaseData, null, 2));
    });

    it('should return null when no created case', () => {
      const result = service.getCurrentCreatedCaseAsJson();

      expect(result).toBeNull();
    });
  });
});
