import { Component, OnInit } from '@angular/core';
import { IonicModule, ModalController, AlertController } from "@ionic/angular";
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { PresupuestoServices } from 'src/app/Servicios/Presupuesto.service';
import { PresupuestoMensualFrecuenciaServices } from 'src/app/Servicios/Presupuesto-mensual-frecuencia.service';
import { PresupuestoModalComponent } from './modal/presupuesto-modal.component';
import { PresupuestoCuentaModalComponent } from './modal-cuenta/presupuesto-cuenta-modal.component';
import { Router } from '@angular/router'

interface Gastos {
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

interface Periodos {
  PeriodoID: number;
  FechaInicio: string;
  FechaFin: string;
  FechaCongelacion: string;
  [key: string]: any;
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
  CajaChica: { data: number[]; type: string; };
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


@Component({
  selector: 'app-presupuesto-mensual',
  templateUrl: './presupuesto-mensual.component.html',
  styleUrls: ['./presupuesto-mensual.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule, HttpClientModule],
})
export class PresupuestoMensualComponent  implements OnInit {

  presupuestoSemanal: PresupuestoSemanal[] = [];

  gastoMensualFrecuencia: GastoMensualPorFrecuencia[] = [];

  periodosCongelados: Periodos[] = [];

  showPeriodSelector = false;
  periodosDisponibles: Array<{label: string, start: Date, end: Date, selected: boolean, congelado: boolean}> = [];

  currentStep: number = 1;
  totalSteps: number = 4;

  selectedCardIndex: number = 0;

  showInitialCard = true;
  showStepCards = false;
  showTable = false;


  steps = [
    {
      title: '1. Congelar semanas del mes',
      totalLabel: 'Mes actual',
      total: '',
      assignedLabel: 'Semanas congeladas para este mes',
      assigned: 0,
    },
    {
      title: '2. Asignar presupuesto extraordinario mensual',
      totalLabel: 'datos aun en desarrollo',
      total: '',
      assignedLabel: 'datos aun en desarrollo',
      assigned: '',
    },
    {
      title: '3. Asignar gastos mensuales por frecuencia',
      totalLabel: 'datos aun en desarrollo',
      total: 0,
      assignedLabel: 'datos aun en desarrollo', 
      assigned: '',
    },
    {
      title: '4. Asignacion de cuentas bancarias',
      totalLabel: '',
      total: '',
      assignedLabel: 'datos aun en desarrollo',
      assigned: '',
    }
  ];

  getStepTitle(step: number): string {
    switch (step) {
      case 0:
        return '1. Congelar semanas del mes';
      case 1:
        return '2. Asignar presupuesto extraordinario mensual';
      case 2:
        return '3. Asignar gastos mensuales por frecuencia';
      case 3:
        return '4. Asignacion de cuentas bancarias';
      default:
        return '';
    }
  }


  showStepCard() {
    this.showInitialCard = false;
    this.showStepCards = true;
  }

  mostrarPeriodos() {

    const selectedValue = this.selectedCardIndex;

    switch (selectedValue) {
      case 0: // Paso 1
        this.showInitialCard = false;
        this.showStepCards = false;
        this.showPeriodSelector = true;
        break;
      case 1: // Paso 2
        this.showInitialCard = false;
        this.showStepCards = false;
        this.showPeriodSelector = false;
        this.showTable = true;
        break;
      case 2: // Paso 3
        this.router.navigate(['/presupuesto-mensual-frecuencia']);
        break;
      case 3: // Paso 4
        this.router.navigate(['/presupuesto-mensual-cuentas']);
        break;
    }



  }

  goToTable() {
    this.showStepCards = false;
    this.showPeriodSelector = false;
    this.showTable = true;
  }


  nextStep() {
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    
    if (user && user.userId) {
      const userId = user.userId;
  
      // Si estamos en el último paso
      if (this.currentStep === this.totalSteps - 3) {
        // Insertar el paso como 0 y redirigir a /home
        // this._presupuestoServ.insertPasoUsuario(userId, 0).subscribe(
        //   () => {
            this.router.navigate(['/presupuesto-mensual-frecuencia']); // Redirigir al usuario a la ruta /home
            this.currentStep = 1; // Restablecer el paso actual a 0
            this.showInitialCard = true;
            this.showStepCards = false;
            this.showTable = false;
            this.selectedCardIndex = 0;
        //   },
        //   (error) => {
        //     this.presentAlert('Error al actualizar el paso del usuario');
        //   }
        // );
      } else {
        // Continuar con la lógica actual para avanzar al siguiente paso
        // this._presupuestoServ.insertPasoUsuario(userId, this.currentStep + 1).subscribe(
        //   () => {
            this.currentStep++; // Avanza al siguiente paso
            this.selectedCardIndex = this.currentStep; // Actualiza el índice del card seleccionado
            this.onRadioChange(null); // Llama a onRadioChange para aplicar los cambios
        //   },
        //   (error) => {
        //     this.presentAlert('Error al insertar el paso del usuario');
        //   }
        // );
      }
    }
  }




  gastos: Gastos[] = [];
  periodos: Periodos[] = [];
  paginatedPresupuesto: Gastos[] = [];
  currentPage: number = 1;
  itemsPerPageOptions: number[] = [10, 20, 50, 100, 200, 500, 1000, 2000];
  itemsPerPage: number = 10;
  totalPages: number = 0;
  isAdmin: boolean = false;

  filtroSeleccionado: 'all' | 'aprobados' | 'denegados' | 'pendientes' | 'noAsignados' = 'all'; 

  filtroAsignarCuenta: 'semanal' | 'periodico' | 'extraordinario' | null = 'semanal';
  modoFiltro: 'gastosSemestrales' | 'presupuestoMensual' = 'presupuestoMensual';


  getStartDate(field: string): string {
    return this.dateSearchValues[field]?.startDate || '';
  }

  getEndDate(field: string): string {
    return this.dateSearchValues[field]?.endDate || '';
  }

  onStartDateChange(event: Event, field: string): void {
    const input = event.target as HTMLInputElement;
    const startDate = input.value;
    if (!this.dateSearchValues[field]) {
      this.dateSearchValues[field] = { startDate: '', endDate: '' };
    }
    this.dateSearchValues[field].startDate = startDate;
  }

  onEndDateChange(event: Event, field: string): void {
    const input = event.target as HTMLInputElement;
    const endDate = input.value;
    if (!this.dateSearchValues[field]) {
      this.dateSearchValues[field] = { startDate: '', endDate: '' };
    }
    this.dateSearchValues[field].endDate = endDate;
  }

  searchFields = [
    { value: 'GastoID', label: 'ID' },
    { value: 'FechaPreautorizada', label: 'Fecha Gasto' },
    { value: 'Concepto', label: 'Concepto Gasto' },
    { value: 'Monto', label: 'Monto' },
    { value: 'NombreProveedor', label: 'Proveedor' },
    { value: 'NombreSegmento', label: 'Segmento' },
    { value: 'Estatus', label: 'Estatus' },
    { value: 'NombreCuenta', label: 'Cuenta' },
    { value: 'TipoCuenta', label: 'Tipo Cuenta' },
    { value: 'RFC', label: 'RFC' },
    { value: 'Fecha', label: 'Fecha' },
    { value: 'NombreCategoria', label: 'Categoria' },
    { value: 'NombreSubcategoria', label: 'Subcategoria' },
    { value: 'NombreConcepto', label: 'Concepto' },
  ];
  selectedFields: string[] = [];
  searchValues: { [key: string]: string } = {};
  dateSearchValues: { [key: string]: { startDate: string, endDate: string } } = {};

  constructor(private modalController: ModalController, private _presupuestoServ: PresupuestoServices, private alertController: AlertController, private router: Router, private _presupuestoMensualFrecuenciaServ: PresupuestoMensualFrecuenciaServices) {}

  ngOnInit() {
    this.loadGastoMensual();
    this.loadGastosMensualesFrecuencia();
    this.loadPeriodosCongelados();
    this.checkAdminStatus();
    this.generarPeriodosMes();
    this.loadPresupuestoSemanal();
    this.setMesActual();

    this.modoFiltro === 'presupuestoMensual'
  }


  eliminarPeriodoCongelado(periodo: any) {
    // console.log("Intentando eliminar periodo congelado:", periodo);
  
    // Confirmación antes de eliminar
    const confirmacion = window.confirm("¿Estás seguro de que deseas eliminar este periodo congelado?");
    if (!confirmacion) {
      // console.log("Eliminación cancelada.");
      return;
    }
  
    // Buscar el periodo congelado con la misma fecha de inicio y fin
    const periodoAEliminar = this.periodosCongelados.find(p => {
      const fechaInicioCongelado = new Date(p.FechaInicio);
      const fechaFinCongelado = new Date(p.FechaFin);
      const fechaInicioDisponible = new Date(periodo.start);
      const fechaFinDisponible = new Date(periodo.end);
  
      // Normalizar horas para comparación
      fechaInicioCongelado.setUTCHours(0, 0, 0, 0);
      fechaFinCongelado.setUTCHours(0, 0, 0, 0);
      fechaInicioDisponible.setUTCHours(0, 0, 0, 0);
      fechaFinDisponible.setUTCHours(0, 0, 0, 0);
  
      return (
        fechaInicioCongelado.getTime() === fechaInicioDisponible.getTime() &&
        fechaFinCongelado.getTime() === fechaFinDisponible.getTime()
      );
    });
  
    if (!periodoAEliminar) {
      console.warn("No se encontró un periodo congelado con estas fechas.");
      return;
    }
  
    // Mostrar qué información se va a enviar al servicio
    // console.log("Datos que se enviarán al servicio para eliminar el periodo:", periodoAEliminar);
  
    // Llamar al servicio para eliminar
    this._presupuestoServ.deletePeriodoCongelado(periodoAEliminar).subscribe(
      response => {
        // console.log("Periodo eliminado exitosamente:", response);
        this.presentAlert("El periodo ha sido eliminado correctamente.", "Éxito");
        this.loadPeriodosCongelados(); // Recargar periodos congelados
      },
      error => {
        console.error("Error al eliminar el periodo:", error);
        this.presentAlert("Hubo un error al eliminar el periodo. Intente nuevamente.");
      }
    );
  }


  loadPresupuestoSemanal() {
    this._presupuestoServ.getPresupuestoSemanal().subscribe((data: PresupuestoSemanal[]) => {

      this.presupuestoSemanal = data;
      const cantidadRegistros = data.length;
      this.steps[3].total = `Gastos semanales de este mes: ${cantidadRegistros}`;
  
      // console.log("esta es la data de presupuesto semanal: ", data);
    }, (error) => {
      console.error('Error fetching presupuesto', error); 
    });
  }

  loadGastosMensualesFrecuencia() {
    this._presupuestoMensualFrecuenciaServ.getPresupuestoMensualFrecuencia().subscribe((data: GastoMensualPorFrecuencia[]) => {
      
      this.gastoMensualFrecuencia = data;
  
      // Contar registros con Guardado en 1 y 0
      const guardados = data.filter(gasto => gasto.Guardado === 1).length;
      const noGuardados = data.filter(gasto => gasto.Guardado === 0).length;
  
      // Asignar los valores de conteo al Step 3
      this.steps[2].totalLabel = 'Total de registros';
      this.steps[2].total = data.length;
      this.steps[2].assignedLabel = 'Registros guardados y no guardados';
      this.steps[2].assigned = `Guardados: ${guardados}, No Guardados: ${noGuardados}`;

      this.steps[3].assigned = `Gastos por frecuencia guardados: ${guardados}`;
  
      // console.log("Esta es la data de gastos mensuales por frecuencia: ", this.gastoMensualFrecuencia);
      // console.log("Registros con Guardado en 1: ", guardados);
      // console.log("Registros con Guardado en 0: ", noGuardados);
  
    }, (error: any) => {
      console.error('Error fetching incomes', error);
    });
  }
  

  // Establece el mes actual en el primer paso del card
  setMesActual() {
    const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
    const fechaActual = new Date();
    const mesActual = meses[fechaActual.getMonth()];
    this.steps[0].total = mesActual.charAt(0).toUpperCase() + mesActual.slice(1); // Capitaliza el mes actual
  }


  generarPeriodosMes() {
    // Obtener la fecha actual
    const fechaActual = new Date();
    this.periodosDisponibles = [];
    
    // Función auxiliar para ajustar al próximo lunes
    const obtenerLunes = (fecha: Date) => {
      const dia = fecha.getDay();
      const diferencia = dia === 0 ? -6 : 1 - dia;
      fecha.setDate(fecha.getDate() + diferencia);
      return fecha;
    };
  
    // Obtener el primer lunes del mes actual
    let inicioPeriodo = obtenerLunes(new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 1));
    const finProximoMes = new Date(fechaActual.getFullYear(), fechaActual.getMonth() + 2, 0);
  
    const diasSemana = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
    const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  
    while (inicioPeriodo <= finProximoMes) {
      const finPeriodo = new Date(inicioPeriodo);
      finPeriodo.setDate(inicioPeriodo.getDate() + 6);
  
      // Construir la etiqueta de texto para el periodo
      const label = `Periodo del ${diasSemana[inicioPeriodo.getDay()]} ${inicioPeriodo.getDate()} de ${meses[inicioPeriodo.getMonth()]} al ${diasSemana[finPeriodo.getDay()]} ${finPeriodo.getDate()} de ${meses[finPeriodo.getMonth()]} del año ${inicioPeriodo.getFullYear()}`;
  
      this.periodosDisponibles.push({
        label: label,
        start: new Date(inicioPeriodo),
        end: new Date(finPeriodo),
        selected: false,
        congelado: false
      });
  
      // Pasar al siguiente lunes
      inicioPeriodo.setDate(inicioPeriodo.getDate() + 7);
    }
  }


  guardarPeriodosCongelados() {
    const periodosSeleccionados = this.periodosDisponibles
      .filter(periodo => periodo.selected)
      .map(periodo => ({
        fecha_inicio: this.formatDate(periodo.start),
        fecha_fin: this.formatDate(periodo.end)
      }));
  
    // console.log('Periodos congelados:', periodosSeleccionados);
  
    this._presupuestoServ.savePeriodosCongelados(periodosSeleccionados).subscribe(
      response => {
        // console.log('Periodos congelados guardados exitosamente:', response);
        this.presentAlert('Los periodos seleccionados han sido congelados exitosamente.', 'Éxito');
        this.loadPeriodosCongelados();
        this.generarPeriodosMes();
      },
      error => {
        console.error('Error al guardar los periodos congelados:', error);
        this.presentAlert('Hubo un error al congelar los periodos. Intente nuevamente.');
      }
    );
  }
  
  // Función para formatear la fecha en 'YYYY-MM-DD'
  formatDate(date: Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0'); // Mes en dos dígitos
    const day = String(d.getDate()).padStart(2, '0'); // Día en dos dígitos
    return `${year}-${month}-${day}`;
  }


  async presentAlert(message: string, header: string = 'Error') {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: ['OK'],
    });

    await alert.present();
}



  onRadioChange(event: any) {
    const selectedValue = this.selectedCardIndex; // Usa el índice del card seleccionado
    
    // console.log("esta cambiando de card: ", selectedValue);
    
    // Cambiar el paso actual
    this.currentStep = selectedValue; // Cambia al paso correspondiente
  
    // Cambiar valores según el paso actual
    switch (selectedValue) {
      case 0: // Paso 1
        break;
      case 1: // Paso 2
        break;
      case 2: // Paso 3
        // this.router.navigate(['/presupuesto-mensual-frecuencia']);
        break;
      case 3: // Paso 4
        // this.router.navigate(['/home']);
        break;
    }
    
    // Cargar la tabla con el nuevo filtro
    // this.loadPresupuesto();
    
    // console.log('Modo Filtro:', this.modoFiltro);
    // console.log('Filtro Asignar Cuenta:', this.filtroAsignarCuenta);
    // console.log('Paso actual:', this.currentStep);
  }


  checkAdminStatus() {
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    this.isAdmin = user.isAdmin === 1;
  }


  loadGastoMensual() {
    this._presupuestoServ.getGastoMensual().subscribe((data: Gastos[]) => {
  
      // Ordenar y formatear los datos
      data.sort((a, b) => b.GastoID - a.GastoID);
      this.gastos = data.map(gastos => ({
        ...gastos,
        FechaPreautorizada: new Date(gastos.FechaPreautorizada).toISOString().split('T')[0],
        Fecha: new Date(gastos.Fecha).toISOString().split('T')[0],
      }));
  
      // Contar la cantidad de registros por estatus
      const countAprobados = this.gastos.filter(gasto => gasto.Estatus === 'Aprobado').length;
      const countDenegados = this.gastos.filter(gasto => gasto.Estatus === 'Denegado').length;
      const countPendientes = this.gastos.filter(gasto => gasto.Estatus === 'Pendiente').length;
      const countNoAsignados = this.gastos.filter(gasto => gasto.Estatus === null).length;
  
      // Actualizar la información del paso 2 con los conteos de estatus
      this.steps[1].totalLabel = `Total de registros: ${this.gastos.length}`;
      this.steps[1].assignedLabel = 
        `Aprobados: ${countAprobados}, Denegados: ${countDenegados}, Pendientes: ${countPendientes}, Sin Estatus: ${countNoAsignados}`;

      this.steps[3].assignedLabel = `Gastos extraordinarios aprobados: ${countAprobados}`;
      
      // Aplicar el filtro seleccionado
      this.gastos = this.gastos.filter(gastos => {
        switch (this.filtroSeleccionado) {
          case 'all':
            return true; // Mostrar todos
          case 'aprobados':
            return gastos.Estatus === 'Aprobado';
          case 'denegados':
            return gastos.Estatus === 'Denegado';
          case 'pendientes':
            return gastos.Estatus === 'Pendiente';
          case 'noAsignados':
            return gastos.Estatus === null;
          default:
            return true; // Mostrar todos por defecto
        }
      });
  
      // console.log("Esta es la data de gastos mensuales: ", this.gastos);
      this.totalPages = Math.ceil(this.gastos.length / this.itemsPerPage);
      this.updatePaginated();
    }, (error) => {
      console.error('Error fetching presupuesto', error);
    });
  }


  loadPeriodosCongelados() {
    this._presupuestoServ.getPeriodosCongelados().subscribe(
      (response: Periodos[]) => {
        this.periodosCongelados = response;
        this.marcarPeriodosCongelados();
        this.updateSemanasCongeladas();
        // console.log("esta es la data de periodos congelados: ", this.periodosCongelados);
      },
      error => {
        console.error("Error al cargar periodos congelados", error);
      }
    );
  }


  updateSemanasCongeladas() {
    const fechaActual = new Date();
    const mesActual = fechaActual.getMonth();
    const añoActual = fechaActual.getFullYear();

    const semanasCongeladas = this.periodosCongelados.filter((periodo) => {
      const fechaInicio = new Date(periodo.FechaInicio);
      const fechaFin = new Date(periodo.FechaFin);
      return (
        (fechaInicio.getMonth() === mesActual || fechaFin.getMonth() === mesActual) &&
        (fechaInicio.getFullYear() === añoActual || fechaFin.getFullYear() === añoActual)
      );
    }).length;

    this.steps[0].assigned = semanasCongeladas; // Actualiza el número de semanas congeladas
  }



  marcarPeriodosCongelados() {
    this.periodosDisponibles.forEach(periodo => {
      // Log para ver qué periodo se está evaluando
      // console.log("Evaluando periodo:", periodo);
  
      // Busca si hay un periodo congelado que coincida con el inicio y fin del periodo disponible
      const congelado = this.periodosCongelados.some(p => {
        // Convierte las fechas de congelado y disponible a solo fecha (sin hora)
        const fechaInicioCongelado = new Date(p.FechaInicio);
        const fechaFinCongelado = new Date(p.FechaFin);
        const fechaInicioDisponible = new Date(periodo.start);
        const fechaFinDisponible = new Date(periodo.end);
  
        // Normalizar las horas a medianoche para la comparación
        fechaInicioCongelado.setUTCHours(0, 0, 0, 0);
        fechaFinCongelado.setUTCHours(0, 0, 0, 0);
        fechaInicioDisponible.setUTCHours(0, 0, 0, 0);
        fechaFinDisponible.setUTCHours(0, 0, 0, 0);
  
        // Log para comparar las fechas en formato legible
        // console.log(`Comparando: Congelado [${fechaInicioCongelado.toISOString()} - ${fechaFinCongelado.toISOString()}] con Disponible [${fechaInicioDisponible.toISOString()} - ${fechaFinDisponible.toISOString()}]`);
  
        return fechaInicioCongelado.getTime() === fechaInicioDisponible.getTime() && fechaFinCongelado.getTime() === fechaFinDisponible.getTime();
      });
  
      // console.log("Este periodo está congelado:", congelado);
  
      // Si el periodo está congelado, desactiva la selección y aplica el color de fondo
      if (congelado) {
        periodo.congelado = true;
        periodo.selected = false;  // Asegúrate de que no se pueda seleccionar
      } else {
        periodo.congelado = false;
      }
  
      // Log para mostrar el estado final del periodo
      // console.log("Estado final del periodo:", periodo);
    });
  }
  
  
  
  setFilter(filtro: 'all' | 'aprobados' | 'denegados' | 'pendientes' | 'noAsignados') {
    this.filtroSeleccionado = filtro;
    this.currentPage = 1;
    this.loadGastoMensual();
  }

  setFilterCuenta(filtro: 'semanal' | 'periodico' | 'extraordinario') {
    this.filtroAsignarCuenta = filtro;
    this.currentPage = 1;
    this.loadGastoMensual();
  }
  

  updatePaginated() {
    this.totalPages = Math.ceil(this.gastos.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedPresupuesto = this.gastos.slice(startIndex, startIndex + this.itemsPerPage);
  }

  onItemsPerPageChange() {
    this.currentPage = 1;  // Reiniciar a la página 1 cuando cambie los registros por página
    this.updatePaginatedRegistros();  // Actualizar la paginación
  }

  updatePaginatedRegistros() {
    this.totalPages = Math.ceil(this.gastos.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedPresupuesto = this.gastos.slice(startIndex, startIndex + this.itemsPerPage);
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

  applySearch() {
    this.currentPage = 1;
    
    // Asegurar que los campos de fecha están configurados correctamente
    for (let field of this.selectedFields) {
      if (this.isDateField(field) && !this.dateSearchValues[field]) {
        this.dateSearchValues[field] = { startDate: '', endDate: '' };
      }
    }
  
    this._presupuestoServ.getGastoMensual().subscribe((data: Gastos[]) => {
      let filteredData = data;
      
      // Filtrar por filtroSeleccionado antes de aplicar la búsqueda
      filteredData = filteredData.filter(gastos => {
        switch (this.filtroSeleccionado) {
          case 'aprobados':
            return gastos.Estatus === 'Aprobado';
          case 'denegados':
            return gastos.Estatus === 'Denegado';
          case 'pendientes':
            return gastos.Estatus === 'Pendiente';
          case 'noAsignados':
            return gastos.Estatus === null;
          case 'all':
          default:
            return true;
        }
      });
  
      // Aplicar la búsqueda adicional después del filtro de estado
      this.gastos = filteredData
        .filter(gastos => this.matchesSearch(gastos))
        .map(gastos => ({
          ...gastos,
          FechaPreautorizada: new Date(gastos.FechaPreautorizada).toISOString().split('T')[0],
          Fecha: new Date(gastos.Fecha).toISOString().split('T')[0],
        }));
  
      // console.log("Esta es la data de gastos después del filtro: ", this.gastos);
      this.totalPages = Math.ceil(this.gastos.length / this.itemsPerPage);
      this.updatePaginated();
    }, (error) => {
      console.error('Error fetching presupuesto', error);
    });
  }
  

  resetSearch() {
    this.searchValues = {};
    this.dateSearchValues = {};
    this.selectedFields = [];
    this.loadGastoMensual();
  }

  matchesSearch(presupuesto: Gastos): boolean {
    for (let field of this.selectedFields) {
      if (this.isDateField(field)) {
        const dateRange = this.dateSearchValues[field];
        const presupuestoDate = new Date(presupuesto[field] as string);
        const startDate = new Date(dateRange.startDate);
        const endDate = new Date(dateRange.endDate);
        
        if (endDate) {
          endDate.setDate(endDate.getDate() + 1);
        }
  
        if (startDate && presupuestoDate < startDate) {
          return false;
        }
        if (endDate && presupuestoDate >= endDate) {
          return false;
        }
      } else {
        const searchValue = this.searchValues[field];
        if (searchValue && !((presupuesto[field] as string)?.toString().includes(searchValue))) {
          return false;
        }
      }
    }
    return true;
  }

  isDateField(field: string): boolean {
    return ['FechaPreautorizada', 'Fecha'].includes(field);
  }

  getFieldLabel(field: string): string {
    return this.searchFields.find(f => f.value === field)?.label || field;
  }


  getEmptyIncome(): Gastos {
    return {
      GastoID: 0,
      FechaPreautorizada: '',
      Concepto: '',
      Monto: 0,
      ProveedorID: 0,
      NombreProveedor: '',
      SegmentoID: 0,
      NombreSegmento: '',
      EstatusPresupuestoID: 0,
      Estatus: '',
      CuentaID: 0,
      TipoCuentaID: 0,
      TipoCuenta: '',
      NombreCuenta: '',
      RFC: '',
      Fecha: '',
      CategoriaID: 0,
      NombreCategoria: '',
      SubcategoriaID: 0,
      NombreSubcategoria: '',
      ConceptoID: 0,
      NombreConcepto: '',
    };
  }


  async asignarDatos(gastos?: Gastos) {

    // console.log("estos son los datos de edicion: ", gastos)

    const modal = await this.modalController.create({
      component: PresupuestoModalComponent,
      componentProps: {
        gastos: gastos ? { ...gastos } : this.getEmptyIncome(),
        isEditMode: !!gastos
      }
    });
  
    modal.onDidDismiss().then((result) => {
      if (result.data && result.role === 'success') {
        this.loadGastoMensual();
      }
    });
  
    return await modal.present();
  }


  async asignarEstatus(gastos?: Gastos) {

    // console.log("estos son los datos de edicion en cuenta y estatus: ", gastos)

    const modal = await this.modalController.create({
      component: PresupuestoCuentaModalComponent,
      componentProps: {
        gastos: gastos ? { ...gastos } : this.getEmptyIncome(),
        isEditMode: !!gastos,
        esPeriodico: this.filtroAsignarCuenta === 'periodico'
      }
    });
  
    modal.onDidDismiss().then((result) => {
      if (result.data && result.role === 'success') {
        this.loadGastoMensual();
      }
    });
  
    return await modal.present();
  }


  setModoFiltro(modo: 'gastosSemestrales' | 'presupuestoMensual') {
    this.modoFiltro = modo;
    this.filtroAsignarCuenta = 'semanal'; // Reiniciar el subfiltro
    this.currentPage = 1;
    this.loadGastoMensual();
  }
  
  setFiltroAsignarCuenta(filtro: 'semanal' | 'periodico' | 'extraordinario') {
    this.filtroAsignarCuenta = filtro;
    this.currentPage = 1;
    this.loadGastoMensual();
  }



}

