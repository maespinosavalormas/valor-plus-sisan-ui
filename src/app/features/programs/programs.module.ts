import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ProgramsPageComponent } from './feature/programs-page/programs-page';
import { ProgramsDetailsComponent } from './feature/programs-details/programs-details';
import { ProgramsTasksComponent } from './feature/programs-tasks/programs-tasks';
import { ProgramsTraceabilityComponent } from './feature/programs-traceability/programs-traceability';
import { ProgramsScheduleComponent } from './feature/programs-schedule/programs-schedule.component';

const routes: Routes = [
  {
    path: '',
    component: ProgramsPageComponent,
    pathMatch: 'full'
  },
  {
    path: ':id',
    component: ProgramsDetailsComponent
  },
  {
    path: ':id/tasks',
    component: ProgramsTasksComponent
  },
  {
    path: ':id/traceability',
    component: ProgramsTraceabilityComponent
  },
  {
    path: ':id/schedule',
    component: ProgramsScheduleComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class ProgramsModule {}