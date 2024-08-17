import { Component, Input, OnInit } from '@angular/core';
import { ModalController, IonicModule, AlertController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ReconciliacionesServices } from 'src/app/Servicios/Reconciliaciones.service';

@Component({
  selector: 'reintegros-reconciliaciones.component',
  templateUrl: './reintegros-reconciliaciones.component.html',
  styleUrls: ['./reintegros-reconciliaciones.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule, HttpClientModule],
})
export class ReintegrosReconciliacionesModalComponent implements OnInit {
  @Input() ingreso: any;

  constructor(
    private modalController: ModalController, 
    private alertController: AlertController, 
    private _ingresosReintegrosService: ReconciliacionesServices
  ) {}

  ngOnInit() {
    console.log('esta es la info que traigo al modal de reintegro:', this.ingreso);
    // Aquí puedes inicializar cualquier lógica relacionada con el ingreso.
  }

  closeModal() {
    this.modalController.dismiss();
  }

  async realizarReintegro() {
    if (this.ingreso && this.ingreso.IngresoID && this.ingreso.Monto) {
        const reintegroData = {
            IngresoID: this.ingreso.IngresoID,
            Monto: this.ingreso.Monto,
            ReconciliacionID: this.ingreso.ReconciliacionID
        };

        console.log("Esta es mi info a reintegrar: ", reintegroData);

        try {
            // Enviar la solicitud de reintegro
            const response = await this._ingresosReintegrosService.reintegrar(reintegroData).toPromise();

            // Verificar la respuesta (ajustar según la estructura esperada)
            if (response && response.success) { // Asegúrate de que `response.success` se usa correctamente
                this.closeModal();
                this.showAlert('Reintegro realizado', 'El monto se ha reintegrado correctamente.');

                // Esperar 1 segundo antes de refrescar la pantalla
                setTimeout(() => {
                    location.reload(); // Refrescar la página
                }, 1000);
            } else {
                this.showAlert('Error', 'Hubo un problema al realizar el reintegro. Inténtalo de nuevo.');
            }
        } catch (error) {
            console.error('Error al realizar el reintegro:', error);
            this.showAlert('Error', 'Hubo un problema al realizar el reintegro. Inténtalo de nuevo.');
        }
    } else {
        this.showAlert('Información incompleta', 'Faltan datos necesarios para realizar el reintegro.');
    }
}


  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }

}