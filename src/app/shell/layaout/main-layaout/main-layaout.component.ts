import { Component } from '@angular/core';
import { SidebarComponent } from '../../../common/sidebar/sidebar.component';

@Component({
  standalone: true,
  selector: 'app-main-layaout',
  imports: [SidebarComponent],
  templateUrl: './main-layaout.component.html',
  styleUrls: ['./main-layaout.component.scss'],
})
export class MainLayaoutComponent {}
