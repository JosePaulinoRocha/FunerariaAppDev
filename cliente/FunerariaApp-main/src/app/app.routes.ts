import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard'; 

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
    canActivate: [AuthGuard],
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'ingresos',
    loadComponent: () => import('./pages/ingresos/ingresos.component').then((m) => m.IngresosComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'ingresos-egresos',
    loadComponent: () => import('./pages/ingresos-egresos/ingresos-egresos.component').then((m) => m.IngresosEgresosComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'gallery',
    loadComponent: () => import('./pages/gallery/gallery.component').then((m) => m.GalleryComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'usuarios',
    loadComponent: () => import('./pages/usuarios/usuarios.component').then((m) => m.UsuariosComponent),
    canActivate: [AuthGuard, AdminGuard],
  },
  {
    path: 'reconciliaciones',
    loadComponent: () => import('./pages/reconciliaciones/reconciliaciones.component').then((m) => m.ReconciliacionesComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'reconciliaciones-historial',
    loadComponent: () => import('./pages/reconciliaciones-historial/reconciliaciones-historial.component').then((m) => m.ReconciliacionesHistorialComponent),
    canActivate: [AuthGuard],
  },
];
