import { Component, Input, OnInit } from '@angular/core';
import { ModalController, IonicModule, AlertController  } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { PresupuestoServices } from 'src/app/Servicios/Presupuesto.service';
import { ProveedoresServices } from 'src/app/Servicios/Proveedores.service';


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
  selector: 'app-presupuesto-modal',
  templateUrl: './presupuesto-modal.component.html',
  styleUrls: ['./presupuesto-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule, HttpClientModule],
})
export class PresupuestoModalComponent implements OnInit {
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
  };


  @Input() isEditMode: boolean = false;

  constructor(private modalController: ModalController, private _presupuestoServ: PresupuestoServices, private alertController: AlertController) {}


  ngOnInit() {
    console.log("Proveedor recibido en el modal:", this.presupuesto);
    console.log("Modo edición:", this.isEditMode);

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
      SegmentoID: this.presupuesto.SegmentoID,
      CategoriaID: this.presupuesto.CategoriaID,
      SubcategoriaID: this.presupuesto.SubcategoriaID,
      ConceptoID: this.presupuesto.ConceptoID,
      MontoDictaminado: this.presupuesto.MontoDictaminado,
      FrecuenciaDictaminada: this.presupuesto.FrecuenciaDictaminada,
    };
  
    console.log("Datos del presupuesto:", montoFrecuenciaDictaminados);



    this._presupuestoServ.updatePresupuesto(montoFrecuenciaDictaminados).subscribe(async response => {
      console.log('Presupuesto actualizado exitosamente:', response);

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
