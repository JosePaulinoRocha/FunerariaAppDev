import { Ingreso, Reconciliacion } from '../Modelos/Reconciliaciones';
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
  private MyApiUrlCreateReconciliacion: string;
  private MyApiUrlUpdateIngresos: string;

  private MyApiUrlReconciliacion: string;

  private MyApiUrlDeleteReconciliacion: string;

  private MyApiUrlAgregarObservacion: string;

  private MyApiUrlReintegrarReconciliacion: string;

  private MyApiUrlReintegrarMontoReconciliacion: string;




  constructor(private http: HttpClient) {
    this.myAppUrl = environment.endpoint;
    this.MyApiUrl = 'api/reconciliaciones/';
    this.MyApiUrlIngreso = 'GetIngresos/';
    this.MyApiUrlIngresoReconciliacion = 'GetIngresosParaConciliacion/';
    this.MyApiUrlUltimaReconciliacion = 'GetUltimaReconciliacion/';
    this.MyApiUrlCreateReconciliacion = 'CreateReconciliacion/';
    this.MyApiUrlUpdateIngresos = 'UpdateIngresos/';

    this.MyApiUrlReconciliacion = 'GetReconciliaciones/';

    this.MyApiUrlDeleteReconciliacion = 'DeleteReconciliacion/';

    this.MyApiUrlAgregarObservacion = 'UpdateObservacion/';

    this.MyApiUrlReintegrarReconciliacion = 'ReintegrarReconciliacion/';

    this.MyApiUrlReintegrarMontoReconciliacion = 'ReintegrarMontoReconciliacion/';


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

  createReconciliacion(reconciliationData: any): Observable<any> {
    return this.http.post<any>(`${this.myAppUrl}${this.MyApiUrl}${this.MyApiUrlCreateReconciliacion}`, reconciliationData);
  }

  updateIngresos(reconciliacionUpdates: any[]): Observable<any> {
    return this.http.put<any>(`${this.myAppUrl}${this.MyApiUrl}${this.MyApiUrlUpdateIngresos}`, reconciliacionUpdates);
  }

  getReconciliaciones(): Observable<Reconciliacion[]> {
    return this.http.get<Reconciliacion[]>(`${this.myAppUrl}${this.MyApiUrl}${this.MyApiUrlReconciliacion}`);
  }

  deleteReconciliacion(reconciliacionID: number): Observable<any> {
    return this.http.delete<any>(`${this.myAppUrl}${this.MyApiUrl}${this.MyApiUrlDeleteReconciliacion}${reconciliacionID}`);
  }

  updateObservacion(ingresoID: number, observacion: string): Observable<any> {
    return this.http.put<any>(`${this.myAppUrl}${this.MyApiUrl}/UpdateObservacion/${ingresoID}`, { observacion });
 }

  reintegracionReconciliacion(reconciliacionID: number): Observable<any> {
    return this.http.get<any>(`${this.myAppUrl}${this.MyApiUrl}${this.MyApiUrlReintegrarReconciliacion}${reconciliacionID}`);
  }
  
  reintegrar(reintegroData: any): Observable<any> {
    return this.http.post<any>(`${this.myAppUrl}${this.MyApiUrl}${this.MyApiUrlReintegrarMontoReconciliacion}`, reintegroData);
  }

  getCuentasCajaChica(): Observable<any[]> {
    return this.http.get<any[]>(`${this.myAppUrl}${this.MyApiUrl}/GetCuentasCajaChica`);
}

  getCuentasBancarias(): Observable<any[]> {
      return this.http.get<any[]>(`${this.myAppUrl}${this.MyApiUrl}/GetCuentasBancarias`);
  }

}
