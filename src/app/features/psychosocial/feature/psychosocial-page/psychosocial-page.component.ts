import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { PsychosocialListComponent } from '../../ui/psychosocial-list/psychosocial-list.component';

@Component({
  selector: 'app-psychosocial-page',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    RouterModule,
    PsychosocialListComponent,
  ],
  templateUrl: './psychosocial-page.component.html',
  styleUrl: './psychosocial-page.component.scss'
})
export class PsychosocialPageComponent {}
