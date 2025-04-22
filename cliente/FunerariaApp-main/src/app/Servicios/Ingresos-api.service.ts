import { Ingresos_api, Historial_Ingresos } from '../Modelos/Ingresos-api';
import { HttpClient, HttpHeaders  } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root',
})
export class IngresosApiServices {
  private apiUrl = 'https://pabs-app.com:4983';
  private myAppUrl: string;
  private MyApiUrl: string;
  private MyApiUrlImportarIngresos: string;
  
  private MyApiUrlHistorialIngresos: string;
  private MyApiUrlHistorialIngresosAdd: string;



  constructor(private http: HttpClient) {
    this.myAppUrl = environment.endpoint;
    this.MyApiUrl = 'api/importar-ingresos/';
    this.MyApiUrlImportarIngresos = 'importarIngresos/';
    
    this.MyApiUrlHistorialIngresos = 'historialIngresos/';

    this.MyApiUrlHistorialIngresosAdd = 'historialIngresosAdd/';


  }

  getToken(username: string, password: string) {
    const url = `${this.apiUrl}/login`;
    const body = { username, password };
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.http.post(url, body, { headers });
  }

  getPaidsAffected(token: string, dateStart: string, dateEnd: string, collection?: string): Observable<Ingresos_api[]> {
    let url = `${this.apiUrl}/paids-affected?date_start=${dateStart}&date_end=${dateEnd}`;
    
    if (collection) {
      url += `&collection=${collection}`;
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<Ingresos_api[]>(url, { headers });
  }

  getFunerariaPayments(token: string, business: string, dateStart: string, dateEnd: string): Observable<Ingresos_api[]> {
    const url = `${this.apiUrl}/mortuary/payment-summary-resumen?business=${business}&date_start=${dateStart}&date_end=${dateEnd}`;

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<Ingresos_api[]>(url, { headers });
  }

  getPagosIniciales(token: string, dateStart: string, dateEnd: string): Observable<Ingresos_api[]> {
    const url = `${this.apiUrl}/initial-paid-by-agent?date_start=${dateStart}&date_end=${dateEnd}`;

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<Ingresos_api[]>(url, { headers });
  }

  importarIngresos(registros: Ingresos_api[]): Observable<any> {
    const url = `${this.myAppUrl}${this.MyApiUrl}${this.MyApiUrlImportarIngresos}`;
    return this.http.post(url, registros);
  }


  getHistorialIngresos(): Observable<Historial_Ingresos[]> {
    return this.http.get<Historial_Ingresos[]>(`${this.myAppUrl}${this.MyApiUrl}${this.MyApiUrlHistorialIngresos}`);
  }


  crearHistorial(fechaInicio: string, fechaCierre: Date, numeroRegistrosImportados: number): Observable<any> {
    const fechaCierreFormateada = fechaCierre.toISOString().split('T')[0];
    const body = {
        FechaInicio: fechaInicio,
        FechaCierre: fechaCierreFormateada,
        NumeroRegistrosImportados: numeroRegistrosImportados,
    };

    console.log('Enviando historial con:', body);

    return this.http.post(`${this.myAppUrl}${this.MyApiUrl}${this.MyApiUrlHistorialIngresosAdd}`, body);
  }



}
