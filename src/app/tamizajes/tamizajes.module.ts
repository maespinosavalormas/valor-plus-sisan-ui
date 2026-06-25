import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TAMIZAJES_ROUTES } from './tamizajes.routes';

@NgModule({
  imports: [RouterModule.forChild(TAMIZAJES_ROUTES)],
  exports: [RouterModule],
})
export class TamizajesModule {}
