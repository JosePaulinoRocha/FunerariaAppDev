import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { ModalController, IonicModule, AlertController  } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { IngresosServices } from 'src/app/Servicios/Ingresos.service';

interface Ingreso {
  IngresoID: number;
}

@Component({
  selector: 'app-ingresos-egresos-archivo-modal',
  templateUrl: './ingresos-egresos-archivo-modal.component.html',
  styleUrls: ['./ingresos-egresos-archivo-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule, HttpClientModule],
})
export class IngresosEgresosArchivoModalComponent implements OnInit {
  @Input() ingreso: Ingreso = {
    IngresoID: 0,
  };

  @Output() fileUploaded = new EventEmitter<boolean>();

  selectedFile: File | null = null;

  @Input() isEditMode: boolean = false;

  constructor(private modalController: ModalController, private _ingresoServ: IngresosServices, private alertController: AlertController) {}

  ngOnInit() {}

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  onSave() {
    if (this.selectedFile) {
      const formData = new FormData();
      // console.log("IngresoID: ", this.ingreso.IngresoID)
      formData.append('Comprobante', this.selectedFile);

      this._ingresoServ.uploadComprobante(this.ingreso.IngresoID, formData).subscribe(
        fileResponse => {
          // console.log('Archivo guardado correctamente:', fileResponse);
          this.fileUploaded.emit(true);
          this.closeModal(true);  
        },
        fileError => {
          console.error('Error al guardar el archivo:', fileError);
          this.presentAlert('Error al guardar el archivo. Inténtalo de nuevo.');
          this.fileUploaded.emit(false);
          this.closeModal(false); 
        }
      );
    } else {
      this.presentAlert('Por favor selecciona un archivo antes de guardar.');
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

  closeModal(success: boolean = false) {
    this.modalController.dismiss({ success });
  }
}
