import { Component, Input, OnInit } from '@angular/core';
import { ModalController, IonicModule, AlertController  } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { PresupuestoServices } from 'src/app/Servicios/Presupuesto.service';
import { IngresosServices } from 'src/app/Servicios/Ingresos.service';


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
  TipoCuentaID: number;
  CuentaID: number;
  RFC: string;
  NombreCuenta: string;
  DiaLimite: number;
  [key: string]: any;
}


interface Cuenta {
  CuentaID: number;
  TipoCuentaID: number;
  NombreCuenta: string;
  RFC: string;
}


@Component({
  selector: 'app-presupuesto-cuenta-modal',
  templateUrl: './presupuesto-cuenta-modal.component.html',
  styleUrls: ['./presupuesto-cuenta-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule, HttpClientModule],
})
export class PresupuestoCuentaModalComponent implements OnInit {
  @Input() presupuesto: Presupuesto = {
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
    TipoCuentaID: 0,
    CuentaID: 0,
    RFC: '',
    NombreCuenta: '',
    DiaLimite: 0,
  };

  cuenta: Cuenta[] = [];

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
    // console.log("presupuesto recibido en el modal:", this.presupuesto);
    // console.log("Modo edición:", this.isEditMode);

    this.loadCuentas();
    this.onTipoCuentaChange();

  }


  onTipoCuentaChange() {

    this.filteredCuentas = this.cuenta.filter(
      (c) => c.TipoCuentaID === this.presupuesto.TipoCuentaID
    );
    
  }

  loadCuentas() {
    this._ingresoServ.getCuentas().subscribe(
      (data: Cuenta[]) => {
        // console.log('Esta es mi data en cuentas: ', data);
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
      this.presupuesto.CuentaID = 0;
    }
  }

  onCuentaChange(event: any) {
    const cuentaID = event.detail.value;
    const selectedCuenta = this.cuenta.find((c) => c.CuentaID === cuentaID);

    if (selectedCuenta && this.presupuesto.TipoCuentaID === 2) {
      this.presupuesto.RFC = selectedCuenta.RFC;
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

  async dictaminarMonto_Frecuencia() {

    const cuentaID = this.presupuesto.TipoCuentaID === 1 ? -1 : this.presupuesto.CuentaID;

    const diaLimite = this.presupuesto.DiaLimite != null ? this.presupuesto.DiaLimite : -1;

    const cuentaDiaLimiteDictaminados = {
      SegmentoID: this.presupuesto.SegmentoID,
      CategoriaID: this.presupuesto.CategoriaID,
      SubcategoriaID: this.presupuesto.SubcategoriaID,
      ConceptoID: this.presupuesto.ConceptoID,
      CuentaID: cuentaID,
      DiaLimite: diaLimite,
    };
  
    // console.log("Datos del presupuesto para asignar cuenta y dia limite:", cuentaDiaLimiteDictaminados);


    this._presupuestoServ.updatePresupuestoCuenta(cuentaDiaLimiteDictaminados).subscribe(async response => {
      // console.log('Presupuesto actualizado exitosamente:', response);

      const alert = await this.alertController.create({
        header: 'Éxito',
        message: 'La informacion de cuenta y dia limite se actualizo correctamente.',
        buttons: ['OK']
      });
      await alert.present();

      this.closeModal(true);
    }, error => {
      console.error('Error al actualizar el Presupuesto:', error);
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
