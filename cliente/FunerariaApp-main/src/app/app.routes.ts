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
  {
    path: 'combinaciones',
    loadComponent: () => import('./pages/combinaciones/combinaciones.component').then((m) => m.CombinacionesComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'ingresos-api',
    loadComponent: () => import('./pages/ingresos-api/ingresos-api.component').then((m) => m.IngresosApiComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'proveedores',
    loadComponent: () => import('./pages/proveedores/proveedores.component').then((m) => m.ProveedoresComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'transferencias',
    loadComponent: () => import('./pages/transferencias/transferencias.component').then((m) => m.TransferenciasComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'presupuesto',
    loadComponent: () => import('./pages/presupuesto/presupuesto.component').then((m) => m.PresupuestoComponent),
    canActivate: [AuthGuard, AdminGuard],
  },
  {
    path: 'presupuesto-mensual',
    loadComponent: () => import('./pages/presupuesto-mensual/presupuesto-mensual.component').then((m) => m.PresupuestoMensualComponent),
    canActivate: [AuthGuard, AdminGuard],
  },
  {
    path: 'presupuesto-mensual-frecuencia',
    loadComponent: () => import('./pages/presupuesto-mensual-frecuencia/presupuesto-mensual-frecuencia.component').then((m) => m.PresupuestoMensualFrecuenciaComponent),
    canActivate: [AuthGuard, AdminGuard],
  },
  {
    path: 'presupuesto-mensual-cuentas',
    loadComponent: () => import('./pages/presupuesto-mensual-cuentas/presupuesto-mensual-cuentas.component').then((m) => m.PresupuestoMensualCuentasComponent),
    canActivate: [AuthGuard, AdminGuard],
  },
  {
    path: 'proyeccion',
    loadComponent: () => import('./pages/proyeccion/proyeccion.component').then((m) => m.ProyeccionComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'reportes',
    loadComponent: () => import('./pages/reportes/reportes.component').then((m) => m.ReportesComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'resumen-presupuesto',
    loadComponent: () => import('./pages/resumen-presupuesto/resumen-presupuesto.component').then((m) => m.ResumenPresupuestoComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'resumen-presupuesto-segmentos',
    loadComponent: () => import('./pages/resumen-presupuesto-segmentos/resumen-presupuesto-segmentos.component').then((m) => m.ResumenPresupuestoSegmentosComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'resumen-presupuesto-categorias',
    loadComponent: () => import('./pages/resumen-presupuesto-categorias/resumen-presupuesto-categorias.component').then((m) => m.ResumenPresupuestoCategoriasComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'compilaciones',
    loadComponent: () => import('./pages/compilaciones/compilaciones.component').then((m) => m.CompilacionesComponent),
    canActivate: [AuthGuard],
  },
];
