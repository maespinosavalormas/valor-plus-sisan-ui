import { ApiService } from './api.service';
import { of } from 'rxjs';

describe('ApiService', () => {
  let service: ApiService;
  let mockHttp: any;

  beforeEach(() => {
    mockHttp = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn()
    };

    service = new ApiService(mockHttp);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Service Initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should have get method', () => {
      expect(service.get).toBeDefined();
    });

    it('should have post method', () => {
      expect(service.post).toBeDefined();
    });

    it('should have put method', () => {
      expect(service.put).toBeDefined();
    });

    it('should have delete method', () => {
      expect(service.delete).toBeDefined();
    });
  });

  describe('get method', () => {
    it('should call http.get with correct path', () => {
      const mockData = { data: 'test' };
      mockHttp.get.mockReturnValue(of(mockData));

      service.get('/test-path').subscribe();

      expect(mockHttp.get).toHaveBeenCalled();
      const callArgs = mockHttp.get.mock.calls[0];
      expect(callArgs[0]).toContain('/test-path');
      expect(callArgs[1]).toEqual({ params: {} });
    });

    it('should call http.get with params', () => {
      const mockData = { data: 'test' };
      mockHttp.get.mockReturnValue(of(mockData));
      const params = { page: 1, limit: 10 };

      service.get('/test-path', params).subscribe();

      expect(mockHttp.get).toHaveBeenCalled();
      const callArgs = mockHttp.get.mock.calls[0];
      expect(callArgs[0]).toContain('/test-path');
      expect(callArgs[1]).toEqual({ params });
    });

    it('should return Observable', () => {
      mockHttp.get.mockReturnValue(of({ data: 'test' }));
      const result = service.get('/test');
      expect(result).toBeDefined();
    });
  });

  describe('post method', () => {
    it('should call http.post with correct path and body', () => {
      const mockData = { success: true };
      mockHttp.post.mockReturnValue(of(mockData));
      const body = { name: 'test' };

      service.post('/test-path', body).subscribe();

      expect(mockHttp.post).toHaveBeenCalled();
      const callArgs = mockHttp.post.mock.calls[0];
      expect(callArgs[0]).toContain('/test-path');
      expect(callArgs[1]).toEqual(body);
    });

    it('should call http.post with empty body by default', () => {
      const mockData = { success: true };
      mockHttp.post.mockReturnValue(of(mockData));

      service.post('/test-path').subscribe();

      expect(mockHttp.post).toHaveBeenCalled();
      const callArgs = mockHttp.post.mock.calls[0];
      expect(callArgs[0]).toContain('/test-path');
      expect(callArgs[1]).toEqual({});
    });

    it('should return Observable', () => {
      mockHttp.post.mockReturnValue(of({ success: true }));
      const result = service.post('/test');
      expect(result).toBeDefined();
    });
  });

  describe('put method', () => {
    it('should call http.put with correct path and body', () => {
      const mockData = { success: true };
      mockHttp.put.mockReturnValue(of(mockData));
      const body = { name: 'updated' };

      service.put('/test-path', body).subscribe();

      expect(mockHttp.put).toHaveBeenCalled();
      const callArgs = mockHttp.put.mock.calls[0];
      expect(callArgs[0]).toContain('/test-path');
      expect(callArgs[1]).toEqual(body);
    });

    it('should call http.put with empty body by default', () => {
      const mockData = { success: true };
      mockHttp.put.mockReturnValue(of(mockData));

      service.put('/test-path').subscribe();

      expect(mockHttp.put).toHaveBeenCalled();
      const callArgs = mockHttp.put.mock.calls[0];
      expect(callArgs[0]).toContain('/test-path');
      expect(callArgs[1]).toEqual({});
    });

    it('should return Observable', () => {
      mockHttp.put.mockReturnValue(of({ success: true }));
      const result = service.put('/test');
      expect(result).toBeDefined();
    });
  });

  describe('delete method', () => {
    it('should call http.delete with correct path', () => {
      const mockData = { success: true };
      mockHttp.delete.mockReturnValue(of(mockData));

      service.delete('/test-path').subscribe();

      expect(mockHttp.delete).toHaveBeenCalled();
      const callArgs = mockHttp.delete.mock.calls[0];
      expect(callArgs[0]).toContain('/test-path');
    });

    it('should return Observable', () => {
      mockHttp.delete.mockReturnValue(of({ success: true }));
      const result = service.delete('/test');
      expect(result).toBeDefined();
    });
  });
});
