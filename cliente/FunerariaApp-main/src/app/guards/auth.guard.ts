import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, UrlTree } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
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
    const requestedRoute = '/' + (route.url.map(segment => segment.path).join('/'));

    // Verificar permisos del usuario
    if (user.permisos && user.permisos.includes(requestedRoute)) {
      return true;
    } else {
      // No tiene permiso
      return this.router.parseUrl('/home');
    }
  }
}
