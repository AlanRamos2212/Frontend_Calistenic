import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard-page.component').then(m => m.DashboardPageComponent)
  },
  {
    path: 'ejercicios',
    loadComponent: () =>
      import('./pages/ejercicios/ejercicios-page.component').then(m => m.EjerciciosPageComponent)
  },
  {
    path: 'progreso',
    loadComponent: () =>
      import('./pages/progreso/progreso-page.component').then(m => m.ProgresoPageComponent)
  },
  {
    path: 'comunidad',
    loadComponent: () =>
      import('./pages/comunidad/comunidad-page.component').then(m => m.ComunidadPageComponent)
  },
  { path: '**', redirectTo: 'dashboard' }
];
