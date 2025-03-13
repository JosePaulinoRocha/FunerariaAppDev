import { Component, Input } from '@angular/core';
import { ModalController, IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { PresupuestoServices } from 'src/app/Servicios/Presupuesto.service';
import { ResumenPresupuestoServices } from 'src/app/Servicios/Resumen-presupuesto.service';
import { SubcategoryDetailModalComponent } from './modal-subcategorias/subcategory-detail-modal.component';



interface GastosExtraordinarios {
  GastoID: number;
  FechaPreautorizada: string;
  Concepto: string;
  Monto: number;
  ProveedorID: number;
  NombreProveedor: string;
  SegmentoID: number;
  NombreSegmento: string;
  EstatusPresupuestoID: number;
  Estatus: string;
  CuentaID: number;
  TipoCuentaID: number;
  TipoCuenta: string;
  NombreCuenta: string;
  RFC: string;
  Fecha: string;
  CategoriaID: number;
  NombreCategoria: string;
  SubcategoriaID: number;
  NombreSubcategoria: string;
  ConceptoID: number;
  NombreConcepto: string;
  [key: string]: any;
}

interface PresupuestoSemanal {
  SegmentoID: number;
  NombreSegmento: string;
  CategoriaID: number;
  NombreCategoria: string;
  SubcategoriaID: number;
  NombreSubcategoria: string;
  ConceptoID: number;
  NombreConcepto: string;
  PromedioMonto: number;
  PromedioPiezas: number;
  FrecuenciaPromedio: number;
  UltimaFecha: string;
  FrecuenciaDictaminada: number;
  MontoDictaminado: number;
  CuentaID: number;
  NombreCuenta: string;
  DiaLimite: number;
  PeriodoID: number | null;
  PeriodoCongelado: string | null;
  [key: string]: any; // Permite la extensión de la interfaz con otros campos si es necesario
}

interface GastoMensualPorFrecuencia {
  SegmentoID: number;
  NombreSegmento: string;
  CategoriaID: number;
  NombreCategoria: string;
  SubcategoriaID: number;
  NombreSubcategoria: string;
  ConceptoID: number;
  NombreConcepto: string;
  MontoDictaminado: number;
  FrecuenciaDictaminada: number;
  CuentaID: number | null;
  NombreCuenta: string | null;
  CajaChica: any;
  DiaLimite: number | null;
  PromedioMonto: number | null;
  PromedioPiezas: number | null;
  FrecuenciaPromedio: number | null;
  UltimaFecha: string | null;  // Fecha en formato ISO
  FechaSiguienteGasto: string | null;  // Fecha en formato ISO
  DiasPendientes: number | null;
  PeriodoID: number | null;
  PeriodoCongelado: string | null; // Rango de fecha como "YYYY-MM-DD al YYYY-MM-DD"
  Guardado: number;
  [key: string]: any;
}

@Component({
  selector: 'app-segment-detail-modal',
  templateUrl: './segment-detail-modal.component.html',
  styleUrls: ['./segment-detail-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class SegmentDetailModalComponent {

  @Input() segmento: any;

  gastosExtraordinarios: GastosExtraordinarios[] = [];
  presupuestoSemanal: PresupuestoSemanal[] = [];
  gastoMensualFrecuencia: GastoMensualPorFrecuencia[] = [];

  egresosMensuales: any[] = [];

  egresosReales: any[] = [];
  egresosPlaneados: any[] = [];
  egresosUnificados: any[] = [];


  constructor(private _resumenPresupuesto_Serv: ResumenPresupuestoServices, private _presupuestoServ: PresupuestoServices, private modalController: ModalController) {}

  ngOnInit() {
    console.log("Segmento recibido en el modal:", this.segmento);
    this.loadGastoMensualExtraordinario();
    this.loadPresupuestoSemanal();
    this.loadGastosMensualesFrecuencia();
    this.loadEgresosMensualesSegmentos();

  }

  procesarEgresos() {
    let egresosAgrupados: Record<number, { 
      CategoriaID: number; 
      NombreCategoria: string; 
      MontoActual: number; 
      MontoPlaneado: number;
    }> = {};
  
    // Procesar Egresos Actuales
    this.egresosMensuales.forEach((egreso: any) => {
      let key: number = egreso.CategoriaID;
      if (!egresosAgrupados[key]) {
        egresosAgrupados[key] = {
          CategoriaID: key,
          NombreCategoria: egreso.NombreCategoria,
          MontoActual: 0,
          MontoPlaneado: 0
        };
      }
      egresosAgrupados[key].MontoActual += isNaN(Number(egreso.EgresoActual)) ? 0 : Number(egreso.EgresoActual);
    });
  
    // Procesar Egresos Planeados
    const egresosPlaneados = [...this.presupuestoSemanal, ...this.gastoMensualFrecuencia, ...this.gastosExtraordinarios];
  
    egresosPlaneados.forEach((egreso) => {
      let key: number = egreso.CategoriaID;
      if (!egresosAgrupados[key]) {
        egresosAgrupados[key] = {
          CategoriaID: key,
          NombreCategoria: egreso.NombreCategoria,
          MontoActual: 0,
          MontoPlaneado: 0
        };
      }
      let monto = egreso.MontoDictaminado !== undefined ? Number(egreso.MontoDictaminado) : 
                  egreso.Monto !== undefined ? Number(egreso.Monto) : 0;
      
      egresosAgrupados[key].MontoPlaneado += isNaN(monto) ? 0 : monto;
    });
  
    // Convertir en array y ordenar por desfase (MontoPlaneado - MontoActual)
    this.egresosUnificados = Object.values(egresosAgrupados).sort((a, b) => 
      (a.MontoPlaneado - a.MontoActual) - (b.MontoPlaneado - b.MontoActual)
    );
  }
  

  loadEgresosMensualesSegmentos() {
    this._resumenPresupuesto_Serv.getEgresosMensualSegmentos(this.segmento.segmentoID).subscribe(
      (data: any[]) => {
        console.log("Datos de egresos actuales mensuales por segmentos:", data);
  
        if (Array.isArray(data)) {
          this.egresosMensuales = data;
          this.procesarEgresos();
        } else {
          console.warn('Los datos recibidos no son un array:', data);
          this.egresosMensuales = []; // Evita problemas en el *ngFor
        }
      },
      (error: any) => console.error('Error fetching egresos mensuales:', error)
    );
  }
  
  

  loadGastosMensualesFrecuencia() {
    if (!this.segmento || !this.segmento.segmentoID) {
      console.warn("No se recibió SegmentoID");
      return;
    }
    this._resumenPresupuesto_Serv.getPresupuestoMensualFrecuenciaAprobadosMesActual(this.segmento.segmentoID).subscribe(
      (data: GastoMensualPorFrecuencia[]) => {
        this.gastoMensualFrecuencia = data.map(gasto => {
          if (gasto.CajaChica == 1) {
            gasto.CuentaID = null; // Si es Caja Chica, asignar CuentaID a null
          }
  
          return {
            ...gasto,
            UltimaFecha: gasto.UltimaFecha ? new Date(gasto.UltimaFecha).toISOString().split('T')[0] : null,
            PeriodoCongeladoOriginal: gasto.PeriodoCongelado, // Mantener el valor original del periodo congelado
            PeriodoCongelado: gasto.PeriodoCongelado ? this.formatPeriodoCongelado(gasto.PeriodoCongelado) : null, // Formatear el periodo
          };
        });
        this.procesarEgresos();
        console.log("esta es la data de gastos por frecuencia: ", this.gastoMensualFrecuencia);
      },
      error => {
        console.error('Error fetching incomes', error);
      }
    );
  }

  loadPresupuestoSemanal() {
    if (!this.segmento || !this.segmento.segmentoID) {
      console.warn("No se recibió SegmentoID");
      return;
    }

    this._resumenPresupuesto_Serv.getPresupuestoSemanal(this.segmento.segmentoID).subscribe((data: PresupuestoSemanal[]) => {
      // Transformar la fecha y asignar la data inicial
      this.presupuestoSemanal = data.map(presupuestoSemanal => ({
        ...presupuestoSemanal,
        UltimaFecha: new Date(presupuestoSemanal.UltimaFecha).toISOString().split('T')[0],
        PeriodoCongeladoOriginal: presupuestoSemanal.PeriodoCongelado, // Mantener el valor original del periodo congelado
        PeriodoCongelado: presupuestoSemanal.PeriodoCongelado ? this.formatPeriodoCongelado(presupuestoSemanal.PeriodoCongelado) : null
      }));
      this.procesarEgresos();
      console.log("esta es la data de presupuesto semanal: ", this.presupuestoSemanal);
    }, (error) => {
      console.error('Error fetching presupuesto', error); 
    });
  }
  
  loadGastoMensualExtraordinario() {
    if (!this.segmento || !this.segmento.segmentoID) {
      console.warn("No se recibió SegmentoID");
      return;
    }
  
    this._resumenPresupuesto_Serv.getGastoMensualExtraordinarioAprobado(this.segmento.segmentoID)
      .subscribe((data: GastosExtraordinarios[]) => {
          data.sort((a, b) => b.GastoID - a.GastoID);
          this.gastosExtraordinarios = data.map(gasto => ({
            ...gasto,
            FechaPreautorizada: new Date(gasto.FechaPreautorizada).toISOString().split('T')[0],
            Fecha: new Date(gasto.Fecha).toISOString().split('T')[0],
          }));
          console.log("Gastos extraordinarios filtrados por SegmentoID:", this.gastosExtraordinarios);
          this.procesarEgresos();
      }, (error) => {
        console.error('Error al obtener gastos por segmento', error);
      });
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


  async openSubcategoryModal(categoria: any) {
    console.log("Categoría seleccionada:", categoria);
  
    const modal = await this.modalController.create({
      component: SubcategoryDetailModalComponent,
      componentProps: {
        segmentoID: this.segmento.segmentoID,
        categoriaID: categoria.CategoriaID
      }
    });
  
    return await modal.present();
  }
  
  

  closeModal() {
    this.modalController.dismiss();
  }

}
