import { Component, OnInit } from '@angular/core';
import { IonicModule, ModalController } from "@ionic/angular";
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Chart, ChartConfiguration, ChartOptions, registerables } from 'chart.js';

@Component({
  selector: 'app-proyeccion',
  templateUrl: './proyeccion.component.html',
  styleUrls: ['./proyeccion.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule, HttpClientModule],
})
export class ProyeccionComponent implements OnInit {
  constructor() {}

  ngOnInit() {
    // Registrar componentes de Chart.js
    Chart.register(...registerables);

    // Configuración para Egresos
    const barChartDataEgresos: ChartConfiguration['data'] = {
      labels: ['Actual', 'Forecast', 'Absolute'],
      datasets: [
        {
          label: 'Egresos ($)',
          data: [120000, 150000, -30000], // Datos de ejemplo
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
        },
      ],
    };

    // Configuración para Ingresos
    const barChartDataIngresos: ChartConfiguration['data'] = {
      labels: ['Actual', 'Forecast', 'Absolute'],
      datasets: [
        {
          label: 'Ingresos ($)',
          data: [200000, 220000, -20000], // Datos de ejemplo
          backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726'],
        },
      ],
    };

    // Configuración para Utilidad Neta (Net Profit)
    const barChartDataNetProfit: ChartConfiguration['data'] = {
      labels: ['Actual', 'Forecast', 'Absolute'],
      datasets: [
        {
          label: 'Utilidad Neta ($)',
          data: [80000, 70000, 10000], // Actual, Forecast, Absolut
          backgroundColor: ['#FF7043', '#29B6F6', '#FFCA28'],
        },
      ],
    };

    // Configuración para Revenue
    const barChartDataRevenue: ChartConfiguration['data'] = {
      labels: [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 
        'Diciembre', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 
        'Junio', 'Julio', 'Agosto'
      ].slice(-20), // Últimos 20 meses
      datasets: [
        {
          label: 'Ingresos Obtenidos ($)',
          data: [18000, 22000, 20000, 24000, 26000, 21000, 23000, 25000, 27000, 28000, 29000, 31000, 22000, 24000, 26000, 27000, 28000, 29000, 30000, 31000], // Ejemplo
          backgroundColor: '#42A5F5',
          borderRadius: 5,
        },
        {
          label: 'Ingresos Esperados ($)',
          data: [20000, 25000, 22000, 26000, 28000, 24000, 26000, 28000, 30000, 31000, 32000, 34000, 25000, 27000, 29000, 30000, 31000, 33000, 34000, 35000], // Ejemplo
          backgroundColor: '#66BB6A',
          borderRadius: 5,
        },
      ],
    };


    // Configuración para Break Down of Costs
    const categorias = [
      'Gasto Operativo', 'Operativo Extraordinario', 'Costo de la Venta', 'Oficina',
      'Operativo Coordinacion', 'Nueva Categoria Prueba', 'Cuentas Establecidas',
      'Ingreso Funeraria', 'Inversiones Iniciales', 'Insumo'
    ];

    const barChartDataBreakdown: ChartConfiguration['data'] = {
      labels: categorias,
      datasets: [
        {
          label: 'Actual ($)',
          data: [5000, 2000, 8000, 3000, 4000, 1000, 2500, 6000, 7000, 1500], // Datos ficticios
          backgroundColor: '#42A5F5',
          borderRadius: 5,
        },
        {
          label: 'Forecast ($)',
          data: [5500, 2200, 8500, 3300, 4400, 1100, 2700, 6500, 7500, 1600], // Datos ficticios
          backgroundColor: '#66BB6A',
          borderRadius: 5,
        },
      ],
    };

    const barChartOptionsBreakdown: ChartOptions = {
      responsive: true,
      indexAxis: 'y', // Hace que las barras sean horizontales
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
            autoSkip: false, // No omitir etiquetas
            maxRotation: 0, // Evita rotación de texto
            minRotation: 0, // Evita rotación de texto
            callback: (value) => {
              // Envuelve texto largo si es necesario
              const label = categorias[Number(value)];
              return label.length > 20 ? label.match(/.{1,20}/g)?.join('\n') : label;
            },
          },
        },
      },
    };
    

    // Opciones comunes para todas las gráficas
    const barChartOptions: ChartOptions = {
      responsive: true,
      plugins: {
        legend: {
          display: true,
          position: 'top',
        },
      },
    };

    // Inicializar Egresos
    const ctxEgresos = document.getElementById('barChartEgresos') as HTMLCanvasElement;
    if (ctxEgresos) {
      new Chart(ctxEgresos, {
        type: 'bar',
        data: barChartDataEgresos,
        options: barChartOptions,
      });
    }

    // Inicializar Ingresos
    const ctxIngresos = document.getElementById('barChartIngresos') as HTMLCanvasElement;
    if (ctxIngresos) {
      new Chart(ctxIngresos, {
        type: 'bar',
        data: barChartDataIngresos,
        options: barChartOptions,
      });
    }

    // Inicializar Utilidad Neta (Net Profit)
    const ctxNetProfit = document.getElementById('barChartNetProfit') as HTMLCanvasElement;
    if (ctxNetProfit) {
      new Chart(ctxNetProfit, {
        type: 'bar',
        data: barChartDataNetProfit,
        options: barChartOptions,
      });
    }


    // Inicializar Revenue
    const ctxRevenue = document.getElementById('barChartRevenue') as HTMLCanvasElement;
    if (ctxRevenue) {
      new Chart(ctxRevenue, {
        type: 'bar',
        data: barChartDataRevenue,
        options: barChartOptions,
      });
    }


    // Inicializar Break Down of Costs
    const ctxBreakdown = document.getElementById('barChartBreakdown') as HTMLCanvasElement;
    if (ctxBreakdown) {
      new Chart(ctxBreakdown, {
        type: 'bar',
        data: barChartDataBreakdown,
        options: barChartOptionsBreakdown,
      });
    }


  }
}
