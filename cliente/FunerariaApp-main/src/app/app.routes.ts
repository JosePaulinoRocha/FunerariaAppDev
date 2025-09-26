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
    canMatch: [AuthGuard],
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'ingresos',
    loadComponent: () => import('./pages/ingresos/ingresos.component').then((m) => m.IngresosComponent),
    canMatch: [AuthGuard],
  },
  {
    path: 'ingresos-egresos',
    loadComponent: () => import('./pages/ingresos-egresos/ingresos-egresos.component').then((m) => m.IngresosEgresosComponent),
    canMatch: [AuthGuard],
  },
  {
    path: 'gallery',
    loadComponent: () => import('./pages/gallery/gallery.component').then((m) => m.GalleryComponent),
    canMatch: [AuthGuard],
  },
  {
    path: 'usuarios',
    loadComponent: () => import('./pages/usuarios/usuarios.component').then((m) => m.UsuariosComponent),
    canMatch: [AuthGuard, AdminGuard],
  },
  {
    path: 'reconciliaciones',
    loadComponent: () => import('./pages/reconciliaciones/reconciliaciones.component').then((m) => m.ReconciliacionesComponent),
    canMatch: [AuthGuard],
  },
  {
    path: 'reconciliaciones-historial',
    loadComponent: () => import('./pages/reconciliaciones-historial/reconciliaciones-historial.component').then((m) => m.ReconciliacionesHistorialComponent),
    canMatch: [AuthGuard],
  },
  {
    path: 'combinaciones',
    loadComponent: () => import('./pages/combinaciones/combinaciones.component').then((m) => m.CombinacionesComponent),
    canMatch: [AuthGuard],
  },
  {
    path: 'ingresos-api',
    loadComponent: () => import('./pages/ingresos-api/ingresos-api.component').then((m) => m.IngresosApiComponent),
    canMatch: [AuthGuard],
  },
  {
    path: 'proveedores',
    loadComponent: () => import('./pages/proveedores/proveedores.component').then((m) => m.ProveedoresComponent),
    canMatch: [AuthGuard],
  },
  {
    path: 'transferencias',
    loadComponent: () => import('./pages/transferencias/transferencias.component').then((m) => m.TransferenciasComponent),
    canMatch: [AuthGuard],
  },
  {
    path: 'presupuesto',
    loadComponent: () => import('./pages/presupuesto/presupuesto.component').then((m) => m.PresupuestoComponent),
    canMatch: [AuthGuard, AdminGuard],
  },
  {
    path: 'presupuesto-mensual',
    loadComponent: () => import('./pages/presupuesto-mensual/presupuesto-mensual.component').then((m) => m.PresupuestoMensualComponent),
    canMatch: [AuthGuard, AdminGuard],
  },
  {
    path: 'presupuesto-mensual-frecuencia',
    loadComponent: () => import('./pages/presupuesto-mensual-frecuencia/presupuesto-mensual-frecuencia.component').then((m) => m.PresupuestoMensualFrecuenciaComponent),
    canMatch: [AuthGuard, AdminGuard],
  },
  {
    path: 'presupuesto-mensual-cuentas',
    loadComponent: () => import('./pages/presupuesto-mensual-cuentas/presupuesto-mensual-cuentas.component').then((m) => m.PresupuestoMensualCuentasComponent),
    canMatch: [AuthGuard, AdminGuard],
  },
  {
    path: 'proyeccion',
    loadComponent: () => import('./pages/proyeccion/proyeccion.component').then((m) => m.ProyeccionComponent),
    canMatch: [AuthGuard],
  },
  {
    path: 'reportes',
    loadComponent: () => import('./pages/reportes/reportes.component').then((m) => m.ReportesComponent),
    canMatch: [AuthGuard],
  },
  {
    path: 'resumen-presupuesto',
    loadComponent: () => import('./pages/resumen-presupuesto/resumen-presupuesto.component').then((m) => m.ResumenPresupuestoComponent),
    canMatch: [AuthGuard],
  },
  {
    path: 'resumen-presupuesto-segmentos',
    loadComponent: () => import('./pages/resumen-presupuesto-segmentos/resumen-presupuesto-segmentos.component').then((m) => m.ResumenPresupuestoSegmentosComponent),
    canMatch: [AuthGuard],
  },
  {
    path: 'resumen-presupuesto-categorias',
    loadComponent: () => import('./pages/resumen-presupuesto-categorias/resumen-presupuesto-categorias.component').then((m) => m.ResumenPresupuestoCategoriasComponent),
    canMatch: [AuthGuard],
  },
  {
    path: 'compilaciones',
    loadComponent: () => import('./pages/compilaciones/compilaciones.component').then((m) => m.CompilacionesComponent),
    canMatch: [AuthGuard],
  },
  {
    path: 'reportes-conciliados',
    loadComponent: () => import('./pages/reportes-conciliados/reportes-conciliados.component').then((m) => m.ReportesConciliadosComponent),
    canMatch: [AuthGuard],
  },
  {
    path: 'presupuesto-semanal',
    loadComponent: () => import('./pages/presupuesto-semanal/presupuesto-semanal.component').then((m) => m.PresupuestoSemanalComponent),
    canMatch: [AuthGuard],
  },
  {
  path: '**',
    loadComponent: () => import('./pages/not-found/not-found.component')
      .then(m => m.NotFoundComponent)
  }
];
