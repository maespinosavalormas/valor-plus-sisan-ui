import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { LegalizationPackagesListComponent } from '../../ui/legalization-packages-list/legalization-packages-list';

@Component({
  selector: 'app-legalization-packages-page',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, RouterModule, LegalizationPackagesListComponent],
  templateUrl: './legalization-packages-page.html',
  styleUrl: './legalization-packages-page.scss'
})
export class LegalizationPackagesPageComponent {

}
