import { Routes } from '@angular/router';
import { MainLayaoutComponent } from './shell/layaout/main-layaout/main-layaout.component';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
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
    path: '',
    component: MainLayaoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'home',
        loadChildren: () => import('./features/home/home.module').then((m) => m.HomeModule),
      },
      {
        path: 'users',
        loadChildren: () => import('./features/users/users.module').then((m) => m.UsersModule),
      },
      {
        path: 'cases',
        loadChildren: () => import('./features/cases/cases.module').then((m) => m.CasesModule),
      },
      {
        path: 'casos',
        loadChildren: () => import('./tamizajes/tamizajes.module').then((m) => m.TamizajesModule),
      },
      {
        path: 'programs',
        loadChildren: () => import('./features/programs/programs.module').then((m) => m.ProgramsModule),
      },
      {
        path: 'traceability',
        loadChildren: () => import('./features/traceability/traceability.module').then((m) => m.TraceabilityModule),
      },  
      {
        path: 'pcd-emergencies',
        loadChildren: () => import('./features/pcd-emergencies/pcd-emergencies.module').then((m) => m.PcdEmergenciesModule),
      },
      {
        path: 'nutritional-follow-up',
        loadChildren: () => import('./features/nutritional-follow-up/nutritional-follow-up.module').then((m) => m.NutritionalFollowUpModule),
      },
      {
        path: 'legalization-packages',
        loadChildren: () => import('./features/legalization-packages/legalization-packages.module').then((m) => m.LegalizationPackagesModule),
      },
      {
        path: 'legalization-rectification',
        loadChildren: () => import('./features/legalization-rectification/legalization-rectification.module').then((m) => m.LegalizationRectificationModule),
      },
      {
        path: 'characterization-up',
        loadChildren: () => import('./features/characterization-up/characterization-up.module').then((m) => m.CharacterizationUpModule),
      },
      {
        path: 'at-comprehensive-up',
        loadChildren: () => import('./features/at-comprehensive-up/at-comprehensive-up.module').then((m) => m.AtComprehensiveUpModule),
      },
      {
        path: 'legalization-supplies',
        loadChildren: () => import('./features/legalization-supplies/legalization-supplies.module').then((m) => m.LegalizationSuppliesModule),
      },
      {
        path: 'psychosocial',
        loadChildren: () => import('./features/psychosocial/psychosocial.module').then((m) => m.PsychosocialModule),
      },
      {
        path: 'complements',
        loadChildren: () => import('./features/complements/complements.module').then((m) => m.ComplementsModule),
      },
      {
        path: 'reports',
        loadChildren: () => import('./features/reports/reports.module').then((m) => m.ReportsModule),
      },
      {
      path: 'targeting-up',
        loadChildren: () => import('./features/targeting-up/targeting-up.module').then((m) => m.TargetingUpModule),
      }
    ],
  },
  {
    path: 'profile',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/profile/profile.module').then((m) => m.ProfileModule),
  },
  {
    path: '**',
    redirectTo: 'auth/login',
  },
];
