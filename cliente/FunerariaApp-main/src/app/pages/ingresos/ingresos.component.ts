import { Component, OnInit } from '@angular/core';
import { IonicModule, ModalController } from "@ionic/angular";
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IncomeModalComponent } from './modal/income-modal.component';
import { HttpClientModule } from '@angular/common/http';
import { IngresosServices } from 'src/app/Servicios/Ingresos.service';
import { LoadingController } from '@ionic/angular';


interface Income {
  IngresoID: number;
  Fecha: string;
  ConceptoID: number;
  NombreConcepto: string;
  Descripcion: string;
  Proveedor: string;
  ProveedorEstatus: { data: number[]; type: string; };
  Piezas: number;
  CajaChica: boolean;
  Monto: number;
  Saldo: number;
  Comprobante: string;
  SegmentoID: number;
  NombreSegmento: string;
  CategoriaID: number;
  NombreCategoria: string;
  SubcategoriaID: number;
  NombreSubcategoria: string;
  EstatusComprobacionID: number;
  NombreEstatus: string;
  FechaAutorizacion: string;
  UsuarioAutorizaID: number;
  NombreUsuarioAutoriza: string;
  UsuarioRecibeID: number;
  NombreUsuarioRecibe: string;
  FechaConciliacion: string;
  ObservacionesDifConciliacion: string;
  NombreCajaChica?: string;
  RFC?: string;
  NombreDuenoCuenta?: string;
  SaldoReconciliacion: number;
  TipoCuenta: string;
  NombreCuenta: string;
  Reconciliado: number;
  TipoIngreso: { data: number[]; type: string; };
  ReconciliacionID: number,
  CuentaID: number;
  [key: string]: any;
}

@Component({
  selector: 'app-ingresos',
  templateUrl: './ingresos.component.html',
  styleUrls: ['./ingresos.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule, IncomeModalComponent, HttpClientModule],
})
export class IngresosComponent implements OnInit {

  isLoading: boolean = false;

  incomes: Income[] = [];
  paginatedIncomes: Income[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;
  itemsPerPageOptions: number[] = [10, 20, 50, 100, 500, 1000];

  updateTotalPages() {
    this.totalPages = Math.ceil(this.incomes.length / this.itemsPerPage);
  }

  onItemsPerPageChange() {
    this.currentPage = 1; // Resetea la paginación al cambiar los registros por página
    this.updateTotalPages();
    this.updatePaginated();
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

  searchFields = [
    { value: 'IngresoID', label: 'ID' },
    { value: 'Fecha', label: 'Fecha' },
    { value: 'NombreSegmento', label: 'Segmento' },
    { value: 'NombreCategoria', label: 'Categoria' },
    { value: 'NombreSubcategoria', label: 'Subcategoria' },
    { value: 'NombreConcepto', label: 'Concepto' },
    { value: 'Descripcion', label: 'Descripcion' },
    { value: 'Proveedor', label: 'Proveedor' },
    { value: 'Piezas', label: 'Piezas' },
    { value: 'TipoCuenta', label: 'Tipo Cuenta' },
    { value: 'RFC', label: 'RFC' },
    { value: 'Monto', label: 'Monto' },
    { value: 'NombreUsuarioRecibe', label: 'Usuario Recibe' },

  ];
  selectedFields: string[] = [];
  searchValues: { [key: string]: string } = {};
  dateSearchValues: { [key: string]: { startDate: string, endDate: string } } = {};

  constructor(private modalController: ModalController, private _ingresoServ: IngresosServices, private loadingController: LoadingController) { }


  

  ngOnInit() {
    this.loadIngresos();
  }

  loadIngresos() {

    this.isLoading = true;

    this._ingresoServ.getIngresosNoReconciliados().subscribe((data: Income[]) => {
      
      // Filtrar los registros donde Reconciliado es igual a 0
      // const filteredData = data.filter(income => income.Reconciliado === 0);
      
      data.sort((a, b) => b.IngresoID - a.IngresoID);
      
      this.incomes = data.map(income => ({
        ...income,
        Fecha: new Date(income.Fecha).toISOString().split('T')[0],
      }));

      console.log("estos son mis registros de ingresos y egresos: ", data);

      this.isLoading = false;
      
      this.totalPages = Math.ceil(this.incomes.length / this.itemsPerPage);
      this.updatePaginated();
    }, (error) => {
      console.error('Error fetching incomes', error);
      this.isLoading = false;

    });
  }
  

  async openModal(income?: Income) {

    console.log("estos son los datos de edicion: ", income)

    const modal = await this.modalController.create({
      component: IncomeModalComponent,
      componentProps: {
        ingreso: income ? { ...income } : this.getEmptyIncome(),
        isEditMode: !!income
      }
    });
  
    modal.onDidDismiss().then((result) => {
      if (result.data && result.role === 'success') {
        this.loadIngresos();
      }
    });
  
    return await modal.present();
  }

  updatePaginated() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedIncomes = this.incomes.slice(startIndex, startIndex + this.itemsPerPage);
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
    for (let field of this.selectedFields) {
      if (this.isDateField(field) && !this.dateSearchValues[field]) {
        this.dateSearchValues[field] = { startDate: '', endDate: '' };
      }
    }
  
    this._ingresoServ.getIngresos().subscribe((data: Income[]) => {
      this.incomes = data
        .filter(income => income.Reconciliado === 0) // Filtrar registros donde Reconciliado es igual a 0
        .filter(income => this.matchesSearch(income)) // Mantener la búsqueda
        .sort((a, b) => b.IngresoID - a.IngresoID)
        .map(transferencia => ({
          ...transferencia,
          Fecha: new Date(transferencia.Fecha).toISOString().split('T')[0],
        }));
  
      this.totalPages = Math.ceil(this.incomes.length / this.itemsPerPage);
      this.updatePaginated();
    });
  }
  

  resetSearch() {
    this.searchValues = {};
    this.dateSearchValues = {};
    this.selectedFields = [];
    this.loadIngresos();
  }

  matchesSearch(income: Income): boolean {
    for (let field of this.selectedFields) {
      if (this.isDateField(field)) {
        const dateRange = this.dateSearchValues[field];
        const incomeDate = new Date(income[field] as string);
        const startDate = new Date(dateRange.startDate);
        const endDate = new Date(dateRange.endDate);
        
        if (endDate) {
          endDate.setDate(endDate.getDate() + 1);
        }
  
        if (startDate && incomeDate < startDate) {
          return false;
        }
        if (endDate && incomeDate >= endDate) {
          return false;
        }
      } else {
        const searchValue = this.searchValues[field];
        if (searchValue && !((income[field] as string)?.toString().includes(searchValue))) {
          return false;
        }
      }
    }
    return true;
  }
  

  isDateField(field: string): boolean {
    return ['Fecha'].includes(field);
  }

  getFieldLabel(field: string): string {
    return this.searchFields.find(f => f.value === field)?.label || field;
  }
  
  
  getEmptyIncome(): Income {
    return {
      IngresoID: 0,
      Fecha: '',
      ConceptoID: 0,
      NombreConcepto: '',
      Descripcion: '',
      Proveedor: '',
      ProveedorEstatus: { data: [], type: '' },
      Piezas: 0,
      CajaChica: false,
      Monto: 0,
      Saldo: 0,
      Comprobante: '',
      SegmentoID: 0,
      NombreSegmento: '',
      CategoriaID: 0,
      NombreCategoria: '',
      SubcategoriaID: 0,
      NombreSubcategoria: '',
      EstatusComprobacionID: 0,
      NombreEstatus: '',
      FechaAutorizacion: '',
      UsuarioAutorizaID: 0,
      NombreUsuarioAutoriza: '',
      UsuarioRecibeID: 0,
      NombreUsuarioRecibe: '',
      FechaConciliacion: '',
      ObservacionesDifConciliacion: '',
      NombreCajaChica: '',
      RFC: '',
      NombreDuenoCuenta: '',
      SaldoReconciliacion: 0,
      TipoCuenta: '',
      NombreCuenta: '',
      Reconciliado: 0,
      TipoIngreso: { data: [], type: '' },
      ReconciliacionID: 0,
      CuentaID: 0,
    };
  }


  async presentLoading(message: string) {
    const loading = await this.loadingController.create({
      message: message,
      spinner: 'crescent', // Puedes cambiar el spinner a 'lines', 'bubbles', etc.
    });
    await loading.present();
    return loading;
  }
  
  async dismissLoading(loading: HTMLIonLoadingElement) {
    await loading.dismiss();
  }


  
}
