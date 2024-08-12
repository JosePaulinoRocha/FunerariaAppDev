import { Component, OnInit } from '@angular/core';
import { IonicModule, ModalController } from "@ionic/angular";
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ReconciliacionesServices } from 'src/app/Servicios/Reconciliaciones.service';
import { ObservableModalComponent } from './modal-observaciones/modal-observaciones.component';

interface Income {
  IngresoID: number;
  Fecha: string;
  ConceptoID: number;
  NombreConcepto: string;
  Descripcion: string;
  Proveedor: string;
  Piezas: number;
  Monto: number;
  Saldo: number;
  Comprobante: string;
  SegmentoID: number;
  NombreSegmento: string;
  CategoriaID: number;
  NombreCategoria: string;
  SubcategoriaID: number;
  NombreSubcategoria: string;
  EstatusComprobacionID: number;
  NombreEstatus: string;
  FechaAutorizacion: string;
  UsuarioAutorizaID: number;
  NombreUsuarioAutoriza: string;
  UsuarioRecibeID: number;
  NombreUsuarioRecibe: string;
  FechaConciliacion: string;
  ObservacionesDifConciliacion: string;
  CuentaID: number;
  TipoCuentaID: number;
  NombreCuenta?: string;
  RFC?: string;
  Reconciliado: boolean;
  TipoIngreso: { data: number[]; type: string; };
}

@Component({
  selector: 'app-reconciliaciones',
  templateUrl: './reconciliaciones.component.html',
  styleUrls: ['./reconciliaciones.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule, HttpClientModule],
})
export class ReconciliacionesComponent implements OnInit {
  incomes: Income[] = [];
  incomesCajaChica: Income[] = [];
  incomesCuentaBancaria: Income[] = [];
  ingresos: Income[] = []; // TipoIngreso = 0
  egresos: Income[] = []; // TipoIngreso = 1
  fechaFinal: string = '';
  balanceFinal: number = 0;
  tipoCuenta: string = '';
  cuentaCajaChica: number = 0;
  cuentaBancaria: number = 0;
  showTables: boolean = false;
  selectedAccountName: string = '';
  ultimaReconciliacionFecha: string = '';
  ultimaReconciliacionSaldo: number = 0;
  diferencia: number = 0;
  checkedMonto: number = 0;

  constructor(private modalController: ModalController, private _reconciliacionServ: ReconciliacionesServices) {}

  ngOnInit() {
    this.loadIngresos();
  }

  handleCheckboxChange(income: Income): void {
    const monto = income.Monto;
    if (income.TipoIngreso.data[0] === 0) { // Ingreso
      if (income.Reconciliado) {
        this.checkedMonto -= monto;
      } else {
        this.checkedMonto += monto;
      }
    } else if (income.TipoIngreso.data[0] === 1) { // Egreso
      if (income.Reconciliado) {
        this.checkedMonto += monto;
      } else {
        this.checkedMonto -= monto;
      }
    }
    console.log('Checked Monto:', this.checkedMonto);
    this.calcularDiferencia();
  }
  
  calcularDiferencia(): void {
    // Diferencia = Balance Final - (Saldo Última Reconciliación + Monto Total Seleccionado)
    this.diferencia = this.balanceFinal - this.ultimaReconciliacionSaldo + this.checkedMonto;
    console.log('Diferencia:', this.diferencia);
  }

  loadIngresos() {
    this._reconciliacionServ.getIngresos().subscribe((data: any[]) => {
      this.incomes = data.map(income => ({
        ...income,
        Fecha: new Date(income.Fecha).toISOString().split('T')[0],
        FechaAutorizacion: new Date(income.FechaAutorizacion).toISOString().split('T')[0],
        FechaConciliacion: new Date(income.FechaConciliacion).toISOString().split('T')[0],
        Monto: parseFloat(income.Monto)  // Asegurarse que Monto sea un número
      })).filter(income => !income.Reconciliado);
  
      const uniqueCajaChica = new Map();
      const uniqueCuentaBancaria = new Map();
  
      this.incomes.forEach(income => {
        if (income.TipoCuentaID === 1 && !uniqueCajaChica.has(income.CuentaID)) {
          uniqueCajaChica.set(income.CuentaID, income);
        } else if (income.TipoCuentaID === 2 && !uniqueCuentaBancaria.has(income.CuentaID)) {
          uniqueCuentaBancaria.set(income.CuentaID, income);
        }
      });
  
      this.incomesCajaChica = Array.from(uniqueCajaChica.values());
      this.incomesCuentaBancaria = Array.from(uniqueCuentaBancaria.values());
  
      console.log("Cuentas por caja chica: ", this.incomesCajaChica);
      console.log("Cuentas por cuenta bancaria: ", this.incomesCuentaBancaria);
    }, (error) => {
      console.error('Error fetching incomes', error); 
    });
  }

  onTipoCuentaChange(event: any) {
    this.tipoCuenta = event.detail.value;
  }

  isFormValid(): boolean {
    return !!this.fechaFinal && !!this.balanceFinal && !!this.tipoCuenta && 
      (this.tipoCuenta === 'cajaChica' ? !!this.cuentaCajaChica : !!this.cuentaBancaria);
  }

  reconciliar() {
    const cuentaID = this.tipoCuenta === 'cajaChica' ? this.cuentaCajaChica : this.cuentaBancaria;
  
    const conciliacionData = {
      fechaFinal: this.fechaFinal,
      cuentaID: cuentaID
    };
  
    const selectedAccount = this.tipoCuenta === 'cajaChica'
      ? this.incomesCajaChica.find(income => income.CuentaID === cuentaID)
      : this.incomesCuentaBancaria.find(income => income.CuentaID === cuentaID);
  
    this.selectedAccountName = selectedAccount ? (selectedAccount.NombreCuenta ?? 'Cuenta no encontrada') : 'Cuenta no encontrada';
  
    this._reconciliacionServ.getUltimaReconciliacion(cuentaID).subscribe((ultimaReconciliacion: any) => {
      if (ultimaReconciliacion) {
        this.ultimaReconciliacionFecha = new Date(ultimaReconciliacion.Fecha).toISOString().split('T')[0];
        this.ultimaReconciliacionSaldo = ultimaReconciliacion.Saldo;
      } else {
        this.ultimaReconciliacionFecha = 'N/A';
        this.ultimaReconciliacionSaldo = 0;
      }
      this.calcularDiferencia();
    }, (error) => {
      console.error('Error fetching ultima reconciliacion', error);
      this.ultimaReconciliacionFecha = 'N/A';
      this.ultimaReconciliacionSaldo = 0;
      this.calcularDiferencia();
    });
  
    this._reconciliacionServ.getIngresosParaConciliacion(conciliacionData).subscribe((data: any[]) => {
      this.incomes = data.map(income => ({
        ...income,
        Fecha: new Date(income.Fecha).toISOString().split('T')[0],
        FechaAutorizacion: new Date(income.FechaAutorizacion).toISOString().split('T')[0],
        FechaConciliacion: new Date(income.FechaConciliacion).toISOString().split('T')[0],
        Monto: parseFloat(income.Monto),  // Asegurarse que Monto sea un número
        Reconciliado: false
      }));
  
      // Filtrar y separar ingresos y egresos según TipoIngreso
      this.ingresos = this.incomes.filter(income => income.TipoIngreso.data[0] === 0);
      this.egresos = this.incomes.filter(income => income.TipoIngreso.data[0] === 1);
  
      console.log("Ingresos reconciliados: ", this.ingresos);
      console.log("Egresos reconciliados: ", this.egresos);
  
      this.showTables = true;
    }, (error) => {
      console.error('Error fetching incomes for reconciliation', error);
    });
  }

  procesarReconciliacion() {
    const cuentaID = this.tipoCuenta === 'cajaChica' ? this.cuentaCajaChica : this.cuentaBancaria;

    const reconciliationData = {
        Fecha: this.fechaFinal,
        Saldo: this.balanceFinal,
        CuentaID: cuentaID
    };

    this._reconciliacionServ.createReconciliacion(reconciliationData).subscribe(
        (newReconciliationID: number) => {
            // Actualizar los registros de ingresos con el ID de la nueva reconciliación
            const reconciliacionUpdates = this.incomes
                .filter(income => income.Reconciliado)
                .map(income => ({
                    IngresoID: income.IngresoID,
                    ReconciliacionID: newReconciliationID,
                    Saldo: this.balanceFinal // O el saldo final calculado para cada ingreso
                }));

            this._reconciliacionServ.updateIngresos(reconciliacionUpdates).subscribe(
                () => {
                    // Mostrar mensaje de éxito
                    alert('Se realizó la reconciliación exitosamente');
                    // Recargar la página después de 3 segundos
                    setTimeout(() => {
                        window.location.reload();
                    }, 200);
                },
                (error: any) => {
                    console.error('Error actualizando los ingresos', error);
                    // Mostrar mensaje de error
                    alert('Error: Algo salio mal');
                }
            );
        },
        (error: any) => {
            console.error('Error creando la reconciliación', error);
            // Mostrar mensaje de error
            alert('Error creando la reconciliación');
        }
    );
  }

  async openObservacionModal(income: Income) {
    const modal = await this.modalController.create({
      component: ObservableModalComponent, // Asegúrate de usar el componente correcto
      componentProps: {
        income: income
      }
    });

    modal.onDidDismiss().then((result) => {
      if (result.data && result.data.observacion) {
        this.updateObservacion(income.IngresoID, result.data.observacion);
      }
    });

    return await modal.present();
  }

  updateObservacion(ingresoID: number, observacion: string) {
    console.log("este es mi id y observacion: ", ingresoID, observacion )
    this._reconciliacionServ.updateObservacion(ingresoID, observacion).subscribe(() => {
      console.log('Observación actualizada exitosamente');
      alert('Se realizó la observacion exitosamente');
      // Aquí puedes actualizar el array de ingresos o recargar los datos según sea necesario
    }, (error) => {
      console.error('Error actualizando la observación', error);
      alert('Error: Algo salio mal');
    });
  }

}
