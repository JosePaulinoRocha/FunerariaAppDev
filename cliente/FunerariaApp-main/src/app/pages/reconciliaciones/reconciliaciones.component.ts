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
  CajaChica: boolean;
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
  NombreCajaChica?: string;
  RFC?: string;
  NombreDuenoCuenta?: string;
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
      }));
      console.log("esta es la data de cuentas: ", this.incomes);
      this.incomesCajaChica = this.incomes.filter(income => income.CajaChica);
      this.incomesCuentaBancaria = this.incomes.filter(income => !income.CajaChica);
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
    // Lógica de reconciliación
  }
}
