import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { NutritionalFollowUpPageComponent } from './feature/nutritional-follow-up-page/nutritional-follow-up-page.component';
import { NutritionalFollowUpFormPageComponent } from './feature/nutritional-follow-up-form-page/nutritional-follow-up-form-page.component';
import { NutritionalFollowUpListComponent } from './ui/nutritional-follow-up-list/nutritional-follow-up-list.component';
import { EvolutionaryRecordPageComponent } from './ui/evolutionary-record-page.component';
import { EvolutionaryHeaderComponent } from './ui/evolutionary-header.component';
import { FollowUpComposerComponent } from './ui/follow-up-composer.component';
import { FollowUpWallComponent } from './ui/follow-up-wall.component';
import { StatusPanelComponent } from './ui/status-panel.component';
import { EvolutionaryFacade } from './data-access/facade/evolutionary.facade';

const routes: Routes = [
  {
    path: '',
    component: NutritionalFollowUpPageComponent,
  },
  {
    path: 'new',
    component: NutritionalFollowUpFormPageComponent,
  },
  {
    path: 'edit/:id',
    component: NutritionalFollowUpFormPageComponent,
  },
  {
    path: 'details/:id',
    loadComponent: () =>
      import('./feature/nutritional-follow-up-details/nutritional-follow-up-details.component').then(
        (m) => m.NutritionalFollowUpDetailsComponent,
      ),
  },
  {
    path: ':casoId/expediente-evolutivo',
    component: EvolutionaryRecordPageComponent,
    title: 'Expediente Evolutivo',
  },
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatDatepickerModule,
    MatNativeDateModule,
    FormsModule,
    NutritionalFollowUpFormPageComponent,
    EvolutionaryRecordPageComponent,
    EvolutionaryHeaderComponent,
    FollowUpComposerComponent,
    FollowUpWallComponent,
    StatusPanelComponent,

  ],
  providers: [EvolutionaryFacade],
})
export class NutritionalFollowUpModule {}