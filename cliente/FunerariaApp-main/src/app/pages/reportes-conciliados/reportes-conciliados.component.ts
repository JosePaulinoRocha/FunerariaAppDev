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
  SegmentoID: number;
  NombreSegmento: string;
  CategoriaID: number;
  NombreCategoria: string;
  SubcategoriaID: number;
  NombreSubcategoria: string;
  TipoIngreso: number | { data: number[] };
  TodosReconciliados: number;
  TotalMonto: string;
  TotalRegistros: number;
  UltimaFecha: string;
}

@Component({
  selector: 'app-reportes-conciliados',
  templateUrl: './reportes-conciliados.component.html',
  styleUrls: ['./reportes-conciliados.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, HttpClientModule, FormsModule],
})
export class ReportesConciliadosComponent implements OnInit {

  isLoading: boolean = false;

  ingresos: Compilacion[] = [];
  egresos: Compilacion[] = [];

  selectedTipo: string = '';
  sortOrder: 'ASC' | 'DESC' = 'DESC';

  currentPage: number = 1;
  itemsPerPage: number = 10;
  itemsPerPageOptions: number[] = [10, 20, 50, 100, 200, 500];

  filtroSeleccionado: 'todos' | 'ingresos' | 'egresos' = 'ingresos';
  reconciliadoSeleccionado: 'todos' | 'reconciliado' | 'noReconciliado' = 'todos';

  dateMode: 'single' | 'range' = 'single';
  selectedDateStart: string = new Date().toISOString().split('T')[0];
  selectedDateEnd: string = new Date().toISOString().split('T')[0];

  modoVista: 'tabla' | 'grafica' = 'tabla';

  segmentoSeleccionado: { id: number, nombre: string } | null = null;
  categoriaSeleccionada: { id: number; nombre: string } | null = null;
  subcategoriaSeleccionada: { id: number; nombre: string } | null = null;

  modoFiltro: 'segmento' | 'categoria' = 'segmento';

  datosPorCategoria: any[] = [];

  columnaNombre: string = 'Segmento';

  charts: { [key: string]: any } = {};

  filtroSegmento: 'Todos' | 'Cobranza' | 'Funeraria' | 'Ventas' = 'Todos';

  constructor(private _compilacionServ: CompilacionesServices) {}

  getNombreColumna(item: any): string {
    if (this.columnaNombre === 'Segmento') return item.NombreSegmento;
    if (this.columnaNombre === 'Categoría') return this.getNombreCategoriaValido(item);
    if (this.columnaNombre === 'Subcategoría') return item.NombreSubcategoria || '(Sin subcategoría)';
    if (this.columnaNombre === 'Concepto') return item.NombreConcepto || '(Sin concepto)';
    return '(Sin nombre)';
  }

  actualizarColumnaNombre() {
    if (this.subcategoriaSeleccionada) {
      this.columnaNombre = 'Concepto'; 
    } else if (this.categoriaSeleccionada) {
      this.columnaNombre = 'Subcategoría'; 
    } else if (this.segmentoSeleccionado) {
      this.columnaNombre = 'Categoría'; 
    } else {
      this.columnaNombre = 'Segmento'; 
    }
  }

  filtrarPorItem(item: Compilacion) {
    if (this.modoFiltro === 'segmento') {
      if (!this.segmentoSeleccionado || this.segmentoSeleccionado.id !== item.SegmentoID) {
        this.segmentoSeleccionado = { id: item.SegmentoID, nombre: item.NombreSegmento };
        this.categoriaSeleccionada = null;
        this.subcategoriaSeleccionada = null;
      } else if (!this.categoriaSeleccionada || this.categoriaSeleccionada.id !== item.CategoriaID) {
        this.categoriaSeleccionada = { id: item.CategoriaID, nombre: item.NombreCategoria };
        this.subcategoriaSeleccionada = null;
      } else if (!this.subcategoriaSeleccionada || this.subcategoriaSeleccionada.id !== item.SubcategoriaID) {
        this.subcategoriaSeleccionada = { id: item.SubcategoriaID, nombre: item.NombreSubcategoria || '(Sin subcategoría)' };
      }
    } else {
      // modoFiltro === 'categoria'
      if (!this.categoriaSeleccionada || this.categoriaSeleccionada.id !== item.CategoriaID) {
        this.categoriaSeleccionada = { id: item.CategoriaID, nombre: item.NombreCategoria };
        this.subcategoriaSeleccionada = null;
      } else if (!this.subcategoriaSeleccionada || this.subcategoriaSeleccionada.id !== item.SubcategoriaID) {
        this.subcategoriaSeleccionada = { id: item.SubcategoriaID, nombre: item.NombreSubcategoria || '(Sin subcategoría)' };
      }
    }

    this.actualizarColumnaNombre();
    this.currentPage = 1;
    this.loadDatos();
  }

  onModoFiltroChange() {
    this.segmentoSeleccionado = null;
    this.categoriaSeleccionada = null;
    this.subcategoriaSeleccionada = null;
    this.actualizarColumnaNombre();
    this.loadDatos();
  }

  volverAFiltro(filtro: 'segmento' | 'categoria' | 'subcategoria') {
    switch(filtro) {
      case 'segmento':
        this.segmentoSeleccionado = null; 
        this.categoriaSeleccionada = null;
        this.subcategoriaSeleccionada = null;
        break;
      case 'categoria':
        this.categoriaSeleccionada = null; 
        this.subcategoriaSeleccionada = null;
        break;
      case 'subcategoria':
        this.subcategoriaSeleccionada = null; 
        break;
    }
    this.actualizarColumnaNombre(); 
    this.loadDatos(); 
  }

  ngOnInit() {
    this._compilacionServ.getUltimaFechaConciliacion().subscribe(
      (resp: any) => {
        const fechaValida = resp?.UltimaFecha
          ? new Date(resp.UltimaFecha).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0];

        this.selectedDateStart = fechaValida;
        this.selectedDateEnd = fechaValida;
        this.loadDatos();
      },
      (error) => {
        console.error('❌ No se pudo obtener la última FechaConciliacion:', error);
        const hoy = new Date().toISOString().split('T')[0];
        this.selectedDateStart = hoy;
        this.selectedDateEnd = hoy;
        this.loadDatos();
      }
    );
  }

  setFiltro(tipo: 'ingresos' | 'egresos' | 'todos') {
    this.filtroSeleccionado = tipo;
    this.currentPage = 1;
  }

  loadDatos() {
    if (this.modoFiltro === 'segmento') {
      if (this.segmentoSeleccionado && this.categoriaSeleccionada && this.subcategoriaSeleccionada) {
        this.columnaNombre = 'Concepto';
      } else if (this.segmentoSeleccionado && this.categoriaSeleccionada) {
        this.columnaNombre = 'Subcategoría';
      } else if (this.segmentoSeleccionado) {
        this.columnaNombre = 'Categoría';
      } else {
        this.columnaNombre = 'Segmento';
      }
    } else {
      // modoFiltro === 'categoria'
      if (this.categoriaSeleccionada && this.subcategoriaSeleccionada) {
        this.columnaNombre = 'Concepto';
      } else if (this.categoriaSeleccionada) {
        this.columnaNombre = 'Subcategoría';
      } else {
        this.columnaNombre = 'Categoría';
      }
    }

    this.loadIngresos();
    this.loadEgresos();
  }

  onFiltroSegmentoChange(event: Event) {    const select = event.target as HTMLSelectElement;
    this.filtroSegmento = select.value as any;
    this.currentPage = 1;
    this.loadDatos(); // esto recarga ingresos y egresos con el nuevo filtro
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

  loadIngresos() {
    this.isLoading = true;
    const fechaInicio = this.selectedDateStart;
    const fechaFin = this.dateMode === 'range' ? this.selectedDateEnd : null;

    const segmentoId = this.modoFiltro === 'segmento' ? this.segmentoSeleccionado?.id : undefined;
    const categoriaId = this.categoriaSeleccionada?.id;
    const subcategoriaId = this.subcategoriaSeleccionada?.id;

    const filtroPalabra = this.filtroSegmento !== 'Todos' ? this.filtroSegmento : undefined;

    this._compilacionServ
      .getResumenIngresosReconciliados(fechaInicio, fechaFin, segmentoId, categoriaId, subcategoriaId, this.modoFiltro, filtroPalabra)
      .subscribe(
        data => {
          // console.log('[LOAD INGRESOS] Datos recibidos:', data);
          this.ingresos = data.map((item: any) => ({
            ...item,
            UltimaFecha: item.UltimaFecha ? item.UltimaFecha.split('T')[0] : item.UltimaFecha
          }));

          const chartData = this.prepararDatosParaGrafica(this.ingresos);
          this.renderChart('barChartIngresos', this.getTituloGraficaIngresos(), chartData, '#42A5F5');
          this.isLoading = false;
        },
        error => {
          this.isLoading = false;
          console.error('❌ [INGRESOS] Error al obtener ingresos:', error);
          alert('Error al obtener ingresos');
        }
      );
  }

  loadEgresos() {
    this.isLoading = true;
    const fechaInicio = this.selectedDateStart;
    const fechaFin = this.dateMode === 'range' ? this.selectedDateEnd : null;

    const segmentoId = this.modoFiltro === 'segmento' ? this.segmentoSeleccionado?.id : undefined;
    const categoriaId = this.categoriaSeleccionada?.id;
    const subcategoriaId = this.subcategoriaSeleccionada?.id;

    const filtroPalabra = this.filtroSegmento !== 'Todos' ? this.filtroSegmento : undefined;

    this._compilacionServ
      .getResumenEgresosReconciliados(fechaInicio, fechaFin, segmentoId, categoriaId, subcategoriaId, this.modoFiltro, filtroPalabra)
      .subscribe(
        data => {
          // console.log('[LOAD EGRESOS] Datos recibidos:', data);
          this.egresos = data.map((item: any) => ({
            ...item,
            UltimaFecha: item.UltimaFecha ? item.UltimaFecha.split('T')[0] : item.UltimaFecha
          }));

          const chartData = this.prepararDatosParaGrafica(this.egresos);
          this.renderChart('barChartEgresos', this.getTituloGraficaEgresos(), chartData, '#EF5350');
          this.isLoading = false;
        },
        error => {
          this.isLoading = false;
          console.error('❌ [EGRESOS] Error al obtener egresos:', error);
          alert('Error al obtener egresos');
        }
      );
  }

  calcularPorcentaje(monto: number | string, tipoIngreso: any): string {
    const montoNum = typeof monto === 'string' ? parseFloat(monto) : monto;

    // Normalizar tipoIngreso para sacar un número
    let tipo: number;
    if (typeof tipoIngreso === 'number') {
      tipo = tipoIngreso;
    } else if (typeof tipoIngreso === 'string') {
      tipo = parseInt(tipoIngreso, 10);
    } else if (typeof tipoIngreso === 'object' && tipoIngreso?.data && Array.isArray(tipoIngreso.data)) {
      // Si viene un objeto con data[], toma el primer valor o default 0
      tipo = tipoIngreso.data[0] ?? 0;
    } else {
      tipo = 0; // fallback
    }

    const total = tipo === 0 ? this.totalIngresos : this.totalEgresos;
    if (!total || total === 0) return '0.00';

    const porcentaje = (montoNum / total) * 100;
    return porcentaje.toFixed(2);
  }

  calcularEgresoIngreso(item: Compilacion): string {
    if (!item) return '0.00';

    const segmentoID = item.SegmentoID;

    // Total de ingresos del segmento
    const totalIngresosSegmento = this.ingresos
      .filter(i => i.SegmentoID === segmentoID)
      .reduce((acc, curr) => acc + parseFloat(curr.TotalMonto), 0);

    // Total de egresos del segmento
    const totalEgresosSegmento = this.egresos
      .filter(e => e.SegmentoID === segmentoID)
      .reduce((acc, curr) => acc + parseFloat(curr.TotalMonto), 0);

    if (!totalIngresosSegmento || totalIngresosSegmento === 0) return '0.00';

    const porcentaje = (totalEgresosSegmento / totalIngresosSegmento) * 100;
    return porcentaje.toFixed(2);
  }

  onModoVistaChange() {
    if (this.modoVista === 'grafica') {
      this.loadDatos();
    }
  }

  get ingresosFiltrados(): Compilacion[] {
    return this.ingresos.filter(item => this.filtrarPorReconciliado(item));
  }

  get egresosFiltrados(): Compilacion[] {
    return this.egresos.filter(item => this.filtrarPorReconciliado(item));
  }

  filtrarPorReconciliado(item: Compilacion): boolean {
    if (this.reconciliadoSeleccionado === 'todos') return true;
    if (this.reconciliadoSeleccionado === 'reconciliado') return item.TodosReconciliados === 1;
    if (this.reconciliadoSeleccionado === 'noReconciliado') return item.TodosReconciliados === 0;
    return true;
  }

  get datosFiltrados(): Compilacion[] {
    let datos: Compilacion[] = [];
    if (this.filtroSeleccionado === 'ingresos') {
      datos = this.ingresosFiltrados;
    } else if (this.filtroSeleccionado === 'egresos') {
      datos = this.egresosFiltrados;
    } else {
      datos = [...this.ingresosFiltrados, ...this.egresosFiltrados];
    }

    if (this.selectedTipo !== '') {
      datos = datos.filter(item => {
        const tipo = typeof item.TipoIngreso === 'number' ? item.TipoIngreso : item.TipoIngreso?.data?.[0];
        return tipo === +this.selectedTipo;
      });
    }

    return datos;
  }

  get paginatedData(): Compilacion[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.datosFiltrados.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.max(Math.ceil(this.datosFiltrados.length / this.itemsPerPage), 1);
  }

  previousPage() {
    if (this.currentPage > 1) this.currentPage--;
  }

  nextPage() {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  onItemsPerPageChange() {
    if(this.itemsPerPage < 10) this.itemsPerPage = 10;
    this.currentPage = 1;
  }

  getNombreCategoriaValido(item: Compilacion): string {
    if (item.NombreCategoria === 'NULL') return 'NULL';
    if (!item.CategoriaID || !item.NombreCategoria || item.NombreCategoria.trim() === '') {
      return '(Sin categoría)';
    }
    return item.NombreCategoria;
  }

  get ingresosParaGrafica() {
    return this.ingresosFiltrados.map(item => ({
      name: this.getNombreCategoriaValido(item),
      value: Number(item.TotalMonto)
    }));
  }

  get egresosParaGrafica() {
    return this.egresosFiltrados.map(item => ({
      name: this.getNombreCategoriaValido(item),
      value: Number(item.TotalMonto)
    }));
  }

  get totalIngresos(): number {
    return this.ingresosFiltrados.reduce((sum, item) => sum + Number(item.TotalMonto), 0);
  }

  get totalEgresos(): number {
    return this.egresosFiltrados.reduce((sum, item) => sum + Number(item.TotalMonto), 0);
  }

  getTituloGraficaIngresos(): string {
    if (this.subcategoriaSeleccionada) {
      return 'Ingresos por Concepto';
    }

    if (this.modoFiltro === 'categoria') {
      if (this.categoriaSeleccionada) {
        return 'Ingresos por Subcategoría';
      }
      return 'Ingresos por Categoría';
    }

    // modo segmento (comportamiento original)
    if (this.categoriaSeleccionada) {
      return 'Ingresos por Subcategoría';
    }
    if (this.segmentoSeleccionado) {
      return 'Ingresos por Categoría';
    }
    return 'Ingresos por Segmento';
  }

  getTituloGraficaEgresos(): string {
    if (this.subcategoriaSeleccionada) {
      return 'Egresos por Concepto';
    }

    if (this.modoFiltro === 'categoria') {
      if (this.categoriaSeleccionada) {
        return 'Egresos por Subcategoría';
      }
      return 'Egresos por Categoría';
    }

    // modo segmento (comportamiento original)
    if (this.categoriaSeleccionada) {
      return 'Egresos por Subcategoría';
    }
    if (this.segmentoSeleccionado) {
      return 'Egresos por Categoría';
    }
    return 'Egresos por Segmento';
  }

  private prepararDatosParaGrafica(datos: any[]): { labels: string[], data: number[] } {
    const labels: string[] = [];
    const data: number[] = [];

    datos.forEach(item => {
      let label = '';

      if (this.subcategoriaSeleccionada) {
        label = item.NombreConcepto ?? 'Sin concepto';
      } else if (this.modoFiltro === 'categoria') {
        if (this.categoriaSeleccionada) {
          label = item.NombreSubcategoria ?? 'Sin subcategoría';
        } else {
          label = item.NombreCategoria ?? 'Sin categoría';
        }
      } else { // modo segmento (original)
        if (this.categoriaSeleccionada) {
          label = item.NombreSubcategoria ?? 'Sin subcategoría';
        } else if (this.segmentoSeleccionado) {
          label = item.NombreCategoria ?? 'Sin categoría';
        } else {
          label = item.NombreSegmento ?? 'Sin segmento';
        }
      }

      labels.push(label);
      data.push(parseFloat(item.TotalMonto));
    });

    return { labels, data };
  }

  private renderChart(
    canvasId: string,
    chartLabel: string,
    chartData: { labels: string[]; data: number[] },
    color: string
  ) {
    const container = document.getElementById(canvasId)?.parentElement;
    const oldCanvas = document.getElementById(canvasId);

    if (this.charts[canvasId]) {
      this.charts[canvasId].destroy();
      delete this.charts[canvasId];
    }
    if (oldCanvas && container) {
      container.removeChild(oldCanvas);
      const newCanvas = document.createElement('canvas');
      newCanvas.id = canvasId;
      newCanvas.style.width = '100%';
      container.appendChild(newCanvas);
    }

    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!canvas) return;

    const rows = chartData.labels.length;
    const rowHeight = 40;
    const minHeight = 150;
    const maxHeight = 600;
    canvas.height = Math.max(rows * rowHeight, minHeight);

    const minGapPx = 10;
    const totalHeight = canvas.height;
    const gapPerBar = (minGapPx) / totalHeight;
    const dynamicCategoryPercentage = Math.max(0.5, 1 - gapPerBar);

    const data: ChartConfiguration['data'] = {
      labels: chartData.labels,
      datasets: [
        {
          label: chartLabel,
          data: chartData.data,
          backgroundColor: color,
          borderRadius: 6,
          barThickness: 18,
          categoryPercentage: dynamicCategoryPercentage,
          barPercentage: 0.9,
        },
      ],
    };

    const options: ChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      plugins: { legend: { display: true, position: 'top' } },
      scales: {
        x: { beginAtZero: true },
        y: { ticks: { autoSkip: false, padding: 4 } },
      },
    };

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
    this.loadDatos();
  }

  getTipoIngresoDescripcion(tipo: any): string {
    const valor = typeof tipo === 'number' ? tipo : tipo?.data?.[0];
    return valor === 0 ? 'Ingreso' : 'Egreso';
  }

  formatDate(isoDate: string): string {
    if (!isoDate) return '';
    const date = new Date(isoDate);

    date.setDate(date.getDate() + 1);

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); 
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }
  
  exportarExcel() {
    const ingresosData = this.ingresosFiltrados.map(item => ({
      Tipo: 'Ingreso',
      [this.columnaNombre]: this.getNombreColumna(item),
      'Monto total': Number(item.TotalMonto),
      'Porcentaje %': this.calcularPorcentaje(Number(item.TotalMonto), item.TipoIngreso),
      'Total registros': item.TotalRegistros,
      'Última fecha': this.formatDate(item.UltimaFecha),
      'Egreso / Ingreso %': this.calcularEgresoIngreso(item) // ← nueva columna
    }));

    const egresosData = this.egresosFiltrados.map(item => ({
      Tipo: 'Egreso',
      [this.columnaNombre]: this.getNombreColumna(item),
      'Monto total': Number(item.TotalMonto),
      'Porcentaje %': this.calcularPorcentaje(Number(item.TotalMonto), item.TipoIngreso),
      'Total registros': item.TotalRegistros,
      'Última fecha': this.formatDate(item.UltimaFecha),
      'Egreso / Ingreso %': this.calcularEgresoIngreso(item) // ← nueva columna
    }));

    ingresosData.push({
      Tipo: 'Total Ingresos',
      [this.columnaNombre]: '',
      'Monto total': this.totalIngresos,
      'Porcentaje %': '100.00',
      'Total registros': this.ingresosFiltrados.reduce((sum, i) => sum + i.TotalRegistros, 0),
      'Última fecha': '',
      'Egreso / Ingreso %': '' // ← dejar vacío
    });

    egresosData.push({
      Tipo: 'Total Egresos',
      [this.columnaNombre]: '',
      'Monto total': this.totalEgresos,
      'Porcentaje %': '100.00',
      'Total registros': this.egresosFiltrados.reduce((sum, e) => sum + e.TotalRegistros, 0),
      'Última fecha': '',
      'Egreso / Ingreso %': '' // ← dejar vacío
    });

    const combinedData = [
      ...ingresosData,
      { Tipo: '', [this.columnaNombre]: '', 'Monto total': '', 'Porcentaje %': '', 'Total registros': '', 'Última fecha': '', 'Egreso / Ingreso %': '' },
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

    const ingresosRows = this.ingresosFiltrados.map(item => [
      'Ingreso',
      this.getNombreColumna(item),
      Number(item.TotalMonto).toLocaleString('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 2 }),
      this.calcularPorcentaje(Number(item.TotalMonto), item.TipoIngreso) + '%',
      item.TotalRegistros,
      this.formatDate(item.UltimaFecha),
      this.calcularEgresoIngreso(item) + '%' // ← nueva columna
    ]);

    ingresosRows.push([
      'Total Ingresos',
      '',
      this.totalIngresos.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 2 }),
      '100.00%',
      this.ingresosFiltrados.reduce((sum, i) => sum + i.TotalRegistros, 0),
      '',
      '' // ← dejar vacío
    ]);

    const egresosRows = this.egresosFiltrados.map(item => [
      'Egreso',
      this.getNombreColumna(item),
      Number(item.TotalMonto).toLocaleString('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 2 }),
      this.calcularPorcentaje(Number(item.TotalMonto), item.TipoIngreso) + '%',
      item.TotalRegistros,
      this.formatDate(item.UltimaFecha),
      this.calcularEgresoIngreso(item) + '%' // ← nueva columna
    ]);

    egresosRows.push([
      'Total Egresos',
      '',
      this.totalEgresos.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 2 }),
      '100.00%',
      this.egresosFiltrados.reduce((sum, e) => sum + e.TotalRegistros, 0),
      '',
      '' // ← dejar vacío
    ]);

    const head = ['Tipo', this.columnaNombre, 'Monto total', 'Porcentaje %', 'Total registros', 'Última fecha', 'Egreso / Ingreso %'];

    autoTable(doc, {
      head: [head],
      body: ingresosRows,
      startY: 20,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185] },
    });

    const finalY = doc.lastAutoTable?.finalY || 20;
    const nextTableStartY = finalY + 15;

    autoTable(doc, {
      head: [head],
      body: egresosRows,
      startY: nextTableStartY,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [192, 57, 43] },
    });

    doc.save('resumen_ingresos_egresos.pdf');
  }

}
