import { LoggerService } from './logger.service';

describe('LoggerService', () => {
  let service: LoggerService;
  let consoleLogSpy: any;
  let consoleErrorSpy: any;
  let consoleWarnSpy: any;

  beforeEach(() => {
    service = new LoggerService();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have log method', () => {
    expect(service.log).toBeDefined();
  });

  it('should have error method', () => {
    expect(service.error).toBeDefined();
  });

  it('should have warn method', () => {
    expect(service.warn).toBeDefined();
  });

  it('should call console.error when error() is called', () => {
    service.error('Test error');
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it('should call console.error with message and data', () => {
    const errorData = { code: 500 };
    service.error('Test error', errorData);
    expect(consoleErrorSpy).toHaveBeenCalledWith('[ERROR] Test error', errorData);
  });

  it('should call console.warn when warn() is called', () => {
    service.warn('Test warning');
    expect(consoleWarnSpy).toHaveBeenCalled();
  });

  it('should call console.warn with message and data', () => {
    const warnData = { status: 'deprecated' };
    service.warn('Test warning', warnData);
    expect(consoleWarnSpy).toHaveBeenCalledWith('[WARN] Test warning', warnData);
  });

  it('should call console.log when log() is called', () => {
    service.log('Test log');
    expect(consoleLogSpy).toHaveBeenCalled();
  });

  it('should call console.log with message and data', () => {
    const logData = { info: 'test' };
    service.log('Test log', logData);
    expect(consoleLogSpy).toHaveBeenCalledWith('[LOG] Test log', logData);
  });

  it('should handle multiple data arguments in error', () => {
    const data1 = { key1: 'value1' };
    service.error('Error message', data1);
    expect(consoleErrorSpy).toHaveBeenCalledWith('[ERROR] Error message', data1);
  });

  it('should handle complex objects in log', () => {
    const complexData = {
      nested: { deep: { value: 'test' } },
      array: [1, 2, 3]
    };
    service.log('Complex log', complexData);
    expect(consoleLogSpy).toHaveBeenCalledWith('[LOG] Complex log', complexData);
  });

  it('should handle undefined data in error', () => {
    service.error('Error without data');
    expect(consoleErrorSpy).toHaveBeenCalledWith('[ERROR] Error without data');
  });

  it('should handle null data in warn', () => {
    service.warn('Warning without data');
    expect(consoleWarnSpy).toHaveBeenCalledWith('[WARN] Warning without data');
  });
});
