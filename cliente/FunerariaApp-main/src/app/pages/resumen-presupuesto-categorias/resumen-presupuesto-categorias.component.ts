import { Component, OnInit } from '@angular/core';
import { IonicModule, ModalController } from "@ionic/angular";
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ProyeccionServices } from 'src/app/Servicios/Proyeccion.service';
import { ReportesServices } from 'src/app/Servicios/Reportes.service';
import { PresupuestoServices } from 'src/app/Servicios/Presupuesto.service';
import { PresupuestoMensualFrecuenciaServices } from 'src/app/Servicios/Presupuesto-mensual-frecuencia.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-resumen-presupuesto-categorias',
  templateUrl: './resumen-presupuesto-categorias.component.html',
  styleUrls: ['./resumen-presupuesto-categorias.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule, HttpClientModule],
})
export class ResumenPresupuestoCategoriasComponent  implements OnInit {

  egresoActual: number = 0;
  ingresoActual: number = 0;
  egresoOtorgado: number = 0;

  presupuestoSemanal: any[] = [];
  gastoMensualFrecuencia: any[] = [];
  gastoMensualFrecuenciaExtraordinaria: any[] = [];

  loadedPresupuestoSemanal = false;
  loadedGastoMensualFrecuencia = false;
  loadedGastoMensualExtraordinario = false;

  mostrarOpciones: boolean = false;  // Maneja la visibilidad de los botones
  
  constructor(private router: Router, private _presupuestoMensualFrecuenciaServ: PresupuestoMensualFrecuenciaServices, private _presupuestoServ: PresupuestoServices, private _reportesServ: ReportesServices, private _proyeccionServ: ProyeccionServices, private modalController: ModalController ) { }

  ngOnInit() {
    this.loadEgresoActual();
    this.loadGastosMensualesFrecuencia();
    this.loadGastoMensualExtraordinario();
    this.loadPresupuestoSemanal();
    this.loadIngresoActual();
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  mostrarBotones() {
    this.mostrarOpciones = true;
  }

  private checkAndCalculateEgresoOtorgado() {
    if (this.loadedPresupuestoSemanal && this.loadedGastoMensualFrecuencia && this.loadedGastoMensualExtraordinario) {
      this.egresoOtorgado = [
        ...this.presupuestoSemanal,
        ...this.gastoMensualFrecuencia,
        ...this.gastoMensualFrecuenciaExtraordinaria
      ].reduce((sum, item) => 
        sum + (item.MontoDictaminado ? parseFloat(item.MontoDictaminado) : (item.Monto ? parseFloat(item.Monto) : 0)), 0
      );
    }
  }

  loadPresupuestoSemanal() {
    this._presupuestoServ.getPresupuestoSemanal().subscribe((data: any[]) => {
      this.presupuestoSemanal = data || [];
      this.loadedPresupuestoSemanal = true;
      this.checkAndCalculateEgresoOtorgado();
      console.log("egreso semanal planeado: ", data)
    }, (error) => {
      console.error('Error fetching presupuesto', error);
      this.loadedPresupuestoSemanal = true;
      this.checkAndCalculateEgresoOtorgado();
    });
  }

  loadGastoMensualExtraordinario() {
    this._presupuestoServ.getGastoMensualExtraordinarioAprobado().subscribe((data: any[]) => {
      this.gastoMensualFrecuenciaExtraordinaria = data || [];
      this.loadedGastoMensualExtraordinario = true;
      this.checkAndCalculateEgresoOtorgado();
      console.log("egreso extraordinario planeado: ", data)
    }, (error) => {
      console.error('Error fetching presupuesto', error);
      this.loadedGastoMensualExtraordinario = true;
      this.checkAndCalculateEgresoOtorgado();
    });
  }

  loadGastosMensualesFrecuencia() {
    this._presupuestoMensualFrecuenciaServ.getPresupuestoMensualFrecuenciaAprobadosMesActual().subscribe((data: any[]) => {
      this.gastoMensualFrecuencia = data || [];
      this.loadedGastoMensualFrecuencia = true;
      this.checkAndCalculateEgresoOtorgado();
      console.log("egreso periodico planeado: ", data)
    }, (error) => {
      console.error('Error fetching incomes', error);
      this.loadedGastoMensualFrecuencia = true;
      this.checkAndCalculateEgresoOtorgado();
    });
  }

  private loadEgresoActual() {
    this._proyeccionServ.getEgresoMensual().subscribe(
      (data: any[]) => {
        this.egresoActual = data.length > 0 && data[0].EgresoActual
          ? parseFloat(data[0].EgresoActual)
          : 0; 
          console.log("egreso actual: ", data)
      },
      (error) => {
        console.error('Error fetching egreso mensual:', error);
      }
    );
  }

  private loadIngresoActual() {
    this._proyeccionServ.getIngresoMensual().subscribe(
      (data: any[]) => {
        this.ingresoActual = data.length > 0 && data[0].IngresoActual
          ? parseFloat(data[0].IngresoActual)
          : 0; // Valor predeterminado
          console.log("ingreso actual: ", data)
      },
      (error) => {
        console.error('Error fetching ingreso mensual:', error);
        this.ingresoActual = 0; // Valor predeterminado en caso de error
      }
    );
  }

  formatPeriodoCongelado(periodo: string): string {
    const [start, end] = periodo.split(' al ');
  
    let fechaInicio = new Date(start);
    let fechaFin = new Date(end);
  
    // Ajustamos las fechas sumando un día
    fechaInicio.setDate(fechaInicio.getDate() + 1);
    fechaFin.setDate(fechaFin.getDate() + 1);
  
    // Formato manual para cada fecha
    const fechaInicioFormateada = `${this.getDiaSemana(fechaInicio)}, ${fechaInicio.getDate()} de ${this.getMesNombre(fechaInicio)} del ${fechaInicio.getFullYear()}`;
    const fechaFinFormateada = `${this.getDiaSemana(fechaFin)}, ${fechaFin.getDate()} de ${this.getMesNombre(fechaFin)} del ${fechaFin.getFullYear()}`;
  
    return `${fechaInicioFormateada} a ${fechaFinFormateada}`;
  }
  
  // Función para obtener el nombre del día en español
  getDiaSemana(fecha: Date): string {
    const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    return dias[fecha.getDay()];
  }
  
  // Función para obtener el nombre del mes en español
  getMesNombre(fecha: Date): string {
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    return meses[fecha.getMonth()];
  }

}

