import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./feature/legalization-packages-page/legalization-packages-page').then((m) => m.LegalizationPackagesPageComponent),
  },
  {
    path: 'new',
    loadComponent: () => import('./feature/legalization-packages-form-page/legalization-packages-form-page').then((m) => m.LegalizationPackagesFormPageComponent),
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('./feature/legalization-packages-form-page/legalization-packages-form-page').then((m) => m.LegalizationPackagesFormPageComponent),
  },
  {
    path: 'details/:id',
    loadComponent: () => import('./feature/legalization-packages-details/legalization-packages-details.component').then((m) => m.LegalizationPackagesDetailsComponent),
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
export class LegalizationPackagesModule {}