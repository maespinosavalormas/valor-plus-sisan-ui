import {
  ApplicationConfig,
  ErrorHandler,
  isDevMode,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import {
  provideHttpClient,
  withInterceptorsFromDi,
  withFetch,
  HTTP_INTERCEPTORS,
} from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { environment } from '../environments/environment';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { appReducers, metaReducers } from './core/store/app.reducer';
import { AuthEffects } from './features/auth/data-access/store/auth.effects';
import { TamizajesEffects } from './tamizajes/store/tamizajes.effects';
import { AuthService } from './core/services/auth.service';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { ErrorHandlerService } from './core/services/error-handler.service';
import { LoadingService } from './core/services/loading.service';
import { LoggerService } from './core/services/logger.service';
import { ApiService } from './core/services/api.service';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(withFetch(), withInterceptorsFromDi()),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    { provide: ErrorHandler, useClass: ErrorHandlerService },
    provideStore(appReducers, { metaReducers }),
    provideEffects([AuthEffects, TamizajesEffects]),
    ...(isDevMode() && !environment.production
      ? [
          provideStoreDevtools({
            maxAge: 25,
            logOnly: environment.production,
          }),
        ]
      : []),
    provideClientHydration(),
    AuthGuard,
    RoleGuard,
    LoadingService,
    LoggerService,
    ApiService,
    AuthService,
  ],
};
