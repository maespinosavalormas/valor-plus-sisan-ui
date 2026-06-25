import { Routes } from '@angular/router';
import { ExpedienteRedirectComponent } from './expediente/expediente-redirect.component';

export const TAMIZAJES_ROUTES: Routes = [
  {
    path: ':casoId/expediente',
    component: ExpedienteRedirectComponent,
  },
];
