import { Combinacion, Reconciliacion, Ingreso } from '../Modelos/Notificaciones';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NotificacionesServices {
  private myAppUrl: string;
  private MyApiUrl: string;
  private MyApiUrlCombinacionesNotificaciones: string;
  private MyApiUrlReconciliacionesNotificaciones: string;
  private MyApiUrlIngresosNotificaciones: string;


  constructor(private http: HttpClient) {
    this.myAppUrl = environment.endpoint;
    this.MyApiUrl = 'api/notificaciones/';
    this.MyApiUrlCombinacionesNotificaciones = 'GetCombinacionesNotificaciones/';
    this.MyApiUrlReconciliacionesNotificaciones = 'GetReconciliacionesNotificaciones/';
    this.MyApiUrlIngresosNotificaciones = 'GetIngresosNotificaciones/';


  }

  getCombinacionesNotificaciones(): Observable<Combinacion[]> {
    return this.http.get<Combinacion[]>(`${this.myAppUrl}${this.MyApiUrl}${this.MyApiUrlCombinacionesNotificaciones}`);
  }

  getReconciliacionesNotificaciones(): Observable<Reconciliacion[]> {
    return this.http.get<Reconciliacion[]>(`${this.myAppUrl}${this.MyApiUrl}${this.MyApiUrlReconciliacionesNotificaciones}`);
  }

  loadIngresosNotificaciones(): Observable<Ingreso[]> {
    return this.http.get<Ingreso[]>(`${this.myAppUrl}${this.MyApiUrl}${this.MyApiUrlIngresosNotificaciones}`);
  }
  
}
