import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { CasesPageComponent } from './feature/case-page/cases-page';
import { CasesDetailsComponent } from './feature/case-details/cases-details.component';
import { CaseTraceabilityComponent } from './feature/case-traceability/case-traceability.component';

@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: CasesPageComponent
      },
      {
        path: ':id',
        component: CasesDetailsComponent
      },
      {
        path: ':id/traceability',
        component: CaseTraceabilityComponent
      }
    ])
  ]
})
export class CasesModule { }
