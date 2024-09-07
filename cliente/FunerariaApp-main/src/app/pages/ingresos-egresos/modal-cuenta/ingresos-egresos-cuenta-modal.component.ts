import { Component, Input, OnInit } from '@angular/core';
import { ModalController, IonicModule, AlertController  } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { IngresosServices } from 'src/app/Servicios/Ingresos.service';

interface Ingreso {
  IngresoID: number;
  TipoCuentaID: number;
  CuentaID: number;
  RFC: string;
}

interface Cuenta {
  CuentaID: number;
  TipoCuentaID: number;
  NombreCuenta: string;
  RFC: string;
}

@Component({
  selector: 'app-ingresos-egresos-cuenta-modal',
  templateUrl: './ingresos-egresos-cuenta-modal.component.html',
  styleUrls: ['./ingresos-egresos-cuenta-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule, HttpClientModule],
})
export class IngresosEgresosCuentaModalComponent implements OnInit {
  @Input() ingreso: Ingreso = {
    IngresoID: 0,
    TipoCuentaID: 1,
    CuentaID: 0,
    RFC: '',
  };

  cuenta: Cuenta[] = [];

  filteredCuentas: Cuenta[] = [];
  isCuentaEnabled = false;
  showRFC = false;

  isNewCuenta = false;
  newNombreCuenta = '';
  newRFC = '';
  
  @Input() isEditMode: boolean = false;

  constructor(private modalController: ModalController, private _ingresoServ: IngresosServices, private alertController: AlertController) {}

  ngOnInit() {
    console.log('IngresoID recibido en el modal:', this.ingreso.IngresoID);
  
    this.loadCuentas();
    this.onTipoCuentaChange();
  }

  loadCuentas() {
    this._ingresoServ.getCuentas().subscribe(
      (data: Cuenta[]) => {
        console.log('Esta es mi data en cuentas: ', data);
        this.cuenta = data;
      },
      (error) => {
        this.presentAlert('Error fetching combinations');
      }
    );
  }

  onTipoCuentaChange() {
    this.filteredCuentas = this.cuenta.filter(
      (c) => c.TipoCuentaID === this.ingreso.TipoCuentaID
    );

    this.isNewCuenta = false;
    this.ingreso.CuentaID = 0;
    this.ingreso.RFC = '';
    this.newNombreCuenta = '';
    this.newRFC = '';
  }

  onCuentaChange(event: any) {
    const cuentaID = event.detail.value;
    const selectedCuenta = this.cuenta.find((c) => c.CuentaID === cuentaID);

    if (selectedCuenta && this.ingreso.TipoCuentaID === 2) {
      this.ingreso.RFC = selectedCuenta.RFC;
    }
  }

  onCuentaSelection(isNew: boolean) {
    this.isNewCuenta = isNew;

    if (!isNew) {
      this.ingreso.CuentaID = 0;
    }
  }

  async presentAlert(message: string) {
    const alert = await this.alertController.create({
      header: 'Mensaje',
      message: message,
      buttons: ['OK'],
    });

    await alert.present();
  }

  async asignarCuenta() {
    const incomeData = {
      IngresoID: this.ingreso.IngresoID,
      TipoCuentaID: this.ingreso.TipoCuentaID,
      CuentaID: this.isNewCuenta ? this.newNombreCuenta : this.ingreso.CuentaID,
      RFC: this.ingreso.TipoCuentaID === 2 ? (this.newRFC || this.ingreso.RFC || '') : '',
    };
  
    console.log("Estos son los datos que estoy mandando para asignar la nueva cuenta: ", incomeData);
  
    this._ingresoServ.actualizarCuentaIngreso(incomeData).subscribe(
      (response: any) => {
        console.log('Actualización exitosa:', response);
        this.presentAlert('Cuenta asignada correctamente.');
        this.closeModal(true);
      },
      (error: any) => {
        console.error('Error al asignar cuenta:', error);
        this.presentAlert('Error al asignar cuenta. Inténtalo de nuevo.');
        this.closeModal(false); 
      }
    );
  }
  

  closeModal(success: boolean = false) {
    this.modalController.dismiss({ success });
  }
}
