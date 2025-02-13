import { Presupuesto, Gastos, Estatus, PasoUsuario, Periodos, PresupuestoMensualSemanal } from '../Modelos/Presupuesto';
import { GastoMensualPorFrecuencia, GastoPresupuestoFrecuenciaGuardados, GastoMensualPorFrecuenciaAprobados, Ingreso } from '../Modelos/Presupuesto';
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


  getReportePresupuestoSemanal(): Observable<PresupuestoMensualSemanal[]> {
    return this.http.get<PresupuestoMensualSemanal[]>(`${this.myAppUrl}${this.MyApiUrl}GetReportePresupuestoSemanal/`);
  }

  getReportePresupuestoPeriodico(): Observable<GastoMensualPorFrecuenciaAprobados[]> {
    return this.http.get<GastoMensualPorFrecuenciaAprobados[]>(`${this.myAppUrl}${this.MyApiUrl}GetReportePresupuestoPeriodico/`);
  }

  getReportePresupuestoExtraordinario(): Observable<any[]> {
    return this.http.get<any[]>(`${this.myAppUrl}${this.MyApiUrl}GetReportePresupuestoExtraordinario/`);
  }
  
  getReporteMesActual(): Observable<any[]> {
    return this.http.get<any[]>(`${this.myAppUrl}${this.MyApiUrl}GetReporteMesActual/`);
  }


  updateObservacion(
    segmentoID: number,
    categoriaID: number,
    subcategoriaID: number,
    conceptoID: number,
    observacion: string
  ): Observable<any> {
    const body = { segmentoID, categoriaID, subcategoriaID, conceptoID, observacion };
    return this.http.put(`${this.myAppUrl}${this.MyApiUrl}UpdateObservacion`, body);
  }
  

}
