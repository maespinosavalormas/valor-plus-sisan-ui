import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { PcdEmergenciesPageComponent } from './feature/pcd-emergencies-page/pcd-emergencies-page';
import { PcdEmergenciesFormPageComponent } from './feature/pcd-emergencies-form-page/pcd-emergencies-form-page';
import { PcdEmergenciesDetailsComponent } from './feature/pcd-emergencies-details/pcd-emergencies-details.component';

const routes: Routes = [
  {
    path: '',
    component: PcdEmergenciesPageComponent,
    pathMatch: 'full'
  },
  {
    path: 'new',
    component: PcdEmergenciesFormPageComponent
  },
  {
    path: 'edit/:id',
    component: PcdEmergenciesFormPageComponent
  },
  {
    path: 'details/:id',
    component: PcdEmergenciesDetailsComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class PcdEmergenciesModule {}