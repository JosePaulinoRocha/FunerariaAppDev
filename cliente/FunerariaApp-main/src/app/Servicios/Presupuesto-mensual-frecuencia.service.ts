import { Presupuesto, GastoMensualPorFrecuencia, GastoPresupuestoFrecuenciaGuardados, GastoMensualPorFrecuenciaAprobados, Ingreso } from '../Modelos/Presupuesto';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { environmentProd } from 'src/environments/environment.prod';


@Injectable({
  providedIn: 'root'
})
export class PresupuestoMensualFrecuenciaServices {
  private myAppUrl: string;
  private MyApiUrl: string;
  private MyApiUrlCombinaciones: string;


  constructor(private http: HttpClient) {
    this.myAppUrl = environment.endpoint;
    this.MyApiUrl = 'api/presupuesto-mensual-frecuencia/';
    this.MyApiUrlCombinaciones = 'GetPresupuesto/';


  }

  getPresupuestoMensualFrecuencia(): Observable<GastoMensualPorFrecuencia[]> {
    return this.http.get<GastoMensualPorFrecuencia[]>(`${this.myAppUrl}${this.MyApiUrl}GetPresupuestoMensualFrecuencia/`);
  }

  getPresupuestoMensualFrecuenciaAprobados(): Observable<GastoMensualPorFrecuenciaAprobados[]> {
    return this.http.get<GastoMensualPorFrecuenciaAprobados[]>(`${this.myAppUrl}${this.MyApiUrl}GetPresupuestoMensualFrecuenciaAprobados/`);
  }

  getPresupuestoMensualFrecuenciaAprobadosMesActual(): Observable<GastoMensualPorFrecuenciaAprobados[]> {
    return this.http.get<GastoMensualPorFrecuenciaAprobados[]>(`${this.myAppUrl}${this.MyApiUrl}GetPresupuestoMensualFrecuenciaAprobadosMesActual/`);
  }

  addGastoFrecuencia(gastoMensualFrecuencia: any): Observable<any> {
    return this.http.post<any>(`${this.myAppUrl}${this.MyApiUrl}PostGastosFrecuencia`, gastoMensualFrecuencia);
  }

  getPresupuestoMensualFrecuenciaGuardados(): Observable<GastoPresupuestoFrecuenciaGuardados[]> {
    return this.http.get<GastoPresupuestoFrecuenciaGuardados[]>(`${this.myAppUrl}${this.MyApiUrl}GetPresupuestoMensualFrecuenciaGuardados/`);
  }


  loadIngresosMensualesCuentas(): Observable<Ingreso[]> {
    return this.http.get<Ingreso[]>(`${this.myAppUrl}${this.MyApiUrl}GetIngresosMensualesCuentas/`);
  }

  
}
