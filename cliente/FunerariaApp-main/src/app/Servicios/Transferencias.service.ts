import { Transferencia } from '../Modelos/Transferencias';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { environmentProd } from 'src/environments/environment.prod';


@Injectable({
  providedIn: 'root'
})
export class TransferenciasServices {
  private myAppUrl: string;
  private MyApiUrl: string;
  private MyApiUrlTransferencias: string;


  constructor(private http: HttpClient) {
    this.myAppUrl = environment.endpoint;
    this.MyApiUrl = 'api/transferencias/';
    this.MyApiUrlTransferencias = 'GetTransferencias/';


  }

  getTransferencias(): Observable<Transferencia[]> {
    return this.http.get<Transferencia[]>(`${this.myAppUrl}${this.MyApiUrl}${this.MyApiUrlTransferencias}`);
  }

  realizarTransferencia(nuevoProveedor: { CuentaEnviaID: number, CuentaRecibeID: number, Descripcion: string, Monto: number }): Observable<any> {
    const url = `${this.myAppUrl}${this.MyApiUrl}RealizarTransferencia/`;
    return this.http.post(url, nuevoProveedor);
  }

  
}
