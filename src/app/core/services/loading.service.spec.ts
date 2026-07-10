import { LoadingService } from './loading.service';

describe('LoadingService', () => {
  let service: LoadingService;

  beforeEach(() => {
    service = new LoadingService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have loading$ observable', () => {
    expect(service.loading$).toBeDefined();
  });

  it('should start with loading false', async () => {
    const loading = await new Promise<boolean>((resolve) => {
      service.loading$.subscribe((loading) => resolve(loading));
    });
    expect(loading).toBe(false);
  });

  it('should show loading when show() is called', async () => {
    service.show();
    const loading = await new Promise<boolean>((resolve) => {
      service.loading$.subscribe((loading) => resolve(loading));
    });
    expect(loading).toBe(true);
  });

  it('should hide loading when hide() is called', async () => {
    service.show();
    service.hide();
    const loading = await new Promise<boolean>((resolve) => {
      service.loading$.subscribe((loading) => resolve(loading));
    });
    expect(loading).toBe(false);
  });

  it('should toggle loading state correctly', async () => {
    const states: boolean[] = [];
    
    service.loading$.subscribe((loading) => {
      states.push(loading);
      if (states.length === 3) {
        expect(states).toEqual([false, true, false]);
      }
    });

    service.show();
    service.hide();
  });
});
