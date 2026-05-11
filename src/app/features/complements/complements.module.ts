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

import { ComplementsPageComponent } from './feature/complements-page/complements-page.component';
import { ComplementsFormPageComponent } from './feature/complements-form-page/complements-form-page.component';
import { ComplementsListComponent } from './ui/complements-list/complements-list.component';

const routes: Routes = [
  {
    path: '',
    component: ComplementsPageComponent,
  },
  {
    path: 'new',
    component: ComplementsFormPageComponent,
  },
  {
    path: 'edit/:id',
    component: ComplementsFormPageComponent,
  },
  {
    path: 'details/:id',
    loadComponent: () => import('./feature/complements-details/complements-details.component').then(m => m.ComplementsDetailsComponent),
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
    ComplementsFormPageComponent,
  ],
})
export class ComplementsModule {}