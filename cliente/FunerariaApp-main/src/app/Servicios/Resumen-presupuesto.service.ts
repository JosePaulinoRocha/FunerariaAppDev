import { Presupuesto, Gastos, Estatus, PasoUsuario, Periodos, PresupuestoMensualSemanal } from '../Modelos/Presupuesto';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class ResumenPresupuestoServices {
  private myAppUrl: string;
  private MyApiUrl: string;


  constructor(private http: HttpClient) {
    this.myAppUrl = environment.endpoint;
    this.MyApiUrl = 'api/resumen-presupuesto/';

  }

  getResumenSegmentos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.myAppUrl}${this.MyApiUrl}GetResumenSegmentos/`);
  }

  getGastoMensualExtraordinarioAprobado(segmentoID: number): Observable<Gastos[]> {
    return this.http.get<Gastos[]>(`${this.myAppUrl}${this.MyApiUrl}GetPresupuestoMensualExtraordinarioAprobado/${segmentoID}`);
  }
  
  getPresupuestoSemanal(segmentoID: number): Observable<PresupuestoMensualSemanal[]> {
    return this.http.get<PresupuestoMensualSemanal[]>(`${this.myAppUrl}${this.MyApiUrl}GetPresupuestoSemanal/${segmentoID}`);
  }

  getPresupuestoMensualFrecuenciaAprobadosMesActual(segmentoID: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.myAppUrl}${this.MyApiUrl}GetPresupuestoMensualFrecuenciaAprobadosMesActual/${segmentoID}`);
  }

  getEgresosMensualSegmentos(segmentoID: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.myAppUrl}${this.MyApiUrl}GetEgresosMensualSegmentos/${segmentoID}`);
  }


  getGastoExtraordinarioPorCategoria(segmentoID: number, categoriaID: number): Observable<Gastos[]> {
    return this.http.get<Gastos[]>(`${this.myAppUrl}${this.MyApiUrl}gasto-extraordinario/${segmentoID}/${categoriaID}`);
  }
  
  getPresupuestoSemanalPorCategoria(segmentoID: number, categoriaID: number): Observable<PresupuestoMensualSemanal[]> {
    return this.http.get<PresupuestoMensualSemanal[]>(`${this.myAppUrl}${this.MyApiUrl}presupuesto-semanal/${segmentoID}/${categoriaID}`);
  }

  getPresupuestoFrecuenciaPorCategoria(segmentoID: number, categoriaID: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.myAppUrl}${this.MyApiUrl}presupuesto-frecuencia/${segmentoID}/${categoriaID}`);
  }

  getEgresosMensualesPorCategoria(segmentoID: number, categoriaID: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.myAppUrl}${this.MyApiUrl}egresos-mensuales/${segmentoID}/${categoriaID}`);
  }




  getGastoExtraordinarioPorSubcategoria(segmentoID: number, categoriaID: number, subcategoriaID: number): Observable<Gastos[]> {
    return this.http.get<Gastos[]>(`${this.myAppUrl}${this.MyApiUrl}gasto-extraordinario-subcategoria/${segmentoID}/${categoriaID}/${subcategoriaID}`);
  }
  
  getPresupuestoSemanalPorSubcategoria(segmentoID: number, categoriaID: number, subcategoriaID: number): Observable<PresupuestoMensualSemanal[]> {
    return this.http.get<PresupuestoMensualSemanal[]>(`${this.myAppUrl}${this.MyApiUrl}presupuesto-semanal-subcategoria/${segmentoID}/${categoriaID}/${subcategoriaID}`);
  }

  getPresupuestoFrecuenciaPorSubcategoria(segmentoID: number, categoriaID: number, subcategoriaID: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.myAppUrl}${this.MyApiUrl}presupuesto-frecuencia-subcategoria/${segmentoID}/${categoriaID}/${subcategoriaID}`);
  }

  getEgresosMensualesPorSubcategoria(segmentoID: number, categoriaID: number, subcategoriaID: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.myAppUrl}${this.MyApiUrl}egresos-mensuales-subcategoria/${segmentoID}/${categoriaID}/${subcategoriaID}`);
  }



  getEgresosMensualesPorConcepto(segmentoID: number, categoriaID: number, subcategoriaID: number, conceptoID: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.myAppUrl}${this.MyApiUrl}egresos-mensuales-concepto/${segmentoID}/${categoriaID}/${subcategoriaID}/${conceptoID}`);
  }




  getGastoMensualExtraordinarioAprobadoCategoriaUnificada(): Observable<Gastos[]> {
    return this.http.get<Gastos[]>(`${this.myAppUrl}${this.MyApiUrl}GetPresupuestoMensualExtraordinarioAprobado/`);
  }
  
  getPresupuestoSemanalCategoriaUnificada(): Observable<PresupuestoMensualSemanal[]> {
    return this.http.get<PresupuestoMensualSemanal[]>(`${this.myAppUrl}${this.MyApiUrl}GetPresupuestoSemanal/`);
  }

  getPresupuestoMensualFrecuenciaAprobadosMesActualCategoriaUnificada(): Observable<any[]> {
    return this.http.get<any[]>(`${this.myAppUrl}${this.MyApiUrl}GetPresupuestoMensualFrecuenciaAprobadosMesActual/`);
  }

  getEgresosMensualCategoriaUnificada(): Observable<any[]> {
    return this.http.get<any[]>(`${this.myAppUrl}${this.MyApiUrl}GetEgresosMensualSegmentos/`);
  }



    getGastoExtraordinarioPorCategoriaUnificada(categoriaID: number): Observable<Gastos[]> {
    return this.http.get<Gastos[]>(`${this.myAppUrl}${this.MyApiUrl}gasto-extraordinario-categoriaUnificada/${categoriaID}`);
    }
    
    getPresupuestoSemanalPorCategoriaUnificada(categoriaID: number): Observable<PresupuestoMensualSemanal[]> {
      return this.http.get<PresupuestoMensualSemanal[]>(`${this.myAppUrl}${this.MyApiUrl}presupuesto-semanal-categoriaUnificada/${categoriaID}`);
    }

    getPresupuestoFrecuenciaPorCategoriaUnificada(categoriaID: number): Observable<any[]> {
      return this.http.get<any[]>(`${this.myAppUrl}${this.MyApiUrl}presupuesto-frecuencia-categoriaUnificada/${categoriaID}`);
    }

    getEgresosMensualesPorCategoriaUnificada(categoriaID: number): Observable<any[]> {
      return this.http.get<any[]>(`${this.myAppUrl}${this.MyApiUrl}egresos-mensuales-categoriaUnificada/${categoriaID}`);
    }


}
