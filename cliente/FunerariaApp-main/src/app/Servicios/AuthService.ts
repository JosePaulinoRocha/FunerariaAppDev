// src/app/Servicios/AuthService.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private myAppUrl: string; 

  // BehaviorSubject para estado de login y rol admin
  public loggedInSubject = new BehaviorSubject<boolean>(this.isLoggedIn());
  public isLoggedIn$ = this.loggedInSubject.asObservable();

  public isAdminSubject = new BehaviorSubject<boolean>(this.isAdmin());
  public isAdmin$ = this.isAdminSubject.asObservable();

  // NUEVO: BehaviorSubject para el usuario completo
  public userSubject = new BehaviorSubject<any>(this.getStoredUser());
  public user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {
    this.myAppUrl = environment.endpoint;
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.myAppUrl}api/usuarios/login`, { email, password });
  }

  isLoggedIn(): boolean {
    return !!sessionStorage.getItem('token');
  }

  getToken(): string | null {
    return sessionStorage.getItem('token');
  }

  isAdmin(): boolean {
    const user = this.getStoredUser();
    return user ? user.isAdmin === 1 : false;
  }

  // NUEVO: obtener usuario desde sessionStorage
  private getStoredUser(): any {
    const user = sessionStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  // NUEVO: actualizar usuario y emitir cambios
  setUser(user: any) {
    sessionStorage.setItem('user', JSON.stringify(user));
    this.userSubject.next(user);
    this.isAdminSubject.next(user.isAdmin === 1);
  }

  setSession(authResult: any) {
    sessionStorage.setItem('token', authResult.token);
    if (authResult.user) {
      this.setUser(authResult.user); // usar setUser para mantener reactividad
    }
    this.loggedInSubject.next(true);
  }

  logout() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    this.userSubject.next(null);
    this.isAdminSubject.next(false);
    this.loggedInSubject.next(false);
  }

  private getAuthHeaders() {
    const token = this.getToken();
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }

  getUsuarios(): Observable<any> {
    return this.http.get(`${this.myAppUrl}api/usuarios/GetUsuarios`, { headers: this.getAuthHeaders() });
  }
}
