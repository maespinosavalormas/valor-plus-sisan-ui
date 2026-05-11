import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { LoggerService } from './logger.service';
import { Router } from '@angular/router';

@Injectable()
export class ErrorHandlerService implements ErrorHandler {
  constructor(private injector: Injector) {}

  handleError(error: Error | HttpErrorResponse): void {
    const logger = this.injector.get(LoggerService);
    const router = this.injector.get(Router);

    if (error instanceof HttpErrorResponse) {
      // Server error
      logger.error('Server error', error);

      if (error.status === 401) {
        router.navigate(['/auth/login']);
      } else if (error.status === 403) {
        router.navigate(['/unauthorized']);
      } else if (error.status === 404) {
        router.navigate(['/not-found']);
      }
    } else {
      // Client error
      logger.error('Client error', error);
    }

    console.error('ErrorHandler:', error);
  }
}
