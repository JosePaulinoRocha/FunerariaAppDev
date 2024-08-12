// src/app/Servicios/AuthService.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:3080/api/usuarios';

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { email, password });
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
    return this.http.get(`${this.apiUrl}/GetUsuarios`, { headers: this.getAuthHeaders() });
  }
}
