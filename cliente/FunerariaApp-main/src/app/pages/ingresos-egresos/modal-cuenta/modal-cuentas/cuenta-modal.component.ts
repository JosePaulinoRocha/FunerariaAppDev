import { Component, Input, OnInit } from '@angular/core';
import { ModalController, IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Cuenta {
  CuentaID: number;
  NombreCuenta: string;
  TipoCuentaID: number;
}

@Component({
  selector: 'app-cuenta-modal',
  templateUrl: './cuenta-modal.component.html',
  styleUrls: ['./cuenta-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class CuentaModalComponent implements OnInit {
  @Input() cuentas: Cuenta[] = [];
  @Input() tipoCuentaID!: number; // 1 = Caja Chica, 2 = Cuenta Bancaria
  @Input() modo!: 'envia' | 'recibe';

  filteredCuentas: Cuenta[] = [];
  searchTerm: string = '';

  private readonly nombresCajaChicaPermitidos = ['PABS Caja Chica', 'Pabs Caja chica SLRC', 'Perdida'];

  constructor(public modalController: ModalController) {}

  ngOnInit() {
    this.filtrarCuentas();
  }

  filtrarCuentas() {
    this.filteredCuentas = this.cuentas
      .filter(c => {
        const tipoCoincide = c.TipoCuentaID === this.tipoCuentaID;
        const nombrePermitido = this.tipoCuentaID === 1 ? this.nombresCajaChicaPermitidos.includes(c.NombreCuenta) : true;
        const textoCoincide = c.NombreCuenta.toLowerCase().includes(this.searchTerm.toLowerCase());
        return tipoCoincide && nombrePermitido && textoCoincide;
      })
      .sort((a, b) => a.NombreCuenta.localeCompare(b.NombreCuenta));
  }

  onSearchChange() {
    this.filtrarCuentas();
  }

  selectCuenta(cuenta: Cuenta) {
    this.modalController.dismiss({ cuenta, modo: this.modo });
  }

  closeModal() {
    this.modalController.dismiss();
  }
}
