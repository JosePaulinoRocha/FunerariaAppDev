import { Ingreso, Concepto, Segmento, Categoria, Subcategoria, Usuario, Combinacion, Estatus, Cuenta, Proveedor } from '../Modelos/Ingresos';
import { HttpClient, HttpParams  } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { environmentProd } from 'src/environments/environment.prod';


@Injectable({
  providedIn: 'root'
})
export class IngresosServices {
  private myAppUrl: string;
  private MyApiUrl: string;
  private MyApiUrlIngreso: string;

  private MyApiUrlIngresoPorFiltro: string;

  private MyApiUrlIngresoOptimizado: string;

  private MyApiUrlIngresoPost: string;
  private MyApiUrlIngresoPostComprobante: string;
  private MyApiUrlIngresoUpdate: string;

  private MyApiUrlConcepto: string;

  private MyApiUrlSegmento: string;

  private MyApiUrlCategoria: string;

  private MyApiUrlSubcategoria: string;

  private MyApiUrlProveedor: string;

  private MyApiUrlUsuario: string;

  private MyApiUrlCombinacion: string;

  private MyApiUrlCombinacionSegmento: string;

  private MyApiUrlEstatus: string;

  private MyApiUrlCuentas: string;

  private MyApiUrlCuentasContables: string;


  constructor(private http: HttpClient) {
    this.myAppUrl = environment.endpoint;
    this.MyApiUrl = 'api/ingresos/';
    this.MyApiUrlIngreso = 'GetIngresos/';

    this.MyApiUrlIngresoPorFiltro = 'GetIngresosPorFiltro/';

    this.MyApiUrlIngresoOptimizado = 'GetIngresosOptimizado/';

    this.MyApiUrlIngresoPost = 'PostIngresos/';
    this.MyApiUrlIngresoPostComprobante = 'PostIngresosComprobante/';

    this.MyApiUrlIngresoUpdate = 'UpdateIngresos/';

    this.MyApiUrlConcepto = 'GetConceptos/';

    this.MyApiUrlSegmento = 'GetSegmentos/';

    this.MyApiUrlCategoria = 'GetCategorias/';

    this.MyApiUrlSubcategoria = 'GetSubcategorias/';

    this.MyApiUrlProveedor = 'GetProveedores/';

    this.MyApiUrlUsuario = 'GetUsuarios/';

    this.MyApiUrlCombinacion = 'GetCombinaciones/';

    this.MyApiUrlCombinacionSegmento = 'GetCombinacionesSegmento/';

    this.MyApiUrlEstatus = 'GetEstatus/';

    this.MyApiUrlCuentas = 'GetCuentas/';

    this.MyApiUrlCuentasContables = 'GetCuentasContables/';


  }

  getIngresos(): Observable<Ingreso[]> {
    return this.http.get<Ingreso[]>(`${this.myAppUrl}${this.MyApiUrl}${this.MyApiUrlIngreso}`);
  }

  getIngresosParametros(filtros: { [key: string]: any }): Observable<Ingreso[]> {
    const params = new HttpParams({ fromObject: filtros });
    return this.http.get<Ingreso[]>(`${this.myAppUrl}${this.MyApiUrl}GetIngresosParametros/`, { params });
  }

  getIngresosPorFiltro(filtro: string, pagina: number, resultadosPorPagina: number): Observable<Ingreso[]> {
    const url = `${this.myAppUrl}${this.MyApiUrl}${this.MyApiUrlIngresoPorFiltro}${filtro}?pagina=${pagina}&resultadosPorPagina=${resultadosPorPagina}`;
    console.log(url)
    return this.http.get<Ingreso[]>(url);
  }


  getIngresosNoReconciliados(page: number, limit: number): Observable<any> {
    const params = new HttpParams()
        .set('page', page.toString())  // Agrega el parámetro 'page'
        .set('limit', limit.toString());  // Agrega el parámetro 'limit'

    return this.http.get<any>(`${this.myAppUrl}${this.MyApiUrl}GetIngresosNoReconciliados`, { params });
}



  getIngresosOptimizado(): Observable<Ingreso[]> {
    return this.http.get<Ingreso[]>(`${this.myAppUrl}${this.MyApiUrl}${this.MyApiUrlIngresoOptimizado}`);
  }

  addIngreso(incomeData: any): Observable<any> {
    return this.http.post<any>(`${this.myAppUrl}${this.MyApiUrl}${this.MyApiUrlIngresoPost}`, incomeData);
  }


  uploadComprobante(ingresoID: number, formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.myAppUrl}${this.MyApiUrl}${this.MyApiUrlIngresoPostComprobante}${ingresoID}`, formData);
  }


  UpdateIngresos(incomeData: any): Observable<any> {
    return this.http.put<Ingreso[]>(`${this.myAppUrl}${this.MyApiUrl}${this.MyApiUrlIngresoUpdate}`, incomeData);
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

  getProveedores(): Observable<Proveedor[]> {
    return this.http.get<Proveedor[]>(`${this.myAppUrl}${this.MyApiUrl}${this.MyApiUrlProveedor}`);
  }

  getUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.myAppUrl}${this.MyApiUrl}${this.MyApiUrlUsuario}`);
  }

  getCombinaciones(): Observable<Combinacion[]> {
    return this.http.get<Combinacion[]>(`${this.myAppUrl}${this.MyApiUrl}${this.MyApiUrlCombinacion}`);
  }

  getCombinacionesSegmento(segmentoId: number): Observable<Combinacion[]> {
    return this.http.get<Combinacion[]>(`${this.myAppUrl}${this.MyApiUrl}${this.MyApiUrlCombinacionSegmento}${segmentoId}`);
  }

  getEstatus(): Observable<Estatus[]> {
    return this.http.get<Estatus[]>(`${this.myAppUrl}${this.MyApiUrl}${this.MyApiUrlEstatus}`);
  }

  getCuentas(): Observable<Cuenta[]> {
    return this.http.get<Cuenta[]>(`${this.myAppUrl}${this.MyApiUrl}${this.MyApiUrlCuentas}`);
  }

  getCuentasContables(): Observable<any> {
    return this.http.get<any>(`${this.myAppUrl}${this.MyApiUrl}${this.MyApiUrlCuentasContables}`);
  }

  updateCombination(updatedData: { IngresoID: number ,ConceptoID: number | string, SegmentoID: number | string, CategoriaID: number | string, SubcategoriaID: number | string }): Observable<any> {
    const url = `${this.myAppUrl}${this.MyApiUrl}UpdateCombination/`;
    return this.http.put(url, updatedData);
  }

  actualizarCuentaIngreso(incomeData: any): Observable<any> {
    const url = `${this.myAppUrl}${this.MyApiUrl}AsignarCuenta/`;
    return this.http.put(url, incomeData);
  }

  actualizarCuentaContable(incomeData: any): Observable<any> {
    const url = `${this.myAppUrl}${this.MyApiUrl}AsignarCuentaContable/`;
    return this.http.put(url, incomeData);
  }

  actualizarCuentasIngresoMasivas(data: any): Observable<any> {
    const url = `${this.myAppUrl}${this.MyApiUrl}AsignarCuentasMasivas/`;
    return this.http.put(url, data);
  }


  updateDescripcion(ingresoID: number, descripcion: string): Observable<any> {
    return this.http.put<any>(`${this.myAppUrl}${this.MyApiUrl}/UpdateDescripcion/${ingresoID}`, { descripcion });
  }

}
