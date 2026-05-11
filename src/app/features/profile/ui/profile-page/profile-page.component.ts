import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileEditComponent } from '../profile-edit/profile-edit.component';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [
    CommonModule,
    ProfileEditComponent  
  ],
  template: `
    <div class="page-container">
      <app-profile-edit></app-profile-edit>
    </div>
  `,
  styles: [`
    .page-container {
      width: 100%;
      height: 100%;
      min-height: 100vh;
    }
  `]
})
export class ProfilePageComponent {
  constructor() { }
}