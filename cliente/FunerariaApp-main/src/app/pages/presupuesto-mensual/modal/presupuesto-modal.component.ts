import { Component, Input, OnInit } from '@angular/core';
import { ModalController, IonicModule, AlertController  } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { PresupuestoServices } from 'src/app/Servicios/Presupuesto.service';
import { ProveedoresServices } from 'src/app/Servicios/Proveedores.service';
import { IngresosServices } from 'src/app/Servicios/Ingresos.service';


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

interface Segmento {
  SegmentoID: number;
  Nombre: string;
}

interface Categoria {
  CategoriaID: number;
  Nombre: string;
}

interface Subcategoria {
  SubcategoriaID: number;
  Nombre: string;
}

interface Proveedor {
  ProveedorID: number;
  Proveedor: string;
  CategoriaID: number;
  NombreCategoria: string;
  SubcategoriaID: number;
  NombreSubcategoria: string;
  Rentabilidad: string;
  Estatus: { data: number[]; type: string; };
}


@Component({
  selector: 'app-presupuesto-modal',
  templateUrl: './presupuesto-modal.component.html',
  styleUrls: ['./presupuesto-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule, HttpClientModule],
})
export class PresupuestoModalComponent implements OnInit {
  @Input() gastos: Gastos = {
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

  proveedor: Proveedor[] = [];
  segmento: Segmento[] = [];

  isNewProveedor = true;
  isNewSegmento = false;

  newProveedor = '';
  newSegmento = '';

  allProveedores: Proveedor[] = [];


  @Input() isEditMode: boolean = false;

  constructor(private modalController: ModalController, private _presupuestoServ: PresupuestoServices, private alertController: AlertController, private _ingresoServ: IngresosServices) {}


  ngOnInit() {
    // console.log("Proveedor recibido en el modal:", this.gastos);
    // console.log("Modo edición:", this.isEditMode);

    this.isNewProveedor = !this.isEditMode;

    this.loadSegmentos();
    this.loadProveedores();

  }

  loadSegmentos() {
    this._ingresoServ.getSegmentos().subscribe(
      (data: Segmento[]) => {
        this.segmento = data;
      },
      (error) => {
        this.presentAlert('Error fetching segments');
      }
    );
  }

  loadProveedores() {
    this._ingresoServ.getProveedores().subscribe(
      (data: Proveedor[]) => {
        // console.log('Esta es mi data en proveedores: ', data);
        this.allProveedores = data; 
        this.proveedor = [...this.allProveedores]; 
      },
      (error) => {
        this.presentAlert('Error fetching providers');
      }
    );
  }

  async presentAlert(message: string) {
    const alert = await this.alertController.create({
      header: 'Error',
      message: message,
      buttons: ['OK'],
    });

    await alert.present();
  }

  async presentSuccessAlert() {
    const alert = await this.alertController.create({
      header: 'Éxito',
      message: 'El registro se ha guardado correctamente.',
      buttons: ['OK']
    });
    await alert.present();
  }
  
  async presentErrorAlert() {
    const alert = await this.alertController.create({
      header: 'Error',
      message: 'Hubo un problema al guardar el registro. Inténtalo nuevamente.',
      buttons: ['OK']
    });
    await alert.present();
  }

  async CrearGasto() {

    const gastos = {
      GastoID: this.gastos.GastoID,
      FechaPreautorizada: this.gastos.FechaPreautorizada,
      Concepto: this.gastos.Concepto,
      Monto: this.gastos.Monto,
      ProveedorID: this.isNewProveedor ? this.newProveedor : this.gastos.ProveedorID,
      SegmentoID: this.isNewSegmento ? this.newSegmento : this.gastos.SegmentoID,
    };
  
    // console.log("Datos del gasto:", gastos);


    if (this.isEditMode) {
      this._presupuestoServ.UpdateGasto(gastos).subscribe(
          response => {
              // console.log('Ingreso actualizado correctamente:', response);
              this.presentSuccessAlert();

              this.closeModal(true);
          },
          error => {
              console.error('Error al actualizar el ingreso:', error);
              this.presentErrorAlert();
          }
      );
    } else {
      this._presupuestoServ.addGasto(gastos).subscribe(
          response => {
              // console.log('Gasto guardado correctamente:', response);
              this.presentSuccessAlert();


              this.closeModal(true);
          },
          error => {
              console.error('Error al guardar el gasto:', error);
              this.presentErrorAlert();
          }
      );
    }


  }
  

  closeModal(success: boolean) {
    this.modalController.dismiss({ success }, success ? 'success' : 'error');
  }

}
