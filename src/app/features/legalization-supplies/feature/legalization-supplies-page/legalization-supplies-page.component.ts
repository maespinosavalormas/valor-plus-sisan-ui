import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LegalizationSuppliesListComponent } from '../../ui/legalization-supplies-list/legalization-supplies-list.component';
import { MatIcon } from "@angular/material/icon";

@Component({
  selector: 'app-legalization-supplies-page',
  standalone: true,
  imports: [RouterModule, LegalizationSuppliesListComponent, MatIcon],
  templateUrl: './legalization-supplies-page.component.html',
  styleUrl: './legalization-supplies-page.component.scss'
})
export class LegalizationSuppliesPageComponent {

}
