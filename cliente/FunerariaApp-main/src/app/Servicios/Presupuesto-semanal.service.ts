import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface PresupuestoSemanal {
  SegmentoID: number;
  CategoriaID: number;
  FechaInicio: string;
  FechaFin: string;
  Monto: number;
}

export interface PresupuestoExcel {
  SegmentoNombre: string;
  CategoriaNombre: string;
  FechaInicio: string;
  FechaFin: string;
  PresupuestoPlaneado: number;
}

@Injectable({
  providedIn: 'root'
})
export class PresupuestoSemanalService {
  private myAppUrl: string;
  private MyApiUrl: string;
  private MyApiUrlPost: string;

  constructor(private http: HttpClient) {
    this.myAppUrl = environment.endpoint;
    this.MyApiUrl = 'api/presupuesto-semanal/';
    this.MyApiUrlPost = 'PostPresupuesto/';
  }

  addPresupuesto(presupuesto: PresupuestoSemanal): Observable<any> {
    return this.http.post<any>(`${this.myAppUrl}${this.MyApiUrl}${this.MyApiUrlPost}`, presupuesto);
  }

  getPresupuestoSemanal(fechaInicio?: string, fechaFin?: string): Observable<any[]> {
    let params = '';
    if (fechaInicio && fechaFin) {
      params = `?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`;
    }
    return this.http.get<any[]>(`${this.myAppUrl}${this.MyApiUrl}GetPresupuesto/${params}`);
  }

  importarPresupuesto(datos: PresupuestoExcel[]): Observable<any> {
    return this.http.post<any>(`${this.myAppUrl}${this.MyApiUrl}ImportarPresupuesto/`, datos);
  }

  eliminarPresupuesto(id: number): Observable<any> {
    return this.http.delete<any>(`${this.myAppUrl}${this.MyApiUrl}DeletePresupuesto/${id}`);
  }

  getUltimaFecha(): Observable<any> {
    return this.http.get<any>(`${this.myAppUrl}${this.MyApiUrl}GetUltimaFecha/`);
  }


}
