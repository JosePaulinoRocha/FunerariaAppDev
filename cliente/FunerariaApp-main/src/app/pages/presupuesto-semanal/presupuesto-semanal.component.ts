import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Chart, ChartConfiguration, ChartOptions, registerables } from 'chart.js';
Chart.register(...registerables);
import { ModalController } from '@ionic/angular';
import { PresupuestoSemanalModalComponent } from './modal/presupuesto-semanal-modal.component';
import { PresupuestoSemanalService } from '../../Servicios/Presupuesto-semanal.service';
import * as XLSX from 'xlsx';
import { AlertController } from '@ionic/angular';

interface Presupuesto {
  PresupuestoID: number;
  SegmentoID: number;
  SegmentoNombre: string;
  CategoriaID: number;
  CategoriaNombre: string;
  FechaInicio: string;
  FechaFin: string;
  PresupuestoPlaneado: number;
  GastoReal: number;
  CuentaID?: number;
  NombreCuenta?: string;
  GastoRealPorCuenta?: number;
}

interface PresupuestoExcel {
  SegmentoNombre: string;
  CategoriaNombre: string;
  FechaInicio: string;
  FechaFin: string;
  PresupuestoPlaneado: number;
}

@Component({
  selector: 'app-presupuesto-semanal',
  templateUrl: './presupuesto-semanal.component.html',
  styleUrls: ['./presupuesto-semanal.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, HttpClientModule, FormsModule],
})
export class PresupuestoSemanalComponent implements OnInit {
  isLoading = false;
  presupuesto: Presupuesto[] = [];
  presupuestoFiltrado: Presupuesto[] = [];
  modoVista: 'tabla' | 'grafica' = 'tabla';
  charts: { [key: string]: any } = {};
  paginaActual = 1;
  tamanoPagina = 10;

  fechaFiltroInicio: string = '';
  fechaFiltroFin: string = '';

  constructor(
    private modalController: ModalController,
    private _presupuestoService: PresupuestoSemanalService,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this._presupuestoService.getUltimaFecha().subscribe({
      next: (row: any) => {
        if (row && row.FechaInicio && row.FechaFin) {
          this.fechaFiltroInicio = row.FechaInicio;
          this.fechaFiltroFin = row.FechaFin;
          // console.log('📌 Fechas obtenidas directamente:', this.fechaFiltroInicio, this.fechaFiltroFin);
        }
        this.loadPresupuesto();
      },
      error: (err: any) => {
        console.error('Error obteniendo última fecha:', err);
        this.loadPresupuesto();
      }
    });
  }

  onDateChange() {
    // console.log('📌 Fechas seleccionadas:', this.fechaFiltroInicio, this.fechaFiltroFin);
    this.loadPresupuesto();
  }

  triggerFileInputPresupuesto() {
    const fileInput = document.getElementById('fileInputPresupuesto') as HTMLInputElement;
    fileInput.click();
  }

  onFileChangePresupuesto(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
      this.processExcelDataPresupuesto(jsonData);
    };
    reader.readAsArrayBuffer(file);

    // Limpiar input para poder cargar el mismo archivo nuevamente
    event.target.value = '';
  }

  processExcelDataPresupuesto(data: any[]) {
    const rows = data.slice(1);

    const processedData: PresupuestoExcel[] = rows.map(row => ({
      SegmentoNombre: row[0]?.trim() || '',
      CategoriaNombre: row[1]?.trim() || '',
      FechaInicio: this.excelDateToJSDate(row[2]),
      FechaFin: this.excelDateToJSDate(row[3]),
      PresupuestoPlaneado: Number(row[4] || 0)
    }));

    this.sendPresupuestoInBatches(processedData);
  }

  sendPresupuestoInBatches(registros: PresupuestoExcel[]) {
    const BATCH_SIZE = 50;
    let offset = 0;

    const sendNextBatch = () => {
      const batch = registros.slice(offset, offset + BATCH_SIZE);
      if (!batch.length) {
        this.isLoading = false;
        this.loadPresupuesto();
        return;
      }

      this._presupuestoService.importarPresupuesto(batch).subscribe({
        next: () => {
          offset += BATCH_SIZE;
          sendNextBatch();
        },
        error: err => {
          console.error('Error importando presupuesto:', err);
          this.isLoading = false;
        }
      });
    };

    this.isLoading = true;
    sendNextBatch();
  }

  // Reutiliza tu función existente para convertir fechas
  excelDateToJSDate(value: any): string {
    if (typeof value === 'number') {
      const utc_days = Math.floor(value - 25569) + 1;
      const date_info = utc_days * 86400;
      const date = new Date(date_info * 1000);
      return this.formatDate(date);
    } else if (typeof value === 'string') {
      const normalizedValue = value.replace(/-/g, '/');
      let date = new Date(normalizedValue);
      if (!isNaN(date.getTime())) return this.formatDate(date);

      const parts = normalizedValue.split('/');
      if (parts.length !== 3) return '';
      let [d, m, y] = parts.map(p => parseInt(p, 10));
      if (d > 31) [y, m, d] = [d, m, y];
      date = new Date(y, m - 1, d);
      return isNaN(date.getTime()) ? '' : this.formatDate(date);
    }
    return '';
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  loadPresupuesto() {
    this.isLoading = true;
    this._presupuestoService.getPresupuestoSemanal(this.fechaFiltroInicio, this.fechaFiltroFin)
      .subscribe({
        next: (data) => {
          console.log(data);
          this.presupuesto = (data || []).map((it: any) => ({
            ...it,
            FechaInicio: it.FechaInicio ? it.FechaInicio.split('T')[0] : '',
            FechaFin: it.FechaFin ? it.FechaFin.split('T')[0] : '',
            PresupuestoPlaneado: Number(it.PresupuestoPlaneado ?? it.Monto ?? 0),
            GastoReal: Number(it.GastoReal ?? 0),
            NombreCuenta: it.NombreCuenta ? String(it.NombreCuenta).trim() : ''
          }));

          this.isLoading = false;

          if (this.modoVista === 'grafica') {
            setTimeout(() => this.renderChart(), 50);
          }
        },
        error: (err) => {
          console.error('Error cargando presupuesto semanal:', err);
          this.isLoading = false;
        }
      });
  }

  async abrirModalPresupuesto() {
    const modal = await this.modalController.create({
      component: PresupuestoSemanalModalComponent
    });
    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data) {
      this.loadPresupuesto();
    }
  }

  get totalPlaneado(): number {
    const seen = new Set<number>();
    return this.presupuesto.reduce((sum, item) => {
      if (!seen.has(item.PresupuestoID)) {
        seen.add(item.PresupuestoID);
        return sum + Number(item.PresupuestoPlaneado || 0);
      }
      return sum;
    }, 0);
  }

  get totalReal(): number {
    const seen = new Set<number>();
    return this.presupuesto.reduce((sum, item) => {
      if (!seen.has(item.PresupuestoID)) {
        seen.add(item.PresupuestoID);
        return sum + Number(item.GastoReal || 0);
      }
      return sum;
    }, 0);
  }

  get totalPaginas(): number {
    return Math.ceil(this.presupuesto.length / this.tamanoPagina) || 1;
  }

  get presupuestoPaginado(): Presupuesto[] {
    const start = (this.paginaActual - 1) * this.tamanoPagina;
    return this.presupuesto.slice(start, start + this.tamanoPagina);
  }

  paginaAnterior() {
    if (this.paginaActual > 1) {
      this.paginaActual--;
    }
  }

  paginaSiguiente() {
    if (this.paginaActual < this.totalPaginas) {
      this.paginaActual++;
    }
  }

  onModoVistaChange() {
    if (this.modoVista === 'grafica') {
      setTimeout(() => {
        this.renderChart();
      }, 50);
    }
  }

  async eliminarPresupuesto(id: number) {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: '¿Seguro que deseas eliminar este registro?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          handler: () => {
            this.isLoading = true;
            this._presupuestoService.eliminarPresupuesto(id).subscribe({
              next: () => {
                // Eliminamos localmente para reflejar en la tabla
                this.presupuesto = this.presupuesto.filter(p => p.PresupuestoID !== id);
                this.isLoading = false;
              },
              error: err => {
                console.error('Error eliminando presupuesto:', err);
                this.isLoading = false;
              }
            });
          }
        }
      ]
    });

    await alert.present();
  }

  private renderChart() {
    const canvasId = 'barChartPresupuesto';

    // 🔹 Destruir gráfica previa si existe
    if (this.charts[canvasId]) {
      this.charts[canvasId].destroy();
      delete this.charts[canvasId];
    }

    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!canvas) return;

    const formatDate = (dateStr: string) => {
      if (!dateStr) return '';
      return dateStr;
    };

    // 🔹 Agrupar por Segmento + Categoría + Rango de fechas, evitando duplicados por ID
    const agrupado = new Map<string, { planeado: number; real: number }>();
    const seenIds = new Set<number>();

    this.presupuesto.forEach(item => {
      if (seenIds.has(item.PresupuestoID)) return; // ya contado

      const key = `${item.SegmentoNombre} - ${item.CategoriaNombre} (${formatDate(item.FechaInicio)} a ${formatDate(item.FechaFin)})`;

      if (!agrupado.has(key)) {
        agrupado.set(key, {
          planeado: Number(item.PresupuestoPlaneado || 0),
          real: Number(item.GastoReal || 0)
        });
      } else {
        const actual = agrupado.get(key)!;
        actual.planeado += Number(item.PresupuestoPlaneado || 0);
        actual.real += Number(item.GastoReal || 0);
      }

      seenIds.add(item.PresupuestoID);
    });

    const labels = Array.from(agrupado.keys());
    const planeado = Array.from(agrupado.values()).map(v => v.planeado);
    const real = Array.from(agrupado.values()).map(v => v.real);

    // 🔹 Ajustar altura dinámica según cantidad de combinaciones
    const rowHeight = 50;
    const minHeight = 200;
    canvas.height = Math.max(labels.length * rowHeight, minHeight);

    const data: ChartConfiguration['data'] = {
      labels,
      datasets: [
        {
          label: 'Planeado',
          data: planeado,
          backgroundColor: '#42A5F5',
          borderRadius: 6,
          barThickness: 12,
          barPercentage: 0.5,
          categoryPercentage: 0.6
        },
        {
          label: 'Real',
          data: real,
          backgroundColor: '#66BB6A',
          borderRadius: 6,
          barThickness: 12,
          barPercentage: 0.5,
          categoryPercentage: 0.6
        }
      ]
    };

    const options: ChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      plugins: { legend: { display: true, position: 'top' } },
      scales: {
        x: { beginAtZero: true },
        y: { ticks: { autoSkip: false, padding: 6 } }
      }
    };

    // 🔹 Crear la gráfica
    this.charts[canvasId] = new Chart(canvas, { type: 'bar', data, options });
  }


}
