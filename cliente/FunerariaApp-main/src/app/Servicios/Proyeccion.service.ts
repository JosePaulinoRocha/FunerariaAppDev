import { Presupuesto } from '../Modelos/Presupuesto';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { environmentProd } from 'src/environments/environment.prod';


@Injectable({
  providedIn: 'root'
})
export class ProyeccionServices {
  private myAppUrl: string;
  private MyApiUrl: string;


  constructor(private http: HttpClient) {
    this.myAppUrl = environment.endpoint;
    this.MyApiUrl = 'api/proyeccion/';

  }

  getEgresoMensual(): Observable<any[]> {
    return this.http.get<any[]>(`${this.myAppUrl}${this.MyApiUrl}GetEgresoActual/`);
  }

  getEgresoMensualPasado(): Observable<any[]> {
    return this.http.get<any[]>(`${this.myAppUrl}${this.MyApiUrl}GetEgresoPasado/`);
  }

  getIngresoMensual(): Observable<any[]> {
    return this.http.get<any[]>(`${this.myAppUrl}${this.MyApiUrl}GetIngresoActual/`);
  }

  getIngresoMensualPasado(): Observable<any[]> {
    return this.http.get<any[]>(`${this.myAppUrl}${this.MyApiUrl}GetIngresoPasado/`);
  }

  getIngresosMensuales(): Observable<any[]> {
    return this.http.get<any[]>(`${this.myAppUrl}${this.MyApiUrl}GetIngresosActuales/`);
  }

  getEgresosPorCategoriaMensuales(): Observable<any[]> {
    return this.http.get<any[]>(`${this.myAppUrl}${this.MyApiUrl}GetEgresosPorCategoriaMensuales/`);
  }
  
}
