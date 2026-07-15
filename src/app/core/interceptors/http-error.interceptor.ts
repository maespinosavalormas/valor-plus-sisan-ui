import { Injectable, inject } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpResponseBase,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { ToastService } from '../../shared/services/toast.service';
import { Router } from '@angular/router';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  private toastService = inject(ToastService);
  private router = inject(Router);

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        this.handleError(error, req);
        return throwError(() => error);
      }),
    );
  }

  private handleError(error: HttpErrorResponse, req: HttpRequest<any>): void {
    switch (error.status) {
      case 401:
        this.handle401(error);
        break;
      case 404:
        this.handle404(error);
        break;
      case 413:
        this.handle413(error);
        break;
      case 415:
        this.handle415(error);
        break;
      case 0:
        this.handleNetworkError(error);
        break;
      default:
        this.toastService.show(error.error?.message || 'Error inesperado', 'error');
    }
  }

  private handle401(error: HttpErrorResponse): void {
    // Save error text to sessionStorage for re-auth
    if (error.error?.message) {
      sessionStorage.setItem('auth_error', error.error.message);
    }
    this.toastService.show('Sesión expirada. Inicie sesión nuevamente.', 'error');
    // Redirect to login after a short delay
    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 2000);
  }

  private handle404(error: HttpErrorResponse): void {
    this.toastService.show('Expediente Nutricional Inexistente', 'error');
  }

  private handle413(error: HttpErrorResponse): void {
    this.toastService.show('Payload demasiado grande. El archivo excede el límite permitido.', 'error');
  }

  private handle415(error: HttpErrorResponse): void {
    this.toastService.show('Tipo de archivo no soportado', 'error');
  }

  private handleNetworkError(error: HttpErrorResponse): void {
    this.toastService.show('Carga interrumpida. Verifique su conexión a internet.', 'error');
  }
}
