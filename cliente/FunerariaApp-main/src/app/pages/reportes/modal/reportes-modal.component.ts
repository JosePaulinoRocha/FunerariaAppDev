import { Component, Input, OnInit } from '@angular/core';
import { ModalController, IonicModule, AlertController  } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { PresupuestoServices } from 'src/app/Servicios/Presupuesto.service';
import { ProveedoresServices } from 'src/app/Servicios/Proveedores.service';


interface ReporteMesActual {
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
  MontoTotal: number;
  PiezasTotal: number;
  DesfaceMonto: number;
  PresupuestoPorcentaje: number;
  DesfacePorcentaje: number;
  PromedioSemanas: number;
  UltimaFecha: string | null; // Fecha en formato ISO
  [key: string]: any;
}

interface Categoria {
  CategoriaID: number;
  Nombre: string;
}

interface Subcategoria {
  SubcategoriaID: number;
  Nombre: string;
}

@Component({
  selector: 'app-reportes-modal',
  templateUrl: './reportes-modal.component.html',
  styleUrls: ['./reportes-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule, HttpClientModule],
})
export class ReportesModalComponent implements OnInit {
  @Input() reporteMesActual: ReporteMesActual = {
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
    MontoTotal: 0,
    PiezasTotal: 0,
    DesfaceMonto: 0,
    PresupuestoPorcentaje: 0,
    DesfacePorcentaje: 0,
    PromedioSemanas: 0,
    UltimaFecha: '',
  };


  @Input() isEditMode: boolean = false;

  constructor(private modalController: ModalController, private _presupuestoServ: PresupuestoServices, private alertController: AlertController) {}


  ngOnInit() {
    // console.log("datos recibidos en el modal:", this.reporteMesActual);
    // console.log("Modo edición:", this.isEditMode);

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

    const montoFrecuenciaDictaminados = {
      SegmentoID: this.reporteMesActual.SegmentoID,
      CategoriaID: this.reporteMesActual.CategoriaID,
      SubcategoriaID: this.reporteMesActual.SubcategoriaID,
      ConceptoID: this.reporteMesActual.ConceptoID,
      MontoDictaminado: this.reporteMesActual.MontoDictaminado,
      FrecuenciaDictaminada: this.reporteMesActual.FrecuenciaDictaminada,
    };
  
    // console.log("Datos del presupuesto:", montoFrecuenciaDictaminados);



    this._presupuestoServ.updatePresupuesto(montoFrecuenciaDictaminados).subscribe(async response => {
      // console.log('Presupuesto actualizado exitosamente:', response);

      const alert = await this.alertController.create({
        header: 'Éxito',
        message: 'El presupuesto ha sido actualizado correctamente.',
        buttons: ['OK']
      });
      await alert.present();

      this.closeModal(true);
    }, error => {
      console.error('Error al actualizar el Presupuesto:', error);
      const alert = this.alertController.create({
        header: 'Error',
        message: 'Hubo un error al actualizar el presupuesto.',
        buttons: ['OK']
      });
    });


  }
  

  closeModal(success: boolean) {
    this.modalController.dismiss({ success }, success ? 'success' : 'error');
  }

}
