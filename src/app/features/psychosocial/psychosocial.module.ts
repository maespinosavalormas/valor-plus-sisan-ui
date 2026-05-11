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

import { PsychosocialPageComponent } from './feature/psychosocial-page/psychosocial-page.component';
import { PsychosocialFormPageComponent } from './feature/psychosocial-form-page/psychosocial-form-page.component';
import { PsychosocialListComponent } from './ui/psychosocial-list/psychosocial-list.component';
import { PsychosocialDetailsComponent } from './feature/psychosocial-details/psychosocial-details.component';

const routes: Routes = [
  {
    path: '',
    component: PsychosocialPageComponent,
  },
  {
    path: 'new',
    component: PsychosocialFormPageComponent,
  },
  {
    path: 'edit/:id',
    component: PsychosocialFormPageComponent,
  },
  {
    path: 'details/:id',
    component: PsychosocialDetailsComponent,
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
  ],
})
export class PsychosocialModule {}