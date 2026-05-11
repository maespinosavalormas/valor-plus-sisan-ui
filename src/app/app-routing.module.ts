import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.module').then((m) => m.AuthModule),
  },
  {
    path: 'home',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/home/home.module').then((m) => m.HomeModule),
  },
  {
    path: 'users',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/users/users.module').then((m) => m.UsersModule),
  },
  {
    path: 'cases',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/cases/cases.module').then((m) => m.CasesModule),
  },
  {
    path: 'pcd-emergencies',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/pcd-emergencies/pcd-emergencies.module').then((m) => m.PcdEmergenciesModule),
  },
  {
    path: 'legalization-packages',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/legalization-packages/legalization-packages.module').then((m) => m.LegalizationPackagesModule),
  },
  {
    path: 'legalization-rectification',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/legalization-rectification/legalization-rectification.module').then((m) => m.LegalizationRectificationModule),
  },
  {
    path: 'nutritional-follow-up',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/nutritional-follow-up/nutritional-follow-up.module').then((m) => m.NutritionalFollowUpModule),
  },
  {
    path: 'psychosocial',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/psychosocial/psychosocial.module').then((m) => m.PsychosocialModule),
  },
  {
    path: 'complements',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/complements/complements.module').then((m) => m.ComplementsModule),
  },
  {
    path: 'targeting-up',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/targeting-up/targeting-up.module').then((m) => m.TargetingUpModule),
  },
  {
    path: 'characterization-up',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/characterization-up/characterization-up.module').then((m) => m.CharacterizationUpModule),
  },
  {
    path: 'at-comprehensive-up',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/at-comprehensive-up/at-comprehensive-up.module').then((m) => m.AtComprehensiveUpModule),
  },
  {
    path: 'legalization-supplies',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/legalization-supplies/legalization-supplies.module').then((m) => m.LegalizationSuppliesModule),
  },
  {
    path: 'programs',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/programs/programs.module').then((m) => m.ProgramsModule),
  },
  {
    path: 'programs/:id',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/programs/programs.module').then((m) => m.ProgramsModule),
  },
  {
    path: 'traceability',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/traceability/traceability.module').then((m) => m.TraceabilityModule),
  },
  {
    path: 'reports',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/reports/reports.module').then((m) => m.ReportsModule),
  },
  {
    path: '**',
    redirectTo: 'auth/login',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
