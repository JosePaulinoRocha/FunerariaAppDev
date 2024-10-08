import { Component, OnInit } from '@angular/core';
import { IonicModule, ModalController, AlertController  } from "@ionic/angular";
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ProveedoresServices } from 'src/app/Servicios/Proveedores.service';
import { ProveedoresModalComponent } from './modal/proveedores-modal.component';


interface Proveedor {
  ProveedorID: number;
  Proveedor: string;
  Estatus: { data: number[]; type: string; };
  CostoPorPieza: number;
  CategoriaID: number;
  NombreCategoria: string;
  SubcategoriaID: number;
  NombreSubcategoria: string;
  FechaRegistro: string;
  Rentabilidad: string;
  RentabilidadCostoPeriodo: number;
  [key: string]: any;
}


@Component({
  selector: 'app-proveedores',
  templateUrl: './proveedores.component.html',
  styleUrls: ['./proveedores.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule, HttpClientModule],
})
export class ProveedoresComponent  implements OnInit {

  proveedores: Proveedor[] = [];
  paginatedProveedores: Proveedor[] = [];
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
    { value: 'ProveedorID', label: 'ID' },
    { value: 'Proveedor', label: 'Proveedor' },
    { value: 'CostoPorPieza', label: 'Costo Por Pieza' },
    { value: 'NombreCategoria', label: 'Categoria' },
    { value: 'NombreSubcategoria', label: 'Subcategoria' },
    { value: 'FechaRegistro', label: 'Fecha Registro' },
  ];
  selectedFields: string[] = [];
  searchValues: { [key: string]: string } = {};
  dateSearchValues: { [key: string]: { startDate: string, endDate: string } } = {};

  constructor(private modalController: ModalController, private _proveedorServ: ProveedoresServices, private alertController: AlertController) {}

  ngOnInit() {
    this.loadProveedores();
    this.checkAdminStatus();
  }

  async openModal(proveedor?: Proveedor) {

    console.log("estos son los datos de edicion: ", proveedor)

    const modal = await this.modalController.create({
      component: ProveedoresModalComponent,
      componentProps: {
        proveedor: proveedor ? { ...proveedor } : this.getEmptyIncome(),
        isEditMode: !!proveedor
      }
    });
  
    modal.onDidDismiss().then((result) => {
      if (result.data && result.role === 'success') {
        this.loadProveedores();
      }
    });
  
    return await modal.present();
  }

  checkAdminStatus() {
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    this.isAdmin = user.isAdmin === 1;
  }

  loadProveedores() {
    this._proveedorServ.getProveedores().subscribe((data: Proveedor[]) => {
      data.sort((a, b) => b.ProveedorID - a.ProveedorID);
  
      this.proveedores = data.map(proveedor => ({
        ...proveedor,
        FechaRegistro: new Date(proveedor.FechaRegistro).toISOString().split('T')[0],
      }));
      
      console.log("esta es la data de proveedores: ", this.proveedores);
      this.totalPages = Math.ceil(this.proveedores.length / this.itemsPerPage);
      this.updatePaginatedProveedores();
    }, (error) => {
      console.error('Error fetching incomes', error); 
    });
  }

  updatePaginatedProveedores() {
    this.totalPages = Math.ceil(this.proveedores.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedProveedores = this.proveedores.slice(startIndex, startIndex + this.itemsPerPage);
  }

  onItemsPerPageChange() {
    this.currentPage = 1;  // Reiniciar a la página 1 cuando cambie los registros por página
    this.updatePaginatedIncomes();  // Actualizar la paginación
  }

  updatePaginatedIncomes() {
    this.totalPages = Math.ceil(this.proveedores.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedProveedores = this.proveedores.slice(startIndex, startIndex + this.itemsPerPage);
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedProveedores();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedProveedores();
    }
  }

  applySearch() {
    for (let field of this.selectedFields) {
      if (this.isDateField(field) && !this.dateSearchValues[field]) {
        this.dateSearchValues[field] = { startDate: '', endDate: '' };
      }
    }
  
    this._proveedorServ.getProveedores().subscribe((data: Proveedor[]) => {
      this.proveedores = data
        .filter(reconciliacion => this.matchesSearch(reconciliacion))
        .sort((a, b) => b.ProveedorID - a.ProveedorID)
        .map(reconciliacion => ({
          ...reconciliacion,
          FechaRegistro: new Date(reconciliacion.FechaRegistro).toISOString().split('T')[0],
        }));
      this.totalPages = Math.ceil(this.proveedores.length / this.itemsPerPage);
      this.updatePaginatedProveedores();
    });
  }

  resetSearch() {
    this.searchValues = {};
    this.dateSearchValues = {};
    this.selectedFields = [];
    this.loadProveedores();
  }

  matchesSearch(proveedor: Proveedor): boolean {
    for (let field of this.selectedFields) {
      if (this.isDateField(field)) {
        const dateRange = this.dateSearchValues[field];
        const proveedorDate = new Date(proveedor[field] as string);
        const startDate = new Date(dateRange.startDate);
        const endDate = new Date(dateRange.endDate);
        
        if (endDate) {
          endDate.setDate(endDate.getDate() + 1);
        }
  
        if (startDate && proveedorDate < startDate) {
          return false;
        }
        if (endDate && proveedorDate >= endDate) {
          return false;
        }
      } else {
        const searchValue = this.searchValues[field];
        if (searchValue && !((proveedor[field] as string)?.toString().includes(searchValue))) {
          return false;
        }
      }
    }
    return true;
  }

  isDateField(field: string): boolean {
    return ['FechaRegistro'].includes(field);
  }

  getFieldLabel(field: string): string {
    return this.searchFields.find(f => f.value === field)?.label || field;
  }

  async confirmarAccion(proveedorID: number, estatus: number) {
    const isActivating = estatus === 0;
    const action = isActivating ? 'activar' : 'desactivar';
    const icon = isActivating ? 'checkmark-circle-outline' : 'close-circle-outline';
    const color = isActivating ? 'success' : 'danger';
    const confirmText = isActivating ? 'activar' : 'desactivar';

    const alert = await this.alertController.create({
      header: 'Confirmar Acción',
      message: `¿Está seguro de que desea ${confirmText} este proveedor?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('Acción cancelada');
          }
        },
        {
          text: 'Confirmar',
          handler: () => {
            this.toggleProveedorStatus(proveedorID, estatus);
          }
        }
      ]
    });

    await alert.present();
  }

  toggleProveedorStatus(proveedorID: number, estatus: number) {
    const nuevoEstatus = estatus === 0 ? 1 : 0;
    this._proveedorServ.updateProveedorStatus(proveedorID, nuevoEstatus).subscribe(async () => {
      this.loadProveedores();
      const successMessage = nuevoEstatus === 1 ? 'activado' : 'desactivado';
      const alert = await this.alertController.create({
        header: 'Éxito',
        message: `Proveedor ${successMessage} correctamente.`,
        buttons: ['OK']
      });
      await alert.present();
    }, (error: any) => {
      console.error('Error updating status', error);
    });
  }


  getEmptyIncome(): Proveedor {
    return {
      ProveedorID: 0,
      Proveedor: '',
      Estatus: { data: [], type: '' },
      CostoPorPieza: 0,
      CategoriaID: 0,
      NombreCategoria: '',
      SubcategoriaID: 0,
      NombreSubcategoria: '',
      FechaRegistro: '',
      Rentabilidad: '',
      RentabilidadCostoPeriodo: 0,
    };
  }

}
