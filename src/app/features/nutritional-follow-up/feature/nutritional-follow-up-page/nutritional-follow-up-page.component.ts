import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { NutritionalFollowUpListComponent } from '../../ui/nutritional-follow-up-list/nutritional-follow-up-list.component';

@Component({
  selector: 'app-nutritional-follow-up-page',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, NutritionalFollowUpListComponent],
  templateUrl: './nutritional-follow-up-page.component.html',
  styleUrl: './nutritional-follow-up-page.component.scss'
})
export class NutritionalFollowUpPageComponent {

}
