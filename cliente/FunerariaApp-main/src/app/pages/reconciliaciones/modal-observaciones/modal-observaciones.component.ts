import { Component, Input, OnInit } from '@angular/core';
import { ModalController, IonicModule, AlertController  } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-observable-modal',
  templateUrl: './modal-observaciones.component.html',
  styleUrls: ['./modal-observaciones.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule, HttpClientModule],
})
export class ObservableModalComponent {
  @Input() income: any; // Recibe el ingreso o egreso
  observacion: string = '';

  constructor(private modalController: ModalController) {}

  dismiss() {
    this.modalController.dismiss();
  }

  saveObservacion() {
    this.modalController.dismiss({
      observacion: this.observacion
    });
  }
}
