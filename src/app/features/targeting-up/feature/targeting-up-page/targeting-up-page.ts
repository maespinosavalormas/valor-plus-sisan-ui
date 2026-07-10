import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { TargetingUpListComponent } from '../../ui/targeting-up-list/targeting-up-list';

@Component({
  selector: 'app-targeting-up-page',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, RouterModule, TargetingUpListComponent],
  templateUrl: './targeting-up-page.html',
  styleUrl: './targeting-up-page.scss'
})
export class TargetingUpPageComponent {

}
