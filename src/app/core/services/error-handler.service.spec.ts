import { ErrorHandlerService } from './error-handler.service';
import { HttpErrorResponse } from '@angular/common/http';
import { LoggerService } from './logger.service';
import { Router } from '@angular/router';

describe('ErrorHandlerService', () => {
  let service: ErrorHandlerService;
  let mockInjector: any;
  let mockLogger: any;
  let mockRouter: any;

  beforeEach(() => {
    mockLogger = {
      error: jest.fn()
    };

    mockRouter = {
      navigate: jest.fn()
    };

    mockInjector = {
      get: jest.fn((token: any) => {
        if (token === LoggerService) {
          return mockLogger;
        }
        if (token === Router) {
          return mockRouter;
        }
        return null;
      })
    };

    service = new ErrorHandlerService(mockInjector);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have handleError method', () => {
    expect(service.handleError).toBeDefined();
  });

  it('should handle client errors', () => {
    const error = new Error('Test error');
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    service.handleError(error);
    
    expect(consoleErrorSpy).toHaveBeenCalledWith('ErrorHandler:', error);
    consoleErrorSpy.mockRestore();
  });

  it('should handle HTTP 401 errors and navigate to login', () => {
    const error = new HttpErrorResponse({
      error: 'Unauthorized',
      status: 401,
      statusText: 'Unauthorized'
    });

    service.handleError(error);
    
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth/login']);
  });

  it('should handle HTTP 403 errors and navigate to unauthorized', () => {
    const error = new HttpErrorResponse({
      error: 'Forbidden',
      status: 403,
      statusText: 'Forbidden'
    });

    service.handleError(error);
    
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/unauthorized']);
  });

  it('should handle HTTP 404 errors and navigate to not-found', () => {
    const error = new HttpErrorResponse({
      error: 'Not Found',
      status: 404,
      statusText: 'Not Found'
    });

    service.handleError(error);
    
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/not-found']);
  });

  it('should log server errors', () => {
    const error = new HttpErrorResponse({
      error: 'Server Error',
      status: 500,
      statusText: 'Internal Server Error'
    });

    service.handleError(error);
    
    expect(mockLogger.error).toHaveBeenCalledWith('Server error', error);
  });
});
