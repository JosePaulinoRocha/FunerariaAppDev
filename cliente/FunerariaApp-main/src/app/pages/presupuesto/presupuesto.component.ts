import { Component, OnInit } from '@angular/core';
import { IonicModule, ModalController, AlertController } from "@ionic/angular";
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { PresupuestoServices } from 'src/app/Servicios/Presupuesto.service';
import { PresupuestoModalComponent } from './modal/presupuesto-modal.component';
import { PresupuestoCuentaModalComponent } from './modal-cuenta/presupuesto-cuenta-modal.component';


interface Presupuesto {
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
  NombreCuenta: string;
  DiaLimite: number;
  [key: string]: any; // Permite la extensión de la interfaz con otros campos si es necesario
}



@Component({
  selector: 'app-presupuesto',
  templateUrl: './presupuesto.component.html',
  styleUrls: ['./presupuesto.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule, HttpClientModule],
})
export class PresupuestoComponent  implements OnInit {

  presupuesto: Presupuesto[] = [];
  paginatedPresupuesto: Presupuesto[] = [];
  currentPage: number = 1;
  itemsPerPageOptions: number[] = [10, 20, 50, 100, 200, 500, 1000, 2000];
  itemsPerPage: number = 10;
  totalPages: number = 0;
  isAdmin: boolean = false;

  filtroSeleccionado: 'all' | 'asignados' | 'noAsignados' = 'noAsignados'; 

  filtroAsignarCuenta: 'semanal' | 'periodico' | 'extraordinario' | null = 'semanal';
  modoFiltro: 'dictaminar' | 'asignarCuenta' = 'dictaminar';


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
    { value: 'UltimaFecha', label: 'Ultima Fecha' },
    { value: 'NombreSegmento', label: 'Segmento' },
    { value: 'NombreCategoria', label: 'Categoria' },
    { value: 'NombreSubcategoria', label: 'Subcategoria' },
    { value: 'NombreConcepto', label: 'Concepto' },
    { value: 'PromedioMonto', label: 'Monto Promedio' },
    { value: 'PromedioPiezas', label: 'Promedio Piezas' },
    { value: 'FrecuenciaPromedio', label: 'Frecuencia Promedio' },
    { value: 'MontoDictaminado', label: 'Monto Dictaminado' },
    { value: 'FrecuenciaDictaminada', label: 'Frecuencia Dictaminada' },
  ];
  selectedFields: string[] = [];
  searchValues: { [key: string]: string } = {};
  dateSearchValues: { [key: string]: { startDate: string, endDate: string } } = {};

  constructor(private modalController: ModalController, private _presupuestoServ: PresupuestoServices, private alertController: AlertController) {}

  ngOnInit() {
    this.loadPresupuesto();
    this.checkAdminStatus();
  }

  checkAdminStatus() {
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    this.isAdmin = user.isAdmin === 1;
  }


  loadPresupuesto() {
    this._presupuestoServ.getPresupuesto().subscribe((data: Presupuesto[]) => {
      // Transformar la fecha y asignar la data inicial
      this.presupuesto = data.map(proveedor => ({
        ...proveedor,
        UltimaFecha: new Date(proveedor.UltimaFecha).toISOString().split('T')[0],
      }));
      
      // Filtrar según el modo de filtro seleccionado
      if (this.modoFiltro === 'dictaminar') {
        // Filtrar según el filtro seleccionado para Dictaminar
        this.presupuesto = this.presupuesto.filter(presupuesto => {
          if (this.filtroSeleccionado === 'all') {
            return true; // Mostrar todos
          } else if (this.filtroSeleccionado === 'asignados') {
            return presupuesto.MontoDictaminado !== null && presupuesto.FrecuenciaDictaminada !== null;
          } else if (this.filtroSeleccionado === 'noAsignados') {
            return presupuesto.MontoDictaminado === null || presupuesto.FrecuenciaDictaminada === null;
          }
          return false;
        });
      } else if (this.modoFiltro === 'asignarCuenta') {
        // Filtrar por registros que tienen Monto y Frecuencia Dictaminados
        this.presupuesto = this.presupuesto.filter(presupuesto => 
          presupuesto.MontoDictaminado !== null && presupuesto.FrecuenciaDictaminada !== null
        );
  
        // Aplicar subfiltros para Asignar Cuenta
        if (this.filtroAsignarCuenta === 'semanal') {
          this.presupuesto = this.presupuesto.filter(presupuesto => presupuesto.FrecuenciaDictaminada == 7);
        } else if (this.filtroAsignarCuenta === 'periodico') {
          this.presupuesto = this.presupuesto.filter(presupuesto => presupuesto.FrecuenciaDictaminada >= 14 && presupuesto.FrecuenciaDictaminada <= 180);
        } else if (this.filtroAsignarCuenta === 'extraordinario') {
          this.presupuesto = this.presupuesto.filter(presupuesto => presupuesto.FrecuenciaDictaminada == -1);
        }
      }
  
      console.log("esta es la data de presupuesto: ", this.presupuesto);
      this.totalPages = Math.ceil(this.presupuesto.length / this.itemsPerPage);
      this.updatePaginated();
    }, (error) => {
      console.error('Error fetching presupuesto', error); 
    });
  }
  
  
  setFilter(filtro: 'all' | 'asignados' | 'noAsignados') {
    this.filtroSeleccionado = filtro;
    this.currentPage = 1;
    this.loadPresupuesto();
  }

  setFilterCuenta(filtro: 'semanal' | 'periodico' | 'extraordinario') {
    this.filtroAsignarCuenta = filtro;
    this.currentPage = 1;
    this.loadPresupuesto();
  }
  

  updatePaginated() {
    this.totalPages = Math.ceil(this.presupuesto.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedPresupuesto = this.presupuesto.slice(startIndex, startIndex + this.itemsPerPage);
  }

  onItemsPerPageChange() {
    this.currentPage = 1;  // Reiniciar a la página 1 cuando cambie los registros por página
    this.updatePaginatedRegistros();  // Actualizar la paginación
  }

  updatePaginatedRegistros() {
    this.totalPages = Math.ceil(this.presupuesto.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedPresupuesto = this.presupuesto.slice(startIndex, startIndex + this.itemsPerPage);
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
  
    this._presupuestoServ.getPresupuesto().subscribe((data: Presupuesto[]) => {
      let filteredData = data;
  
      // Filtrar según el botón seleccionado
      if (this.filtroSeleccionado === 'asignados') {
        // Filtrar solo los registros con MontoDictaminado y FrecuenciaDictaminada no nulos
        filteredData = data.filter(presupuesto => 
          presupuesto.MontoDictaminado !== null && 
          presupuesto.FrecuenciaDictaminada !== null
        );
      } else if (this.filtroSeleccionado === 'noAsignados') {
        // Filtrar solo los registros con MontoDictaminado o FrecuenciaDictaminada nulos
        filteredData = data.filter(presupuesto => 
          presupuesto.MontoDictaminado === null || 
          presupuesto.FrecuenciaDictaminada === null
        );
      }
  
      // Filtro adicional para "Asignar Cuenta"
      if (this.modoFiltro === 'asignarCuenta') {
        // Filtrar por registros que tienen Monto y Frecuencia Dictaminados
        filteredData = filteredData.filter(presupuesto => 
          presupuesto.MontoDictaminado !== null && presupuesto.FrecuenciaDictaminada !== null
        );
  
        // Aplicar subfiltros para Asignar Cuenta
        if (this.filtroAsignarCuenta === 'semanal') {
          filteredData = filteredData.filter(presupuesto => presupuesto.FrecuenciaDictaminada == 7);
        } else if (this.filtroAsignarCuenta === 'periodico') {
          filteredData = filteredData.filter(presupuesto => 
            presupuesto.FrecuenciaDictaminada >= 14 && presupuesto.FrecuenciaDictaminada <= 180
          );
        } else if (this.filtroAsignarCuenta === 'extraordinario') {
          filteredData = filteredData.filter(presupuesto => presupuesto.FrecuenciaDictaminada == -1);
        }
      }
  
      // Aplicar la búsqueda adicional
      this.presupuesto = filteredData
        .filter(presupuesto => this.matchesSearch(presupuesto))
        .map(presupuesto => ({
          ...presupuesto,
          UltimaFecha: new Date(presupuesto.UltimaFecha).toISOString().split('T')[0],
        }));
  
      console.log("Esta es la data de presupuesto después del filtro: ", this.presupuesto);
      this.totalPages = Math.ceil(this.presupuesto.length / this.itemsPerPage);
      this.updatePaginated();
    }, (error) => {
      console.error('Error fetching presupuesto', error);
    });
  }
  
  

  resetSearch() {
    this.searchValues = {};
    this.dateSearchValues = {};
    this.selectedFields = [];
    this.loadPresupuesto();
  }

  matchesSearch(presupuesto: Presupuesto): boolean {
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
    return ['UltimaFecha'].includes(field);
  }

  getFieldLabel(field: string): string {
    return this.searchFields.find(f => f.value === field)?.label || field;
  }


  getEmptyIncome(): Presupuesto {
    return {
      SegmentoID: 0,
      NombreSegmento: '',
      CategoriaID: 0,
      NombreCategoria: '',
      SubcategoriaID: 0,
      NombreSubcategoria: '',
      ConceptoID: 0,
      NombreConcepto: '',
      PromedioMonto: 0,
      PromedioPiezas: 0,
      FrecuenciaPromedio: 0,
      UltimaFecha: '',
      FrecuenciaDictaminada: 0,
      MontoDictaminado: 0,
      NombreCuenta: '',
      DiaLimite: 0,
    };
  }


  async asignarMonto_Frecuencia(presupuesto?: Presupuesto) {

    console.log("estos son los datos de edicion: ", presupuesto)

    const modal = await this.modalController.create({
      component: PresupuestoModalComponent,
      componentProps: {
        presupuesto: presupuesto ? { ...presupuesto } : this.getEmptyIncome(),
        isEditMode: !!presupuesto
      }
    });
  
    modal.onDidDismiss().then((result) => {
      if (result.data && result.role === 'success') {
        this.loadPresupuesto();
      }
    });
  
    return await modal.present();
  }


  async asignarCuenta_DiaLimite(presupuesto?: Presupuesto) {

    console.log("estos son los datos de edicion en cuenta y dia limite: ", presupuesto)

    const modal = await this.modalController.create({
      component: PresupuestoCuentaModalComponent,
      componentProps: {
        presupuesto: presupuesto ? { ...presupuesto } : this.getEmptyIncome(),
        isEditMode: !!presupuesto,
        esPeriodico: this.filtroAsignarCuenta === 'periodico'
      }
    });
  
    modal.onDidDismiss().then((result) => {
      if (result.data && result.role === 'success') {
        this.loadPresupuesto();
      }
    });
  
    return await modal.present();
  }


  setModoFiltro(modo: 'dictaminar' | 'asignarCuenta') {
    this.modoFiltro = modo;
    this.filtroAsignarCuenta = 'semanal'; // Reiniciar el subfiltro
    this.currentPage = 1;
    this.loadPresupuesto();
  }
  
  setFiltroAsignarCuenta(filtro: 'semanal' | 'periodico' | 'extraordinario') {
    this.filtroAsignarCuenta = filtro;
    this.currentPage = 1;
    this.loadPresupuesto();
  }



}

