import { CaseService, CaseFilters, CasePage, CaseFull } from './case.service';
import { of } from 'rxjs';

describe('CaseService', () => {
  let service: CaseService;
  let mockHttp: any;

  beforeEach(() => {
    mockHttp = {
      get: jest.fn(),
      post: jest.fn()
    };

    service = new CaseService(mockHttp);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getCasesPage', () => {
    it('should get cases page without filters', (done) => {
      const mockPage: CasePage = {
        content: [],
        totalElements: 0,
        number: 0,
        size: 10,
        totalPages: 0
      };
      mockHttp.get.mockReturnValue(of(mockPage));

      service.getCasesPage().subscribe((page) => {
        expect(mockHttp.get).toHaveBeenCalledWith('http://localhost:3000/api/v1/cases/page', { params: expect.any(Object) });
        expect(page).toEqual(mockPage);
        done();
      });
    });

    it('should get cases page with filters', (done) => {
      const mockPage: CasePage = {
        content: [],
        totalElements: 0,
        number: 0,
        size: 10,
        totalPages: 0
      };
      const filters: CaseFilters = {
        page: 1,
        size: 20,
        states: ['active', 'pending']
      };
      mockHttp.get.mockReturnValue(of(mockPage));

      service.getCasesPage(filters).subscribe((page) => {
        expect(mockHttp.get).toHaveBeenCalled();
        expect(page).toEqual(mockPage);
        done();
      });
    });
  });

  describe('getCaseById', () => {
    it('should get case by id', (done) => {
      const mockCase: CaseFull = {
        id: 1,
        upgdCode: 'UPGD001',
        upgdName: 'Test UPDG',
        notificationDate: new Date(),
        state: { code: 'ACTIVE', name: 'Active' },
        event: { code: 'EVENT001', name: 'Event' },
        category: { code: 'CAT001', name: 'Category' }
      };
      mockHttp.get.mockReturnValue(of({ case: mockCase }));

      service.getCaseById(1).subscribe((caseData) => {
        expect(mockHttp.get).toHaveBeenCalledWith('http://localhost:3000/api/v1/cases/1');
        expect(caseData).toEqual(mockCase);
        done();
      });
    });
  });

  describe('assignUsersToCase', () => {
    it('should assign users to case', (done) => {
      const mockResponse = { caseId: 1, assignedUserIds: ['user1', 'user2'] };
      mockHttp.post.mockReturnValue(of(mockResponse));

      service.assignUsersToCase(1, ['user1', 'user2']).subscribe((response) => {
        expect(mockHttp.post).toHaveBeenCalledWith(
          'http://localhost:3000/api/v1/cases/1/responsibles',
          { userIds: ['user1', 'user2'] }
        );
        expect(response).toEqual(mockResponse);
        done();
      });
    });
  });

  describe('getAvailableResponsibles', () => {
    it('should get available responsibles for case', (done) => {
      const mockUsers = [{ userId: 'user1', firstName: 'John', lastName: 'Doe' }];
      mockHttp.get.mockReturnValue(of(mockUsers));

      service.getAvailableResponsibles(1).subscribe((users) => {
        expect(mockHttp.get).toHaveBeenCalledWith('http://localhost:3000/api/v1/cases/1/available-responsibles');
        expect(users).toEqual(mockUsers);
        done();
      });
    });
  });

  describe('getMyCases', () => {
    it('should get my cases', (done) => {
      const mockPage: CasePage = {
        content: [],
        totalElements: 0,
        number: 0,
        size: 10,
        totalPages: 0
      };
      mockHttp.get.mockReturnValue(of(mockPage));

      service.getMyCases().subscribe((page) => {
        expect(mockHttp.get).toHaveBeenCalledWith('http://localhost:3000/api/v1/cases/me', { params: expect.any(Object) });
        expect(page).toEqual(mockPage);
        done();
      });
    });
  });

  describe('getAvailableProfessionals', () => {
    it('should get available professionals for case', (done) => {
      const mockProfessionals = [{ userId: 'prof1', firstName: 'Jane', lastName: 'Smith' }];
      mockHttp.get.mockReturnValue(of(mockProfessionals));

      service.getAvailableProfessionals(1).subscribe((professionals) => {
        expect(mockHttp.get).toHaveBeenCalledWith('http://localhost:3000/api/v1/cases/1/available-professionals');
        expect(professionals).toEqual(mockProfessionals);
        done();
      });
    });
  });

  describe('assignProfessionalToCase', () => {
    it('should assign professional to case', (done) => {
      const mockResponse = { caseId: 1, professionalUserId: 'prof1' };
      mockHttp.post.mockReturnValue(of(mockResponse));

      service.assignProfessionalToCase(1, 'prof1').subscribe((response) => {
        expect(mockHttp.post).toHaveBeenCalledWith(
          'http://localhost:3000/api/v1/cases/1/professionals',
          { userId: 'prof1' }
        );
        expect(response).toEqual(mockResponse);
        done();
      });
    });
  });
});
