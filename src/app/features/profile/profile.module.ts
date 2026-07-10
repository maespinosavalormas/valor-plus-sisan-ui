import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        loadComponent: () => import('./ui/profile-page/profile-page.component').then(m => m.ProfilePageComponent)
      }
    ])
  ]
})
export class ProfileModule { }
