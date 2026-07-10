import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatStepperModule } from '@angular/material/stepper';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';

import { ESTILOS_VIDA_ROUTES } from './estilos-vida.routes';
import { ElsaFormPageComponent } from './feature/elsa-form-page/elsa-form-page.component';
import { ElsaListPageComponent } from './feature/elsa-list-page/elsa-list-page.component';
import { ElsaDetailPageComponent } from './feature/elsa-detail-page/elsa-detail-page.component';
import { ElsaPatientSearchComponent } from './ui/elsa-patient-search.component';
import { ElsaAlimentacionSectionComponent } from './ui/elsa-alimentacion-section.component';
import { ElsaActividadFisicaSectionComponent } from './ui/elsa-actividad-fisica-section.component';
import { ElsaTabacoSectionComponent } from './ui/elsa-tabaco-section.component';
import { ElsaAlcoholSectionComponent } from './ui/elsa-alcohol-section.component';
import { ElsaResumenComponent } from './ui/elsa-resumen.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(ESTILOS_VIDA_ROUTES),
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatStepperModule,
    MatProgressSpinnerModule,
    MatCardModule,
    ElsaFormPageComponent,
    ElsaListPageComponent,
    ElsaDetailPageComponent,
    ElsaPatientSearchComponent,
    ElsaAlimentacionSectionComponent,
    ElsaActividadFisicaSectionComponent,
    ElsaTabacoSectionComponent,
    ElsaAlcoholSectionComponent,
    ElsaResumenComponent,
  ],
})
export class EstilosVidaModule {}