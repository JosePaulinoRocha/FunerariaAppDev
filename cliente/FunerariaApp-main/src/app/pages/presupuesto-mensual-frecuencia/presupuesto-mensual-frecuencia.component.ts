import { Component, OnInit } from '@angular/core';
import { IonicModule, ModalController } from "@ionic/angular";
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { PresupuestoMensualFrecuenciaServices } from 'src/app/Servicios/Presupuesto-mensual-frecuencia.service';
import { ReintegrosReconciliacionesModalComponent } from './modal/presupuesto-modal.component';
import { Router } from '@angular/router'


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


interface GastoPresupuestoFrecuenciaGuardados {
  GastoFrecuenciaID: number;
  SegmentoID: number;
  CategoriaID: number;
  SubcategoriaID: number;
  ConceptoID: number;
  PromedioMonto: number;
  FrecuenciaPromedio: number;
  FrecuenciaDictaminada: number;
  MontoDictaminado: number;
  CuentaID: number;
  CajaChica: { data: number[]; type: string; }; 
  UltimaFecha: string;  
  DiaLimite: number;
  DiasPendientes: number;
  PeriodoID: number;
}



@Component({
  selector: 'app-presupuesto-mensual-frecuencia',
  templateUrl: './presupuesto-mensual-frecuencia.component.html',
  styleUrls: ['./presupuesto-mensual-frecuencia.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule, HttpClientModule],
})
export class PresupuestoMensualFrecuenciaComponent  implements OnInit {

  isButtonDisabled: boolean = true;

  selectedCardIndex: number = 0;

  currentStep: number = 2;
  totalSteps: number = 4;

  gastoPresupuestoFrecuenciaGuardados: GastoPresupuestoFrecuenciaGuardados[] = [];
  gastoMensualFrecuencia: GastoMensualPorFrecuencia[] = [];
  paginatedGastos: GastoMensualPorFrecuencia[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 0;
  isAdmin: boolean = false;
  showReintegracionesTable: boolean = false;
  reintegracionesData: any[] = [];
  itemsPerPageOptions: number[] = [10, 20, 50, 100, 200, 500, 1000, 2000];

  filtroSeleccionado: 'all' | 'guardados' | 'noGuardados' = 'all'; 

  setFilter(filtro: 'all' | 'guardados' | 'noGuardados' ) {
    this.filtroSeleccionado = filtro;
    this.currentPage = 1;
    this.loadGastosMensualesFrecuencia();
  }

  checkGuardadoStatus() {
    this.isButtonDisabled = !this.gastoMensualFrecuencia.every(gasto => gasto.Guardado === 1);
  }

  nextStep() {
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    
    if (user && user.userId) {
      const userId = user.userId;
  
      // Si estamos en el último paso
      if (this.currentStep === this.totalSteps - 2) {
        // Insertar el paso como 0 y redirigir a /home
        // this._presupuestoServ.insertPasoUsuario(userId, 0).subscribe(
        //   () => {
            this.router.navigate(['/presupuesto-mensual-cuentas']); // Redirigir al usuario a la ruta /home
            this.currentStep = 0; // Restablecer el paso actual a 0
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
        //   },
        //   (error) => {
        //     this.presentAlert('Error al insertar el paso del usuario');
        //   }
        // );
      }
    }
  }

  onItemsPerPageChange() {
    this.currentPage = 1;  // Reiniciar a la página 1 cuando cambie los registros por página
    this.updatePaginatedGastos();  // Actualizar la paginación
  }

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

  // Search variables
  searchFields = [
    { value: 'NombreSegmento', label: 'Segmento' },
    { value: 'NombreCategoria', label: 'Categoria' },
    { value: 'NombreSubcategoria', label: 'Subcategoria' },
    { value: 'NombreConcepto', label: 'Concepto' },
    { value: 'PromedioMonto', label: 'Monto Promedio' },
    { value: 'FrecuenciaPromedio', label: 'Frecuencia Promedio' },
    { value: 'FrecuenciaDictaminada', label: 'Frecuencia Dictaminada' },
    { value: 'MontoDictaminado', label: 'Monto Dictaminado' },
    { value: 'UltimaFecha', label: 'Fecha Ultimo Gasto' },
    { value: 'DiaLimite', label: 'Dia Limite' },
    { value: 'DiasPendientes', label: 'Dias Pendientes' },
  ];

  getEmptyIncome(): GastoMensualPorFrecuencia {
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
      CuentaID: 0,
      NombreCuenta: '',
      CajaChica: { data: [], type: '' },
      DiaLimite: 0,
      PromedioMonto: 0,
      PromedioPiezas: 0,
      FrecuenciaPromedio: 0,
      UltimaFecha: '',  // Fecha en formato ISO
      FechaSiguienteGasto: '',  // Fecha en formato ISO
      DiasPendientes: 0,
      PeriodoID: 0,
      PeriodoCongelado: '',
      Guardado: 0,
    };
  }

  selectedFields: string[] = [];
  searchValues: { [key: string]: string } = {};
  dateSearchValues: { [key: string]: { startDate: string, endDate: string } } = {};

  constructor(private modalController: ModalController, private _presupuestoMensualFrecuenciaServ: PresupuestoMensualFrecuenciaServices, private router: Router) {}

  ngOnInit() {
    this.loadGastosMensualesFrecuencia();
    this.checkAdminStatus();
  }
  

  async asignarPeriodo(gastoMensualFrecuencia?: GastoMensualPorFrecuencia) {

    // console.log("estos son los datos de edicion: ", gastoMensualFrecuencia)

    const modal = await this.modalController.create({
      component: ReintegrosReconciliacionesModalComponent,
      componentProps: {
        gastoMensualFrecuencia: gastoMensualFrecuencia ? { ...gastoMensualFrecuencia } : this.getEmptyIncome(),
        isEditMode: !!gastoMensualFrecuencia
      }
    });
  
    modal.onDidDismiss().then((result) => {
      if (result.data && result.role === 'success') {
        this.loadGastosMensualesFrecuencia();
      }
    });
  
    return await modal.present();
  }

  checkAdminStatus() {
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    this.isAdmin = user.isAdmin === 1;
  }


  loadGastosMensualesFrecuencia() {
    this._presupuestoMensualFrecuenciaServ.getPresupuestoMensualFrecuencia().subscribe((data: GastoMensualPorFrecuencia[]) => {
  
      // Filtrar y ordenar la data según el filtro seleccionado
      let filteredData = data.filter(gasto => {
        switch (this.filtroSeleccionado) {
          case 'guardados':
            return gasto.Guardado === 1;
          case 'noGuardados':
            return gasto.Guardado === 0;
          case 'all':
          default:
            return true;
        }
      });
  
      // Ordenar los datos cuando el filtro es "all": primero los Guardado = 0, luego Guardado = 1
      if (this.filtroSeleccionado === 'all') {
        filteredData.sort((a, b) => a.Guardado - b.Guardado);
      }
  
      // Formatear datos
      this.gastoMensualFrecuencia = filteredData.map(gasto => ({
        ...gasto,
        UltimaFecha: gasto.UltimaFecha ? new Date(gasto.UltimaFecha).toISOString().split('T')[0] : null,
        PeriodoCongelado: gasto.PeriodoCongelado ? this.formatPeriodoCongelado(gasto.PeriodoCongelado) : null
      }));
  
      // console.log("Esta es la data de gastos mensuales por frecuencia filtrada y ordenada: ", this.gastoMensualFrecuencia);
      this.checkGuardadoStatus();
      this.totalPages = Math.ceil(this.gastoMensualFrecuencia.length / this.itemsPerPage);
      this.updatePaginatedGastos();
    }, (error) => {
      console.error('Error fetching incomes', error);
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
  
  

  updatePaginatedGastos() {
    this.totalPages = Math.ceil(this.gastoMensualFrecuencia.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedGastos = this.gastoMensualFrecuencia.slice(startIndex, startIndex + this.itemsPerPage);
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedGastos();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedGastos();
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

  this._presupuestoMensualFrecuenciaServ.getPresupuestoMensualFrecuencia().subscribe((data: GastoMensualPorFrecuencia[]) => {
    let filteredData = data
      .filter(gasto => {
        switch (this.filtroSeleccionado) {
          case 'guardados':
            return gasto.Guardado === 1;
          case 'noGuardados':
            return gasto.Guardado === 0;
          case 'all':
          default:
            return true;
        }
      })
      .filter(gastoMensualFrecuencia => this.matchesSearch(gastoMensualFrecuencia)); // Filtrar según criterios adicionales de búsqueda

      if (this.filtroSeleccionado === 'all') {
        filteredData.sort((a, b) => a.Guardado - b.Guardado);
      }

      // Formatear datos
      this.gastoMensualFrecuencia = filteredData.map(gastoMensualFrecuencia => ({
        ...gastoMensualFrecuencia,
        UltimaFecha: gastoMensualFrecuencia.UltimaFecha ? new Date(gastoMensualFrecuencia.UltimaFecha).toISOString().split('T')[0] : null,
        PeriodoCongelado: gastoMensualFrecuencia.PeriodoCongelado ? this.formatPeriodoCongelado(gastoMensualFrecuencia.PeriodoCongelado) : null
      }));

      // console.log("Esta es la data de gastos después del filtro: ", this.gastoMensualFrecuencia);
      this.totalPages = Math.ceil(this.gastoMensualFrecuencia.length / this.itemsPerPage);
      this.updatePaginatedGastos();
    }, (error) => {
      console.error('Error fetching presupuesto', error);
    });
  }


  resetSearch() {
    this.searchValues = {};
    this.dateSearchValues = {};
    this.selectedFields = [];
    this.loadGastosMensualesFrecuencia();
  }

  matchesSearch(gastoMensualFrecuencia: GastoMensualPorFrecuencia): boolean {
    for (let field of this.selectedFields) {
      if (this.isDateField(field)) {
        const dateRange = this.dateSearchValues[field];
        const gastosDate = new Date(gastoMensualFrecuencia[field] as string);
        const startDate = new Date(dateRange.startDate);
        const endDate = new Date(dateRange.endDate);
        
        // Incrementar la fecha final en 1 día para incluir el último día en el rango
        if (endDate) {
          endDate.setDate(endDate.getDate() + 1);
        }
  
        if (startDate && gastosDate < startDate) {
          return false;
        }
        if (endDate && gastosDate >= endDate) {
          return false;
        }
      } else {
        const searchValue = this.searchValues[field];
        if (searchValue && !((gastoMensualFrecuencia[field] as string)?.toString().includes(searchValue))) {
          return false;
        }
      }
    }
    return true;
  }

  isDateField(field: string): boolean {
    return ['UltimaFecha'].includes(field);
  }

  getFieldLabel(field: string): string {
    return this.searchFields.find(f => f.value === field)?.label || field;
  }

  
}

