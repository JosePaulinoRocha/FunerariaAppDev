import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class CompilacionesServices {
  private myAppUrl: string;
  private MyApiUrl: string;


  constructor(private http: HttpClient) {
    this.myAppUrl = environment.endpoint;
    this.MyApiUrl = 'api/compilaciones/';


  }
  
  getResumenIngresosEgresos(
    fecha: string,
    tipo: 'todos' | 'ingresos' | 'egresos',
    reconciliado: 'todos' | 'reconciliado' | 'noReconciliado',
    fechaFin?: string | null
  ): Observable<any> {
    const url = `${this.myAppUrl}${this.MyApiUrl}GetResumenIngresosEgresos`;
    const params: any = { fecha, tipo, reconciliado };
    if (fechaFin) params.fechaFin = fechaFin;
    return this.http.get(url, { params });
  }

  getUltimaFechaConDatos(): Observable<any> {
      const url = `${this.myAppUrl}${this.MyApiUrl}GetUltimaFechaConDatos`;
    return this.http.get(url);
  }

  getUltimaFechaConciliacion(): Observable<any> {
    const url = `${this.myAppUrl}${this.MyApiUrl}GetUltimaFechaConciliacion`;
    return this.http.get(url);
  }

  getResumenIngresosReconciliados(fecha: string, fechaFin?: string | null): Observable<any> {
    const url = `${this.myAppUrl}${this.MyApiUrl}GetResumenIngresosReconciliados`;
    const params: any = { fecha };
    if (fechaFin) params.fechaFin = fechaFin;
    return this.http.get(url, { params });
  }

  getResumenEgresosReconciliados(fecha: string, fechaFin?: string | null): Observable<any> {
    const url = `${this.myAppUrl}${this.MyApiUrl}GetResumenEgresosReconciliados`;
    const params: any = { fecha };
    if (fechaFin) params.fechaFin = fechaFin;
    return this.http.get(url, { params });
  }


  
}
