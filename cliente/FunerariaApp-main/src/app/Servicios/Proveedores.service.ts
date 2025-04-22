import { Proveedor } from '../Modelos/Proveedores';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class ProveedoresServices {
  private myAppUrl: string;
  private MyApiUrl: string;
  private MyApiUrlCombinaciones: string;


  constructor(private http: HttpClient) {
    this.myAppUrl = environment.endpoint;
    this.MyApiUrl = 'api/proveedores/';
    this.MyApiUrlCombinaciones = 'GetProveedores/';


  }

  getProveedores(): Observable<Proveedor[]> {
    return this.http.get<Proveedor[]>(`${this.myAppUrl}${this.MyApiUrl}${this.MyApiUrlCombinaciones}`);
  }

  addProveedor(nuevoProveedor: { Proveedor: string, CategoriaID: number | string, SubcategoriaID: number | string }): Observable<any> {
    const url = `${this.myAppUrl}${this.MyApiUrl}AddProveedor/`;
    return this.http.post(url, nuevoProveedor);
  }

  updateProveedor(proveedor: { ProveedorID: number, CategoriaID: number | string, SubcategoriaID: number | string, CostoPorPieza: number }): Observable<any> {
    const url = `${this.myAppUrl}${this.MyApiUrl}UpdateProveedor/`;
    return this.http.put(url, proveedor);
  }

  updateProveedorStatus(proveedorID: number, nuevoEstatus: number): Observable<any> {
    const url = `${this.myAppUrl}${this.MyApiUrl}UpdateProveedorStatus/`; 
    const body = { ProveedorID: proveedorID, Estatus: nuevoEstatus };
    return this.http.put(url, body);
  }
  
  
}
