import { Ingreso, Concepto, Segmento, Categoria, Subcategoria, Usuario, Combinacion, Estatus } from '../Modelos/Ingresos';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class IngresosServices {
  private myAppUrl: string;
  private MyApiUrl: string;
  private MyApiUrlIngreso: string;
  private MyApiUrlIngresoPost: string;
  private MyApiUrlIngresoUpdate: string;

  private MyApiUrlConcepto: string;

  private MyApiUrlSegmento: string;

  private MyApiUrlCategoria: string;

  private MyApiUrlSubcategoria: string;

  private MyApiUrlUsuario: string;

  private MyApiUrlCombinacion: string;

  private MyApiUrlEstatus: string;


  constructor(private http: HttpClient) {
    this.myAppUrl = environment.endpoint;
    this.MyApiUrl = 'api/ingresos/';
    this.MyApiUrlIngreso = 'GetIngresos/';
    this.MyApiUrlIngresoPost = 'PostIngresos/';
    this.MyApiUrlIngresoUpdate = 'UpdateIngresos/';

    this.MyApiUrlConcepto = 'GetConceptos/';

    this.MyApiUrlSegmento = 'GetSegmentos/';

    this.MyApiUrlCategoria = 'GetCategorias/';

    this.MyApiUrlSubcategoria = 'GetSubcategorias/';

    this.MyApiUrlUsuario = 'GetUsuarios/';

    this.MyApiUrlCombinacion = 'GetCombinaciones/';

    this.MyApiUrlEstatus = 'GetEstatus/';

  }

  getIngresos(): Observable<Ingreso[]> {
    return this.http.get<Ingreso[]>(`${this.myAppUrl}${this.MyApiUrl}${this.MyApiUrlIngreso}`);
  }

  addIngreso(ingreso: any): Observable<any> {
    return this.http.post<Ingreso[]>(`${this.myAppUrl}${this.MyApiUrl}${this.MyApiUrlIngresoPost}`, ingreso);
  }

  UpdateIngresos(ingreso: any): Observable<any> {
    return this.http.put<Ingreso[]>(`${this.myAppUrl}${this.MyApiUrl}${this.MyApiUrlIngresoUpdate}`, ingreso);
  }

  getConceptos(): Observable<Concepto[]> {
    return this.http.get<Concepto[]>(`${this.myAppUrl}${this.MyApiUrl}${this.MyApiUrlConcepto}`);
  }

  getSegmentos(): Observable<Segmento[]> {
    return this.http.get<Segmento[]>(`${this.myAppUrl}${this.MyApiUrl}${this.MyApiUrlSegmento}`);
  }

  getCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${this.myAppUrl}${this.MyApiUrl}${this.MyApiUrlCategoria}`);
  }

  getSubcategorias(): Observable<Subcategoria[]> {
    return this.http.get<Subcategoria[]>(`${this.myAppUrl}${this.MyApiUrl}${this.MyApiUrlSubcategoria}`);
  }

  getUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.myAppUrl}${this.MyApiUrl}${this.MyApiUrlUsuario}`);
  }

  getCombinaciones(): Observable<Combinacion[]> {
    return this.http.get<Combinacion[]>(`${this.myAppUrl}${this.MyApiUrl}${this.MyApiUrlCombinacion}`);
  }

  getEstatus(): Observable<Estatus[]> {
    return this.http.get<Estatus[]>(`${this.myAppUrl}${this.MyApiUrl}${this.MyApiUrlEstatus}`);
  }

  updateCombination(updatedData: { IngresoID: number ,ConceptoID: number | string, SegmentoID: number | string, CategoriaID: number | string, SubcategoriaID: number | string }): Observable<any> {
    const url = `${this.myAppUrl}${this.MyApiUrl}UpdateCombination/`;
    return this.http.put(url, updatedData);
  }

}
