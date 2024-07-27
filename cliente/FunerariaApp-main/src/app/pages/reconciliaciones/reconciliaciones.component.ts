import { Component, OnInit } from '@angular/core';
import { IonicModule, ModalController } from "@ionic/angular";
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ReconciliacionesServices } from 'src/app/Servicios/Reconciliaciones.service';

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
    if (income.Reconciliado) {
      this.checkedMonto += income.Monto;
    } else {
      this.checkedMonto -= income.Monto;
    }
    console.log('Checked Monto:', this.checkedMonto);
    this.calcularDiferencia();
  }
  
  calcularDiferencia(): void {
    this.diferencia = this.balanceFinal - this.ultimaReconciliacionSaldo + this.checkedMonto;
    console.log('Diferencia:', this.diferencia);
  }
  

  loadIngresos() {
    this._reconciliacionServ.getIngresos().subscribe((data: Income[]) => {
      this.incomes = data.map(income => ({
        ...income,
        Fecha: new Date(income.Fecha).toISOString().split('T')[0],
        FechaAutorizacion: new Date(income.FechaAutorizacion).toISOString().split('T')[0],
        FechaConciliacion: new Date(income.FechaConciliacion).toISOString().split('T')[0]
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
  
    // Crear un objeto con los datos que se enviarán en el cuerpo de la solicitud POST
    const conciliacionData = {
      fechaFinal: this.fechaFinal,
      cuentaID: cuentaID
    };
    
    
    const selectedAccount = this.tipoCuenta === 'cajaChica'
    ? this.incomesCajaChica.find(income => income.CuentaID === cuentaID)
    : this.incomesCuentaBancaria.find(income => income.CuentaID === cuentaID);
  
    this.selectedAccountName = selectedAccount ? (selectedAccount.NombreCuenta ?? 'Cuenta no encontrada') : 'Cuenta no encontrada';

    // Obtener la última reconciliación
    this._reconciliacionServ.getUltimaReconciliacion(cuentaID).subscribe((ultimaReconciliacion: any) => {
      if (ultimaReconciliacion) {
        this.ultimaReconciliacionFecha = new Date(ultimaReconciliacion.Fecha).toISOString().split('T')[0];
        this.ultimaReconciliacionSaldo = ultimaReconciliacion.Saldo;
      } else {
        this.ultimaReconciliacionFecha = 'N/A';
        this.ultimaReconciliacionSaldo = 0;
      }
      this.calcularDiferencia(); // Recalcular diferencia después de obtener la última reconciliación
    }, (error) => {
      console.error('Error fetching ultima reconciliacion', error);
      this.ultimaReconciliacionFecha = 'N/A';
      this.ultimaReconciliacionSaldo = 0;
      this.calcularDiferencia(); // Recalcular diferencia incluso si hay un error
    });
  
    this._reconciliacionServ.getIngresosParaConciliacion(conciliacionData).subscribe((data: Income[]) => {
      console.log("esta es mi data para conciliar: ", conciliacionData);
      this.incomes = data.map(income => ({
        ...income,
        Fecha: new Date(income.Fecha).toISOString().split('T')[0],
        FechaAutorizacion: new Date(income.FechaAutorizacion).toISOString().split('T')[0],
        FechaConciliacion: new Date(income.FechaConciliacion).toISOString().split('T')[0],
        Reconciliado: false
      }));

      console.log("esta es mi data reconciliada: ", this.incomes);
      this.showTables = true;
    }, (error) => {
      console.error('Error fetching incomes for reconciliation', error);
    });
  }
}
