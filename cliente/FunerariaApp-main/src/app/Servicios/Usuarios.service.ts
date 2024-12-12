import { Usuarios, Roles } from '../Modelos/Usuarios';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { environmentProd } from 'src/environments/environment.prod';


@Injectable({
  providedIn: 'root'
})
export class UsuariosServices {
  private myAppUrl: string;
  private MyApiUrl: string;
  private MyApiUrlUser: string;
  private MyApiUrlUserPost: string;
  private MyApiUrlUserUpdate: string;

  private MyApiUrlRol: string;

  constructor(private http: HttpClient) {
    this.myAppUrl = environment.endpoint;
    this.MyApiUrl = 'api/usuarios/';
    this.MyApiUrlUser = 'GetUsuarios/';
    this.MyApiUrlUserPost = 'PostUsers/';
    this.MyApiUrlUserUpdate = 'UpdateUser/';

    this.MyApiUrlRol = 'GetRoles/';

  }

  getUsers(): Observable<Usuarios[]> {
    return this.http.get<Usuarios[]>(`${this.myAppUrl}${this.MyApiUrl}${this.MyApiUrlUser}`);
  }

  addUser(user: any): Observable<any> {
    return this.http.post<Usuarios[]>(`${this.myAppUrl}${this.MyApiUrl}${this.MyApiUrlUserPost}`, user);
  }

  updateUser(user: any): Observable<any> {
    return this.http.put<Usuarios[]>(`${this.myAppUrl}${this.MyApiUrl}${this.MyApiUrlUserUpdate}`, user);
  }

  getRoles(): Observable<Roles[]> {
    return this.http.get<Roles[]>(`${this.myAppUrl}${this.MyApiUrl}${this.MyApiUrlRol}`);
  }


  updatePassword(userId: number, newPassword: string): Observable<any> {
    const url = `${this.myAppUrl}${this.MyApiUrl}UpdatePassword`;
    return this.http.post<any>(url, { userId, newPassword });
  }
  

}
