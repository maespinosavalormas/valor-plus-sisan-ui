import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { CharacterizationUpListComponent } from '../../ui/characterization-up-list/characterization-up-list.component';

@Component({
  selector: 'app-characterization-up-page',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    RouterModule,
    CharacterizationUpListComponent,
  ],
  templateUrl: './characterization-up-page.html',
  styleUrl: './characterization-up-page.scss'
})
export class CharacterizationUpPageComponent {}
