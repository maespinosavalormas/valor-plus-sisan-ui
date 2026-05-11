import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { TraceabilityPageComponent } from './feature/traceability-page/traceability-page.component';

const routes: Routes = [
  {
    path: '',
    component: TraceabilityPageComponent,
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class TraceabilityModule {}
