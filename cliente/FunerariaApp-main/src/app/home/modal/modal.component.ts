import { Component, Input } from '@angular/core';
import { ModalController, IonicModule, AlertController } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { UsuariosServices } from 'src/app/Servicios/Usuarios.service';


@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule, HttpClientModule, ReactiveFormsModule],
})
export class ChangePasswordModalComponent {
    @Input() userId: number = 0;
  
    newPassword: string = '';
    confirmPassword: string = '';
    error: string = '';
  
    constructor(
      private modalController: ModalController,
      private usuariosService: UsuariosServices
    ) {}
  
    async savePassword() {
      if (this.newPassword !== this.confirmPassword) {
        this.error = 'Las contraseñas no coinciden.';
        return;
      }
  
      try {
        await this.usuariosService.updatePassword(this.userId, this.newPassword).toPromise();
        await this.modalController.dismiss({ updated: true });
      } catch (err) {
        this.error = 'Hubo un error al actualizar la contraseña.';
      }
    }
  
    close() {
      this.modalController.dismiss({ updated: false });
    }
  }