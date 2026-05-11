import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { MatDialogModule } from '@angular/material/dialog';
import { UsersPage } from './feature/users-page/users-page';
import { UserDetailsComponent } from './feature/user-details/user-details.component';
import { MatButtonModule } from '@angular/material/button';
import { HttpClientModule } from '@angular/common/http';

const routes: Routes = [
  {
    path: '',
    component: UsersPage,
  },
  {
    path: ':id/details',
    component: UserDetailsComponent,
  },
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    UsersPage,
    MatDialogModule,
    MatButtonModule,
    HttpClientModule
  ],
})
export class UsersModule {}
