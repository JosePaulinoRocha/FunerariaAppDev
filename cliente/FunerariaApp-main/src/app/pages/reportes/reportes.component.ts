import { Component, OnInit } from '@angular/core';
import { IonicModule, ModalController } from "@ionic/angular";
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UsuariosServices } from 'src/app/Servicios/Usuarios.service';
import { HttpClientModule } from '@angular/common/http';
import { ReportesModalComponent } from './modal/reportes-modal.component';
import { ObservacionesModalComponent } from './modal-observaciones/modal-observaciones-reporte.component';
import { ProyeccionServices } from 'src/app/Servicios/Proyeccion.service';
import { ReportesServices } from 'src/app/Servicios/Reportes.service';
import { PresupuestoServices } from 'src/app/Servicios/Presupuesto.service';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface Registros {
  SegmentoID: number;
  NombreSegmento: string;
  CategoriaID: number;
  NombreCategoria: string;
  SubcategoriaID: number;
  NombreSubcategoria: string;
  ConceptoID: number;
  NombreConcepto: string;
  TotalPiezas: number;
  FrecuenciaPromedio: number;
  UltimaFecha: string; 
  TotalMonto: string;
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

interface GastoMensualPorFrecuenciaExtraordinaria {
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

interface ReporteMesActual {
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
  MontoTotal: number;
  PiezasTotal: number;
  DesfaceMonto: number;
  PresupuestoPorcentaje: number;
  DesfacePorcentaje: number;
  PromedioSemanas: number;
  UltimaFecha: string | null; // Fecha en formato ISO
  Observaciones: string;
  [key: string]: any;
}

@Component({
  selector: 'app-reportes',
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule, HttpClientModule, ReportesModalComponent, ObservacionesModalComponent],
})
export class ReportesComponent  implements OnInit {

  isAdmin: boolean = false;

  presupuestoSemanal: PresupuestoSemanal[] = [];
  gastoMensualFrecuencia: GastoMensualPorFrecuencia[] = [];
  gastoMensualFrecuenciaExtraordinaria: GastoMensualPorFrecuenciaExtraordinaria[] = [];
  reporteMesActual: ReporteMesActual[] = [];

  paginatedPresupuesto: ReporteMesActual[] = [];
  currentPage: number = 1;
  itemsPerPageOptions: number[] = [10, 20, 50, 100, 200, 500, 1000, 2000];
  itemsPerPage: number = 10;
  totalPages: number = 0;


  selectedMonth: string = '';
  selectedYear: string = '';
  months = [
    { label: 'Enero', value: '01' },
    { label: 'Febrero', value: '02' },
    { label: 'Marzo', value: '03' },
    { label: 'Abril', value: '04' },
    { label: 'Mayo', value: '05' },
    { label: 'Junio', value: '06' },
    { label: 'Julio', value: '07' },
    { label: 'Agosto', value: '08' },
    { label: 'Septiembre', value: '09' },
    { label: 'Octubre', value: '10' },
    { label: 'Noviembre', value: '11' },
    { label: 'Diciembre', value: '12' },
  ];
  years: number[] = [];

  egresoPasado: number = 0;
  ingresoPasado: number = 0;
  loading: boolean = false;
  errorMessage: string = '';
  egresos: Registros[] = [];
  ingresos: Registros[] = [];

  constructor(
    private modalController: ModalController,
    private _proyeccionServ: ProyeccionServices,
    private _reportesServ: ReportesServices,
    private _presupuestoServ: PresupuestoServices
  ) {}

  ngOnInit() {
    this.loadEgresoPasado();
    this.loadIngresoPasado();
    this.loadReportesEgresos();
    this.loadReportesIngresos();
    this.populateYears();
    this.loadPresupuestoSemanal();
    this.loadPresupuestoPeriodico();
    this.loadPresupuestoExtraordinario();
    this.loadReporteMesActual();
    this.checkAdminStatus();

  }

  async openObservacionModal(registro: any) {
    const modal = await this.modalController.create({
      component: ObservacionesModalComponent,
      componentProps: {
        segmentoID: registro.SegmentoID,
        categoriaID: registro.CategoriaID,
        subcategoriaID: registro.SubcategoriaID,
        conceptoID: registro.ConceptoID,
      }
    });
  
    modal.onDidDismiss().then((result) => {
      if (result.data && result.data.success) { 
        this.loadReporteMesActual(); 
      }
    });
  
    return await modal.present();
  }
  
  
  async asignarMonto_Frecuencia(reporteMesActual?: ReporteMesActual) {

    // console.log("estos son los datos de edicion: ", reporteMesActual)

    const modal = await this.modalController.create({
      component: ReportesModalComponent,
      componentProps: {
        reporteMesActual: reporteMesActual ? { ...reporteMesActual } : this.getEmptyIncome(),
        isEditMode: !!reporteMesActual
      }
    });
  
    modal.onDidDismiss().then((result) => {
      if (result.data && result.role === 'success') {
        this.loadReporteMesActual();
      }
    });
  
    return await modal.present();
  }

  loadReporteMesActual() {
    this.loading = true;
    this._reportesServ.getReporteMesActual().subscribe(
      (data: any[]) => {
        this.reporteMesActual = data.map(reporteMesActual => ({
          ...reporteMesActual,
          UltimaFecha: reporteMesActual.UltimaFecha ? reporteMesActual.UltimaFecha.split('T')[0] : null
        }));
        this.loading = false;
        // console.log("Esta es la data del reporte del mes actual:", this.reporteMesActual);
        this.totalPages = Math.ceil(this.reporteMesActual.length / this.itemsPerPage);
        this.updatePaginated();
      },
      (error) => {
        console.error('Error fetching egresos:', error);
        this.errorMessage = 'Error al cargar los egresos. Por favor, inténtalo de nuevo.';
        this.loading = false;
      }
    );
  }


  loadPresupuestoExtraordinario() {
    this.loading = true;
    this._reportesServ.getReportePresupuestoExtraordinario().subscribe(
      (data: any[]) => {
        this.gastoMensualFrecuenciaExtraordinaria = data.map(gastoMensualFrecuenciaExtraordinaria => ({
          ...gastoMensualFrecuenciaExtraordinaria,
          Fecha: gastoMensualFrecuenciaExtraordinaria.Fecha ? gastoMensualFrecuenciaExtraordinaria.Fecha.split('T')[0] : null, // Extrae solo la parte de la fecha
          FechaPreautorizada: gastoMensualFrecuenciaExtraordinaria.FechaPreautorizada ? gastoMensualFrecuenciaExtraordinaria.FechaPreautorizada.split('T')[0] : null
        }));
        this.loading = false;
        // console.log("Esta es la data de gastos por frecuencia extraordinaria:", this.gastoMensualFrecuenciaExtraordinaria);
      },
      (error) => {
        console.error('Error fetching egresos:', error);
        this.errorMessage = 'Error al cargar los egresos. Por favor, inténtalo de nuevo.';
        this.loading = false;
      }
    );
  }
  

  loadPresupuestoPeriodico() {
    this._reportesServ.getReportePresupuestoPeriodico().subscribe(
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
  
        // console.log("esta es la data de gastos por frecuencia: ", this.gastoMensualFrecuencia);
      },
      error => {
        console.error('Error fetching incomes', error);
      }
    );
  }

  loadPresupuestoSemanal() {
    this._reportesServ.getReportePresupuestoSemanal().subscribe((data: PresupuestoSemanal[]) => {
      // Transformar la fecha y asignar la data inicial
      this.presupuestoSemanal = data.map(presupuestoSemanal => ({
        ...presupuestoSemanal,
        UltimaFecha: new Date(presupuestoSemanal.UltimaFecha).toISOString().split('T')[0],
        PeriodoCongeladoOriginal: presupuestoSemanal.PeriodoCongelado, // Mantener el valor original del periodo congelado
        PeriodoCongelado: presupuestoSemanal.PeriodoCongelado ? this.formatPeriodoCongelado(presupuestoSemanal.PeriodoCongelado) : null
      }));
  
      // console.log("esta es la data de presupuesto semanal: ", this.presupuestoSemanal);
      }, (error) => {
      console.error('Error fetching presupuesto', error); 
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

  populateYears() {
    const currentYear = new Date().getFullYear();
    for (let i = 0; i < 50; i++) {
      this.years.push(currentYear - i);
    }
  }

  generateReportByDate() {
    if (!this.selectedMonth || !this.selectedYear) {
      console.warn('Mes y año no seleccionados.');
      return;
    }
  
    this.loading = true;
    this._reportesServ.getReportePorFecha(this.selectedMonth, this.selectedYear).subscribe(
      (data: any) => {
        // console.log('Reporte recibido:', data);
  
        // Asignar los datos recibidos del endpoint
        const totalIngresos = data.totalIngresos || 0;
        const totalEgresos = data.totalEgresos || 0;
        const gananciaNeta = totalIngresos - totalEgresos;
        this.ingresos = data.reporteIngresos || [];
        this.egresos = data.reporteEgresos || [];
  
        // Generar el PDF con los datos obtenidos
        const doc = new jsPDF();
  
        // Configuración inicial
        doc.setFontSize(18);
        doc.text(`Reporte de Ingresos y Egresos (${this.selectedMonth}/${this.selectedYear})`, 14, 20);
  
        // Tabla de totales
        const totalesStartY = 30;
        doc.autoTable({
          startY: totalesStartY,
          head: [['Descripción', 'Monto']],
          body: [
            ['Total Ingresos', `$${totalIngresos}`],
            ['Total Egresos', `$${totalEgresos}`],
            ['Ganancia Neta', `$${gananciaNeta}`],
          ],
          styles: { fontSize: 12 },
          theme: 'grid',
        });
  
        // Ingresos
        const ingresosStartY = (doc as any).lastAutoTable.finalY + 10;
        doc.text('Ingresos:', 14, ingresosStartY);
        doc.autoTable({
          startY: ingresosStartY + 5,
          head: [['Segmento', 'Categoría', 'Subcategoría', 'Monto Total', 'Última Fecha']],
          body: this.ingresos.map(ingreso => [
            ingreso.NombreSegmento,
            ingreso.NombreCategoria,
            ingreso.NombreSubcategoria,
            `$${parseFloat(ingreso.TotalMonto || '0').toFixed(2)}`,
            ingreso.UltimaFecha.split('T')[0], // Formato YYYY-MM-DD
          ]),
          styles: { fontSize: 10 },
        });
  
        // Egresos
        const egresosStartY = (doc as any).lastAutoTable.finalY + 10;
        doc.text('Egresos:', 14, egresosStartY);
        doc.autoTable({
          startY: egresosStartY + 5,
          head: [['Segmento', 'Categoría', 'Subcategoría', 'Monto Total', 'Última Fecha']],
          body: this.egresos.map(egreso => [
            egreso.NombreSegmento,
            egreso.NombreCategoria,
            egreso.NombreSubcategoria,
            `$${parseFloat(egreso.TotalMonto || '0').toFixed(2)}`,
            egreso.UltimaFecha.split('T')[0], // Formato YYYY-MM-DD
          ]),
          styles: { fontSize: 10 },
        });
  
        // Guardar el PDF
        doc.save(`Reporte_Ingresos_Egresos_${this.selectedMonth}_${this.selectedYear}.pdf`);
  
        this.loading = false;
      },
      (error) => {
        console.error('Error al generar el reporte:', error);
        this.errorMessage = 'Error al generar el reporte. Inténtalo nuevamente.';
        this.loading = false;
      }
    );
  }
  

  loadReportesEgresos() {
    this.loading = true;
    this._reportesServ.getReporteEgresos().subscribe(
      (data: any[]) => {
        this.egresos = data;
        this.loading = false;
        // console.log("egresos unificados: ", data)
      },
      (error) => {
        console.error('Error fetching egresos:', error);
        this.errorMessage = 'Error al cargar los egresos. Por favor, inténtalo de nuevo.';
        this.loading = false;
      }
    );
  }

  loadReportesIngresos() {
    this.loading = true;
    this._reportesServ.getReporteIngresos().subscribe(
      (data: any[]) => {
        this.ingresos = data;
        this.loading = false;
        // console.log("ingresos unificados: ", data)
      },
      (error) => {
        console.error('Error fetching ingresos:', error);
        this.errorMessage = 'Error al cargar los ingresos. Por favor, inténtalo de nuevo.';
        this.loading = false;
      }
    );
  }

  private loadIngresoPasado() {
    this._proyeccionServ.getIngresoMensualPasado().subscribe(
      (data: any[]) => {
        this.ingresoPasado = data.length > 0 && data[0].IngresoMesPasado
          ? parseFloat(data[0].IngresoMesPasado)
          : 0;
        // console.log("ingreso total: ", this.ingresoPasado)
      },
      (error) => {
        console.error('Error fetching ingreso mensual pasado:', error);
        this.ingresoPasado = 0;
      }
    );
  }

  private loadEgresoPasado() {
    this._proyeccionServ.getEgresoMensualPasado().subscribe(
      (data: any[]) => {
        this.egresoPasado = data.length > 0 && data[0].EgresoMesPasado
          ? parseFloat(data[0].EgresoMesPasado)
          : 0;
        // console.log("egreso total: ", this.egresoPasado)
      },
      (error) => {
        console.error('Error fetching egreso mensual pasado:', error);
        this.egresoPasado = 0;
      }
    );
  }

  generarPDF() {
    const doc = new jsPDF();
  
    // Cálculo de la ganancia neta
    const gananciaNeta = this.ingresoPasado - this.egresoPasado;

    const totalEgresosEsperados = 
    this.presupuestoSemanal.reduce((sum, p) => sum + parseFloat(String(p.MontoDictaminado) || '0'), 0) +
    this.gastoMensualFrecuencia.reduce((sum, g) => sum + parseFloat(String(g.MontoDictaminado) || '0'), 0) +
    this.gastoMensualFrecuenciaExtraordinaria.reduce((sum, e) => sum + parseFloat(String(e.Monto) || '0'), 0);

    // Cálculo de la diferencia entre el presupuesto esperado y el gasto real
    const diferenciaPresupuestal = totalEgresosEsperados - this.egresoPasado;

    // Configuración inicial
    doc.setFontSize(18);
    doc.text('Reporte de Ingresos y Egresos', 14, 20);

    // Tabla de totales
    const totalesStartY = 30;
    doc.autoTable({
        startY: totalesStartY,
        head: [['Descripción', 'Monto']],
        body: [
            ['Total Ingresos', `$${this.ingresoPasado.toFixed(2)}`],
            ['Total Egresos', `$${this.egresoPasado.toFixed(2)}`],
            ['Total Egresos Esperados', `$${totalEgresosEsperados.toFixed(2)}`],
            // ['Diferencia Presupuestal', `$${diferenciaPresupuestal.toFixed(2)}`],
            ['Ganancia Neta', `$${gananciaNeta.toFixed(2)}`],
        ],
        styles: { fontSize: 12 },
        theme: 'grid',
    });

    // Ingresos
    const ingresosStartY = (doc as any).lastAutoTable.finalY + 10;
    doc.text('Ingresos:', 14, ingresosStartY);
    doc.autoTable({
      startY: ingresosStartY + 5,
      head: [['Segmento', 'Categoría', 'Subcategoría', 'Monto Total', 'Última Fecha']],
      body: this.ingresos.map(ingreso => [
        ingreso.NombreSegmento,
        ingreso.NombreCategoria,
        ingreso.NombreSubcategoria,
        `$${parseFloat(ingreso.TotalMonto || '0').toFixed(2)}`, // Conversión a número con valor predeterminado
        ingreso.UltimaFecha.split('T')[0], // Formato YYYY-MM-DD
      ]),
      styles: { fontSize: 10 },
    });
  
    // Egresos
    const egresosStartY = (doc as any).lastAutoTable.finalY + 10;
    doc.text('Egresos:', 14, egresosStartY);
    doc.autoTable({
      startY: egresosStartY + 5,
      head: [['Segmento', 'Categoría', 'Subcategoría', 'Monto Total', 'Última Fecha']],
      body: this.egresos.map(egreso => [
        egreso.NombreSegmento,
        egreso.NombreCategoria,
        egreso.NombreSubcategoria,
        `$${parseFloat(egreso.TotalMonto || '0').toFixed(2)}`,
        egreso.UltimaFecha.split('T')[0], // Formato YYYY-MM-DD
      ]),
      styles: { fontSize: 9 }, // Reducir tamaño de fuente
    });
  
    // Egresos esperados (presupuesto semanal)
    const presupuestoStartY = (doc as any).lastAutoTable.finalY + 15;
    doc.text('Egresos Esperados (Presupuesto Semanal):', 14, presupuestoStartY);
    doc.autoTable({
      startY: presupuestoStartY + 5,
      head: [['Segmento', 'Categoría', 'Subcategoría', 'Monto Dictaminado', 'Periodo Congelado']],
      body: this.presupuestoSemanal.map(presupuesto => [
        presupuesto.NombreSegmento,
        presupuesto.NombreCategoria,
        presupuesto.NombreSubcategoria,
        `$${(presupuesto.MontoDictaminado)}`,
        presupuesto['PeriodoCongeladoOriginal'],
      ]),
      styles: { fontSize: 9 },
    });
  
    // Gastos por Frecuencia
    const frecuenciaStartY = (doc as any).lastAutoTable.finalY + 15;
    doc.text('Gastos por Frecuencia:', 14, frecuenciaStartY);
    doc.autoTable({
      startY: frecuenciaStartY + 5,
      head: [['Segmento', 'Categoría', 'Subcategoría', 'Monto Dictaminado', 'Última Fecha', 'Frecuencia Dictaminada']],
      body: this.gastoMensualFrecuencia.map(gasto => [
        gasto.NombreSegmento,
        gasto.NombreCategoria,
        gasto.NombreSubcategoria,
        `$${(gasto.MontoDictaminado)}`,
        gasto.UltimaFecha ? gasto.UltimaFecha.split('T')[0] : 'N/A',
        `${(gasto.FrecuenciaDictaminada)} días`,
      ]),
      styles: { fontSize: 9 },
    });
  
    // **NUEVO: Gastos Extraordinarios**
    const extraordinariosStartY = (doc as any).lastAutoTable.finalY + 15;
    doc.text('Gastos Extraordinarios:', 14, extraordinariosStartY);
    doc.autoTable({
      startY: extraordinariosStartY + 5,
      head: [['Segmento', 'Categoría', 'Subcategoría', 'Fecha', 'Monto', 'Estatus']],
      body: this.gastoMensualFrecuenciaExtraordinaria.map(gasto => [
        gasto.NombreSegmento,
        gasto.NombreCategoria,
        gasto.NombreSubcategoria,
        gasto.Fecha ? gasto.Fecha.split('T')[0] : 'N/A', // Formato YYYY-MM-DD o 'N/A'
        `$${(gasto.Monto)}`,
        gasto.Estatus,
      ]),
      styles: { fontSize: 9 }, // Reducir tamaño de fuente
    });
  
    // Guardar el PDF
    doc.save('Reporte_Ingresos_Egresos.pdf');
  }
  

  isButtonDisabled(): boolean {
    return this.loading;
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginated();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginated();
    }
  }

  
  updatePaginated() {
    this.totalPages = Math.ceil(this.reporteMesActual.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedPresupuesto = this.reporteMesActual.slice(startIndex, startIndex + this.itemsPerPage);
  }

  onItemsPerPageChange() {
    this.currentPage = 1; // Resetea la paginación al cambiar los registros por página
    this.updateTotalPages();
    this.updatePaginated();
  }

  updateTotalPages() {
    this.totalPages = Math.ceil(this.reporteMesActual.length / this.itemsPerPage);
  }

  checkAdminStatus() {
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    this.isAdmin = user.isAdmin === 1;
  }

  getEmptyIncome(): ReporteMesActual {
    return {
      SegmentoID: 0,
      NombreSegmento: '',
      CategoriaID: 0,
      NombreCategoria: '',
      SubcategoriaID: 0,
      NombreSubcategoria: '',
      ConceptoID: 0,
      NombreConcepto: '',
      MontoDictaminado: 0,
      FrecuenciaDictaminada: 0,
      MontoTotal: 0,
      PiezasTotal: 0,
      DesfaceMonto: 0,
      PresupuestoPorcentaje: 0,
      DesfacePorcentaje: 0,
      PromedioSemanas: 0,
      UltimaFecha: '',
      Observaciones: '',
    };
  }
  

}
