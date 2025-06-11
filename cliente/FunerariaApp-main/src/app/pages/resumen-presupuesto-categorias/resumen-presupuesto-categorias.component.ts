import { Component, Input } from '@angular/core';
import { ModalController, IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ResumenPresupuestoServices } from 'src/app/Servicios/Resumen-presupuesto.service';
import { SubcategoriaModalComponent } from './modal-subcategorias/subcategory-detail-modal.component';


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
  selector: 'app-resumen-presupuesto-categorias',
  templateUrl: './resumen-presupuesto-categorias.component.html',
  styleUrls: ['./resumen-presupuesto-categorias.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class ResumenPresupuestoCategoriasComponent {

  gastosExtraordinarios: GastosExtraordinarios[] = [];
  presupuestoSemanal: PresupuestoSemanal[] = [];
  gastoMensualFrecuencia: GastoMensualPorFrecuencia[] = [];

  egresosMensuales: any[] = [];

  categorias: any[] = [];

  constructor(
    private modalController: ModalController,
    private _resumenPresupuesto_Serv: ResumenPresupuestoServices
  ) {}

  ngOnInit() {
  
    this.loadGastoMensualExtraordinario();
    this.loadPresupuestoSemanal();
    this.loadGastosMensualesFrecuencia();
    this.loadEgresosMensuales();
  }

  async openSubcategoryModal(categoria: any) {
    // console.log("Categoría seleccionada:", categoria);
  
    const modal = await this.modalController.create({
      component: SubcategoriaModalComponent,
      componentProps: {
        categoriaID: categoria.CategoriaID
      }
    });
  
    return await modal.present();
  }

  procesarCategorias() {
    let categoriasAgrupadas: Record<number, { 
      CategoriaID: number;  
      NombreCategoria: string;
      Actual: number; 
      Planeado: number;
      Desfase: number;
    }> = {};
  
    // Procesar egresos actuales
    this.egresosMensuales.forEach((egreso: any) => {
      let key = egreso.CategoriaID;
      if (!categoriasAgrupadas[key]) {
        categoriasAgrupadas[key] = {
          CategoriaID: key,
          NombreCategoria: egreso.NombreCategoria,
          Actual: 0,
          Planeado: 0,
          Desfase: 0
        };
      }
      categoriasAgrupadas[key].Actual += isNaN(Number(egreso.EgresoActual)) ? 0 : Number(egreso.EgresoActual);
    });
  
    // Procesar egresos planeados
    const egresosPlaneados = [...this.presupuestoSemanal, ...this.gastoMensualFrecuencia, ...this.gastosExtraordinarios];
  
    egresosPlaneados.forEach((egreso) => {
      let key = egreso.CategoriaID;
      if (!categoriasAgrupadas[key]) {
        categoriasAgrupadas[key] = {
          CategoriaID: key,
          NombreCategoria: egreso.NombreCategoria,
          Actual: 0,
          Planeado: 0,
          Desfase: 0
        };
      }
      let monto = egreso.MontoDictaminado !== undefined ? Number(egreso.MontoDictaminado) : 
                  egreso.Monto !== undefined ? Number(egreso.Monto) : 0;
      
      categoriasAgrupadas[key].Planeado += isNaN(monto) ? 0 : monto;
    });
  
    // Calcular el desfase (Planeado - Actual) y ordenar de menor a mayor
    this.categorias = Object.values(categoriasAgrupadas)
      .map(categoria => {
        categoria.Desfase = categoria.Planeado - categoria.Actual;
        return categoria;
      })
      .sort((a, b) => a.Desfase - b.Desfase); // Orden de menor a mayor (más déficit primero)
  
    // console.log("Categorías procesadas (ordenadas por desfase):", this.categorias);
  }
    
  
  loadGastoMensualExtraordinario() {
    this._resumenPresupuesto_Serv.getGastoMensualExtraordinarioAprobadoCategoriaUnificada().subscribe(
      (data: any[]) => {
        this.gastosExtraordinarios = data;
        // console.log("gastos planeados extraordinarios: ", data);
        this.procesarCategorias();
      }
    );
  }

  loadPresupuestoSemanal() {
    this._resumenPresupuesto_Serv.getPresupuestoSemanalCategoriaUnificada().subscribe(
      (data: any[]) => {
        this.presupuestoSemanal = data;
        // console.log("gastos planeados semanales: ", data);
        this.procesarCategorias();
      }
    );
  }

  loadGastosMensualesFrecuencia() {
    this._resumenPresupuesto_Serv.getPresupuestoMensualFrecuenciaAprobadosMesActualCategoriaUnificada().subscribe(
      (data: any[]) => {
        this.gastoMensualFrecuencia = data;
        // console.log("gastos planeados periodicos: ", data);
        this.procesarCategorias();
      }
    );
  }

  loadEgresosMensuales() {
    this._resumenPresupuesto_Serv.getEgresosMensualCategoriaUnificada().subscribe(
      (data: any[]) => {
        this.egresosMensuales = data;
        // console.log("gastos actuales: ", data);
        this.procesarCategorias();
      }
    );
  }

  calcularDesfase(actual: number, planeado: number): number {
    return actual - planeado;
  }

  closeModal() {
    this.modalController.dismiss();
  }
}

