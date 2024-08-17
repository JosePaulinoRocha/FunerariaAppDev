import { Component, OnInit } from '@angular/core';
import { IonicModule, ModalController } from "@ionic/angular";
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ReconciliacionesServices } from 'src/app/Servicios/Reconciliaciones.service';
import { ReintegrosReconciliacionesModalComponent } from './modal/reintegros-reconciliaciones.component';

interface Reconciliacion {
  ReconciliacionID: number;
  Fecha: string;
  Saldo: number;
  CuentaID: number;
  NombreCuenta: string;
  NombreTipoCuenta: string;
  [key: string]: any;
}

@Component({
  selector: 'app-reconciliaciones-historial',
  templateUrl: './reconciliaciones-historial.component.html',
  styleUrls: ['./reconciliaciones-historial.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule, HttpClientModule, ReintegrosReconciliacionesModalComponent],
})
export class ReconciliacionesHistorialComponent  implements OnInit {
  reconciliaciones: Reconciliacion[] = [];
  paginatedReconciliaciones: Reconciliacion[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 8;
  totalPages: number = 0;
  isAdmin: boolean = false;
  showReintegracionesTable: boolean = false;
  reintegracionesData: any[] = [];

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
    { value: 'ReconciliacionID', label: 'ID' },
    { value: 'Fecha', label: 'Fecha' },
    { value: 'Saldo', label: 'Saldo' },
    { value: 'CuentaID', label: 'CuentaID' },
    { value: 'NombreCuenta', label: 'Nombre Cuenta' },
    { value: 'NombreTipoCuenta', label: 'Tipo Cuenta' },
  ];
  selectedFields: string[] = [];
  searchValues: { [key: string]: string } = {};
  dateSearchValues: { [key: string]: { startDate: string, endDate: string } } = {};

  constructor(private modalController: ModalController, private _reconciliacionServ: ReconciliacionesServices) {}

  ngOnInit() {
    this.loadReconciliaciones();
    this.checkAdminStatus();
  }

  checkAdminStatus() {
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    this.isAdmin = user.isAdmin === 1;
  }

  loadReconciliaciones() {
    this._reconciliacionServ.getReconciliaciones().subscribe((data: Reconciliacion[]) => {
      // Ordenar los datos por IngresoID en orden descendente
      data.sort((a, b) => b.ReconciliacionID - a.ReconciliacionID);
  
      this.reconciliaciones = data.map(reconciliacion => ({
        ...reconciliacion,
        Fecha: new Date(reconciliacion.Fecha).toISOString().split('T')[0], // Formatear la fecha
      }));
      
      console.log("esta es la data de reconciliaciones: ", this.reconciliaciones);
      this.totalPages = Math.ceil(this.reconciliaciones.length / this.itemsPerPage);
      this.updatePaginatedReconciliaciones();
    }, (error) => {
      console.error('Error fetching incomes', error); 
    });
  }

  updatePaginatedReconciliaciones() {
    this.totalPages = Math.ceil(this.reconciliaciones.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedReconciliaciones = this.reconciliaciones.slice(startIndex, startIndex + this.itemsPerPage);
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedReconciliaciones();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedReconciliaciones();
    }
  }

  applySearch() {
    // Asegurarse de que dateSearchValues tenga valores predeterminados para campos de fecha
    for (let field of this.selectedFields) {
      if (this.isDateField(field) && !this.dateSearchValues[field]) {
        this.dateSearchValues[field] = { startDate: '', endDate: '' };
      }
    }
  
    this._reconciliacionServ.getReconciliaciones().subscribe((data: Reconciliacion[]) => {
      this.reconciliaciones = data
        .filter(reconciliacion => this.matchesSearch(reconciliacion))
        .sort((a, b) => b.ReconciliacionID - a.ReconciliacionID) // Ordenar los datos por IngresoID en orden descendente
        .map(reconciliacion => ({
          ...reconciliacion,
          Fecha: new Date(reconciliacion.Fecha).toISOString().split('T')[0], // Formatear la fecha
        }));
      this.totalPages = Math.ceil(this.reconciliaciones.length / this.itemsPerPage);
      this.updatePaginatedReconciliaciones();
    });
  }

  resetSearch() {
    this.searchValues = {};
    this.dateSearchValues = {};
    this.selectedFields = [];
    this.loadReconciliaciones();
  }

  matchesSearch(reconciliacion: Reconciliacion): boolean {
    for (let field of this.selectedFields) {
      if (this.isDateField(field)) {
        const dateRange = this.dateSearchValues[field];
        const reconciliacionDate = new Date(reconciliacion[field] as string);
        const startDate = new Date(dateRange.startDate);
        const endDate = new Date(dateRange.endDate);
        
        // Incrementar la fecha final en 1 día para incluir el último día en el rango
        if (endDate) {
          endDate.setDate(endDate.getDate() + 1);
        }
  
        if (startDate && reconciliacionDate < startDate) {
          return false;
        }
        if (endDate && reconciliacionDate >= endDate) {
          return false;
        }
      } else {
        const searchValue = this.searchValues[field];
        if (searchValue && !((reconciliacion[field] as string)?.toString().includes(searchValue))) {
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

  deleteReconciliacion(reconciliacionID: number) {
    console.log("este es mi ReconciliacionID a eliminar: ", reconciliacionID)
    if (confirm('¿Está seguro de que desea eliminar esta reconciliación?')) {
        this._reconciliacionServ.deleteReconciliacion(reconciliacionID).subscribe(
            response => {
                console.log('Reconciliación eliminada:', response);

                // Mensaje de éxito
                alert('Reconciliación eliminada exitosamente.');

                // Actualizar la lista de reconciliaciones
                this.loadReconciliaciones(); // Llamar a este método para actualizar los datos
            },
            error => {
                console.error('Error eliminando reconciliación:', error);
                console.error('Detalles del error:', error.message, error.error); // Log adicional

                // Mensaje de error
                alert('Error al eliminar la reconciliación. Inténtelo de nuevo más tarde.');
            }
        );
    }
  }

  ReintegracionesEgresos(reconciliacionID: number) {
    console.log("este es mi ReconciliacionID para la reintegracion: ", reconciliacionID);

    this._reconciliacionServ.reintegracionReconciliacion(reconciliacionID).subscribe(
      (response: any[]) => {
        console.log('Resultados de la consulta de reintegraciones:', response);
        
        // Asigna los datos de respuesta a reintegracionesData
        this.reintegracionesData = response.map(reintegracion => ({
          IngresoID: reintegracion.IngresoID,
          TipoCuenta: reintegracion.TipoCuenta,
          NombreCuenta: reintegracion.NombreCuenta,
          Monto: reintegracion.Monto,
          SaldoReconciliacion: reintegracion.SaldoReconciliacion,
          ReconciliacionID : reintegracion.ReconciliacionID
        }));

        // Mostrar la nueva tabla y ocultar la anterior
        this.showReintegracionesTable = true;
      },
      error => {
        console.error('Error al reintegrar:', error);
        alert('Error al realizar reintegro. Inténtelo de nuevo más tarde.');
      }
    );
  }

  async RealizarReintegro(ingresoID: number) {
    console.log("este es mi ReconciliacionID para la reintegracion: ", ingresoID);

    const ingreso = this.reintegracionesData.find(i => i.IngresoID === ingresoID); // Buscar el ingreso por ID
    const modal = await this.modalController.create({
      component: ReintegrosReconciliacionesModalComponent,
      componentProps: {
        ingreso: ingreso // Pasar los datos del ingreso al modal
      }
    });
    return await modal.present();
  }

  
}
