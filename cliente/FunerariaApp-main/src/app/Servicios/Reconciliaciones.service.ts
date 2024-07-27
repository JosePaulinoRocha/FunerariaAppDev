import { Ingreso } from '../Modelos/Reconciliaciones';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReconciliacionesServices {
  private myAppUrl: string;
  private MyApiUrl: string;
  private MyApiUrlIngreso: string;
  private MyApiUrlIngresoReconciliacion: string;
  private MyApiUrlUltimaReconciliacion: string;

  constructor(private http: HttpClient) {
    this.myAppUrl = environment.endpoint;
    this.MyApiUrl = 'api/reconciliaciones/';
    this.MyApiUrlIngreso = 'GetIngresos/';
    this.MyApiUrlIngresoReconciliacion = 'GetIngresosParaConciliacion/';
    this.MyApiUrlUltimaReconciliacion = 'GetUltimaReconciliacion/';
  }

  getIngresos(): Observable<Ingreso[]> {
    return this.http.get<Ingreso[]>(`${this.myAppUrl}${this.MyApiUrl}${this.MyApiUrlIngreso}`);
  }

  getIngresosParaConciliacion(reconciliacion: any): Observable<any> {
    return this.http.post<Ingreso[]>(`${this.myAppUrl}${this.MyApiUrl}${this.MyApiUrlIngresoReconciliacion}`, reconciliacion);
  }

  getUltimaReconciliacion(cuentaID: number): Observable<any> {
    return this.http.get<any>(`${this.myAppUrl}${this.MyApiUrl}${this.MyApiUrlUltimaReconciliacion}${cuentaID}`);
  }

}
