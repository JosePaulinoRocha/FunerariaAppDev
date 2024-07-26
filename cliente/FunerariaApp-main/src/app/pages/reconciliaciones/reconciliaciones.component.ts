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
  balanceFinal: string = '';
  tipoCuenta: string = '';
  cuentaCajaChica: number = 0;
  cuentaBancaria: number = 0;
  showTables: boolean = false;
  selectedAccountName: string = '';

  constructor(private modalController: ModalController, private _reconciliacionServ: ReconciliacionesServices) {}

  ngOnInit() {
    this.loadIngresos();
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

