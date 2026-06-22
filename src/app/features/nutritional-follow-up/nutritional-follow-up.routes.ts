import { Routes } from '@angular/router';
import { EvolutionaryRecordPageComponent } from './ui/evolutionary-record-page.component';

export const NUTRITIONAL_FOLLOW_UP_ROUTES: Routes = [
  {
    path: ':casoId/expediente-evolutivo',
    component: EvolutionaryRecordPageComponent,
    title: 'Expediente Evolutivo',
  },
];
