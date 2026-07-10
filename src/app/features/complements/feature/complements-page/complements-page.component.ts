import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { ComplementsListComponent } from '../../ui/complements-list/complements-list.component';

@Component({
  selector: 'app-complements-page',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    RouterModule,
    ComplementsListComponent,
  ],
  templateUrl: './complements-page.component.html',
  styleUrl: './complements-page.component.scss'
})
export class ComplementsPageComponent {}
