import { Component, OnInit } from '@angular/core';
import { IonicModule, ModalController } from "@ionic/angular";
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UsuariosServices } from 'src/app/Servicios/Usuarios.service';
import { HttpClientModule } from '@angular/common/http';
import { ReportesModalComponent } from './modal/reportes-modal.component';
import { ProyeccionServices } from 'src/app/Servicios/Proyeccion.service';
import { ReportesServices } from 'src/app/Servicios/Reportes.service';
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
  PromedioPiezas: number;
  FrecuenciaPromedio: number;
  UltimaFecha: string; 
  PromedioMonto: string;
}

@Component({
  selector: 'app-reportes',
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule, HttpClientModule, ReportesModalComponent],
})
export class ReportesComponent  implements OnInit {

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
    private _reportesServ: ReportesServices
  ) {}

  ngOnInit() {
    this.loadEgresoPasado();
    this.loadIngresoPasado();
    this.loadReportesEgresos();
    this.loadReportesIngresos();
    this.populateYears();
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
        console.log('Reporte recibido:', data);
  
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
          head: [['Segmento', 'Categoría', 'Subcategoría', 'Monto Promedio', 'Última Fecha']],
          body: this.ingresos.map(ingreso => [
            ingreso.NombreSegmento,
            ingreso.NombreCategoria,
            ingreso.NombreSubcategoria,
            `$${parseFloat(ingreso.PromedioMonto || '0').toFixed(2)}`,
            ingreso.UltimaFecha.split('T')[0], // Formato YYYY-MM-DD
          ]),
          styles: { fontSize: 10 },
        });
  
        // Egresos
        const egresosStartY = (doc as any).lastAutoTable.finalY + 10;
        doc.text('Egresos:', 14, egresosStartY);
        doc.autoTable({
          startY: egresosStartY + 5,
          head: [['Segmento', 'Categoría', 'Subcategoría', 'Monto Promedio', 'Última Fecha']],
          body: this.egresos.map(egreso => [
            egreso.NombreSegmento,
            egreso.NombreCategoria,
            egreso.NombreSubcategoria,
            `$${parseFloat(egreso.PromedioMonto || '0').toFixed(2)}`,
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
        console.log("egresos unificados: ", data)
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
        console.log("ingresos unificados: ", data)
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
        console.log("ingreso total: ", this.ingresoPasado)
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
        console.log("egreso total: ", this.egresoPasado)
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
      head: [['Segmento', 'Categoría', 'Subcategoría', 'Monto Promedio', 'Última Fecha']],
      body: this.ingresos.map(ingreso => [
        ingreso.NombreSegmento,
        ingreso.NombreCategoria,
        ingreso.NombreSubcategoria,
        `$${parseFloat(ingreso.PromedioMonto || '0').toFixed(2)}`, // Conversión a número con valor predeterminado
        ingreso.UltimaFecha.split('T')[0], // Formato YYYY-MM-DD
      ]),
      styles: { fontSize: 10 },
    });
  
    // Egresos
    const egresosStartY = (doc as any).lastAutoTable.finalY + 10;
    doc.text('Egresos:', 14, egresosStartY);
    doc.autoTable({
      startY: egresosStartY + 5,
      head: [['Segmento', 'Categoría', 'Subcategoría', 'Monto Promedio', 'Última Fecha']],
      body: this.egresos.map(egreso => [
        egreso.NombreSegmento,
        egreso.NombreCategoria,
        egreso.NombreSubcategoria,
        `$${parseFloat(egreso.PromedioMonto || '0').toFixed(2)}`, // Conversión a número con valor predeterminado
        egreso.UltimaFecha.split('T')[0], // Formato YYYY-MM-DD
      ]),
      styles: { fontSize: 10 },
    });
  
    // Guardar el PDF
    doc.save('Reporte_Ingresos_Egresos.pdf');
  }
  
  

  isButtonDisabled(): boolean {
    return this.loading || !this.ingresos.length || !this.egresos.length;
  }
}
