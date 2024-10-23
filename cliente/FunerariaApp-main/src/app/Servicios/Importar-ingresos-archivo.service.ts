import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { environmentProd } from 'src/environments/environment.prod';


@Injectable({
  providedIn: 'root'
})
export class IngresosArchivoServices {
  private myAppUrl: string;
  private MyApiUrl: string;


  constructor(private http: HttpClient) {
    this.myAppUrl = environment.endpoint;
    this.MyApiUrl = 'api/importar-ingresos-archivo/';


  }


  // Método para enviar los datos al endpoint
  importarIngresosArchivo(datos: any[]): Observable<any> {
    const url = `${this.myAppUrl}${this.MyApiUrl}importarIngresosArchivo/`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    
    return this.http.post(url, datos, { headers });
  }


  importarEgresosArchivo(datos: any[]): Observable<any> {
    const url = `${this.myAppUrl}${this.MyApiUrl}importarEgresosArchivo/`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    
    return this.http.post(url, datos, { headers });
  }
  
  
}
