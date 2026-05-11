import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./feature/targeting-up-page/targeting-up-page').then((m) => m.TargetingUpPageComponent),
  },
  {
    path: 'details/:id',
    loadComponent: () =>
      import('./feature/targeting-up-details/targeting-up-details.component').then(
        (m) => m.TargetingUpDetailsComponent
      ),
  },
  {
    path: 'new',
    loadComponent: () => import('./feature/targeting-up-form-page/targeting-up-form-page').then((m) => m.TargetingUpFormPageComponent),
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('./feature/targeting-up-form-page/targeting-up-form-page').then((m) => m.TargetingUpFormPageComponent),
  },
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatButtonModule,
    MatIconModule,
  ],
})
export class TargetingUpModule {}