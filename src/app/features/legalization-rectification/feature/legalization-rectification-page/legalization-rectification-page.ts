import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { LegalizationRectificationListComponent } from '../../ui/legalization-rectification-list/legalization-rectification-list';

@Component({
  selector: 'app-legalization-rectification-page',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, RouterModule, LegalizationRectificationListComponent],
  templateUrl: './legalization-rectification-page.html',
  styleUrl: './legalization-rectification-page.scss'
})
export class LegalizationRectificationPageComponent {

}
