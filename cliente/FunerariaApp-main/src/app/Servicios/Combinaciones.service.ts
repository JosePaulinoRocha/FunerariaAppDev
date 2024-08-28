import { Combinacion } from '../Modelos/Combinaciones';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CombinacionesServices {
  private myAppUrl: string;
  private MyApiUrl: string;
  private MyApiUrlCombinaciones: string;
  private MyApiUrlEliminarCombinaciones: string;


  constructor(private http: HttpClient) {
    this.myAppUrl = environment.endpoint;
    this.MyApiUrl = 'api/combinaciones/';
    this.MyApiUrlCombinaciones = 'GetCombinaciones/';
    this.MyApiUrlEliminarCombinaciones = 'DeleteCombinaciones/';


  }

  getCombinaciones(): Observable<Combinacion[]> {
    return this.http.get<Combinacion[]>(`${this.myAppUrl}${this.MyApiUrl}${this.MyApiUrlCombinaciones}`);
  }

  deleteCombinaciones(combinacionID: number): Observable<Combinacion[]> {
    return this.http.delete<Combinacion[]>(`${this.myAppUrl}${this.MyApiUrl}${this.MyApiUrlEliminarCombinaciones}${combinacionID}`);
  }

  updateCombinacionValidado(combinacionID: number, validado: boolean): Observable<any> {
    const url = `${this.myAppUrl}${this.MyApiUrl}UpdateValidado/${combinacionID}`;
    const body = { validado };
    return this.http.put(url, body, { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) });
  }
  
}
