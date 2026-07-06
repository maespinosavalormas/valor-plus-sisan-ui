import { Routes } from '@angular/router';
import { RoleGuard } from '../../core/guards/role.guard';

export const ESTILOS_VIDA_ROUTES: Routes = [
  {
    path: '',
    title: 'Formularios ELSA',
    loadComponent: () =>
      import('./feature/elsa-list-page/elsa-list-page.component').then(
        (m) => m.ElsaListPageComponent,
      ),
  },
  {
    path: 'nuevo',
    title: 'Nuevo cuestionario ELSA',
    canActivate: [RoleGuard],
    data: { expectedRoles: ['GOBERNACION', 'MUNICIPIO'] },
    loadComponent: () =>
      import('./feature/elsa-form-page/elsa-form-page.component').then(
        (m) => m.ElsaFormPageComponent,
      ),
  },
  {
    path: ':id',
    title: 'Detalle ELSA',
    loadComponent: () =>
      import('./feature/elsa-detail-page/elsa-detail-page.component').then(
        (m) => m.ElsaDetailPageComponent,
      ),
  },
];