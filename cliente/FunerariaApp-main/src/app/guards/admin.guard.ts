import { Injectable } from '@angular/core';
import { Router, Route, UrlSegment, UrlTree } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AdminGuard {
  constructor(private router: Router) {}

  canMatch(route: Route, segments: UrlSegment[]): boolean | UrlTree {
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');

    if (user && user.isAdmin === 1) {
      return true;
    } else {
      return this.router.parseUrl('/home');
    }
  }
}
