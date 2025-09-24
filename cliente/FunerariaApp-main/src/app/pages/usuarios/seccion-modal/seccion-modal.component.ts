import { Component, Input, OnInit } from '@angular/core';
import { ModalController, IonicModule, AlertController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PermisosService } from 'src/app/Servicios/Permisos.service';

export interface Seccion {
  PermisoID: number;
  NombrePermiso: string;
  Ruta: string;
}

@Component({
  selector: 'app-seccion-modal',
  templateUrl: './seccion-modal.component.html',
  styleUrls: ['./seccion-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule],
})
export class SeccionModalComponent implements OnInit {
  @Input() seccion: Seccion = { PermisoID: 0, NombrePermiso: '', Ruta: '' };
  @Input() isEditMode: boolean = false;

  constructor(private modalController: ModalController, private permisosService: PermisosService, private alertController: AlertController) {}

  ngOnInit() {}

  async presentAlert(message: string) {
    const alert = await this.alertController.create({
      header: 'Error',
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }

  closeModal() {
    this.modalController.dismiss();
  }

  saveSeccion() {
    if (this.isEditMode) {
      this.permisosService.updateSeccion(this.seccion).subscribe({
        next: () => this.modalController.dismiss(this.seccion, 'edit'),
        error: (err) => this.presentAlert('Error actualizando sección: ' + err.message)
      });
    } else {
      this.permisosService.crearSeccion(this.seccion).subscribe({
        next: () => this.modalController.dismiss(this.seccion, 'add'),
        error: (err) => this.presentAlert('Error añadiendo sección: ' + err.message)
      });
    }
  }
}
