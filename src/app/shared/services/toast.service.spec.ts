import { TestBed } from '@angular/core/testing';
import { ToastService, ToastMessage } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ToastService],
    });

    service = TestBed.inject(ToastService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('show', () => {
    it('should add a toast to the list', (done) => {
      service.toasts$.subscribe((toasts) => {
        if (toasts.length > 0) {
          expect(toasts[0].message).toBe('Test message');
          expect(toasts[0].type).toBe('success');
          done();
        }
      });

      service.show('Test message', 'success');
    });

    it('should set correct type for error toast', (done) => {
      service.toasts$.subscribe((toasts) => {
        if (toasts.length > 0) {
          expect(toasts[0].type).toBe('error');
          done();
        }
      });

      service.show('Error occurred', 'error');
    });

    it('should auto-remove toast after duration', (done) => {
      const shortDuration = 100; // 100ms for fast test
      service.show('Auto-remove test', 'info', shortDuration);

      setTimeout(() => {
        service.toasts$.subscribe((toasts) => {
          if (toasts.length === 0) {
            done();
          }
        });
      }, shortDuration + 50);
    });

    it('should have unique ID for each toast', (done) => {
      let id1: string, id2: string;

      service.toasts$.subscribe((toasts) => {
        if (toasts.length === 1) {
          id1 = toasts[0].id;
        } else if (toasts.length === 2) {
          id2 = toasts[1].id;
          expect(id1).not.toBe(id2);
          done();
        }
      });

      service.show('First toast');
      service.show('Second toast');
    });
  });

  describe('remove', () => {
    it('should remove specific toast by ID', () => {
      service.show('Keep this');
      service.show('Remove this');

      const toastsBefore = service['toasts'].value;
      expect(toastsBefore.length).toBe(2);

      // Remove the second toast
      service.remove(toastsBefore[1].id);

      const toastsAfter = service['toasts'].value;
      expect(toastsAfter.length).toBe(1);
      expect(toastsAfter[0].message).toBe('Keep this');
    });
  });

  describe('clear', () => {
    it('should remove all toasts', () => {
      service.show('Toast 1');
      service.show('Toast 2');
      service.show('Toast 3');

      expect(service['toasts'].value.length).toBe(3);

      service.clear();

      expect(service['toasts'].value.length).toBe(0);
    });
  });
});
