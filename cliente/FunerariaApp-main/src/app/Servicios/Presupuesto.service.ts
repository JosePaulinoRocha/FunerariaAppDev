import { Presupuesto, Gastos, Estatus, PasoUsuario, Periodos, PresupuestoMensualSemanal } from '../Modelos/Presupuesto';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { environmentProd } from 'src/environments/environment.prod';


@Injectable({
  providedIn: 'root'
})
export class PresupuestoServices {
  private myAppUrl: string;
  private MyApiUrl: string;
  private MyApiUrlCombinaciones: string;


  constructor(private http: HttpClient) {
    this.myAppUrl = environment.endpoint;
    this.MyApiUrl = 'api/presupuesto/';
    this.MyApiUrlCombinaciones = 'GetPresupuesto/';


  }

  getPresupuesto(): Observable<Presupuesto[]> {
    return this.http.get<Presupuesto[]>(`${this.myAppUrl}${this.MyApiUrl}${this.MyApiUrlCombinaciones}`);
  }

  getPresupuestoSemanal(): Observable<PresupuestoMensualSemanal[]> {
    return this.http.get<PresupuestoMensualSemanal[]>(`${this.myAppUrl}${this.MyApiUrl}GetPresupuestoSemanal/`);
  }

  getPasoUsuario(userId: number): Observable<PasoUsuario[]> {
    return this.http.get<PasoUsuario[]>(`${this.myAppUrl}${this.MyApiUrl}GetPasoUsuario/${userId}`);
  }

  insertPasoUsuario(userId: number, numeroPaso: number): Observable<any> {
    const body = { userId, numeroPaso }; // Cuerpo de la solicitud con los datos a insertar
    return this.http.post<any>(`${this.myAppUrl}${this.MyApiUrl}InsertPasoUsuario`, body);
  }
  

  getGastoMensual(): Observable<Gastos[]> {
    return this.http.get<Gastos[]>(`${this.myAppUrl}${this.MyApiUrl}GetPresupuestoMensual/`);
  }

  getGastoMensualExtraordinarioAprobado(): Observable<Gastos[]> {
    return this.http.get<Gastos[]>(`${this.myAppUrl}${this.MyApiUrl}GetPresupuestoMensualExtraordinarioAprobado/`);
  }

  addGasto(gastos: any): Observable<any> {
    return this.http.post<any>(`${this.myAppUrl}${this.MyApiUrl}PostGastos`, gastos);
  }

  UpdateGasto(incomeData: any): Observable<any> {
    return this.http.put<Gastos[]>(`${this.myAppUrl}${this.MyApiUrl}UpdateGastos`, incomeData);
  }

  updatePresupuesto(proveedor: { SegmentoID: number, CategoriaID: number, SubcategoriaID: number, ConceptoID: number, MontoDictaminado: number, FrecuenciaDictaminada: number }): Observable<any> {
    const url = `${this.myAppUrl}${this.MyApiUrl}UpdatePresupuesto/`;
    return this.http.put(url, proveedor);
  }

  updatePresupuestoCuenta(proveedor: { SegmentoID: number, CategoriaID: number, SubcategoriaID: number, ConceptoID: number, CuentaID: number, DiaLimite: number }): Observable<any> {
    const url = `${this.myAppUrl}${this.MyApiUrl}UpdatePresupuestoCuenta/`;
    return this.http.put(url, proveedor);
  }

  updateGastoEstatus(proveedor: {GastoID: number, EstatusPresupuestoID: number, Fecha: string, CuentaID: number, CategoriaID: number | string, SubcategoriaID: number | string, ConceptoID: number | string }): Observable<any> {
    const url = `${this.myAppUrl}${this.MyApiUrl}UpdateGastoEstatus/`;
    return this.http.put(url, proveedor);
  }

  getEstatus(): Observable<Estatus[]> {
    return this.http.get<Estatus[]>(`${this.myAppUrl}${this.MyApiUrl}GetEstatus`);
  }



  // ---------------------------cosas de gasto mensual-----------------------------------------------


  getPeriodosCongelados(): Observable<Periodos[]> {
    return this.http.get<Periodos[]>(`${this.myAppUrl}${this.MyApiUrl}GetPeriodosCongelados/`);
  }

  // Nuevo método para guardar los periodos congelados
  savePeriodosCongelados(periodos: { fecha_inicio: Date; fecha_fin: Date }[]): Observable<any> {
    return this.http.post<any>(`${this.myAppUrl}${this.MyApiUrl}InsertPeriodosCongelados`, periodos);
  }


  deletePeriodoCongelado(periodo: { FechaInicio: string; FechaFin: string }): Observable<any> {
    const url = `${this.myAppUrl}${this.MyApiUrl}DeletePeriodoCongelado`;  // Correcta URL sin barra extra
    return this.http.delete<any>(url, { body: periodo });
  }
  

  
}
