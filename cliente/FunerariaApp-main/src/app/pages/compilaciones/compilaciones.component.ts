import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { CompilacionesServices } from 'src/app/Servicios/Compilaciones.service';
import { FormsModule } from '@angular/forms';
import { Chart, ChartConfiguration, ChartOptions, registerables } from 'chart.js';
Chart.register(...registerables);
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { saveAs } from 'file-saver';


interface Compilacion {
  CategoriaID: number;
  NombreCategoria: string;
  TipoIngreso: number | { data: number[] };
  TodosReconciliados: number;
  TotalMonto: string;
  TotalRegistros: number;
  UltimaFecha: string;
}

@Component({
  selector: 'app-compilaciones',
  templateUrl: './compilaciones.component.html',
  styleUrls: ['./compilaciones.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, HttpClientModule, FormsModule],
})
export class CompilacionesComponent implements OnInit {
  isLoading: boolean = false;
  compilacion: Compilacion[] = [];

  selectedTipo: string = '';
  sortOrder: 'ASC' | 'DESC' = 'DESC';

  currentPage: number = 1;
  itemsPerPage: number = 10;
  itemsPerPageOptions: number[] = [10, 20, 50, 100, 200, 500];

  filtroSeleccionado: 'todos' | 'ingresos' | 'egresos' = 'todos';
  reconciliadoSeleccionado: 'todos' | 'reconciliado' | 'noReconciliado' = 'todos';

  dateMode: 'single' | 'range' = 'single';
  selectedDateStart: string = new Date().toISOString().split('T')[0];
  selectedDateEnd: string = new Date().toISOString().split('T')[0];

  modoVista: 'tabla' | 'grafica' = 'tabla';

  charts: { [key: string]: any } = {};


  setFiltro(tipo: 'todos' | 'ingresos' | 'egresos') {
    this.filtroSeleccionado = tipo;
    this.reconciliadoSeleccionado = 'todos';
    this.loadCompilaciones(); // Actualiza la tabla
  }

  onReconciliadoChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.reconciliadoSeleccionado = select.value as any;
    this.loadCompilaciones(); // Actualiza la tabla
  }

  isIngreso(tipo: any): boolean {
    if (typeof tipo === 'number') return tipo === 0;
    if (tipo?.data?.[0] !== undefined) return tipo.data[0] === 0;
    return false;
  }

  isEgreso(tipo: any): boolean {
    if (typeof tipo === 'number') return tipo === 1;
    if (tipo?.data?.[0] !== undefined) return tipo.data[0] === 1;
    return false;
  }

  constructor(private _compilacionServ: CompilacionesServices) {}

  ngOnInit() {
    this._compilacionServ.getUltimaFechaConDatos().subscribe(
      (resp: any) => {
        // console.log('📅 Fecha más reciente con datos desde el backend:', resp?.UltimaFecha);

        const fechaValida = resp?.UltimaFecha
          ? new Date(resp.UltimaFecha).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0];

        this.selectedDateStart = fechaValida;
        this.selectedDateEnd = fechaValida;
        this.loadCompilaciones();
      },
      (error) => {
        console.error('❌ No se pudo obtener la fecha más reciente:', error);
        const hoy = new Date().toISOString().split('T')[0];
        this.selectedDateStart = hoy;  
        this.selectedDateEnd = hoy;
        this.loadCompilaciones();
      }
    );
  }

  loadCompilaciones() {
    this.isLoading = true;

    const tipoFiltro = this.filtroSeleccionado;
    const reconciliadoFiltro = this.reconciliadoSeleccionado;

    // Para enviar fechas
    let fechaParam: string;
    let fechaFinParam: string | null = null;

    if (this.dateMode === 'single') {
      fechaParam = this.selectedDateStart;
    } else {
      fechaParam = this.selectedDateStart;
      fechaFinParam = this.selectedDateEnd;
    }

    this._compilacionServ.getResumenIngresosEgresos(fechaParam, tipoFiltro, reconciliadoFiltro, fechaFinParam).subscribe(
      (data: any) => {
        this.compilacion = data;
        this.isLoading = false;

        if (this.modoVista === 'grafica') {
          const egresos = this.egresosParaGrafica;
          const ingresos = this.ingresosParaGrafica;

          this.renderChart(
            'barChartEgresos',
            'Egresos ($)',
            { labels: egresos.map(e => e.name), data: egresos.map(e => e.value) },
            '#EF5350'
          );

          this.renderChart(
            'barChartIngresos',
            'Ingresos ($)',
            { labels: ingresos.map(i => i.name), data: ingresos.map(i => i.value) },
            '#66BB6A'
          );
        }

      },
      (error) => {
        this.isLoading = false;
        alert('Error al obtener el resumen. Intenta de nuevo más tarde.');
      }
    );
  }

  onModoVistaChange() {
    if (this.modoVista === 'grafica') {
      this.loadCompilaciones();
    }
  }

  get ingresosParaGrafica() {
    return this.compilacion
      .filter(item => this.isIngreso(item.TipoIngreso))
      .map(item => ({
        name: item.NombreCategoria,
        value: Number(item.TotalMonto)
      }));
  }

  get egresosParaGrafica() {
    return this.compilacion
      .filter(item => this.isEgreso(item.TipoIngreso))
      .map(item => ({
        name: item.NombreCategoria,
        value: Number(item.TotalMonto)
      }));
  }

  get totalIngresos(): number {
    return this.compilacion
      .filter(item => this.isIngreso(item.TipoIngreso))
      .reduce((sum, item) => sum + Number(item.TotalMonto), 0);
  }

  get totalEgresos(): number {
    return this.compilacion
      .filter(item => this.isEgreso(item.TipoIngreso))
      .reduce((sum, item) => sum + Number(item.TotalMonto), 0);
  }

  private renderChart(canvasId: string, chartLabel: string, chartData: { labels: string[]; data: number[] }, color: string) {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!canvas) return;

    const rows = chartData.labels.length;
    const rowHeight = 80;
    const minHeight = 100;  // mínimo alto del canvas (pocas barras)
    const maxHeight = 600; 
    const calculatedHeight = rows * rowHeight;
    canvas.height = Math.min(Math.max(calculatedHeight, minHeight), maxHeight);

    const data: ChartConfiguration['data'] = {
      labels: chartData.labels,
      datasets: [
        {
          label: chartLabel,
          data: chartData.data,
          backgroundColor: color,
          borderRadius: 6,
          barThickness: 18,
          categoryPercentage: 0.7,
          barPercentage: 0.9,
        },
      ],
    };

    const options: ChartOptions = {
      responsive: true,
      indexAxis: 'y',
      plugins: {
        legend: {
          display: true,
          position: 'top',
        },
      },
      scales: {
        x: { beginAtZero: true },
        y: {
          ticks: {
            autoSkip: false,
            maxRotation: 0,
            minRotation: 0,
            padding: 4,
          },
        },
      },
      layout: { padding: { right: 8 } },
    };

    if (this.charts[canvasId]) this.charts[canvasId].destroy();
    this.charts[canvasId] = new Chart(canvas, {
      type: 'bar',
      data,
      options,
    });
  }


  compareTipoIngreso(a: Compilacion, b: Compilacion): number {
    const aVal = typeof a.TipoIngreso === 'number' ? a.TipoIngreso : a.TipoIngreso?.data?.[0];
    const bVal = typeof b.TipoIngreso === 'number' ? b.TipoIngreso : b.TipoIngreso?.data?.[0];
    return aVal - bVal;
  }

  onDateChange() {
    this.currentPage = 1;
    this.loadCompilaciones();
  }

  getTipoIngresoDescripcion(tipo: any): string {
    const valor = typeof tipo === 'number' ? tipo : tipo?.data?.[0];
    return valor === 0 ? 'Ingreso' : 'Egreso';
  }

  get paginatedData(): Compilacion[] {
    const filtrado = this.compilacion.filter(item => {
      if (this.selectedTipo === '') return true;
      const valor = typeof item.TipoIngreso === 'number' ? item.TipoIngreso : item.TipoIngreso?.data?.[0];
      return valor === +this.selectedTipo;
    });

    // Paginación
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return filtrado.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number {
    const filtrado = this.compilacion.filter(item => {
      if (this.selectedTipo === '') return true;
      const valor = typeof item.TipoIngreso === 'number' ? item.TipoIngreso : item.TipoIngreso?.data?.[0];
      return valor === +this.selectedTipo;
    });
    return Math.max(Math.ceil(filtrado.length / this.itemsPerPage), 1);
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  onItemsPerPageChange() {
    // Al cambiar registros por página, vuelve a la página 1
    if(this.itemsPerPage < 10){
      this.itemsPerPage = 10; // mínimo 10
    }
    this.currentPage = 1;
  }

  formatDate(isoDate: string): string {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    // Opcional: formatear a 'dd/MM/yyyy'
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Mes empieza en 0
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  exportarExcel() {
    // Usar todo el conjunto, no solo página
    const ingresos = this.compilacion.filter(item => this.isIngreso(item.TipoIngreso));
    const egresos = this.compilacion.filter(item => this.isEgreso(item.TipoIngreso));

    const ingresosData = ingresos.map(item => ({
      Tipo: 'Ingreso',
      Categoría: item.NombreCategoria,
      'Monto total': Number(item.TotalMonto),
      'Total registros': item.TotalRegistros,
      'Última fecha': this.formatDate(item.UltimaFecha),
      Reconciliados: item.TodosReconciliados === 1 ? 'Sí' : 'No'
    }));

    const egresosData = egresos.map(item => ({
      Tipo: 'Egreso',
      Categoría: item.NombreCategoria,
      'Monto total': Number(item.TotalMonto),
      'Total registros': item.TotalRegistros,
      'Última fecha': this.formatDate(item.UltimaFecha),
      Reconciliados: item.TodosReconciliados === 1 ? 'Sí' : 'No'
    }));

    ingresosData.push({
      Tipo: 'Total Ingresos',
      Categoría: '',
      'Monto total': this.totalIngresos,
      'Total registros': ingresos.reduce((sum, i) => sum + i.TotalRegistros, 0),
      'Última fecha': '',
      Reconciliados: ''
    });

    egresosData.push({
      Tipo: 'Total Egresos',
      Categoría: '',
      'Monto total': this.totalEgresos,
      'Total registros': egresos.reduce((sum, e) => sum + e.TotalRegistros, 0),
      'Última fecha': '',
      Reconciliados: ''
    });

    const combinedData = [
      ...ingresosData,
      { Tipo: '', Categoría: '', 'Monto total': '', 'Total registros': '', 'Última fecha': '', Reconciliados: '' },
      ...egresosData
    ];

    const worksheet = XLSX.utils.json_to_sheet(combinedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Resumen');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, 'resumen_ingresos_egresos.xlsx');
  }

  exportarPDF() {
    const doc = new jsPDF();
    const title = 'Resumen de Ingresos y Egresos';
    doc.setFontSize(16);
    doc.text(title, 14, 15);

    const ingresos = this.compilacion.filter(item => this.isIngreso(item.TipoIngreso));
    const egresos = this.compilacion.filter(item => this.isEgreso(item.TipoIngreso));

    const ingresosRows = ingresos.map(item => [
      'Ingreso',
      item.NombreCategoria,
      Number(item.TotalMonto).toLocaleString('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 2
      }),
      item.TotalRegistros,
      this.formatDate(item.UltimaFecha),
      item.TodosReconciliados === 1 ? 'Sí' : 'No'
    ]);
    ingresosRows.push([
      'Total Ingresos',
      '',
      this.totalIngresos.toLocaleString('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 2
      }),
      ingresos.reduce((sum, i) => sum + i.TotalRegistros, 0),
      '',
      ''
    ]);

    const egresosRows = egresos.map(item => [
      'Egreso',
      item.NombreCategoria,
      Number(item.TotalMonto).toLocaleString('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 2
      }),
      item.TotalRegistros,
      this.formatDate(item.UltimaFecha),
      item.TodosReconciliados === 1 ? 'Sí' : 'No'
    ]);
    egresosRows.push([
      'Total Egresos',
      '',
      this.totalEgresos.toLocaleString('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 2
      }),
      egresos.reduce((sum, e) => sum + e.TotalRegistros, 0),
      '',
      ''
    ]);

    autoTable(doc, {
      head: [['Tipo', 'Categoría', 'Monto total', 'Total registros', 'Última fecha', 'Reconciliados']],
      body: ingresosRows,
      startY: 20,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185] },
    });

    const finalY = doc.lastAutoTable.finalY || 20;
    const nextTableStartY = finalY + 15;

    autoTable(doc, {
      head: [['Tipo', 'Categoría', 'Monto total', 'Total registros', 'Última fecha', 'Reconciliados']],
      body: egresosRows,
      startY: nextTableStartY,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [192, 57, 43] },
    });

    doc.save('resumen_ingresos_egresos.pdf');
  }

}
