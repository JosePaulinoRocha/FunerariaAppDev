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
  activeEgresoChart: string = 'actualVsPlaneado';
  activeIngresoChart: string = 'actualVsPlaneado';
  activeUtilidadChart: string = 'actualVsPlaneado';
  activeEgresosChart: string = '';
  ingresosSemanales: any[] = [];
  egresosSemanales: any[] = [];
  egresoActual: number = 0;
  egresoPasado: number = 0;
  ingresoActual: number = 0;
  ingresoPasado: number = 0;
  percentageEgreso:number = 0;
  egresosPlaneadosSemanalesTotales: number = 0;
  egresosPlaneadosFrecuenciaTotales: number = 0;
  egresosPlaneadosExtraordinariosTotales: number = 0;
  filtros: any = {};

  selectedSegmentos: any[] = [];
  selectedCategorias: any[] = [];
  selectedSubcategorias: any[] = [];
  selectedConceptos: any[] = [];
  selectedSegmentosIngresos: any[] = [];
  selectedCategoriasIngresos: any[] = [];
  selectedSubcategoriasIngresos: any[] = [];
  selectedConceptosIngresos: any[] = [];
  ingresosPorFiltrosData: any[] = []; //
  EgresosPorFiltrosData: any[] = []; //

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
    this.loadFiltros()
    this.loadEgresoActual();
    this.loadEgresoPasado();
    this.loadIngresoActual();
    this.loadIngresoPasado();
    this.loadIngresosMensuales();
    this.loadEgresosMensuales();
    this.loadEgresosPorCategoria();
    this.loadPresupuestoSemanal();
    this.loadGastosMensualesFrecuencia();
    this.loadGastoMensualExtraordinario();
    this.loadUtilidadesNetasMensuales();
    this.loadEgresosMensualesSegmentos();
    this.loadIngresosMensualesSegmentos();
    this.loadEgresosMensualSemanales();
    this.loadIngresosMensualSemanales();
    this.loadIngresosPorCategoria();


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

  onFilterChange(): void {
    console.log("Esto funciona")
    this.ObtenerEgresosPorFiltros();
  }

  onFilterIngresosChange() : void {
    this.LoadIngresosporFiltros()
  }

  ngOnDestroy() {
    // Destruir todos los gráficos al salir del componente
    Object.keys(this.charts).forEach(chartId => {
      this.charts[chartId].destroy();
    });
    this.charts = {};
  }

  toggleEgresoChart(chart: string) {
    this.activeEgresoChart = chart;
  }

  toggleIngresoChart(chart: string) {
    this.activeIngresoChart = chart;
  }

  toggleUtilidadChart(chart: string) {
    this.activeUtilidadChart = chart;
  }

  loadEgresosMensualesSegmentos() {
    this._proyeccionServ.getEgresosMensualSegmentos().subscribe(
      (data: any[]) => {
        console.log("Datos de egresos mensual por segmentos:", data);
        this.createEgresosMensualesChart(data);
      },
      (error) => console.error('Error fetching egresos mensuales:', error)
    );
  }


  loadIngresosMensualesSegmentos() {
    this._proyeccionServ.getIngresosMensualSegmentos().subscribe(
      (data: any[]) => {
        console.log('Datos de ingresos mensual por segmentos:', data);
        this.createIngresosMensualesChart(data); // Pasamos los datos directamente
      },
      (error) => console.error('Error fetching ingresos mensuales:', error)
    );
  }


  loadUtilidadesNetasMensuales() {
    this._proyeccionServ.getUtilidadesNetasMensuales().subscribe(
      (data: any[]) => {
        console.log("Datos de utilidades netas mensuales:", data);

        // Extraemos los datos para la gráfica
        const labels = data.map(item => `${item.Mes} ${item.Anio}`);
        const values = data.map(item => parseFloat(item.UtilidadNeta));

        // Creamos la gráfica
        this.createUtilidadesNetasChart(labels, values);
      },
      (error) => console.error('Error fetching utilidades netas mensuales:', error)
    );
  }

  private loadEgresoActual() {
    this._proyeccionServ.getEgresoMensual().subscribe(
      (data: any[]) => {
        this.egresoActual = data.length > 0 && data[0].EgresoActual
          ? parseFloat(data[0].EgresoActual)
          : 0; // Establece en 0 si no hay resultados
        this.updateEgresosChart();
        this.calculatePercentage();
      },
      (error) => {
        console.error('Error fetching egreso mensual:', error);
        this.egresoActual = 0; // Valor por defecto en caso de error
        this.updateEgresosChart();
      }
    );
  }

  private loadEgresoPasado() {
    this._proyeccionServ.getEgresoMensualPasado().subscribe(
      (data: any[]) => {
        this.egresoPasado = data.length > 0 && data[0].EgresoMesPasado
          ? parseFloat(data[0].EgresoMesPasado)
          : 0; // Establece en 0 si no hay resultados
        this.calculatePercentage();
      },
      (error) => {
        console.error('Error fetching egreso mensual pasado:', error);
        this.egresoPasado = 0; // Valor por defecto en caso de error
      }
    );
  }

  loadFiltros() {
    this._proyeccionServ.getFiltros().subscribe(
      (data: any) => {
        console.log("Filtros recibidos desde el SP:", data[0].resultados.conceptos);
        this.filtros.conceptos = data[0].resultados.conceptos;
        this.filtros.categorias = data[0].resultados.categorias;
        this.filtros.subcategorias = data[0].resultados.subcategorias;
        this.filtros.segmentos = data[0].resultados.segmentos;
              this.actualizarDatos(); // Actualizamos los datos o gráficos si es necesario
      },
      (error) => {
        console.error("Error al obtener los filtros:", error);
      }
    );
  }

  LoadIngresosporFiltros() {
    console.log(this.selectedSegmentosIngresos, this.selectedCategoriasIngresos, this.selectedSubcategoriasIngresos, this.selectedConceptosIngresos)
    this._proyeccionServ.ObtenerIngresosPorFiltros(this.selectedSegmentosIngresos, this.selectedCategoriasIngresos, this.selectedSubcategoriasIngresos, this.selectedConceptosIngresos).subscribe(
      (data: any) => {
        console.log("Egresos recibidos desde el SP:", data);
        this.ingresosPorFiltrosData = data;

        // Si hay datos, actualiza activeIngresoChart
        if (this.ingresosPorFiltrosData && this.ingresosPorFiltrosData.length > 0) {
          this.activeIngresoChart = 'barChartIngresosPorFiltros'; // Muestra la gráfica específica
          this.graficarIngresosPorFiltros(this.ingresosPorFiltrosData); // Llama la función para graficar los datos
        } else {
          this.activeIngresoChart = ''; // No mostrar gráfica si no hay datos
        }
      },
      (error) => {
        console.error("Error al obtener los Egresos:", error);
        this.activeIngresoChart = '';
      }
    );
  }

  graficarIngresosPorFiltros(ingresos: any[]) {
    console.log(ingresos[0])
    // Implementa la lógica de graficación aquí usando la librería Chart.js o la que uses.
    const ctx = document.getElementById('barChartIngresosPorFiltros') as HTMLCanvasElement;
    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ingresos[0].map((item:any) => item.Descripcion), // Etiquetas basadas en 'Descripcion'
        datasets: [{
          label: 'Monto',
          data: ingresos[0].map((item:any) => parseFloat(item.Monto)), // Monto de los ingresos
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  ObtenerEgresosPorFiltros() {
    console.log(this.selectedSegmentos, this.selectedCategorias, this.selectedSubcategorias, this.selectedConceptos)
    this._proyeccionServ.ObtenerEgresosPorFiltros(this.selectedSegmentos, this.selectedCategorias, this.selectedSubcategorias, this.selectedConceptos).subscribe(
      (data: any) => {
        this.EgresosPorFiltrosData = data;

        // Si hay datos, actualiza activeIngresoChart
        if (this.EgresosPorFiltrosData && this.EgresosPorFiltrosData.length > 0) {
          this.activeEgresoChart = 'barChartEgresosPorFiltros'; // Muestra la gráfica específica
          this.graficarEgresosPorFiltros(this.EgresosPorFiltrosData); // Llama la función para graficar los datos
        } else {
          this.activeEgresosChart = ''; // No mostrar gráfica si no hay datos
        }
      },
      (error) => {
        console.error("Error al obtener los Egresos:", error);
        this.activeEgresosChart = '';
      }
    );
  }


  graficarEgresosPorFiltros(egresos: any[]) {
    console.log(egresos[0])
    // Implementa la lógica de graficación aquí usando la librería Chart.js o la que uses.
    const ctx = document.getElementById('barChartEgresosPorFiltros') as HTMLCanvasElement;
    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: egresos[0].map((item:any) => item.Descripcion), // Etiquetas basadas en 'Descripcion'
        datasets: [{
          label: 'Monto',
          data: egresos[0].map((item:any) => parseFloat(item.Monto)), // Monto de los ingresos
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  actualizarDatos() {
    console.log('Filtros:', this.filtros[0].resultados);
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
          : 0; // Valor predeterminado
        this.updateIngresosChart(); // Aseguramos que el gráfico se actualice
      },
      (error) => {
        console.error('Error fetching ingreso mensual:', error);
        this.ingresoActual = 0; // Valor predeterminado en caso de error
        this.updateIngresosChart(); // Aseguramos que el gráfico se actualice
      }
    );
  }

  private loadIngresoPasado() {
    this._proyeccionServ.getIngresoMensualPasado().subscribe(
      (data: any[]) => {
        this.ingresoPasado = data.length > 0 && data[0].IngresoMesPasado
          ? parseFloat(data[0].IngresoMesPasado)
          : 0; // Valor predeterminado
        this.updateIngresosChart(); // Aseguramos que el gráfico se actualice
      },
      (error) => {
        console.error('Error fetching ingreso mensual pasado:', error);
        this.ingresoPasado = 0; // Valor predeterminado en caso de error
        this.updateIngresosChart(); // Aseguramos que el gráfico se actualice
      }
    );
  }


  private updateIngresosChart() {
    // Aseguramos que la gráfica se renderice solo cuando ambos ingresos estén definidos
    if (this.ingresoActual !== undefined && this.ingresoPasado !== undefined) {
      this.initializeChart(
        'barChartIngresos',
        'Ingresos ($)',
        [this.ingresoActual, this.ingresoPasado, this.ingresoActual - this.ingresoPasado],
        ['#42A5F5', '#66BB6A', '#FFA726']
      );
    }
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

  loadEgresosMensuales() {
    this._proyeccionServ.getEgresosMensuales().subscribe(
      (data: any[]) => {
        const reversedData = data.reverse();
        console.log("Datos invertidos de egresos:", reversedData);

        // Actualiza la gráfica con los datos invertidos
        this.updateEgresosMensualesChart(reversedData);
      },
      (error) => console.error('Error fetching egresos mensuales:', error)
    );
  }

  loadEgresosMensualSemanales() {
    this._proyeccionServ.EgresosMensualSemanales().subscribe(
      (data: any[]) => {
        console.log("Datos de egresos semanales:", data);
        this.createEgresosSemanalesChart(data); // Llamar a la función para crear la gráfica
        this.egresosSemanales = data; // Almacenar los datos de egresos
        this.createUtilidadNetaChart(); // Crear la gráfica de utilidad neta después de obtener los datos
      },
      (error) => console.error('Error fetching egresos mensuales:', error)
    );
  }

  loadIngresosMensualSemanales() {
    this._proyeccionServ.IngresosMensualSemanales().subscribe(
      (data: any[]) => {
        console.log("Datos de ingresos semanales:", data);
        this.createIngresosSemanalesChart(data); // Llamar a la función para crear la gráfica
        this.ingresosSemanales = data; // Almacenar los datos de ingresos
        this.createUtilidadNetaChart(); // Crear la gráfica de utilidad neta después de obtener los datos
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

  loadIngresosPorCategoria() {
    this._proyeccionServ.getIngresosPorCategoriaMensuales().subscribe(
      (data: any[]) => {
        console.log("Esta es la data de ingresos por categoria mensuales:", data);

        // Procesar datos para el gráfico
        const ingresosData = {
          labels: data.map(item => item.NombreCategoria), // Categorías
          data: data.map(item => parseFloat(item.TotalIngresos)) // Montos de ingresos
        };

        // Ahora que los datos están listos, inicializamos el gráfico
        this.initializeIngresosChart(ingresosData);
      },
      (error) => console.error('Error fetching ingresos por categoría mensuales:', error)
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
        (this.egresosPlaneadosSemanalesTotales || 0) +
        (this.egresosPlaneadosFrecuenciaTotales || 0) +
        (this.egresosPlaneadosExtraordinariosTotales || 0);

      // Asegúrate de que la gráfica de utilidad neta siempre se inicialice
      this.initializeNetProfitChart();

      this.initializeChart(
        'barChartEgresos',
        'Egresos ($)',
        [this.egresoActual || 0, this.totalEgresos, (this.egresoActual || 0) - (this.totalEgresos || 0)],
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


  private updateEgresosMensualesChart(data: any[]) {
    const labels = data.map(item => `${item.Mes} ${item.Anio}`);
    const egresos = data.map(item => parseFloat(item.IngresoTotal)); // Asegúrate de que el campo sea el correcto.

    // Destruir el gráfico existente si ya está definido
    if (this.charts['barChartEgresosMensuales']) {
      this.charts['barChartEgresosMensuales'].destroy();
    }

    this.charts['barChartEgresosMensuales'] = new Chart('barChartEgresosMensuales', {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Egresos ($)',
            data: egresos,
            backgroundColor: '#EF5350', // Rojo claro
            borderColor: '#D32F2F', // Rojo oscuro
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
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
            beginAtZero: true,
            ticks: {
              callback: function (value) {
                return `$${value.toLocaleString()}`;
              },
            },
          },
        },
      },
    });
  }


  private initializeNetProfitChart() {
    const ctx = document.getElementById('barChartNetProfit') as HTMLCanvasElement;

    if (!ctx) {
      console.warn('Canvas for Net Profit Chart not found.');
      return;
    }

    // Calcular la utilidad neta con valores predeterminados
    const utilidadNetaActual = (this.ingresoActual || 0) - (this.egresoActual || 0);
    const utilidadNetaEsperada = (this.ingresoPasado || 0) - (this.totalEgresos || 0);
    const diferenciaUtilidadNeta = utilidadNetaActual - utilidadNetaEsperada;

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


  private createUtilidadesNetasChart(labels: string[], values: number[]) {
    const chartId = 'utilidadesNetasChart';
    const canvas = document.getElementById(chartId) as HTMLCanvasElement;

    if (this.charts[chartId]) {
      this.charts[chartId].destroy(); // Elimina el gráfico anterior si existe
    }

    this.charts[chartId] = new Chart(canvas, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Utilidades Netas ($)',
            data: values,
            borderColor: '#4CAF50',
            backgroundColor: 'rgba(76, 175, 80, 0.2)',
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true,
            position: 'top',
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Utilidad Neta ($)',
            },
          },
          x: {
            title: {
              display: true,
              text: 'Meses',
            },
          },
        },
      },
    });
  }


  private createEgresosMensualesChart(data: any[]) {
    const chartId = 'egresosMensualesChart';
    const canvas = document.getElementById(chartId) as HTMLCanvasElement;

    // Procesar los datos
    const labels = data.map((item) => item.NombreSegmento);
    const values = data.map((item) => parseFloat(item.EgresoActual));

    // Verificar y destruir el gráfico existente
    if (this.charts[chartId]) {
      this.charts[chartId].destroy();
    }

    // Crear el gráfico
    this.charts[chartId] = new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Egresos Actuales ($)',
            data: values,
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true,
            position: 'top',
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Egresos ($)',
            },
          },
          x: {
            title: {
              display: true,
              text: 'Segmentos',
            },
          },
        },
      },
    });
  }


  private createIngresosMensualesChart(data: any[]) {
    const chartId = 'ingresosMensualesChart';
    const canvas = document.getElementById(chartId) as HTMLCanvasElement;

    // Procesar los datos
    const labels = data.map((item) => item.NombreSegmento);
    const values = data.map((item) => parseFloat(item.IngresoActual));

    // Verificar y destruir el gráfico existente
    if (this.charts[chartId]) {
      this.charts[chartId].destroy();
    }

    // Crear el gráfico
    this.charts[chartId] = new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Ingresos Actuales ($)',
            data: values,
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true,
            position: 'top',
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Ingresos ($)',
            },
          },
          x: {
            title: {
              display: true,
              text: 'Segmentos',
            },
          },
        },
      },
    });
  }


  private createEgresosSemanalesChart(data: any[]) {
    const chartId = 'egresosSemanalesChart';
    const canvas = document.getElementById(chartId) as HTMLCanvasElement;

    // Procesar los datos: extraemos los rangos de fechas y los montos
    const labels = data.map(item => `${item.inicio_semana} - ${item.fin_semana}`);
    const values = data.map(item => parseFloat(item.total_monto));

    // Verificar y destruir el gráfico existente
    if (this.charts[chartId]) {
      this.charts[chartId].destroy();
    }

    // Crear el gráfico
    this.charts[chartId] = new Chart(canvas, {
      type: 'bar', // Usamos barras, pero puedes elegir otro tipo si es necesario
      data: {
        labels,
        datasets: [
          {
            label: 'Egresos Semanales ($)',
            data: values,
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true,
            position: 'top',
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Monto de Egresos ($)',
            },
          },
          x: {
            title: {
              display: true,
              text: 'Semanas',
            },
          },
        },
      },
    });
  }


  private createIngresosSemanalesChart(data: any[]) {
    const chartId = 'ingresosSemanalesChart';
    const canvas = document.getElementById(chartId) as HTMLCanvasElement;

    // Procesar los datos: extraemos los rangos de fechas y los montos
    const labels = data.map(item => `${item.inicio_semana} - ${item.fin_semana}`);
    const values = data.map(item => parseFloat(item.total_monto));

    // Verificar y destruir el gráfico existente
    if (this.charts[chartId]) {
      this.charts[chartId].destroy();
    }

    // Crear el gráfico
    this.charts[chartId] = new Chart(canvas, {
      type: 'bar', // Usamos barras, pero puedes elegir otro tipo si es necesario
      data: {
        labels,
        datasets: [
          {
            label: 'Ingresos Semanales ($)',
            data: values,
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true,
            position: 'top',
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Monto de Ingresos ($)',
            },
          },
          x: {
            title: {
              display: true,
              text: 'Semanas',
            },
          },
        },
      },
    });
  }


  // Función para calcular la utilidad neta y crear la gráfica
  createUtilidadNetaChart() {
    if (this.ingresosSemanales.length && this.egresosSemanales.length) {
      const chartId = 'utilidadNetaSemanalesChart';
      const canvas = document.getElementById(chartId) as HTMLCanvasElement;

      // Asegurarse de que las semanas coincidan en ambas consultas
      const labels = this.ingresosSemanales.map(item => `${item.inicio_semana} - ${item.fin_semana}`);
      const ingresosValues = this.ingresosSemanales.map(item => parseFloat(item.total_monto));
      const egresosValues = this.egresosSemanales.map(item => parseFloat(item.total_monto));

      // Calcular la utilidad neta
      const utilidadNetaValues = ingresosValues.map((ingreso, index) => ingreso - egresosValues[index]);

      // Verificar y destruir el gráfico existente
      if (this.charts[chartId]) {
        this.charts[chartId].destroy();
      }

      // Crear la gráfica
      this.charts[chartId] = new Chart(canvas, {
        type: 'line', // Usamos una gráfica de líneas
        data: {
          labels,
          datasets: [
            {
              label: 'Utilidad Neta Semanal ($)',
              data: utilidadNetaValues,
              borderColor: 'rgba(255, 99, 132, 1)', // Color de la línea
              backgroundColor: 'rgba(255, 99, 132, 0.5)', // Color de fondo
              fill: true, // Rellenar el área debajo de la línea
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: true,
              position: 'top',
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Utilidad Neta ($)',
              },
            },
            x: {
              title: {
                display: true,
                text: 'Semanas',
              },
            },
          },
        },
      });
    }
  }


  // Función para inicializar la gráfica de ingresos por categoría
  private initializeIngresosChart(ingresosData: { labels: string[]; data: number[] }) {
    const canvas = document.getElementById('barChartIngresosSemanales') as HTMLCanvasElement;

    if (!canvas) {
      console.warn('Canvas for Ingresos Chart not found.');
      return;
    }

    const data: ChartConfiguration['data'] = {
      labels: ingresosData.labels, // Usamos las categorías desde los datos
      datasets: [
        {
          label: 'Ingresos ($)',
          data: ingresosData.data, // Usamos los montos desde los datos
          backgroundColor: '#66BB6A', // Color de los ingresos (puedes cambiarlo)
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
    if (this.charts['barChartIngresosSemanales']) {
      this.charts['barChartIngresosSemanales'].destroy();
    }

    // Crear el gráfico
    this.charts['barChartIngresosSemanales'] = new Chart(canvas, {
      type: 'bar',
      data,
      options,
    });
  }

}
