import { Component, Input, OnInit } from '@angular/core';
import { ModalController, IonicModule, AlertController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { PresupuestoServices } from 'src/app/Servicios/Presupuesto.service';
import { PresupuestoMensualFrecuenciaServices } from 'src/app/Servicios/Presupuesto-mensual-frecuencia.service';



interface GastoMensualPorFrecuencia {
  SegmentoID: number;
  NombreSegmento: string;
  CategoriaID: number;
  NombreCategoria: string;
  SubcategoriaID: number;
  NombreSubcategoria: string;
  ConceptoID: number;
  NombreConcepto: string;
  MontoDictaminado: number;
  FrecuenciaDictaminada: number;
  CuentaID: number | null;
  NombreCuenta: string | null;
  CajaChica: { data: number[]; type: string; };
  DiaLimite: number | null;
  PromedioMonto: number | null;
  PromedioPiezas: number | null;
  FrecuenciaPromedio: number | null;
  UltimaFecha: string | null;  // Fecha en formato ISO
  FechaSiguienteGasto: string | null;  // Fecha en formato ISO
  DiasPendientes: number | null;
  PeriodoID: number | null;
  PeriodoCongelado: string | null; // Rango de fecha como "YYYY-MM-DD al YYYY-MM-DD"
  [key: string]: any;
}


interface Periodos {
  PeriodoID: number;
  FechaInicio: string;
  FechaFin: string;
  FechaCongelacion: string;
  [key: string]: any;
}


@Component({
  selector: 'presupuesto-modal.component',
  templateUrl: './presupuesto-modal.component.html',
  styleUrls: ['./presupuesto-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule, HttpClientModule],
})
export class ReintegrosReconciliacionesModalComponent implements OnInit {

  periodosCongelados: Periodos[] = [];

  @Input() gastoMensualFrecuencia: GastoMensualPorFrecuencia = {
    SegmentoID: 0,
    NombreSegmento: '',
    CategoriaID: 0,
    NombreCategoria: '',
    SubcategoriaID: 0,
    NombreSubcategoria: '',
    ConceptoID: 0,
    NombreConcepto: '',
    MontoDictaminado: 0,
    FrecuenciaDictaminada: 0,
    CuentaID: 0,
    NombreCuenta: '',
    CajaChica: { data: [], type: '' },
    DiaLimite: 0,
    PromedioMonto: 0,
    PromedioPiezas: 0,
    FrecuenciaPromedio: 0,
    UltimaFecha: '',  // Fecha en formato ISO
    FechaSiguienteGasto: '',  // Fecha en formato ISO
    DiasPendientes: 0,
    PeriodoID: 0,
    PeriodoCongelado: '',
  };

  constructor(
    private modalController: ModalController, 
    private alertController: AlertController, 
    private _presupuestoServ: PresupuestoServices,
    private _presupuestoMensualFrecuenciaServ: PresupuestoMensualFrecuenciaServices
  ) {}

  ngOnInit() {
    // console.log('esta es la info que traigo al modal de periodos a vencer:', this.gastoMensualFrecuencia);
    this.loadPeriodosCongelados();
  }


  loadPeriodosCongelados() {
    this._presupuestoServ.getPeriodosCongelados().subscribe(
      (response: Periodos[]) => {
        this.periodosCongelados = response;
        // console.log("esta es la data de periodos congelados: ", this.periodosCongelados);
      },
      error => {
        // console.error("Error al cargar periodos congelados", error);
      }
    );
  }

  formatFechaAmigable(fechaInicio: string, fechaFin: string): string {
    const opciones: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    
    const fechaInicioFormateada = new Date(fechaInicio).toLocaleDateString('es-ES', opciones);
    const fechaFinFormateada = new Date(fechaFin).toLocaleDateString('es-ES', opciones);
  
    return `${fechaInicioFormateada} a ${fechaFinFormateada}`;
  }
  

  async GuardarGastoFrecuencia() {

    const gastoMensualFrecuencia = {
      SegmentoID: this.gastoMensualFrecuencia.SegmentoID,
      CategoriaID: this.gastoMensualFrecuencia.CategoriaID,
      SubcategoriaID: this.gastoMensualFrecuencia.SubcategoriaID,
      ConceptoID: this.gastoMensualFrecuencia.ConceptoID,
      PromedioMonto: this.gastoMensualFrecuencia.PromedioMonto,
      FrecuenciaPromedio: this.gastoMensualFrecuencia.FrecuenciaPromedio,
      FrecuenciaDictaminada: this.gastoMensualFrecuencia.FrecuenciaDictaminada,
      MontoDictaminado: this.gastoMensualFrecuencia.MontoDictaminado,
      CuentaID: this.gastoMensualFrecuencia.CuentaID,
      CajaChica: this.gastoMensualFrecuencia.CajaChica.data,
      UltimaFecha: this.gastoMensualFrecuencia.UltimaFecha,
      DiaLimite: this.gastoMensualFrecuencia.DiaLimite,
      DiasPendientes: this.gastoMensualFrecuencia.DiasPendientes,
      PeriodoID: this.gastoMensualFrecuencia.PeriodoID,

    };
  
    // console.log("Datos del gasto por frecuencia:", gastoMensualFrecuencia);


    this._presupuestoMensualFrecuenciaServ.addGastoFrecuencia(gastoMensualFrecuencia).subscribe(
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


  async presentSuccessAlert() {
    const alert = await this.alertController.create({
      header: 'Éxito',
      message: 'El gasto mensual por frecuencia se ha guardado correctamente.',
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


  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }


  closeModal(success: boolean) {
    this.modalController.dismiss({ success }, success ? 'success' : 'error');
  }

}