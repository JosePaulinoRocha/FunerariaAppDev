import { Component, OnInit } from '@angular/core';
import { IonicModule, ModalController, AlertController } from "@ionic/angular";
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { PresupuestoServices } from 'src/app/Servicios/Presupuesto.service';
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



@Component({
  selector: 'app-presupuesto-mensual',
  templateUrl: './presupuesto-mensual.component.html',
  styleUrls: ['./presupuesto-mensual.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule, HttpClientModule],
})
export class PresupuestoMensualComponent  implements OnInit {

  gastos: Gastos[] = [];
  paginatedPresupuesto: Gastos[] = [];
  currentPage: number = 1;
  itemsPerPageOptions: number[] = [10, 20, 50, 100, 200, 500, 1000, 2000];
  itemsPerPage: number = 10;
  totalPages: number = 0;
  isAdmin: boolean = false;

  filtroSeleccionado: 'extraordinario' | 'asignados' | 'noAsignados' = 'extraordinario'; 

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

  constructor(private modalController: ModalController, private _presupuestoServ: PresupuestoServices, private alertController: AlertController, private router: Router) {}

  ngOnInit() {
    this.loadGastoMensual();
    this.checkAdminStatus();
    this.modoFiltro === 'presupuestoMensual'
  }

  checkAdminStatus() {
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    this.isAdmin = user.isAdmin === 1;
  }


  loadGastoMensual() {
    this._presupuestoServ.getGastoMensual().subscribe((data: Gastos[]) => {
      // Transformar la fecha y asignar la data inicial
      this.gastos = data.map(gastos => ({
        ...gastos,
        FechaPreautorizada: new Date(gastos.FechaPreautorizada).toISOString().split('T')[0],
        Fecha: new Date(gastos.Fecha).toISOString().split('T')[0],
      }));
      
      // Filtrar según el modo de filtro seleccionado
      if (this.modoFiltro === 'presupuestoMensual') {
        // Filtrar según el filtro seleccionado para Dictaminar
        this.gastos = this.gastos.filter(gastos => {
          if (this.filtroSeleccionado === 'extraordinario') {
            return true; // Mostrar todos
          }
          return false;
        });
      } else if (this.modoFiltro === 'gastosSemestrales') {
        this.router.navigate(['/presupuesto']);
      }
  
      console.log("esta es la data de gastos mensuales: ", this.gastos);
      this.totalPages = Math.ceil(this.gastos.length / this.itemsPerPage);
      this.updatePaginated();
    }, (error) => {
      console.error('Error fetching presupuesto', error); 
    });
  }
  
  
  setFilter(filtro: 'extraordinario' | 'asignados' | 'noAsignados') {
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
  
      // Aplicar la búsqueda adicional
      this.gastos = filteredData
        .filter(gastos => this.matchesSearch(gastos))
        .map(gastos => ({
          ...gastos,
          FechaPreautorizada: new Date(gastos.FechaPreautorizada).toISOString().split('T')[0],
          Fecha: new Date(gastos.Fecha).toISOString().split('T')[0],
        }));
  
      console.log("Esta es la data de gastos después del filtro: ", this.gastos);
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
    return ['UltimaFecha'].includes(field);
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

    console.log("estos son los datos de edicion: ", gastos)

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

    console.log("estos son los datos de edicion en cuenta y estatus: ", gastos)

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

