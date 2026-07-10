import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { CharacterizationUpPageComponent } from './feature/characterization-up-page/characterization-up-page.component';
import { CharacterizationUpFormPageComponent } from './feature/characterization-up-form-page/characterization-up-form-page.component';
import { CharacterizationUpListComponent } from './ui/characterization-up-list/characterization-up-list.component';

const routes: Routes = [
  {
    path: '',
    component: CharacterizationUpPageComponent,
  },
  {
    path: 'details/:id',
    loadComponent: () => import('./feature/characterization-up-details/characterization-up-details.component').then(m => m.CharacterizationUpDetailsComponent),
  },
  {
    path: 'new',
    component: CharacterizationUpFormPageComponent,
  },
  {
    path: 'edit/:id',
    component: CharacterizationUpFormPageComponent,
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
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatDatepickerModule,
    MatNativeDateModule,
    FormsModule,
    CharacterizationUpFormPageComponent,
  ],
})
export class CharacterizationUpModule {}