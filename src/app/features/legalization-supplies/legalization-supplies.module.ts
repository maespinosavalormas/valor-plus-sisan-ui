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

import { LegalizationSuppliesPageComponent } from './feature/legalization-supplies-page/legalization-supplies-page.component';
import { LegalizationSuppliesFormPageComponent } from './feature/legalization-supplies-form-page/legalization-supplies-form-page.component';
import { LegalizationSuppliesListComponent } from './ui/legalization-supplies-list/legalization-supplies-list.component';

const routes: Routes = [
  {
    path: '',
    component: LegalizationSuppliesPageComponent,
  },
  {
    path: 'new',
    component: LegalizationSuppliesFormPageComponent,
  },
  {
    path: 'edit/:id',
    component: LegalizationSuppliesFormPageComponent,
  },
  {
    path: 'details/:id',
    loadComponent: () =>
      import('./feature/legalization-supplies-details/legalization-supplies-details.component').then(
        (m) => m.LegalizationSuppliesDetailsComponent,
      ),
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
    LegalizationSuppliesFormPageComponent,
  ],
})
export class LegalizationSuppliesModule {}