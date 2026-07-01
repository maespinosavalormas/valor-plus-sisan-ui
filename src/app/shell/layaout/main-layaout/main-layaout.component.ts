import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../../common/sidebar/sidebar.component';

@Component({
  standalone: true,
  selector: 'app-main-layaout',
  imports: [SidebarComponent, RouterOutlet],
  templateUrl: './main-layaout.component.html',
  styleUrls: ['./main-layaout.component.scss'],
})
export class MainLayaoutComponent {}
