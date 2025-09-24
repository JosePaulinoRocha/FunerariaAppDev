import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface Rol {
  RolID: number;
  NombreRol: string;
}

export interface Seccion {
  PermisoID: number;
  NombrePermiso: string;
  Ruta: string;
}

@Injectable({
  providedIn: 'root'
})
export class PermisosService {
  private myAppUrl: string;
  private MyApiUrl: string;

  constructor(private http: HttpClient) {
    this.myAppUrl = environment.endpoint;
    this.MyApiUrl = 'api/permisos/';
  }

  getRoles(): Observable<Rol[]> {
    const url = `${this.myAppUrl}${this.MyApiUrl}GetRoles/`;
    return this.http.get<Rol[]>(url);
  }

  getSecciones(): Observable<Seccion[]> {
    const url = `${this.myAppUrl}${this.MyApiUrl}GetSecciones/`;
    return this.http.get<Seccion[]>(url);
  }

  crearSeccion(nuevaSeccion: { NombrePermiso: string; Ruta: string }): Observable<Seccion> {
    return this.http.post<Seccion>(`${this.myAppUrl}${this.MyApiUrl}CrearSeccion`, nuevaSeccion);
  }

  updateSeccion(seccion: Seccion): Observable<Seccion> {
    return this.http.put<Seccion>(`${this.myAppUrl}${this.MyApiUrl}UpdateSeccion`, seccion);
  }

  crearRol(nuevoRol: { NombreRol: string }): Observable<Rol> {
    return this.http.post<Rol>(`${this.myAppUrl}${this.MyApiUrl}CrearRol`, nuevoRol);
  }

  updateRol(rol: Rol): Observable<Rol> {
    return this.http.put<Rol>(`${this.myAppUrl}${this.MyApiUrl}UpdateRol`, rol);
  }

  getPermisosPorRol(rolId: number): Observable<number[]> {
    const url = `${this.myAppUrl}${this.MyApiUrl}GetPermisosPorRol/${rolId}`;
    return this.http.get<number[]>(url);
  }

  asignarPermiso(rolId: number, permisoId: number): Observable<any> {
    const url = `${this.myAppUrl}${this.MyApiUrl}AsignarPermisoRol`;
    return this.http.post(url, { RolID: rolId, PermisoID: permisoId });
  }

  removerPermiso(rolId: number, permisoId: number): Observable<any> {
    const url = `${this.myAppUrl}${this.MyApiUrl}RemoverPermisoRol/${rolId}/${permisoId}`;
    return this.http.delete(url);
  }


}
