import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonicModule } from "@ionic/angular";
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Chart, ChartConfiguration, ChartOptions, registerables } from 'chart.js';
import { ProyeccionServices } from 'src/app/Servicios/Proyeccion.service';
import { PresupuestoServices } from 'src/app/Servicios/Presupuesto.service';
import { PresupuestoMensualFrecuenciaServices } from 'src/app/Servicios/Presupuesto-mensual-frecuencia.service';


@Component({
  selector: 'app-proyeccion',
  templateUrl: './proyeccion.component.html',
  styleUrls: ['./proyeccion.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule, HttpClientModule],
})
export class ProyeccionComponent implements OnInit, OnDestroy {
  egresoActual: number = 0;
  egresoPasado: number = 0;
  ingresoActual: number = 0;
  ingresoPasado: number = 0;
  percentageEgreso:number = 0;
  egresosPlaneadosSemanalesTotales: number = 0;
  egresosPlaneadosFrecuenciaTotales: number = 0;
  egresosPlaneadosExtraordinariosTotales: number = 0;

  totalEgresos: number = 0;

  private isSemanalLoaded: boolean = false;
  private isFrecuenciaLoaded: boolean = false;
  private isExtraordinarioLoaded: boolean = false;

  ingresosMensualesData: number[] = [];

  egresosPorCategoria: { labels: string[]; data: number[] } = { labels: [], data: [] };

  private charts: { [key: string]: Chart } = {}; // Referencia a todos los gráficos

  constructor(private _proyeccionServ: ProyeccionServices, private _presupuestoServ: PresupuestoServices, private _presupuestoMensualFrecuenciaServ: PresupuestoMensualFrecuenciaServices ) {}

  ngOnInit() {
    Chart.register(...registerables);
  
    // Primero, cargamos los datos
    this.loadEgresoActual();
    this.loadEgresoPasado();
    this.loadIngresoActual();
    this.loadIngresoPasado();
    this.loadIngresosMensuales();
    this.loadEgresosPorCategoria();
    this.loadPresupuestoSemanal();
    this.loadGastosMensualesFrecuencia();
    this.loadGastoMensualExtraordinario();
  }
  
  ngOnChanges() {
    // Una vez todos los datos estén cargados, podemos inicializar los gráficos
    if (this.isSemanalLoaded && this.isFrecuenciaLoaded && this.isExtraordinarioLoaded) {
      this.updateEgresosChart();
    }
  
    if (this.ingresoActual && this.ingresoPasado) {
      this.initializeChart(
        'barChartIngresos',
        'Ingresos ($)',
        [this.ingresoActual, this.ingresoPasado, this.ingresoActual - this.ingresoPasado],
        ['#42A5F5', '#66BB6A', '#FFA726']
      );
    }
  }

  ngOnDestroy() {
    // Destruir todos los gráficos al salir del componente
    Object.keys(this.charts).forEach(chartId => {
      this.charts[chartId].destroy();
    });
    this.charts = {};
  }

  private loadEgresoActual() {
    this._proyeccionServ.getEgresoMensual().subscribe(
      (data: any[]) => {
        this.egresoActual = data.length > 0 && data[0].EgresoActual
          ? parseFloat(data[0].EgresoActual)
          : 0;
        this.updateEgresosChart();
        this.calculatePercentage();  // Llamar al método para calcular el porcentaje
      },
      (error) => console.error('Error fetching egreso mensual:', error)
    );
  }
  
  private loadEgresoPasado() {
    this._proyeccionServ.getEgresoMensualPasado().subscribe(
      (data: any[]) => {
        this.egresoPasado = data.length > 0 && data[0].EgresoMesPasado
          ? parseFloat(data[0].EgresoMesPasado)
          : 0;
        console.log("este es el egreso del mes pasado: ", this.egresoPasado);
        this.calculatePercentage();  // Llamar al método para calcular el porcentaje
      },
      (error) => console.error('Error fetching egreso mensual:', error)
    );
  }
  
  private calculatePercentage() {
    console.log('Egreso actual:', this.egresoActual);
    console.log('Total de egresos del mes pasado:', this.totalEgresos);

    if (this.totalEgresos > 0) {
      this.percentageEgreso = ((this.egresoActual - this.totalEgresos) / this.totalEgresos) * 100;
      console.log('Porcentaje de egreso:', this.percentageEgreso);
    } else {
      this.percentageEgreso = 0; // Evitar dividir por cero
      console.log('No se puede calcular el porcentaje. Total de egresos es 0.');
    }
  }
  

  private loadIngresoActual() {
    this._proyeccionServ.getIngresoMensual().subscribe(
      (data: any[]) => {
        this.ingresoActual = data.length > 0 && data[0].IngresoActual
          ? parseFloat(data[0].IngresoActual)
          : 0;
        // Solo inicializar el gráfico si ambos ingresos están disponibles
        if (this.ingresoPasado) {
          this.initializeChart(
            'barChartIngresos',
            'Ingresos ($)',
            [this.ingresoActual, this.ingresoPasado, this.ingresoActual - this.ingresoPasado],
            ['#42A5F5', '#66BB6A', '#FFA726']
          );
        }
      },
      (error) => console.error('Error fetching ingreso mensual:', error)
    );
  }
  
  private loadIngresoPasado() {
    this._proyeccionServ.getIngresoMensualPasado().subscribe(
      (data: any[]) => {
        this.ingresoPasado = data.length > 0 && data[0].IngresoMesPasado
          ? parseFloat(data[0].IngresoMesPasado)
          : 0;
        console.log("este es el ingreso del mes pasado: ", this.ingresoPasado);
        // Solo inicializar el gráfico si ambos ingresos están disponibles
        if (this.ingresoActual) {
          this.initializeChart(
            'barChartIngresos',
            'Ingresos ($)',
            [this.ingresoActual, this.ingresoPasado, this.ingresoActual - this.ingresoPasado],
            ['#42A5F5', '#66BB6A', '#FFA726']
          );
        }
      },
      (error) => console.error('Error fetching egreso mensual:', error)
    );
  }


  loadIngresosMensuales() {
    this._proyeccionServ.getIngresosMensuales().subscribe(
      (data: any[]) => {
        console.log("Esta es la data de ingresos mensuales:", data);
  
        // Invertimos el orden de los registros
        const reversedData = data.reverse();
        console.log("Datos invertidos:", reversedData);
  
        // Llenamos la gráfica con los ingresos mensuales
        this.updateRevenueChart(reversedData);
      },
      (error) => console.error('Error fetching ingresos mensuales:', error)
    );
  }


  loadEgresosPorCategoria() {
    this._proyeccionServ.getEgresosPorCategoriaMensuales().subscribe(
      (data: any[]) => {
        console.log("Esta es la data de egresos por categoria mensuales:", data);

        // Procesar datos para el gráfico
        this.egresosPorCategoria.labels = data.map(item => item.NombreCategoria);
        this.egresosPorCategoria.data = data.map(item => parseFloat(item.TotalEgresos));

        // Ahora que los datos están listos, inicializamos el gráfico
        this.initializeBreakdownChart(this.egresosPorCategoria);
      },
      (error) => console.error('Error fetching egresos por categoría mensuales:', error)
    );
  }


  private loadPresupuestoSemanal() {
    this._presupuestoServ.getPresupuestoSemanal().subscribe(
      (data: any[]) => {
        this.egresosPlaneadosSemanalesTotales = data.reduce(
          (total, item) => total + (parseFloat(item.MontoDictaminado) || 0),
          0
        );
        this.isSemanalLoaded = true;
        this.updateEgresosChart();
      },
      (error) => console.error('Error fetching presupuesto semanal:', error)
    );
  }

  private loadGastosMensualesFrecuencia() {
    this._presupuestoMensualFrecuenciaServ.getPresupuestoMensualFrecuenciaAprobadosMesActual().subscribe(
      (data: any[]) => {
        this.egresosPlaneadosFrecuenciaTotales = data.reduce(
          (total, item) => total + (parseFloat(item.MontoDictaminado) || 0),
          0
        );
        this.isFrecuenciaLoaded = true;
        this.updateEgresosChart();
      },
      (error) => console.error('Error fetching gastos frecuencia:', error)
    );
  }

  private loadGastoMensualExtraordinario() {
    this._presupuestoServ.getGastoMensualExtraordinarioAprobado().subscribe(
      (data: any[]) => {
        this.egresosPlaneadosExtraordinariosTotales = data.reduce(
          (total, item) => total + (parseFloat(item.Monto) || 0),
          0
        );
        this.isExtraordinarioLoaded = true;
        this.updateEgresosChart();
      },
      (error) => console.error('Error fetching gastos extraordinarios:', error)
    );
  }


  private updateEgresosChart() {
    if (this.isSemanalLoaded && this.isFrecuenciaLoaded && this.isExtraordinarioLoaded) {
      this.totalEgresos =
        this.egresosPlaneadosSemanalesTotales +
        this.egresosPlaneadosFrecuenciaTotales +
        this.egresosPlaneadosExtraordinariosTotales;
  
      // Verificar si todos los datos para la utilidad neta están disponibles
      if (this.ingresoActual && this.egresoActual && this.totalEgresos !== undefined) {
        this.initializeNetProfitChart(); // Inicializar gráfico de utilidad neta
      }
  
      // Llamar a la inicialización del gráfico de egresos
      this.initializeChart(
        'barChartEgresos',
        'Egresos ($)',
        [this.egresoActual, this.totalEgresos, this.egresoActual - this.totalEgresos],
        ['#FF6384', '#36A2EB', '#FFCE56']
      );
    }
    this.calculatePercentage();
  }
  

  private initializeChart(
    chartId: string,
    label: string,
    dataValues: number[],
    backgroundColors: string[]
  ) {
    const canvas = document.getElementById(chartId) as HTMLCanvasElement;

    if (!canvas) {
      console.warn(`Canvas element with ID ${chartId} not found.`);
      return;
    }

    const data: ChartConfiguration['data'] = {
      labels: ['Actual', 'Esperado', 'Diferencia'],
      datasets: [
        {
          label: label,
          data: dataValues,
          backgroundColor: backgroundColors,
          borderRadius: 5,
        },
      ],
    };

    const options: ChartOptions = {
      responsive: true,
      plugins: {
        legend: {
          display: true,
          position: 'top',
        },
      },
      scales: {
        x: {
          beginAtZero: true,
        },
      },
    };

    if (this.charts[chartId]) {
      this.charts[chartId].destroy();
    }

    this.charts[chartId] = new Chart(canvas, {
      type: 'bar',
      data,
      options,
    });
  }

  private updateRevenueChart(data: any[]) {
    const ctx = document.getElementById('barChartRevenue') as HTMLCanvasElement;
  
    if (!ctx) {
      console.warn('Canvas for Revenue Chart not found.');
      return;
    }
  
    // Extraemos los nombres de los meses y los ingresos obtenidos del array de datos
    const labels = data.map(item => item.Mes); // Mes en el eje X
    const ingresos = data.map(item => parseFloat(item.IngresoTotal)); // IngresoTotal en el eje Y
  
    const dataForChart: ChartConfiguration['data'] = {
      labels: labels,
      datasets: [
        {
          label: 'Ingresos Obtenidos ($)',
          data: ingresos,
          backgroundColor: '#42A5F5',
          borderRadius: 5,
        },
      ],
    };
  
    const options: ChartOptions = {
      responsive: true,
      plugins: {
        legend: {
          display: true,
          position: 'top',
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Meses',
          },
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Ingresos ($)',
          },
        },
      },
    };
  
    // Destruir el gráfico existente si ya fue creado previamente
    if (this.charts['barChartRevenue']) {
      this.charts['barChartRevenue'].destroy();
    }
  
    this.charts['barChartRevenue'] = new Chart(ctx, {
      type: 'bar',
      data: dataForChart,
      options,
    });
  }
  

  private initializeNetProfitChart() {
    const ctx = document.getElementById('barChartNetProfit') as HTMLCanvasElement;
  
    if (!ctx) {
      console.warn('Canvas for Net Profit Chart not found.');
      return;
    }
  
    // Calcular la utilidad neta
    const utilidadNetaActual = this.ingresoActual - this.egresoActual;  // Utilidad neta actual
    const utilidadNetaEsperada = this.ingresoPasado - this.totalEgresos; // Utilidad neta esperada (con los egresos totales)
    const diferenciaUtilidadNeta = utilidadNetaActual - utilidadNetaEsperada; // Diferencia entre las dos
  
    console.log('Utilidad neta actual:', utilidadNetaActual);
    console.log('Utilidad neta esperada:', utilidadNetaEsperada);
    console.log('Diferencia de utilidad neta:', diferenciaUtilidadNeta);
  
    // Asegúrate de que no haya valores inesperados
    if (isNaN(utilidadNetaActual) || isNaN(utilidadNetaEsperada) || isNaN(diferenciaUtilidadNeta)) {
      console.error('Error en los cálculos de la utilidad neta.');
      return;
    }
  
    const data: ChartConfiguration['data'] = {
      labels: ['Actual', 'Forecast', 'Diferencia'],
      datasets: [
        {
          label: 'Utilidad Neta ($)',
          data: [utilidadNetaActual, utilidadNetaEsperada, diferenciaUtilidadNeta],
          backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726'],
          borderRadius: 5,
        },
      ],
    };
  
    const options: ChartOptions = {
      responsive: true,
      plugins: {
        legend: {
          display: true,
          position: 'top',
        },
      },
    };
  
    // Destruir el gráfico existente si ya fue creado previamente
    if (this.charts['barChartNetProfit']) {
      this.charts['barChartNetProfit'].destroy();
    }
  
    this.charts['barChartNetProfit'] = new Chart(ctx, {
      type: 'bar',
      data,
      options,
    });
  }
  

  private initializeBreakdownChart(egresosData: { labels: string[]; data: number[] }) {
    const canvas = document.getElementById('barChartBreakdown') as HTMLCanvasElement;

    if (!canvas) {
      console.warn('Canvas for Breakdown Chart not found.');
      return;
    }

    const data: ChartConfiguration['data'] = {
      labels: egresosData.labels, // Usamos las categorías desde los datos
      datasets: [
        {
          label: 'Egresos ($)',
          data: egresosData.data, // Usamos los montos desde los datos
          backgroundColor: '#42A5F5',
          borderRadius: 5,
        },
      ],
    };

    const options: ChartOptions = {
      responsive: true,
      indexAxis: 'y', // Gráfico horizontal
      plugins: {
        legend: {
          display: true,
          position: 'top',
        },
      },
      scales: {
        x: {
          beginAtZero: true,
        },
        y: {
          ticks: {
            autoSkip: false,
            maxRotation: 0,
            minRotation: 0,
          },
        },
      },
    };

    // Destruir el gráfico existente si ya fue creado previamente
    if (this.charts['barChartBreakdown']) {
      this.charts['barChartBreakdown'].destroy();
    }

    // Crear el gráfico
    this.charts['barChartBreakdown'] = new Chart(canvas, {
      type: 'bar',
      data,
      options,
    });
  }


}
