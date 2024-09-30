import { Component, Input, OnInit } from '@angular/core';
import { ModalController, IonicModule, AlertController  } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { IngresosServices } from 'src/app/Servicios/Ingresos.service';
import { TransferenciasServices } from 'src/app/Servicios/Transferencias.service';

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

interface Cuenta {
  CuentaID: number;
  TipoCuentaID: number;
  NombreCuenta: string;
  RFC: string;
}

@Component({
  selector: 'app-transferencias-modal',
  templateUrl: './transferencias-modal.component.html',
  styleUrls: ['./transferencias-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule, HttpClientModule],
})
export class TransferenciasModalComponent implements OnInit {
  @Input() transferencia: Transferencia = {
    TransferenciaID: 0,
    CuentaEnviaID: 0,
    EnviaTipoCuentaID: 0,
    EnviaNombreCuenta: '',
    EnviaRFC: '',
    CuentaRecibeID: 0,
    RecibeTipoCuentaID: 0,
    RecibeNombreCuenta: '',
    RecibeRFC: '',
    Descripcion: '',
    Monto: 0,
    Fecha: '',
  };

  cuenta: Cuenta[] = [];

  filteredCuentasEnvia: Cuenta[] = [];
  filteredCuentasRecibe: Cuenta[] = [];


  @Input() isEditMode: boolean = false;

  constructor(private modalController: ModalController, private _transferenciaServ: TransferenciasServices, private _ingresoServ: IngresosServices, private alertController: AlertController) {}


  ngOnInit() {
    this.loadCuentas();
  }

  loadCuentas() {
    this._ingresoServ.getCuentas().subscribe((data: Cuenta[]) => {
      console.log("esta es la info de cuentas: ", data);
      this.cuenta = data;
      this.onTipoCuentaChange('envia');
      this.onTipoCuentaChange('recibe');
    }, (error) => {
      this.presentAlert('Error fetching categories');
    });
  }

  onTipoCuentaChange(tipo: 'envia' | 'recibe') {
    if (tipo === 'envia' && this.transferencia.EnviaTipoCuentaID) {
      this.filteredCuentasEnvia = this.cuenta.filter(
        (c) => c.TipoCuentaID === this.transferencia.EnviaTipoCuentaID
      );
      this.transferencia.CuentaEnviaID = 0;
    } else if (tipo === 'recibe' && this.transferencia.RecibeTipoCuentaID) {
      this.filteredCuentasRecibe = this.cuenta.filter(
        (c) => c.TipoCuentaID === this.transferencia.RecibeTipoCuentaID
      );
      this.transferencia.CuentaRecibeID = 0;
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

  async RealizarTransferencia() {
    const nuevaTransferencia = {
      CuentaEnviaID: this.transferencia.CuentaEnviaID,
      CuentaRecibeID: this.transferencia.CuentaRecibeID,
      Descripcion: this.transferencia.Descripcion,
      Monto: this.transferencia.Monto,
    };
  
    console.log("Datos de transferencia:", nuevaTransferencia);
  
    this._transferenciaServ.realizarTransferencia(nuevaTransferencia).subscribe(async response => {
      console.log('Proveedor agregado exitosamente:', response);
  
      const alert = await this.alertController.create({
        header: 'Éxito',
        message: 'El proveedor ha sido agregado correctamente.',
        buttons: ['OK']
      });
      await alert.present();
  
      this.closeModal(true);
    }, error => {
      console.error('Error al agregar el proveedor:', error);
      const alert = this.alertController.create({
        header: 'Error',
        message: 'Algo salio mal.',
        buttons: ['OK']
      });
    });
  }
  

  closeModal(success: boolean) {
    this.modalController.dismiss({ success }, success ? 'success' : 'error');
  }

}
