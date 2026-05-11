import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./feature/legalization-rectification-page/legalization-rectification-page').then((m) => m.LegalizationRectificationPageComponent),
  },
  {
    path: 'new',
    loadComponent: () => import('./feature/legalization-rectification-form-page/legalization-rectification-form-page').then((m) => m.LegalizationRectificationFormPageComponent),
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('./feature/legalization-rectification-form-page/legalization-rectification-form-page').then((m) => m.LegalizationRectificationFormPageComponent),
  },
  {
    path: 'details/:id',
    loadComponent: () => import('./feature/legalization-rectification-details/legalization-rectification-details.component').then((m) => m.LegalizationRectificationDetailsComponent),
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
export class LegalizationRectificationModule {}