import { Component, Input, OnInit } from '@angular/core';
import { ModalController, IonicModule, AlertController  } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { PresupuestoServices } from 'src/app/Servicios/Presupuesto.service';
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


interface Cuenta {
  CuentaID: number;
  TipoCuentaID: number;
  NombreCuenta: string;
  RFC: string;
}

interface Categoria {
  CategoriaID: number;
  Nombre: string;
}

interface Subcategoria {
  SubcategoriaID: number;
  Nombre: string;
}

interface Concepto {
  ConceptoID: number;
  Nombre: string;
}

interface Estatus {
  EstatusPresupuestoID: number;
  Nombre: string;
}

@Component({
  selector: 'app-presupuesto-cuenta-modal',
  templateUrl: './presupuesto-cuenta-modal.component.html',
  styleUrls: ['./presupuesto-cuenta-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule, HttpClientModule],
})
export class PresupuestoCuentaModalComponent implements OnInit {
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

  cuenta: Cuenta[] = [];

  categoria: Categoria[] = [];
  subcategoria: Subcategoria[] = [];
  concepto: Concepto[] = [];
  estatus: Estatus[] = [];

  isNewConcepto = false;
  isNewCategoria = false;
  isNewSubcategoria = false;

  newConcepto = '';
  newCategoria = '';
  newSubcategoria = '';

  filteredCuentas: Cuenta[] = [];
  isCuentaEnabled = false;
  showRFC = false;

  isNewCuenta = false;
  newNombreCuenta = '';
  newRFC = '';

  @Input() isEditMode: boolean = false;

  @Input() esPeriodico: boolean = false;

  constructor(private modalController: ModalController, private _presupuestoServ: PresupuestoServices, private alertController: AlertController, private _ingresoServ: IngresosServices) {}


  ngOnInit() {
    console.log("presupuesto recibido en el modal:", this.gastos);
    console.log("Modo edición:", this.isEditMode);

    if (this.gastos.Fecha === '1970-01-01' || !this.gastos.Fecha) {
      this.gastos.Fecha = new Date().toISOString().split('T')[0];
    }

    this.loadCuentas();
    this.onTipoCuentaChange();

    this.loadCategorias();
    this.loadSubcategorias();
    this.loadConceptos();
    this.loadEstatus();

  }
  
  loadEstatus() {
    this._presupuestoServ.getEstatus().subscribe(
      (data: Estatus[]) => {
        this.estatus = data;
      },
      (error) => {
        this.presentAlert('Error fetching categories');
      }
    );
  }

  loadCategorias() {
    this._ingresoServ.getCategorias().subscribe(
      (data: Categoria[]) => {
        this.categoria = data;
      },
      (error) => {
        this.presentAlert('Error fetching categories');
      }
    );
  }


  loadSubcategorias() {
    this._ingresoServ.getSubcategorias().subscribe(
      (data: Subcategoria[]) => {
        this.subcategoria = data;
      },
      (error) => {
        this.presentAlert('Error fetching subcategories');
      }
    );
  }

  loadConceptos() {
    this._ingresoServ.getConceptos().subscribe(
      (data: Concepto[]) => {
        this.concepto = data;
      },
      (error) => {
        this.presentAlert('Error fetching concepts');
      }
    );
  }

  onTipoCuentaChange() {

    this.filteredCuentas = this.cuenta.filter(
      (c) => c.TipoCuentaID === this.gastos.TipoCuentaID
    );
    
  }

  loadCuentas() {
    this._ingresoServ.getCuentas().subscribe(
      (data: Cuenta[]) => {
        console.log('Esta es mi data en cuentas: ', data);
        this.cuenta = data;
        this.onTipoCuentaChange();
      },
      (error) => {
        this.presentAlert('Error fetching combinations');
      }
    );
  }

  onCuentaSelection(isNew: boolean) {
    this.isNewCuenta = isNew;

    if (!isNew) {
      this.gastos.CuentaID = 0;
    }
  }

  onCuentaChange(event: any) {
    const cuentaID = event.detail.value;
    const selectedCuenta = this.cuenta.find((c) => c.CuentaID === cuentaID);

    if (selectedCuenta && this.gastos.TipoCuentaID === 2) {
      this.gastos.RFC = selectedCuenta.RFC;
    }
  }


  async presentAlert(message: string) {
    const alert = await this.alertController.create({
      header: 'Error',
      message: message,
      buttons: ['OK'],
    });

    await alert.present();
  }

  async CuentaEstatus() {

    const datosCuentaEstatus = {
      GastoID: this.gastos.GastoID,
      EstatusPresupuestoID: this.gastos.EstatusPresupuestoID,
      Fecha: this.gastos.Fecha,
      CuentaID: this.gastos.CuentaID,
      CategoriaID: this.isNewCategoria ? this.newCategoria : this.gastos.CategoriaID,
      SubcategoriaID: this.isNewSubcategoria ? this.newSubcategoria : this.gastos.SubcategoriaID,
      ConceptoID: this.isNewConcepto ? this.newConcepto : this.gastos.ConceptoID,
    };
  
    console.log("Datos del presupuesto para asignar cuenta y estatus:", datosCuentaEstatus);


    this._presupuestoServ.updateGastoEstatus(datosCuentaEstatus).subscribe(async response => {
      console.log('Presupuesto actualizado exitosamente:', response);

      const alert = await this.alertController.create({
        header: 'Éxito',
        message: 'La informacion de cuenta y estatus se actualizo correctamente.',
        buttons: ['OK']
      });
      await alert.present();

      this.closeModal(true);
    }, error => {
      console.error('Error al actualizar el gaasto:', error);
      const alert = this.alertController.create({
        header: 'Error',
        message: 'Hubo un error al actualizar.',
        buttons: ['OK']
      });
    });


  }
  

  closeModal(success: boolean) {
    this.modalController.dismiss({ success }, success ? 'success' : 'error');
  }

}
