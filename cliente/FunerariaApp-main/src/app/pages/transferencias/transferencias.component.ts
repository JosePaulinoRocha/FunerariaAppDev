import { Component, OnInit } from '@angular/core';
import { IonicModule, ModalController, AlertController  } from "@ionic/angular";
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { TransferenciasServices } from 'src/app/Servicios/Transferencias.service';
import { TransferenciasModalComponent } from './modal/transferencias-modal.component';

interface Transferencia {
  TransferenciaID: number;
  CuentaEnviaID: number;
  EnviaTipoCuentaID: number;
  EnviaNombreCuenta: string;
  EnviaRFC: string;
  CuentaRecibeID: number;
  RecibeTipoCuentaID: number;
  RecibeNombreCuenta: string;
  RecibeRFC: string;
  Descripcion: string;
  Monto: number;
  Fecha: string;
  [key: string]: any;
}

@Component({
  selector: 'app-transferencias',
  templateUrl: './transferencias.component.html',
  styleUrls: ['./transferencias.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule, HttpClientModule],
})
export class TransferenciasComponent  implements OnInit {

  transferencias: Transferencia[] = [];
  paginatedTransferencias: Transferencia[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;
  itemsPerPageOptions: number[] = [10, 20, 50, 100, 500, 1000];
  isAdmin: boolean = false;

  updateTotalPages() {
    this.totalPages = Math.ceil(this.transferencias.length / this.itemsPerPage);
  }

  onItemsPerPageChange() {
    this.currentPage = 1; // Resetea la paginación al cambiar los registros por página
    this.updateTotalPages();
    this.updatePaginatedTransferencias();
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
    { value: 'TransferenciaID', label: 'ID' },
    { value: 'Fecha', label: 'Fecha' },
    { value: 'EnviaNombreCuenta', label: 'Cuenta Envia' },
    { value: 'EnviaRFC', label: 'Envia RFC' },
    { value: 'RecibeNombreCuenta', label: 'Cuenta Recibe' },
    { value: 'RecibeRFC', label: 'Recibe RFC' },
    { value: 'Descripcion', label: 'Descripcion' },
    { value: 'Monto', label: 'Monto' },

  ];
  selectedFields: string[] = [];
  searchValues: { [key: string]: string } = {};
  dateSearchValues: { [key: string]: { startDate: string, endDate: string } } = {};


  constructor(private modalController: ModalController, private _transferenciaServ: TransferenciasServices, private alertController: AlertController) {}


  ngOnInit() {
    this.loadTransferencias();
    this.checkAdminStatus();
  }

  async openModal(transferencia?: Transferencia) {
    const modal = await this.modalController.create({
      component: TransferenciasModalComponent,
    });
  
    modal.onDidDismiss().then((result) => {
      if (result.data && result.role === 'success') {
        this.loadTransferencias();
      }
    });
  
    return await modal.present();
  }

  checkAdminStatus() {
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    this.isAdmin = user.isAdmin === 1;
  }

  loadTransferencias() {
    this._transferenciaServ.getTransferencias().subscribe((data: Transferencia[]) => {
      data.sort((a, b) => b.TransferenciaID - a.TransferenciaID);
  
      this.transferencias = data.map(transferencia => ({
        ...transferencia,
        Fecha: new Date(transferencia.Fecha).toISOString().split('T')[0],
      }));
      
      console.log("esta es la data de transferencias: ", this.transferencias);
      this.totalPages = Math.ceil(this.transferencias.length / this.itemsPerPage);
      this.updatePaginatedTransferencias();
    }, (error) => {
      console.error('Error fetching incomes', error); 
    });
  }

  updatePaginatedTransferencias() {
    this.totalPages = Math.ceil(this.transferencias.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedTransferencias = this.transferencias.slice(startIndex, startIndex + this.itemsPerPage);
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedTransferencias();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedTransferencias();
    }
  }

  applySearch() {
    for (let field of this.selectedFields) {
      if (this.isDateField(field) && !this.dateSearchValues[field]) {
        this.dateSearchValues[field] = { startDate: '', endDate: '' };
      }
    }
  
    this._transferenciaServ.getTransferencias().subscribe((data: Transferencia[]) => {
      this.transferencias = data
        .filter(transferencia => this.matchesSearch(transferencia))
        .sort((a, b) => b.TransferenciaID - a.TransferenciaID)
        .map(transferencia => ({
          ...transferencia,
          Fecha: new Date(transferencia.Fecha).toISOString().split('T')[0],
        }));
      this.totalPages = Math.ceil(this.transferencias.length / this.itemsPerPage);
      this.updatePaginatedTransferencias();
    });
  }

  resetSearch() {
    this.searchValues = {};
    this.dateSearchValues = {};
    this.selectedFields = [];
    this.loadTransferencias();
  }

  matchesSearch(transferencia: Transferencia): boolean {
    for (let field of this.selectedFields) {
      if (this.isDateField(field)) {
        const dateRange = this.dateSearchValues[field];
        const transferenciaDate = new Date(transferencia[field] as string);
        const startDate = new Date(dateRange.startDate);
        const endDate = new Date(dateRange.endDate);
        
        if (endDate) {
          endDate.setDate(endDate.getDate() + 1);
        }
  
        if (startDate && transferenciaDate < startDate) {
          return false;
        }
        if (endDate && transferenciaDate >= endDate) {
          return false;
        }
      } else {
        const searchValue = this.searchValues[field];
        if (searchValue && !((transferencia[field] as string)?.toString().includes(searchValue))) {
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

}
