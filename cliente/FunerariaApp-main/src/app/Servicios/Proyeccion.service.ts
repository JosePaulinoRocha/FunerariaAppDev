import { Presupuesto } from '../Modelos/Presupuesto';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
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

  getFiltros(): Observable<any> {
    return this.http.get<any>(`${this.myAppUrl}${this.MyApiUrl}GetFiltros/`);
  }


  ObtenerIngresosPorFiltros(selectedSegmentos: any, selectedCategorias: any, selectedSubcategorias: any, selectedConceptos: any): Observable<any> {
    const filtros = {
      segmento: selectedSegmentos || [],
      categoria: selectedCategorias || [],
      subcategoria: selectedSubcategorias || [],
      concepto: selectedConceptos || []
    };

    return this.http.post<any>(`${this.myAppUrl}${this.MyApiUrl}ObtenerIngresosPorFiltros/`,  filtros );
  }

  ObtenerEgresosPorFiltros(selectedSegmentos: any, selectedCategorias: any, selectedSubcategorias: any, selectedConceptos: any): Observable<any> {
    const filtros = {
      segmento: selectedSegmentos || [],
      categoria: selectedCategorias || [],
      subcategoria: selectedSubcategorias || [],
      concepto: selectedConceptos || []
    };

    return this.http.post<any>(`${this.myAppUrl}${this.MyApiUrl}ObtenerEgresosPorFiltros/`,  filtros );
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

  getEgresosMensuales(): Observable<any[]> {
    return this.http.get<any[]>(`${this.myAppUrl}${this.MyApiUrl}GetEgresosMensuales/`);
  }

  EgresosMensualSemanales(): Observable<any[]> {
    return this.http.get<any[]>(`${this.myAppUrl}${this.MyApiUrl}GetEgresosMensualSemanales/`);
  }

  IngresosMensualSemanales(): Observable<any[]> {
    return this.http.get<any[]>(`${this.myAppUrl}${this.MyApiUrl}GetIngresosMensualSemanales/`);
  }

  getEgresosMensualSegmentos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.myAppUrl}${this.MyApiUrl}GetEgresosMensualSegmentos/`);
  }

  getIngresosMensualSegmentos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.myAppUrl}${this.MyApiUrl}GetIngresosMensualSegmentos/`);
  }

  getUtilidadesNetasMensuales(): Observable<any[]> {
    return this.http.get<any[]>(`${this.myAppUrl}${this.MyApiUrl}GetUtilidadesNetasMensuales/`);
  }

  getEgresosPorCategoriaMensuales(): Observable<any[]> {
    return this.http.get<any[]>(`${this.myAppUrl}${this.MyApiUrl}GetEgresosPorCategoriaMensuales/`);
  }

  getIngresosPorCategoriaMensuales(): Observable<any[]> {
    return this.http.get<any[]>(`${this.myAppUrl}${this.MyApiUrl}GetIngresosPorCategoriaMensuales/`);
  }

}
