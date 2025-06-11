import { Component, Input, OnInit } from '@angular/core';
import { ModalController, IonicModule, AlertController  } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-observacion-modal',
  templateUrl: './modal-observaciones.component.html',
  styleUrls: ['./modal-observaciones.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule, HttpClientModule],
})
export class ObservacionesModalComponent {
  @Input() income: any; // Recibe el ingreso o egreso
  observacion: string = '';

  constructor(private modalController: ModalController) {}

  ngOnInit() {
    // Verificamos si el campo correcto es "Descripcion"
    if (this.income?.ObservacionesDifConciliacion) {
      this.observacion = this.income.ObservacionesDifConciliacion;
      // console.log('Descripción precargada:', this.observacion);
    }
  }

  dismiss() {
    this.modalController.dismiss();
  }

  saveObservacion() {
    this.modalController.dismiss({
      observacion: this.observacion
    });
  }
}
