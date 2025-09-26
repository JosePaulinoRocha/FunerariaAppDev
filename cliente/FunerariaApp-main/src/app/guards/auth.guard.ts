import { Injectable } from '@angular/core';
import { Router, Route, UrlSegment, UrlTree } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard {
  constructor(private router: Router) {}

  canMatch(route: Route, segments: UrlSegment[]): boolean | UrlTree {
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');

    if (!user || !user.userId) {
      // No está logueado
      return this.router.parseUrl('/login');
    }

    // Si es admin, puede acceder a cualquier ruta
    if (user.isAdmin === 1) {
      return true;
    }

    // Construir la ruta solicitada
    const requestedRoute = '/' + segments.map(s => s.path).join('/');

    // Verificar permisos del usuario
    if (user.permisos && user.permisos.includes(requestedRoute)) {
      return true;
    } else {
      // No tiene permiso
      return this.router.parseUrl('/home');
    }
  }
}
