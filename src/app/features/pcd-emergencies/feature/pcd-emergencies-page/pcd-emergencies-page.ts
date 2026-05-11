import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { PcdEmergenciesListComponent } from '../../ui/pcd-emergencies-list/pcd-emergencies-list';

@Component({
  selector: 'app-pcd-emergencies-page',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, PcdEmergenciesListComponent],
  templateUrl: './pcd-emergencies-page.html',
  styleUrl: './pcd-emergencies-page.scss'
})
export class PcdEmergenciesPageComponent {

  constructor(private router: Router) {}

  openPcdEmergenciesForm() {
    this.router.navigate(['/pcd-emergencies/new']);
  }

}
