// src/app/Servicios/AuthService.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { environmentProd } from 'src/environments/environment.prod';


@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private myAppUrl: string; 

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
    const user = sessionStorage.getItem('user');
    if (user) {
      const userObj = JSON.parse(user);
      return userObj.isAdmin === 1; // 1 indica que es admin
    }
    return false;
  }

  setSession(authResult: any) {
    sessionStorage.setItem('token', authResult.token);
    if (authResult.user) {
      sessionStorage.setItem('user', JSON.stringify(authResult.user));
    }
  }

  logout() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
  }

  private getAuthHeaders() {
    const token = this.getToken();
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }

  getUsuarios(): Observable<any> {
    return this.http.get(`${this.myAppUrl}api/usuarios/GetUsuarios`, { headers: this.getAuthHeaders() });
  }
}
