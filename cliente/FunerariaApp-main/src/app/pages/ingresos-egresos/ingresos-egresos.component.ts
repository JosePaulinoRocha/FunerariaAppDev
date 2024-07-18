import { Component, OnInit } from '@angular/core';
import { IonicModule, ModalController } from "@ionic/angular";
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { IngresosServices } from 'src/app/Servicios/Ingresos.service';

interface Income {
  IngresoID: number;
  Fecha: string;
  ConceptoID: number;
  NombreConcepto: string;
  Descripcion: string;
  Proveedor: string;
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
  [key: string]: any; // Para permitir acceso dinámico
}


@Component({
  selector: 'app-ingresos-egresos',
  templateUrl: './ingresos-egresos.component.html',
  styleUrls: ['./ingresos-egresos.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule, HttpClientModule],
})
export class IngresosEgresosComponent implements OnInit {
  incomes: Income[] = [];
  paginatedIncomes: Income[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 8;
  totalPages: number = 0;

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

  // Search variables
  searchFields = [
    { value: 'IngresoID', label: 'Ingreso ID' },
    { value: 'Fecha', label: 'Fecha' },
    { value: 'NombreConcepto', label: 'Concepto' },
    { value: 'Descripcion', label: 'Descripcion' },
    { value: 'Proveedor', label: 'Proveedor' },
    { value: 'Piezas', label: 'Piezas' },
    { value: 'CajaChica', label: 'Tipo de ingreso' },
    { value: 'Monto', label: 'Monto' },
    { value: 'Saldo', label: 'Saldo' },
    { value: 'Comprobante', label: 'Comprobante' },
    { value: 'NombreSegmento', label: 'Segmento' },
    { value: 'NombreCategoria', label: 'Categoria' },
    { value: 'NombreSubcategoria', label: 'Subcategoria' },
    { value: 'NombreEstatus', label: 'Estatus' },
    { value: 'FechaAutorizacion', label: 'Fecha Autorizacion' },
    { value: 'NombreUsuarioAutoriza', label: 'Usuario Autoriza' },
    { value: 'NombreUsuarioRecibe', label: 'Usuario Recibe' },
    { value: 'FechaConciliacion', label: 'Fecha Conciliacion' },
    { value: 'ObservacionesDifConciliacion', label: 'Observaciones' },
  ];
  selectedFields: string[] = [];
  searchValues: { [key: string]: string } = {};
  dateSearchValues: { [key: string]: { startDate: string, endDate: string } } = {};

  constructor(private modalController: ModalController, private _ingresoServ: IngresosServices) { }

  ngOnInit() {
    this.loadIngresos();
  }

  loadIngresos() {
    this._ingresoServ.getIngresos().subscribe((data: Income[]) => {
      this.incomes = data.map(income => ({
        ...income,
        Fecha: new Date(income.Fecha).toISOString().split('T')[0], // Formatear la fecha
        FechaAutorizacion: new Date(income.FechaAutorizacion).toISOString().split('T')[0], // Formatear la fecha
        FechaConciliacion: new Date(income.FechaConciliacion).toISOString().split('T')[0] // Formatear la fecha
      }));
      this.totalPages = Math.ceil(this.incomes.length / this.itemsPerPage);
      this.updatePaginatedIncomes();
    }, (error) => {
      console.error('Error fetching incomes', error); 
    });
  }
  

  updatePaginatedIncomes() {
    this.totalPages = Math.ceil(this.incomes.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedIncomes = this.incomes.slice(startIndex, startIndex + this.itemsPerPage);
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedIncomes();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedIncomes();
    }
  }

  applySearch() {
    // Asegurarse de que dateSearchValues tenga valores predeterminados para campos de fecha
    for (let field of this.selectedFields) {
      if (this.isDateField(field) && !this.dateSearchValues[field]) {
        this.dateSearchValues[field] = { startDate: '', endDate: '' };
      }
    }
  
    this._ingresoServ.getIngresos().subscribe((data: Income[]) => {
      this.incomes = data
        .filter(income => this.matchesSearch(income))
        .map(income => ({
          ...income,
          Fecha: new Date(income.Fecha).toISOString().split('T')[0], // Formatear la fecha
          FechaAutorizacion: new Date(income.FechaAutorizacion).toISOString().split('T')[0], // Formatear la fecha
          FechaConciliacion: new Date(income.FechaConciliacion).toISOString().split('T')[0] // Formatear la fecha
        }));
      this.totalPages = Math.ceil(this.incomes.length / this.itemsPerPage);
      this.updatePaginatedIncomes();
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
        
        // Incrementar la fecha final en 1 día para incluir el último día en el rango
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
    return ['Fecha', 'FechaAutorizacion', 'FechaConciliacion'].includes(field);
  }

  getFieldLabel(field: string): string {
    return this.searchFields.find(f => f.value === field)?.label || field;
  }
}
