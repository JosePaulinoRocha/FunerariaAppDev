import { Presupuesto } from '../Modelos/Presupuesto';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';


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


  ObtenerIngresosPorFiltros(
    selectedSegmentos: any,
    selectedCategorias: any,
    selectedSubcategorias: any,
    selectedConceptos: any,
    selectedInitialDateIngresos: any,
    selectedFinalDateIngresos: any,
    reconciliado: string | null
  ): Observable<any> {
    const filtros = {
      segmento: selectedSegmentos || null,
      categoria: selectedCategorias || null,
      subcategoria: selectedSubcategorias || null,
      concepto: selectedConceptos || null,
      fechaInicial: selectedInitialDateIngresos || null,
      fechaFinal: selectedFinalDateIngresos || null,
      reconciliado: reconciliado
    };
  
    return this.http.post<any>(`${this.myAppUrl}${this.MyApiUrl}ObtenerIngresosPorFiltros/`, filtros);
  }
  

  ObtenerEgresosPorFiltros(selectedSegmentos: any, selectedCategorias: any, selectedSubcategorias: any, selectedConceptos: any, selectedInitialDateIngresos: any, selectedFinalDateIngresos:any, estadoReconciliado: any): Observable<any> {
    const filtros = {
      segmento: selectedSegmentos || null,
      categoria: selectedCategorias || null,
      subcategoria: selectedSubcategorias || null,
      concepto: selectedConceptos || null,
      fechaInicial: selectedInitialDateIngresos || null,
      fechaFinal: selectedFinalDateIngresos || null,
      reconciliado: estadoReconciliado || null // Incluir el filtro de reconciliado
    };
  
    return this.http.post<any>(`${this.myAppUrl}${this.MyApiUrl}ObtenerEgresosPorFiltros/`, filtros );
  }
  

  ObtenerUtilidadesPorFiltros(selectedUtilidadesSegmentos: any, selectedUtilidadesCategorias: any, selectedUtilidadesSubcategorias: any, selectedUtilidadesConceptos: any, selectedUtilidadesInitialDateUtilidades: any, selectedUtilidadesFinalDateUtilidades:any): Observable<any> {
    const filtros = {
      segmento: selectedUtilidadesSegmentos || null,
      categoria: selectedUtilidadesCategorias || null,
      subcategoria: selectedUtilidadesSubcategorias || null,
      concepto: selectedUtilidadesConceptos || null,
      fechaInicial: selectedUtilidadesInitialDateUtilidades || null,
      fechaFinal: selectedUtilidadesFinalDateUtilidades || null
    };

    return this.http.post<any>(`${this.myAppUrl}${this.MyApiUrl}ObtenerUtilidadesPorFiltros/`,  filtros );
  }

  getEgresoMensual(estado: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.myAppUrl}${this.MyApiUrl}GetEgresoActual?estado=${estado}`);
  }

  getEgresoMensualPasado(): Observable<any[]> {
    return this.http.get<any[]>(`${this.myAppUrl}${this.MyApiUrl}GetEgresoPasado/`);
  }

  getIngresoMensual(estado: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.myAppUrl}${this.MyApiUrl}GetIngresoActual?estado=${estado}`);
  }
  

  getIngresoMensualPasado(): Observable<any[]> {
    return this.http.get<any[]>(`${this.myAppUrl}${this.MyApiUrl}GetIngresoPasado/`);
  }

  getIngresosMensuales(filtro: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.myAppUrl}${this.MyApiUrl}GetIngresosActuales/${filtro}`);
  }
  

  getEgresosMensuales(filtroReconciliado: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.myAppUrl}${this.MyApiUrl}GetEgresosMensuales/${filtroReconciliado}`);
  }

  EgresosMensualSemanales(filtroReconciliado: number, fechaInicio?: string, fechaFin?: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.myAppUrl}${this.MyApiUrl}GetEgresosMensualSemanales/${filtroReconciliado}?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`);
  }

  IngresosMensualSemanales(filtroReconciliado: number, fechaInicio: string, fechaFin: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.myAppUrl}${this.MyApiUrl}GetIngresosMensualSemanales/${filtroReconciliado}?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`);
  }

  getEgresosMensualSegmentos(filtroReconciliado: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.myAppUrl}${this.MyApiUrl}GetEgresosMensualSegmentos/${filtroReconciliado}`);
  }

  getIngresosMensualSegmentos(filtroReconciliado: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.myAppUrl}${this.MyApiUrl}GetIngresosMensualSegmentos/${filtroReconciliado}`);
  }

  getUtilidadesNetasMensuales(): Observable<any[]> {
    return this.http.get<any[]>(`${this.myAppUrl}${this.MyApiUrl}GetUtilidadesNetasMensuales/`);
  }

  getEgresosPorCategoriaMensuales(filtro: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.myAppUrl}${this.MyApiUrl}GetEgresosPorCategoriaMensuales/${filtro}`);
  }

  getIngresosPorCategoriaMensuales(filtro: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.myAppUrl}${this.MyApiUrl}GetIngresosPorCategoriaMensuales/${filtro}`);
  }
  
}
