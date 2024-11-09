import { Presupuesto, GastoMensualPorFrecuencia, GastoPresupuestoFrecuenciaGuardados, GastoMensualPorFrecuenciaAprobados } from '../Modelos/Presupuesto';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { environmentProd } from 'src/environments/environment.prod';


@Injectable({
  providedIn: 'root'
})
export class PresupuestoMensualCuentasServices {
  private myAppUrl: string;
  private MyApiUrl: string;


  constructor(private http: HttpClient) {
    this.myAppUrl = environment.endpoint;
    this.MyApiUrl = 'api/presupuesto-mensual-cuentas/';


  }

  getPresupuestoMensualFrecuencia(): Observable<GastoMensualPorFrecuencia[]> {
    return this.http.get<GastoMensualPorFrecuencia[]>(`${this.myAppUrl}${this.MyApiUrl}GetPresupuestoMensualFrecuencia/`);
  }

  actualizarGastosSeleccionados(gastosSeleccionados: any[], cuentaID: number): Observable<any> {
    const url = `${this.myAppUrl}${this.MyApiUrl}ActualizarCuentaDeGastos`;
    const body = {
        gastosSeleccionados,
        cuentaID
    };
    return this.http.put(url, body);
}


  
}
