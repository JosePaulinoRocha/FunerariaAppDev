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

interface Concepto {
  ConceptoID: number;
  NombreConcepto: string;
  NombreSubcategoria: string;
  NombreCategoria: string;
  NombreSegmento: string;
  Actual: number;
  Planeado: number;
}

interface Observacion {
  ObservacionID: number;
  ConceptoID: number;
  Observaciones: string;
  Fecha: string;
}

@Component({
  selector: 'app-observaciones-modal',
  templateUrl: './observaciones-modal.component.html',
  styleUrls: ['./observaciones-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class ObservacionesModalComponent {
  @Input() segmentoID!: number;
  @Input() nombreSegmento!: string;
  @Input() categoriaID!: number;
  @Input() nombreCategoria!: string;
  @Input() subcategoriaID!: number;
  @Input() nombreSubcategoria!: string;
  @Input() conceptoID!: number;
  @Input() NombreConcepto!: string;
  @Input() planeado!: number;
  @Input() actual!: number;


  gastosExtraordinarios: GastosExtraordinarios[] = [];
  presupuestoSemanal: PresupuestoSemanal[] = [];
  gastoMensualFrecuencia: GastoMensualPorFrecuencia[] = [];

  egresosMensuales: any[] = [];

  observaciones: Observacion[] = [];

  constructor(private _resumenPresupuesto_Serv: ResumenPresupuestoServices, private modalController: ModalController) {}

  ngOnInit() {
    // console.log("Props recibidos en el modal de observaciones:", {
    //   segmentoID: this.segmentoID,
    //   nombreSegmento: this.nombreSegmento,
    //   categoriaID: this.categoriaID,
    //   nombreCategoria: this.nombreCategoria,
    //   subcategoriaID: this.subcategoriaID,
    //   nombreSubcategoria: this.nombreSubcategoria,
    //   conceptoID: this.conceptoID,
    //   NombreConcepto: this.NombreConcepto,
    //   planeado: this.planeado,
    //   actual: this.actual,

    // });

    this.loadEgresosMensuales();
  }

  loadEgresosMensuales() {
    this._resumenPresupuesto_Serv.getEgresosMensualesPorConcepto(
      this.segmentoID, this.categoriaID, this.subcategoriaID, this.conceptoID
    ).subscribe(
      (data: any[]) => {
        // console.log("Egresos mensuales filtrados:", data);
        this.egresosMensuales = data;
  
        // Extraer solo observaciones de los egresos que las tienen
        this.observaciones = data.filter(e => e.Observaciones && e.Observaciones.trim() !== '');
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
