import { Component, Input } from '@angular/core';
import { ModalController, IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ResumenPresupuestoServices } from 'src/app/Servicios/Resumen-presupuesto.service';

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
  selector: 'app-subcategory-detail-modal',
  templateUrl: './subcategory-detail-modal.component.html',
  styleUrls: ['./subcategory-detail-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class SubcategoriaModalComponent {
  @Input() categoriaID: number = 0;

  gastosExtraordinarios: GastosExtraordinarios[] = [];
  presupuestoSemanal: PresupuestoSemanal[] = [];
  gastoMensualFrecuencia: GastoMensualPorFrecuencia[] = [];

  egresosMensuales: any[] = [];

  subcategorias: any[] = [];

  constructor(
    private modalController: ModalController,
    private _resumenPresupuesto_Serv: ResumenPresupuestoServices
  ) {}

  ngOnInit() {
    console.log("Categoria recibida en el modal:", this.categoriaID);
  
    this.loadGastoMensualExtraordinario();
    this.loadPresupuestoSemanal();
    this.loadGastosMensualesFrecuencia();
    this.loadEgresosMensuales();
  }

  procesarSubcategorias() {
    let subcategoriasAgrupadas: Record<number, { 
      SubcategoriaID: number;  
      NombreSubcategoria: string; 
      NombreCategoria: string;  // Agregamos el nombre de la categoría
      NombreSegmento: string;   // Agregamos el nombre del segmento
      Actual: number; 
      Planeado: number;
      Desfase: number;
    }> = {};
  
    // Procesar egresos actuales
    this.egresosMensuales.forEach((egreso: any) => {
      let key = egreso.SubcategoriaID;
      if (!subcategoriasAgrupadas[key]) {
        subcategoriasAgrupadas[key] = {
          SubcategoriaID: key,
          NombreSubcategoria: egreso.NombreSubcategoria,
          NombreCategoria: egreso.NombreCategoria,   // Guardar el nombre de la categoría
          NombreSegmento: egreso.NombreSegmento,     // Guardar el nombre del segmento
          Actual: 0,
          Planeado: 0,
          Desfase: 0
        };
      }
      subcategoriasAgrupadas[key].Actual += isNaN(Number(egreso.EgresoActual)) ? 0 : Number(egreso.EgresoActual);
    });
  
    // Procesar egresos planeados
    const egresosPlaneados = [...this.presupuestoSemanal, ...this.gastoMensualFrecuencia, ...this.gastosExtraordinarios];
  
    egresosPlaneados.forEach((egreso) => {
      let key = egreso.SubcategoriaID;
      if (!subcategoriasAgrupadas[key]) {
        subcategoriasAgrupadas[key] = {
          SubcategoriaID: key,
          NombreSubcategoria: egreso.NombreSubcategoria,
          NombreCategoria: egreso.NombreCategoria,   // Guardar el nombre de la categoría
          NombreSegmento: egreso.NombreSegmento,     // Guardar el nombre del segmento
          Actual: 0,
          Planeado: 0,
          Desfase: 0
        };
      }
      let monto = egreso.MontoDictaminado !== undefined ? Number(egreso.MontoDictaminado) : 
                  egreso.Monto !== undefined ? Number(egreso.Monto) : 0;
      
      subcategoriasAgrupadas[key].Planeado += isNaN(monto) ? 0 : monto;
    });
  
    // Calcular el desfase y ordenar de menor a mayor
    this.subcategorias = Object.values(subcategoriasAgrupadas)
      .map(subcategoria => {
        subcategoria.Desfase = subcategoria.Planeado - subcategoria.Actual; // Planeado - Actual
        return subcategoria;
      })
      .sort((a, b) => a.Desfase - b.Desfase); // Orden de menor a mayor
  
    console.log("Subcategorías procesadas (ordenadas por desfase):", this.subcategorias);
  }
  


  loadGastoMensualExtraordinario() {
    this._resumenPresupuesto_Serv.getGastoExtraordinarioPorCategoriaUnificada(this.categoriaID).subscribe(
      (data: GastosExtraordinarios[]) => {
        console.log("Gastos extraordinarios filtrados:", data);
        this.gastosExtraordinarios = data;
        this.procesarSubcategorias();
      },
      (error) => console.error('Error al obtener gastos por categoría', error)
    );
  }

  loadPresupuestoSemanal() {
    this._resumenPresupuesto_Serv.getPresupuestoSemanalPorCategoriaUnificada(this.categoriaID).subscribe(
      (data: PresupuestoSemanal[]) => {
        console.log("Presupuesto semanal filtrado:", data);
        this.presupuestoSemanal = data;
        this.procesarSubcategorias();
      },
      (error) => console.error('Error al obtener presupuesto semanal por categoría', error)
    );
  }

  loadGastosMensualesFrecuencia() {
    this._resumenPresupuesto_Serv.getPresupuestoFrecuenciaPorCategoriaUnificada(this.categoriaID).subscribe(
      (data: GastoMensualPorFrecuencia[]) => {
        console.log("Gastos mensuales por frecuencia filtrados:", data);
        this.gastoMensualFrecuencia = data;
        this.procesarSubcategorias();
      },
      (error) => console.error('Error al obtener gastos mensuales por frecuencia por categoría', error)
    );
  }

  loadEgresosMensuales() {
    this._resumenPresupuesto_Serv.getEgresosMensualesPorCategoriaUnificada(this.categoriaID).subscribe(
      (data: any[]) => {
        console.log("Egresos mensuales filtrados:", data);
        this.egresosMensuales = data;
        this.procesarSubcategorias();
      },
      (error) => console.error('Error al obtener egresos mensuales por categoría', error)
    );
  }

  calcularDesfase(actual: number, planeado: number): number {
    return actual - planeado;
  }

  closeModal() {
    this.modalController.dismiss();
  }
}
