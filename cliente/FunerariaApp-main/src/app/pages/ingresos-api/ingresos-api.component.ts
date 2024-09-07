import { Component, OnInit } from '@angular/core';
import { IonicModule, ModalController } from "@ionic/angular";
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { IngresosApiServices } from 'src/app/Servicios/Ingresos-api.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AlertController } from '@ionic/angular';

interface Ingreso {
  collection?: string;
  service_ref?: string;
  agent?: string;
  date_affect?: string;
  date_ref?: string;
  transactions: number;
  total_amount: number;
}

@Component({
  selector: 'app-ingresos-api',
  templateUrl: './ingresos-api.component.html',
  styleUrls: ['./ingresos-api.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule, HttpClientModule],
})
export class IngresosApiComponent implements OnInit {
  ingresos: Ingreso[] = [];
  paginatedIngresos: Ingreso[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 8;
  totalPages: number = 0;

  tipoIngreso: string | null = null;
  fechaInicio: string | null = null;
  fechaFin: string | null = null;
  collection: string | null = null;
  business: string | null = null;
  canSubmit: boolean = false;
  mostrarTabla: boolean = false;
  errorMessage: string | null = null;

  constructor(private _ingresoApiServ: IngresosApiServices, private alertController: AlertController) { }

  ngOnInit() { }

  async confirmarImportacion() {
    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: '¿Estás seguro de que deseas importar esta información?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Aceptar',
          handler: () => {
            this.importarIngresos();
          }
        }
      ]
    });

    await alert.present();
  }

  importarIngresos() {
    // Asegúrate de que hay registros para importar
    if (this.ingresos.length === 0) {
      console.warn('No hay registros para importar.');
      return;
    }
  
    // Prepara los datos para enviar en una sola solicitud
    const registrosParaImportar = this.ingresos.map(ingreso => ({
      tipoIngreso: this.tipoIngreso,
      collection: ingreso.collection,
      service_ref: ingreso.service_ref,
      agent: ingreso.agent,
      date_affect: ingreso.date_affect,
      date_ref: ingreso.date_ref,
      transactions: ingreso.transactions,
      total_amount: ingreso.total_amount
    }));
  
    console.log("Estos son los registros a importar: ", registrosParaImportar);
  
    this._ingresoApiServ.importarIngresos(registrosParaImportar).subscribe(
      () => {
        console.log('Registros importados correctamente');
      },
      (error: any) => {
        console.error('Error al importar los registros', error);
      }
    );
  }
  

  checkDates() {
    // Limpia la tabla y otras variables relacionadas al cambiar el tipo de ingreso
    if (this.tipoIngreso) {
      this.ingresos = [];
      this.paginatedIngresos = [];
      this.currentPage = 1;
      this.totalPages = 0;
      this.mostrarTabla = false;
    }
  
    // Validación de campos obligatorios según el tipo de ingreso seleccionado
    if (this.tipoIngreso === 'afectaciones') {
      this.canSubmit = this.fechaInicio != null && this.fechaFin != null;
    } else if (this.tipoIngreso === 'funeraria') {
      this.canSubmit = this.business != null && this.fechaInicio != null && this.fechaFin != null;
    } else if (this.tipoIngreso === 'pagos-iniciales') {
      this.canSubmit = this.fechaInicio != null && this.fechaFin != null;
    }
  }
  

  mostrarIngresos() {
    this.errorMessage = null;

    if (this.tipoIngreso === 'afectaciones') {
      this._ingresoApiServ.getToken('test', '1234').pipe(
        catchError(err => {
          this.errorMessage = 'Error al obtener el token para Afectaciones';
          return throwError(err);
        })
      ).subscribe((tokenResponse: any) => {
        const token = tokenResponse.token;
        this._ingresoApiServ
          .getPaidsAffected(token, this.fechaInicio!, this.fechaFin!, this.collection || undefined)
          .pipe(
            catchError(err => {
              this.errorMessage = 'Error al obtener los ingresos de Afectaciones';
              return throwError(err);
            })
          )
          .subscribe((data: Ingreso[]) => {
            console.log("Datos recibidos de afectaciones: ", data);
            this.ingresos = data;
            this.totalPages = Math.ceil(this.ingresos.length / this.itemsPerPage);
            this.updatePaginatedIngresos();
            this.mostrarTabla = true;
          });
      });
    } else if (this.tipoIngreso === 'funeraria') {
      this._ingresoApiServ.getToken('test', '1234').pipe(
        catchError(err => {
          this.errorMessage = 'Error al obtener el token para Funeraria';
          return throwError(err);
        })
      ).subscribe((tokenResponse: any) => {
        const token = tokenResponse.token;
        this._ingresoApiServ
          .getFunerariaPayments(token, this.business!, this.fechaInicio!, this.fechaFin!)
          .pipe(
            catchError(err => {
              this.errorMessage = 'Error al obtener los pagos de Funeraria';
              return throwError(err);
            })
          )
          .subscribe((data: Ingreso[]) => {
            console.log("Datos recibidos de funeraria: ", data);
            this.ingresos = data;
            this.totalPages = Math.ceil(this.ingresos.length / this.itemsPerPage);
            this.updatePaginatedIngresos();
            this.mostrarTabla = true;
          });
      });
    } else if (this.tipoIngreso === 'pagos-iniciales') {
      this._ingresoApiServ.getToken('test', '1234').pipe(
        catchError(err => {
          this.errorMessage = 'Error al obtener el token para Pagos Iniciales';
          return throwError(err);
        })
      ).subscribe((tokenResponse: any) => {
        const token = tokenResponse.token;
        this._ingresoApiServ
          .getPagosIniciales(token, this.fechaInicio!, this.fechaFin!)
          .pipe(
            catchError(err => {
              this.errorMessage = 'Error al obtener los pagos iniciales';
              return throwError(err);
            })
          )
          .subscribe((data: Ingreso[]) => {
            console.log("Datos recibidos de pagos iniciales: ", data);
            this.ingresos = data;
            this.totalPages = Math.ceil(this.ingresos.length / this.itemsPerPage);
            this.updatePaginatedIngresos();
            this.mostrarTabla = true;
          });
      });
    }
  }

  updatePaginatedIngresos() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedIngresos = this.ingresos.slice(startIndex, startIndex + this.itemsPerPage);
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedIngresos();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedIngresos();
    }
  }
}
