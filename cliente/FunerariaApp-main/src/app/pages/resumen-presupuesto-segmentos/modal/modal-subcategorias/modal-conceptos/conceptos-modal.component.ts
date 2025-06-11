import { Component, Input } from '@angular/core';
import { ModalController, IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ResumenPresupuestoServices } from 'src/app/Servicios/Resumen-presupuesto.service';
import { ObservacionesModalComponent } from './modal-observaciones/observaciones-modal.component';


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


interface Concepto {
  ConceptoID: number;
  NombreConcepto: string;
  NombreSubcategoria: string;
  NombreCategoria: string;
  NombreSegmento: string;
  Actual: number;
  Planeado: number;
}


@Component({
  selector: 'app-conceptos-modal',
  templateUrl: './conceptos-modal.component.html',
  styleUrls: ['./conceptos-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class ConceptosModalComponent {
  @Input() segmentoID!: number;
  @Input() categoriaID!: number;
  @Input() subcategoriaID!: number;
  @Input() nombreSegmento!: string;
  @Input() nombreCategoria!: string;
  @Input() nombreSubcategoria!: string;

  gastosExtraordinarios: GastosExtraordinarios[] = [];
  presupuestoSemanal: PresupuestoSemanal[] = [];
  gastoMensualFrecuencia: GastoMensualPorFrecuencia[] = [];

  egresosMensuales: any[] = [];

  subcategorias: any[] = [];

  conceptos: Concepto[] = [];

  constructor(private _resumenPresupuesto_Serv: ResumenPresupuestoServices, private modalController: ModalController) {}

  ngOnInit() {
    // console.log("Props recibidos en el modal de conceptos:");
    // console.log("Segmento ID:", this.segmentoID);
    // console.log("Nombre Segmento:", this.nombreSegmento);
    // console.log("Categoría ID:", this.categoriaID);
    // console.log("Nombre Categoría:", this.nombreCategoria);
    // console.log("Subcategoría ID:", this.subcategoriaID);
    // console.log("Nombre Subcategoría:", this.nombreSubcategoria);

    this.loadGastoMensualExtraordinario();
    this.loadPresupuestoSemanal();
    this.loadGastosMensualesFrecuencia();
    this.loadEgresosMensuales();
  }

  async openObservacionesModal(concepto: Concepto) {
    const modal = await this.modalController.create({
      component: ObservacionesModalComponent,
      componentProps: {
        segmentoID: this.segmentoID,
        nombreSegmento: this.nombreSegmento,
        categoriaID: this.categoriaID,
        nombreCategoria: this.nombreCategoria,
        subcategoriaID: this.subcategoriaID,
        nombreSubcategoria: this.nombreSubcategoria,
        conceptoID: concepto.ConceptoID,
        NombreConcepto: concepto.NombreConcepto,
        planeado: concepto.Planeado,
        actual: concepto.Actual
      }
    });
    return await modal.present();
  }
  

  procesarConceptos() {
    let conceptosAgrupados: Record<number, Concepto> = {};

    // Procesar egresos actuales
    this.egresosMensuales.forEach((egreso: any) => {
      let key = egreso.ConceptoID;
      if (!conceptosAgrupados[key]) {
        conceptosAgrupados[key] = {
          ConceptoID: key,
          NombreConcepto: egreso.NombreConcepto,
          NombreSubcategoria: this.nombreSubcategoria,
          NombreCategoria: this.nombreCategoria,
          NombreSegmento: this.nombreSegmento,
          Actual: 0,
          Planeado: 0
        };
      }
      conceptosAgrupados[key].Actual += isNaN(Number(egreso.EgresoActual)) ? 0 : Number(egreso.EgresoActual);
    });

    // Procesar egresos planeados
    const egresosPlaneados = [...this.presupuestoSemanal, ...this.gastoMensualFrecuencia, ...this.gastosExtraordinarios];

    egresosPlaneados.forEach((egreso) => {
      let key = egreso.ConceptoID;
      if (!conceptosAgrupados[key]) {
        conceptosAgrupados[key] = {
          ConceptoID: key,
          NombreConcepto: egreso.NombreConcepto,
          NombreSubcategoria: this.nombreSubcategoria,
          NombreCategoria: this.nombreCategoria,
          NombreSegmento: this.nombreSegmento,
          Actual: 0,
          Planeado: 0
        };
      }
      let monto = egreso.MontoDictaminado !== undefined ? Number(egreso.MontoDictaminado) : 
                  egreso.Monto !== undefined ? Number(egreso.Monto) : 0;

      conceptosAgrupados[key].Planeado += isNaN(monto) ? 0 : monto;
    });

    this.conceptos = Object.values(conceptosAgrupados).sort((a, b) => (a.Actual + a.Planeado) - (b.Actual + b.Planeado));
    // console.log("Conceptos procesados:", this.conceptos);
  }


loadGastoMensualExtraordinario() {
  this._resumenPresupuesto_Serv.getGastoExtraordinarioPorSubcategoria(this.segmentoID, this.categoriaID, this.subcategoriaID).subscribe(
    (data: GastosExtraordinarios[]) => {
      // console.log("Gastos extraordinarios filtrados:", data);
      this.gastosExtraordinarios = data;
      this.procesarConceptos();
    },
    (error) => console.error('Error al obtener gastos por categoría', error)
  );
}

loadPresupuestoSemanal() {
  this._resumenPresupuesto_Serv.getPresupuestoSemanalPorSubcategoria(this.segmentoID, this.categoriaID, this.subcategoriaID).subscribe(
    (data: PresupuestoSemanal[]) => {
      // console.log("Presupuesto semanal filtrado:", data);
      this.presupuestoSemanal = data;
      this.procesarConceptos();
    },
    (error) => console.error('Error al obtener presupuesto semanal por categoría', error)
  );
}

loadGastosMensualesFrecuencia() {
  this._resumenPresupuesto_Serv.getPresupuestoFrecuenciaPorSubcategoria(this.segmentoID, this.categoriaID, this.subcategoriaID).subscribe(
    (data: GastoMensualPorFrecuencia[]) => {
      // console.log("Gastos mensuales por frecuencia filtrados:", data);
      this.gastoMensualFrecuencia = data;
      this.procesarConceptos();
    },
    (error) => console.error('Error al obtener gastos mensuales por frecuencia por categoría', error)
  );
}

loadEgresosMensuales() {
  this._resumenPresupuesto_Serv.getEgresosMensualesPorSubcategoria(this.segmentoID, this.categoriaID, this.subcategoriaID).subscribe(
    (data: any[]) => {
      // console.log("Egresos mensuales filtrados:", data);
      this.egresosMensuales = data;
      this.procesarConceptos();
    },
    (error) => console.error('Error al obtener egresos mensuales por categoría', error)
  );
}

calcularDesfase(planeado: number, actual: number): number {
  return planeado - actual;
}


  closeModal() {
    this.modalController.dismiss();
  }
}
