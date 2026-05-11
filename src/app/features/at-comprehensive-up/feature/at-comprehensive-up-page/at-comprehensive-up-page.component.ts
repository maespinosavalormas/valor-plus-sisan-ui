import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { AtComprehensiveUpListComponent } from '../../ui/at-comprehensive-up-list/at-comprehensive-up-list.component';

@Component({
  selector: 'app-at-comprehensive-up-page',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    RouterModule,
    AtComprehensiveUpListComponent,
  ],
  templateUrl: './at-comprehensive-up-page.component.html',
  styleUrls: ['./at-comprehensive-up-page.component.scss']
})
export class AtComprehensiveUpPageComponent {}
