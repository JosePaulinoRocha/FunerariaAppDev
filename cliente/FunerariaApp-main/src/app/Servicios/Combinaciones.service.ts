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


  constructor(private http: HttpClient) {
    this.myAppUrl = environment.endpoint;
    this.MyApiUrl = 'api/combinaciones/';
    this.MyApiUrlCombinaciones = 'GetCombinaciones/';


  }

  getCombinaciones(): Observable<Combinacion[]> {
    return this.http.get<Combinacion[]>(`${this.myAppUrl}${this.MyApiUrl}${this.MyApiUrlCombinaciones}`);
  }
  
}
