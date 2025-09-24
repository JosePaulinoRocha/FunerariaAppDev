import { Component, Input, OnInit } from '@angular/core';
import { ModalController, IonicModule, AlertController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Rol, PermisosService, Seccion } from 'src/app/Servicios/Permisos.service';

@Component({
  selector: 'app-rol-modal',
  templateUrl: './rol-modal.component.html',
  styleUrls: ['./rol-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule],
})
export class RolModalComponent implements OnInit {
  @Input() rol: Rol = { RolID: 0, NombreRol: '' };
  @Input() isEditMode: boolean = false;

  permisos: Seccion[] = [];
  permisosRol: number[] = []; // IDs de permisos asignados

  constructor(
    private modalController: ModalController,
    private permisosService: PermisosService,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.loadPermisos();
    if (this.isEditMode) {
      this.loadPermisosRol();
    }
  }

  loadPermisos() {
    this.permisosService.getSecciones().subscribe({
      next: (data) => (this.permisos = data),
      error: (err) => this.presentAlert('Error cargando permisos: ' + err.message),
    });
  }

  loadPermisosRol() {
    this.permisosService.getPermisosPorRol(this.rol.RolID).subscribe({
      next: (data: number[]) => (this.permisosRol = data),
      error: (err) => this.presentAlert('Error cargando permisos del rol: ' + err.message),
    });
  }

  hasPermiso(permisoId: number): boolean {
    return this.permisosRol.includes(permisoId);
  }

  togglePermiso(permisoId: number, checked: boolean) {
    if (checked) {
      // asignar
      this.permisosService.asignarPermiso(this.rol.RolID, permisoId).subscribe({
        next: () => this.permisosRol.push(permisoId),
        error: (err) => this.presentAlert('Error asignando permiso: ' + err.message),
      });
    } else {
      // quitar
      this.permisosService.removerPermiso(this.rol.RolID, permisoId).subscribe({
        next: () =>
          (this.permisosRol = this.permisosRol.filter((id) => id !== permisoId)),
        error: (err) => this.presentAlert('Error removiendo permiso: ' + err.message),
      });
    }
  }

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

  saveRol() {
    if (this.isEditMode) {
      this.permisosService.updateRol(this.rol).subscribe({
        next: () => this.modalController.dismiss(this.rol, 'edit'),
        error: (err) =>
          this.presentAlert('Error actualizando rol: ' + err.message),
      });
    } else {
      this.permisosService.crearRol(this.rol).subscribe({
        next: (nuevoRol) => {
          this.rol.RolID = nuevoRol.RolID;
          this.modalController.dismiss(this.rol, 'add');
        },
        error: (err) =>
          this.presentAlert('Error añadiendo rol: ' + err.message),
      });
    }
  }
}
