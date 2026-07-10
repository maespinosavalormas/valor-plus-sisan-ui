import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ProfileFormComponent } from '../profile-form/profile-form.component';

@Component({
  standalone: true,
  selector: 'app-profile-edit',  
  imports: [
    CommonModule,
    ProfileFormComponent
  ],
  templateUrl: './profile-edit.html',
  styleUrls: ['./profile-edit.scss']
})
export class ProfileEditComponent {
  user = {
    firstName: 'Juan Jose',
    lastName: 'Vergara Graciano',
    email: 'juanjosevergara@example.com',
    role: 'Administrador',
    initials: 'JV'
  };

  constructor(private location: Location) {}

  goBack() {
    this.location.back();
  }
}
