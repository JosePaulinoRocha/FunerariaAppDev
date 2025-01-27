import { Presupuesto } from '../Modelos/Presupuesto';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { environmentProd } from 'src/environments/environment.prod';


@Injectable({
  providedIn: 'root'
})
export class ReportesServices {
  private myAppUrl: string;
  private MyApiUrl: string;


  constructor(private http: HttpClient) {
    this.myAppUrl = environment.endpoint;
    this.MyApiUrl = 'api/reportes/';

  }

  getReporteEgresos(): Observable<any> {
    return this.http.get<any>(`${this.myAppUrl}${this.MyApiUrl}GetReporteEgresos/`);
  }

  getReporteIngresos(): Observable<any> {
    return this.http.get<any>(`${this.myAppUrl}${this.MyApiUrl}GetReporteIngresos/`);
  }

  getReportePorFecha(mes: string, anio: string): Observable<any> {
    const params = new HttpParams()
      .set('mes', mes)
      .set('anio', anio);
  
    return this.http.get<any>(`${this.myAppUrl}${this.MyApiUrl}GetReportePorFecha/`, { params });
  }
  

}
