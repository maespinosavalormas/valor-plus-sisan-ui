import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { AtComprehensiveUpPageComponent } from './feature/at-comprehensive-up-page/at-comprehensive-up-page.component';
import { AtComprehensiveUpFormPageComponent } from './feature/at-comprehensive-up-form-page/at-comprehensive-up-form-page.component';

const routes: Routes = [
  {
    path: '',
    component: AtComprehensiveUpPageComponent,
  },
  {
    path: 'details/:id',
    loadComponent: () => import('./feature/at-comprehensive-up-details/at-comprehensive-up-details.component').then(m => m.AtComprehensiveUpDetailsComponent),
  },
  {
    path: 'new',
    component: AtComprehensiveUpFormPageComponent,
  },
  {
    path: 'edit/:id',
    component: AtComprehensiveUpFormPageComponent,
  },
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    FormsModule,
  ],
})
export class AtComprehensiveUpModule {}