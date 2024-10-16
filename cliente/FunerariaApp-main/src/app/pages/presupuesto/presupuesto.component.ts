import { Component, OnInit } from '@angular/core';
import { IonicModule, ModalController, AlertController } from "@ionic/angular";
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { PresupuestoServices } from 'src/app/Servicios/Presupuesto.service';
import { PresupuestoModalComponent } from './modal/presupuesto-modal.component';


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
  ];
  selectedFields: string[] = [];
  searchValues: { [key: string]: string } = {};
  dateSearchValues: { [key: string]: { startDate: string, endDate: string } } = {};

  constructor(private modalController: ModalController, private _presupuestoServ: PresupuestoServices, private alertController: AlertController) {}

  ngOnInit() {
    this.loadPresupuesto();
    this.checkAdminStatus();
  }

  async openModal(presupuesto?: Presupuesto) {

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

  checkAdminStatus() {
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    this.isAdmin = user.isAdmin === 1;
  }

  loadPresupuesto() {
    this._presupuestoServ.getPresupuesto().subscribe((data: Presupuesto[]) => {
  
      this.presupuesto = data.map(proveedor => ({
        ...proveedor,
        UltimaFecha: new Date(proveedor.UltimaFecha).toISOString().split('T')[0],
      }));
      
      console.log("esta es la data de presupuesto: ", this.presupuesto);
      this.totalPages = Math.ceil(this.presupuesto.length / this.itemsPerPage);
      this.updatePaginated();
    }, (error) => {
      console.error('Error fetching incomes', error); 
    });
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
    for (let field of this.selectedFields) {
      if (this.isDateField(field) && !this.dateSearchValues[field]) {
        this.dateSearchValues[field] = { startDate: '', endDate: '' };
      }
    }
  
    this._presupuestoServ.getPresupuesto().subscribe((data: Presupuesto[]) => {
      this.presupuesto = data
        .filter(presupuesto => this.matchesSearch(presupuesto))
        .map(presupuesto => ({
          ...presupuesto,
          UltimaFecha: new Date(presupuesto.UltimaFecha).toISOString().split('T')[0],
        }));
      this.totalPages = Math.ceil(this.presupuesto.length / this.itemsPerPage);
      this.updatePaginated();
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




}

