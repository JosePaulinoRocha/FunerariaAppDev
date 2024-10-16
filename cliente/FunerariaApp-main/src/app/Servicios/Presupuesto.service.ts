import { Presupuesto } from '../Modelos/Presupuesto';
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


  updatePresupuesto(proveedor: { SegmentoID: number, CategoriaID: number, SubcategoriaID: number, ConceptoID: number, MontoDictaminado: number, FrecuenciaDictaminada: number }): Observable<any> {
    const url = `${this.myAppUrl}${this.MyApiUrl}UpdatePresupuesto/`;
    return this.http.put(url, proveedor);
  }

  
  
}
